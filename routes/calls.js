const express = require('express');
const router  = express.Router();
const log     = require('../logger');
const { plivoClient, agentMap, agentById, BASE_URL } = require('../config');
const { upsertCall, setRecording }                   = require('../db/queries');
const { runAnalysis }                                = require('../services/groq');

function xml(content) {
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${content}</Response>`;
}

// ── POST /call-handler ────────────────────────────────────────────────
router.post('/call-handler', (req, res) => {
  res.set('Content-Type', 'text/xml');

  const to        = req.body.To        || req.body.to        || '';
  const from      = req.body.From      || req.body.from      || '';
  const callUuid  = req.body.CallUUID  || req.body.call_uuid || '';
  const direction = (req.body.Direction || req.body.direction || '').toLowerCase();

  log.info('CALL', 'call-handler', { direction, from, to, callUuid });

  // ── Outbound SDK call (Leg 1) — check FIRST because Plivo may send Direction=inbound
  // even for browser SDK calls; the real signal is the SIP URI in From.
  if (
    direction === 'outbound' ||
    from.includes('@phone.plivo.com') ||
    from.includes('@sip.plivo.com') ||
    from.startsWith('sip:')
  ) {
    const sipUsername = from
      .replace(/^sip:/i, '')
      .replace(/@.*/,    '')
      .trim();

    const agent = agentById[sipUsername] || agentById[from];
    const callerId = agent?.number || '';

    log.info('CALL', 'outbound: leg1', { sipUsername, agentFound: !!agent, callerId, to });

    if (!to) {
      log.warn('CALL', 'outbound: no destination number');
      return res.send(xml('<Speak>No destination number. Goodbye.</Speak>'));
    }

    if (callUuid && agent) {
      upsertCall({
        id: callUuid, direction: 'outbound', number: to,
        agent_username: agent.endpointUsername,
        started_at: new Date().toISOString(), status: 'completed',
      });
    }

    // Start recording via REST API after a short delay to let the call connect
    if (callUuid) {
      setTimeout(() => {
        plivoClient.calls.record(callUuid, {
          time_limit: 3600,
          file_format: 'mp3',
          callback_url: `${BASE_URL}/call-recording-callback`,
          callback_method: 'POST',
        }).then(() => {
          log.info('CALL', 'recording started', { callUuid });
        }).catch(err => {
          log.warn('CALL', 'recording start failed', { callUuid, error: err.message });
        });
      }, 3000);
    }

    const callerIdAttr = callerId ? ` callerId="${callerId}"` : '';
    const actionAttr   = ` action="${BASE_URL}/outbound-dial-callback" method="POST"`;

    return res.send(xml(`<Dial${callerIdAttr}${actionAttr}><Number>${to}</Number></Dial>`));
  }

  // ── Inbound PSTN call ─────────────────────────────────────────────
  if (direction === 'inbound') {
    const normalised = to && !to.startsWith('+') ? '+' + to : to;
    const agent = agentMap[normalised] || agentMap[to];

    if (!agent) {
      log.warn('CALL', 'inbound: no agent for number', { to, normalised, knownNumbers: Object.keys(agentMap) });
      return res.send(xml('<Speak>This number is not configured. Goodbye.</Speak>'));
    }

    log.info('CALL', 'inbound: routing to agent', { agent: agent.endpointUsername });

    if (callUuid) {
      upsertCall({
        id: callUuid, direction: 'inbound', number: from,
        agent_username: agent.endpointUsername,
        started_at: new Date().toISOString(), status: 'completed',
      });
    }

    return res.send(xml(
      `<Dial callbackUrl="${BASE_URL}/inbound-fallback" callbackMethod="POST" timeout="25" redirect="false">` +
      `<User>sip:${agent.endpointUsername}@phone.plivo.com</User>` +
      `</Dial>`
    ));
  }

  // ── Fallback (Leg 2 / empty response) ────────────────────────────
  log.debug('CALL', 'call-handler: fallback (leg2 or unknown)', { direction, from, to });
  res.send(xml(''));
});

// ── POST /outbound-dial-callback ──────────────────────────────────────
// Fires when the outbound <Dial> leg ends (answered, busy, no-answer, etc.)
router.post('/outbound-dial-callback', (req, res) => {
  res.set('Content-Type', 'text/xml');
  const dialStatus   = (req.body.DialStatus || req.body.dial_status || '').toLowerCase();
  const callUuid     = req.body.CallUUID || req.body.call_uuid || '';
  const bLegDuration = parseInt(
    req.body.DialBLegDuration || req.body.dial_b_leg_duration ||
    req.body.Duration         || req.body.duration            || '0', 10);

  log.info('CALL', 'outbound-dial-callback', { dialStatus, callUuid, bLegDuration });

  if (callUuid) {
    if (dialStatus === 'completed' || dialStatus === 'answer') {
      // Call was answered — save duration now (recording callback may overwrite with same/better value)
      setRecording({ id: callUuid, recording_url: null, duration_sec: bLegDuration, ended_at: new Date().toISOString(), status: 'completed' });
    } else if (dialStatus) {
      // busy, no-answer, failed, canceled
      setRecording({ id: callUuid, recording_url: null, duration_sec: 0, ended_at: new Date().toISOString(), status: 'missed' });
    }
  }
  res.send(xml(''));
});

// Track calls already processed by inbound-fallback to deduplicate Plivo's duplicate callbacks
const _fallbackProcessed = new Set();

// ── POST /inbound-fallback ────────────────────────────────────────────
// Fires when the inbound <Dial> ends — may fire multiple times for same call
router.post('/inbound-fallback', (req, res) => {
  res.set('Content-Type', 'text/xml');
  const dialStatus = (req.body.DialStatus || req.body.dial_status || '').toLowerCase();
  const callUuid   = req.body.CallUUID || req.body.call_uuid || '';

  log.info('CALL', 'inbound-fallback', { dialStatus, callUuid });

  if (!callUuid) return res.send(xml(''));

  const existing = require('../db/queries').getCall(callUuid);

  // Ignore outbound calls that misfire here
  if (existing?.direction === 'outbound') {
    log.debug('CALL', 'inbound-fallback: ignoring outbound call', { callUuid });
    return res.send(xml(''));
  }

  // Agent answered — call is already completed, start recording and ignore further callbacks
  if (existing?.status === 'completed' || dialStatus === 'completed' || dialStatus === 'answer') {
    if (!_fallbackProcessed.has(callUuid)) {
      _fallbackProcessed.add(callUuid);
      // Start recording the answered inbound call via REST API
      plivoClient.calls.record(callUuid, {
        time_limit: 3600,
        file_format: 'mp3',
        callback_url: `${BASE_URL}/call-recording-callback`,
        callback_method: 'POST',
      }).then(() => {
        log.info('CALL', 'inbound recording started', { callUuid });
      }).catch(err => {
        log.warn('CALL', 'inbound recording start failed', { callUuid, error: err.message });
      });
    }
    return res.send(xml(''));
  }

  // Deduplicate — only process missed/voicemail logic once per call
  if (_fallbackProcessed.has(callUuid)) {
    log.debug('CALL', 'inbound-fallback: duplicate, ignoring', { callUuid });
    return res.send(xml(''));
  }
  _fallbackProcessed.add(callUuid);

  // Agent did not answer — mark missed and play voicemail prompt
  setRecording({ id: callUuid, recording_url: null, duration_sec: 0, ended_at: new Date().toISOString(), status: 'missed' });

  res.send(xml(
    `<Speak>Hi, we're unavailable right now. Please leave a message after the beep.</Speak>` +
    `<Record action="${BASE_URL}/voicemail-recording" maxLength="120" playBeep="true" transcribe="false"/>`
  ));
});

// ── POST /voicemail-recording ─────────────────────────────────────────
router.post('/voicemail-recording', async (req, res) => {
  const callUuid     = req.body.CallUUID || req.body.call_uuid || '';
  const recordingUrl = req.body.RecordUrl || req.body.RecordingUrl || req.body.recording_url || '';
  const duration     = parseInt(req.body.RecordingDuration || req.body.recording_duration || '0', 10);

  log.info('CALL', 'voicemail-recording', { callUuid, recordingUrl, duration });

  if (callUuid) {
    setRecording({ id: callUuid, recording_url: recordingUrl, duration_sec: duration, ended_at: new Date().toISOString(), status: 'voicemail' });
    runAnalysis(callUuid).catch(err => log.error('GROQ', 'voicemail analysis failed', { callUuid, error: err.message }));
  }
  res.sendStatus(200);
});

// ── POST /call-recording-callback ─────────────────────────────────────
router.post('/call-recording-callback', async (req, res) => {
  // Plivo REST API recording callback sends data as a JSON string in req.body.response
  const payload = (() => {
    try { return JSON.parse(req.body.response || '{}'); } catch { return req.body; }
  })();

  const callUuid     = payload.call_uuid    || payload.CallUUID    || req.body.call_uuid    || req.body.CallUUID    || '';
  const recordingUrl = payload.record_url   || payload.RecordUrl   || req.body.RecordUrl    || req.body.RecordingUrl || '';
  const duration     = parseInt(payload.recording_duration || req.body.RecordingDuration || '0', 10);

  log.info('CALL', 'recording-callback', { callUuid, recordingUrl, duration });

  if (callUuid) {
    setRecording({ id: callUuid, recording_url: recordingUrl, duration_sec: duration, ended_at: new Date().toISOString(), status: 'completed' });
    if (recordingUrl) {
      runAnalysis(callUuid).catch(err => log.error('GROQ', 'recording analysis failed', { callUuid, error: err.message }));
    }
  }
  res.sendStatus(200);
});

module.exports = router;

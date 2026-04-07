const express = require('express');
const router = express.Router();
const { agentMap, agentById, plivoClient, BASE_URL } = require('../config');

const voicemailLog = [];

function xml(content) {
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${content}</Response>`;
}

// POST /inbound-call — Plivo answer URL
router.post('/inbound-call', (req, res) => {
  res.set('Content-Type', 'text/xml');
  const toNumber = req.body.To || req.body.to;
  const agent = agentMap[toNumber];

  if (!agent) {
    console.log(`[inbound-call] Unknown number: ${toNumber}`);
    return res.send(xml('<Speak>This number is not configured. Goodbye.</Speak>'));
  }

  console.log(`[inbound-call] Routing to ${agent.name} (${agent.endpointUsername})`);
  res.send(xml(
    `<Dial callbackUrl="${BASE_URL}/inbound-fallback" callbackMethod="POST" timeout="25">` +
    `<User>sip:${agent.endpointUsername}@phone.plivo.com</User>` +
    `</Dial>`
  ));
});

// POST /inbound-fallback — agent didn't answer in 25s
router.post('/inbound-fallback', (req, res) => {
  res.set('Content-Type', 'text/xml');
  console.log(`[inbound-fallback] Agent did not answer, playing voicemail prompt`);
  res.send(xml(
    `<Speak>Hi, we're unavailable right now. Please leave a message after the beep.</Speak>` +
    `<Record action="${BASE_URL}/voicemail-recording" maxLength="120" playBeep="true" transcribe="false"/>`
  ));
});

// POST /voicemail-recording — recording complete callback
router.post('/voicemail-recording', (req, res) => {
  const toNumber = req.body.To || req.body.to;
  const entry = {
    agentName: (toNumber && agentMap[toNumber]) ? agentMap[toNumber].name : null,
    callerNumber: req.body.From || req.body.from || 'Unknown',
    recordingUrl: req.body.RecordingUrl || req.body.recording_url || '',
    duration: req.body.RecordingDuration || req.body.recording_duration || '0',
    timestamp: new Date().toISOString(),
  };
  voicemailLog.push(entry);
  console.log('[voicemail-recording]', JSON.stringify(entry, null, 2));
  res.sendStatus(200);
});

// POST /outbound-call — frontend triggers outbound via Plivo REST API
router.post('/outbound-call', async (req, res) => {
  const { agentId, toNumber } = req.body;

  if (!agentId || !agentById[agentId]) {
    return res.status(400).json({ error: 'Invalid agentId' });
  }
  if (!toNumber || !/^\+\d{7,15}$/.test(toNumber)) {
    return res.status(400).json({ error: 'Invalid number format. Use E.164 (e.g. +14155550123)' });
  }

  const agent = agentById[agentId];

  try {
    const response = await plivoClient.calls.create(
      agent.number,
      toNumber,
      `${BASE_URL}/outbound-answer?agentId=${encodeURIComponent(agentId)}`
    );
    console.log(`[outbound-call] ${agent.name} → ${toNumber}, UUID: ${response.requestUuid}`);
    res.json({ success: true, callUuid: response.requestUuid });
  } catch (err) {
    console.error('[outbound-call] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /outbound-answer — answer URL for outbound destination leg
router.get('/outbound-answer', (req, res) => {
  res.set('Content-Type', 'text/xml');
  const agentId = req.query.agentId;
  const agent = agentId && agentById[agentId];

  if (!agent) {
    console.log(`[outbound-answer] Unknown agentId: ${agentId}`);
    return res.send(xml('<Speak>Call configuration error. Goodbye.</Speak>'));
  }

  console.log(`[outbound-answer] Connecting destination to ${agent.name}`);
  res.send(xml(
    `<Dial><User>sip:${agent.endpointUsername}@phone.plivo.com</User></Dial>`
  ));
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { agentMap, agentById, BASE_URL } = require('../config');

const voicemailLog = [];

function xml(content) {
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${content}</Response>`;
}

// POST /call-handler — unified answer URL set on BrowserCallingApp in Plivo console.
// This receives ALL call events for the app: inbound PSTN calls AND outbound SDK calls.
//
// Plivo sends Direction=inbound when an external caller dials the Plivo number.
// Plivo sends Direction=outbound for SDK-initiated calls (both legs).
//
// Outbound has two legs:
//   Leg 1: From = sip:AgentUsername@phone.plivo.com  → dial the destination number
//   Leg 2: From = destination phone number            → already bridged, return empty
router.post('/call-handler', (req, res) => {
  res.set('Content-Type', 'text/xml');
  const to        = req.body.To        || req.body.to        || '';
  const from      = req.body.From      || req.body.from      || '';
  const direction = (req.body.Direction || req.body.direction || '').toLowerCase();

  console.log(`[call-handler] direction=${direction} from=${from} to=${to}`);

  // ── Inbound PSTN ────────────────────────────────────────────────────
  if (direction === 'inbound') {
    const normalised = to && !to.startsWith('+') ? '+' + to : to;
    const agent = agentMap[normalised] || agentMap[to];
    if (!agent) {
      console.log(`[call-handler] inbound — no agent for ${to}, known: ${Object.keys(agentMap).join(', ')}`);
      return res.send(xml('<Speak>This number is not configured. Goodbye.</Speak>'));
    }
    console.log(`[call-handler] inbound — routing to ${agent.name} (${agent.endpointUsername})`);
    return res.send(xml(
      `<Dial callbackUrl="${BASE_URL}/inbound-fallback" callbackMethod="POST" timeout="25">` +
      `<User>sip:${agent.endpointUsername}@phone.plivo.com</User>` +
      `</Dial>`
    ));
  }

  // ── Outbound SDK Leg 1: browser → destination ───────────────────────
  if (from.includes('@phone.plivo.com') || from.startsWith('sip:')) {
    const sipUsername = from.replace(/^sip:/, '').replace(/@.*$/, '');
    const agent = agentById[sipUsername];
    const callerId = agent ? agent.number : '';
    console.log(`[call-handler] outbound leg1 — ${sipUsername} → ${to}, callerId: ${callerId || 'none'}`);
    if (!to) return res.send(xml('<Speak>No destination number. Goodbye.</Speak>'));
    const dialAttrs = callerId ? ` callerId="${callerId}"` : '';
    return res.send(xml(`<Dial${dialAttrs}><Number>${to}</Number></Dial>`));
  }

  // ── Outbound SDK Leg 2: destination answered, already bridged ───────
  console.log(`[call-handler] outbound leg2 — ${from} answered, bridge complete`);
  res.send(xml(''));
});

// POST /inbound-fallback — agent didn't answer within timeout → voicemail
router.post('/inbound-fallback', (req, res) => {
  res.set('Content-Type', 'text/xml');
  console.log('[inbound-fallback] no answer — playing voicemail prompt');
  res.send(xml(
    `<Speak>Hi, we're unavailable right now. Please leave a message after the beep.</Speak>` +
    `<Record action="${BASE_URL}/voicemail-recording" maxLength="120" playBeep="true" transcribe="false"/>`
  ));
});

// POST /voicemail-recording — recording complete callback from Plivo
router.post('/voicemail-recording', (req, res) => {
  const toNumber = req.body.To || req.body.to;
  const normalised = toNumber && !toNumber.startsWith('+') ? '+' + toNumber : toNumber;
  const entry = {
    agentName: (agentMap[normalised] || agentMap[toNumber] || {}).name || null,
    callerNumber: req.body.From || req.body.from || 'Unknown',
    recordingUrl: req.body.RecordingUrl || req.body.recording_url || '',
    duration: req.body.RecordingDuration || req.body.recording_duration || '0',
    timestamp: new Date().toISOString(),
  };
  voicemailLog.push(entry);
  console.log('[voicemail-recording]', JSON.stringify(entry, null, 2));
  res.sendStatus(200);
});

// GET /agents — also expose voicemail log for debugging
router.get('/voicemail-log', (req, res) => {
  res.json(voicemailLog);
});

module.exports = router;

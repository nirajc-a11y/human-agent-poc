const express = require('express');
const router = express.Router();

router.post('/inbound-call', (req, res) => res.send('<Response></Response>'));
router.post('/inbound-fallback', (req, res) => res.send('<Response></Response>'));
router.post('/voicemail-recording', (req, res) => res.sendStatus(200));
router.post('/outbound-call', (req, res) => res.json({ ok: true }));
router.get('/outbound-answer', (req, res) => res.send('<Response></Response>'));

module.exports = router;

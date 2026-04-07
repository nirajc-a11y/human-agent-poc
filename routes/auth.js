const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { agentById, JWT_SECRET } = require('../config');
const log = require('../logger');

router.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }

  const agent = agentById[username];
  if (!agent) {
    log.warn('AUTH', 'login failed: unknown username', { username });
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Timing-safe comparison
  const expected = Buffer.from(agent.endpointPassword);
  const provided = Buffer.from(password);
  const match =
    expected.length === provided.length &&
    crypto.timingSafeEqual(expected, provided);

  if (!match) {
    log.warn('AUTH', 'login failed: wrong password', { username });
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  log.info('AUTH', 'login success', { username });
  const payload = {
    username: agent.endpointUsername,
    name: agent.name,
    number: agent.number,
    password: agent.endpointPassword,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, agent: payload });
});

module.exports = router;

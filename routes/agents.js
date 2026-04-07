const express = require('express');
const router = express.Router();
const { agentById } = require('../config');

router.get('/agents', (req, res) => {
  const agents = Object.values(agentById).map((agent) => ({
    id: agent.endpointUsername,
    name: agent.name,
    number: agent.number,
  }));
  res.json(agents);
});

// POC only — returns endpoint credentials for SDK login (no auth in this POC)
router.get('/agent-credentials/:id', (req, res) => {
  const agent = agentById[req.params.id];
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  res.json({
    id: agent.endpointUsername,
    username: agent.endpointUsername,
    password: agent.endpointPassword,
  });
});

module.exports = router;

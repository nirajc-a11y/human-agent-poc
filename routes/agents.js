const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const { agentById } = require('../config');

// Returns the list of agents (used by frontend to display agent name)
router.get('/api/agents', requireAuth, (req, res) => {
  const agents = Object.values(agentById).map((agent) => ({
    id: agent.endpointUsername,
    name: agent.name,
    number: agent.number,
  }));
  res.json(agents);
});

module.exports = router;

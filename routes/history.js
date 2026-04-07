const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const { listCalls, countCalls, getCall, todayStats, clearAllCalls } = require('../db/queries');
const { runAnalysis } = require('../services/groq');
const log = require('../logger');

router.get('/api/calls', requireAuth, (req, res) => {
  const { direction, status, search, page = 1, limit = 50 } = req.query;
  const params = {
    direction: direction || null,
    status: status || null,
    search: search ? `%${search}%` : null,
    limit: parseInt(limit, 10),
    offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
  };
  const calls = listCalls(params);
  const { total } = countCalls(params);
  const stats = todayStats();
  log.debug('HISTORY', 'list calls', { total, page, limit, direction, status });
  res.json({ calls, total, stats });
});

router.get('/api/calls/:id', requireAuth, (req, res) => {
  const call = getCall(req.params.id);
  if (!call) return res.status(404).json({ error: 'Not found' });
  if (call.analysis) call.analysis = JSON.parse(call.analysis);
  res.json(call);
});

router.post('/api/calls/:id/analyze', requireAuth, async (req, res) => {
  const call = getCall(req.params.id);
  if (!call) return res.status(404).json({ error: 'Not found' });
  log.info('HISTORY', 'manual analyze triggered', { id: req.params.id });
  try {
    const result = await runAnalysis(req.params.id);
    res.json(result);
  } catch (err) {
    log.error('HISTORY', 'analyze failed', { id: req.params.id, error: err.message });
    res.status(500).json({ error: err.message });
  }
});

router.delete('/api/calls', requireAuth, (req, res) => {
  clearAllCalls();
  log.info('HISTORY', 'all calls cleared');
  res.json({ ok: true });
});

module.exports = router;

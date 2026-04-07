require('dotenv').config();
const express = require('express');
const path = require('path');
const log = require('./logger');

// Initialise DB on startup
require('./db/schema');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, _res, next) => {
  if (req.path.startsWith('/api/') || req.method === 'POST') {
    log.debug('HTTP', `${req.method} ${req.path}`);
  }
  next();
});

// API routes
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/agents'));
app.use('/', require('./routes/calls'));
app.use('/', require('./routes/history'));

// Serve React build
app.use(express.static(path.join(__dirname, 'client', 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  log.info('SERVER', `Running on http://localhost:${PORT}`);
});

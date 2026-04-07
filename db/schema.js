const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const db = new Database(path.join(dataDir, 'calls.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS calls (
    id             TEXT PRIMARY KEY,
    direction      TEXT NOT NULL,
    number         TEXT NOT NULL,
    agent_username TEXT,
    started_at     TEXT,
    ended_at       TEXT,
    duration_sec   INTEGER,
    recording_url  TEXT,
    status         TEXT DEFAULT 'completed',
    transcript     TEXT,
    utterances     TEXT,
    analysis       TEXT
  );
`);

// Migration: add utterances column if it doesn't exist (safe to run on existing DBs)
try {
  db.exec(`ALTER TABLE calls ADD COLUMN utterances TEXT`);
} catch (err) {
  if (!err.message.includes('duplicate column name')) throw err;
}

module.exports = db;

const fs = require('fs');
const path = require('path');

const LOG_DIR  = path.join(__dirname, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'app.log');

// Ensure logs/ directory exists
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

function ts() {
  return new Date().toISOString().replace('T', ' ').replace('Z', '');
}

function write(level, tag, message, data) {
  const dataStr = data !== undefined ? ' ' + JSON.stringify(data) : '';
  const line = `[${ts()}] [${level.padEnd(5)}] [${tag}] ${message}${dataStr}\n`;
  process.stdout.write(line);
  fs.appendFileSync(LOG_FILE, line, 'utf8');
}

module.exports = {
  info:  (tag, msg, data) => write('INFO',  tag, msg, data),
  warn:  (tag, msg, data) => write('WARN',  tag, msg, data),
  error: (tag, msg, data) => write('ERROR', tag, msg, data),
  debug: (tag, msg, data) => write('DEBUG', tag, msg, data),
};

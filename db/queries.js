const db = require('./schema');

const stmtUpsert = db.prepare(`
  INSERT INTO calls (id, direction, number, agent_username, started_at, status)
  VALUES (@id, @direction, @number, @agent_username, @started_at, @status)
  ON CONFLICT(id) DO UPDATE SET
    direction      = excluded.direction,
    number         = excluded.number,
    agent_username = excluded.agent_username,
    started_at     = coalesce(calls.started_at, excluded.started_at),
    status         = excluded.status
`);

const stmtSetRecording = db.prepare(`
  UPDATE calls SET
    recording_url = COALESCE(NULLIF(@recording_url, ''), recording_url),
    duration_sec  = CASE WHEN @duration_sec > 0 THEN @duration_sec ELSE COALESCE(duration_sec, 0) END,
    ended_at      = COALESCE(NULLIF(@ended_at, ''), ended_at),
    status        = @status
  WHERE id = @id
`);

const stmtSetAnalysis = db.prepare(`
  UPDATE calls SET transcript = @transcript, utterances = @utterances, analysis = @analysis WHERE id = @id
`);

const stmtGet = db.prepare(`SELECT * FROM calls WHERE id = ?`);

const stmtList = db.prepare(`
  SELECT * FROM calls
  WHERE
    (@direction IS NULL OR direction = @direction) AND
    (@status    IS NULL OR status    = @status)    AND
    (@search    IS NULL OR number LIKE @search)
  ORDER BY started_at DESC
  LIMIT @limit OFFSET @offset
`);

const stmtCount = db.prepare(`
  SELECT COUNT(*) as total FROM calls
  WHERE
    (@direction IS NULL OR direction = @direction) AND
    (@status    IS NULL OR status    = @status)    AND
    (@search    IS NULL OR number LIKE @search)
`);

const stmtTodayStats = db.prepare(`
  SELECT
    COUNT(*) as total,
    SUM(CASE WHEN status = 'missed' THEN 1 ELSE 0 END) as missed,
    AVG(CASE WHEN duration_sec > 0 THEN duration_sec END) as avg_duration
  FROM calls
  WHERE started_at >= date('now')
`);

const stmtClearAll = db.prepare(`DELETE FROM calls`);

module.exports = {
  upsertCall: (data) => stmtUpsert.run(data),
  setRecording: (data) => stmtSetRecording.run(data),
  setAnalysis: (data) => stmtSetAnalysis.run(data),
  getCall: (id) => stmtGet.get(id),
  listCalls: (params) => stmtList.all(params),
  countCalls: (params) => stmtCount.get(params),
  todayStats: () => stmtTodayStats.get(),
  clearAllCalls: () => stmtClearAll.run(),
};

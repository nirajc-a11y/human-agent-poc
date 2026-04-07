import React, { useRef, useState } from 'react';

function formatMs(ms) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
import api from '../../api';
import SentimentBadge from '../shared/SentimentBadge';

function WaveformPlayer({ url }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  function toggle() {
    if (!ref.current) return;
    if (playing) { ref.current.pause(); setPlaying(false); }
    else { ref.current.play().then(() => setPlaying(true)).catch(() => {}); }
  }

  if (!url) return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
      background: 'var(--surface-raised)', borderRadius: 10, border: '1px solid var(--border)',
    }}>
      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <i className="fa-solid fa-waveform-lines" style={{ fontSize: 12, color: 'var(--text-3)' }} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>No recording available</span>
    </div>
  );

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
      background: 'var(--surface-raised)', borderRadius: 10, border: '1px solid var(--border)',
    }}>
      <audio ref={ref} src={url}
        onEnded={() => { setPlaying(false); setProgress(0); }}
        onTimeUpdate={() => { const el = ref.current; if (el?.duration) setProgress(el.currentTime / el.duration); }}
      />
      <button onClick={toggle} style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'var(--accent)', border: 'none', color: '#fff', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(91,106,245,.3)',
      }}>
        <i className={`fa-solid ${playing ? 'fa-pause' : 'fa-play'}`} style={{ fontSize: 11, marginLeft: playing ? 0 : 1 }} />
      </button>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, height: 30, overflow: 'hidden' }}>
        {Array.from({ length: 48 }).map((_, i) => {
          const h = 4 + Math.abs(Math.sin(i * 0.7 + 1) * 14) + Math.abs(Math.sin(i * 0.3) * 8);
          const filled = i / 48 < progress;
          return (
            <div key={i} style={{
              width: 2.5, flexShrink: 0, borderRadius: 2,
              height: `${h}px`,
              background: filled ? 'var(--accent)' : 'var(--accent-muted)',
              opacity: playing ? 1 : 0.55,
              transition: 'background .05s',
            }} />
          );
        })}
      </div>
      <span style={{ fontSize: 10, color: 'var(--text-3)', whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'monospace' }}>
        {playing ? 'Playing...' : 'Play'}
      </span>
    </div>
  );
}

export default function CallDetail({ call, onAnalysisUpdate }) {
  const [loading, setLoading] = useState(false);
  const analysis = call.analysis
    ? (typeof call.analysis === 'string' ? JSON.parse(call.analysis) : call.analysis)
    : null;
  const utterances = call.utterances
    ? (typeof call.utterances === 'string' ? JSON.parse(call.utterances) : call.utterances)
    : null;
  const isAgent = (speaker) => speaker === 'A';
  const speakerLabel = (speaker) => speaker === 'A' ? 'Agent' : 'User';

  async function reAnalyze() {
    setLoading(true);
    try {
      const { data } = await api.post(`/calls/${call.id}/analyze`);
      onAnalysisUpdate(call.id, data);
    } catch (e) {
      console.error('Analysis failed:', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <WaveformPlayer url={call.recording_url} />

      {/* Transcript */}
      {utterances ? (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderLeft: '3px solid var(--accent)', borderRadius: '0 10px 10px 0',
          padding: '10px 14px',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>Transcript</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto', padding: '2px 0' }}>
            {utterances.length === 0 && (
              <p style={{ fontSize: 11, color: 'var(--text-3)', fontStyle: 'italic', margin: 0 }}>No speech detected</p>
            )}
            {utterances.map((u, i) => {
              const agent = isAgent(u.speaker);
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: agent ? 'flex-end' : 'flex-start' }}>
                  <div style={{ fontSize: 9, color: 'var(--text-3)', marginBottom: 2, paddingLeft: agent ? 0 : 4, paddingRight: agent ? 4 : 0 }}>
                    {speakerLabel(u.speaker)} · {formatMs(u.start)}
                  </div>
                  <div style={{
                    maxWidth: '80%', padding: '7px 11px',
                    borderRadius: agent ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                    background: agent ? 'var(--accent)' : 'var(--surface-raised)',
                    color: agent ? '#fff' : 'var(--text-1)',
                    fontSize: 12, lineHeight: 1.6,
                    border: agent ? 'none' : '1px solid var(--border)',
                  }}>
                    {u.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : call.transcript ? (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderLeft: '3px solid var(--accent)', borderRadius: '0 10px 10px 0',
          padding: '10px 14px',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>Transcript</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.75, maxHeight: 100, overflowY: 'auto' }}>
            {call.transcript}
          </div>
        </div>
      ) : (
        <p style={{ fontSize: 11, color: 'var(--text-3)', fontStyle: 'italic', margin: 0 }}>
          {call.recording_url ? 'Transcript pending...' : 'No transcript available'}
        </p>
      )}

      {/* Analysis */}
      {analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Chips row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            {analysis.sentiment && <SentimentBadge sentiment={analysis.sentiment} />}
            {analysis.intent && (
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, fontWeight: 500, background: 'var(--accent-dim)', border: '1px solid var(--accent-muted)', color: '#3730a3', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <i className="fa-solid fa-bullseye" style={{ fontSize: 9 }} />{analysis.intent}
              </span>
            )}
            {analysis.entities?.map((e, i) => (
              <span key={i} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, fontWeight: 500, background: 'var(--green-dim)', border: '1px solid var(--green-border)', color: '#166534', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <i className="fa-solid fa-tag" style={{ fontSize: 9 }} />{e.value}
              </span>
            ))}
          </div>

          {/* Action items */}
          {analysis.action_items?.length > 0 && (
            <div style={{ background: 'var(--amber-dim)', border: '1px solid var(--amber-border)', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                <i className="fa-solid fa-list-check" /> Action Items
              </div>
              <ul style={{ paddingLeft: 16, margin: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {analysis.action_items.map((a, i) => (
                  <li key={i} style={{ fontSize: 12, color: '#78350f', lineHeight: 1.6 }}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Summary */}
          {analysis.summary && (
            <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>{analysis.summary}</p>
          )}
        </div>
      )}

      {!analysis && call.transcript && (
        <p style={{ fontSize: 11, color: 'var(--text-3)', fontStyle: 'italic', margin: 0 }}>Analysis pending...</p>
      )}

      {call.recording_url && (
        <div>
          <button onClick={reAnalyze} disabled={loading} style={{
            fontSize: 11, fontWeight: 600,
            padding: '5px 12px', borderRadius: 7, cursor: loading ? 'not-allowed' : 'pointer',
            border: '1px solid', transition: 'all .12s',
            background: loading ? 'var(--surface-raised)' : 'var(--accent-dim)',
            borderColor: loading ? 'var(--border)' : 'var(--accent-muted)',
            color: loading ? 'var(--text-3)' : 'var(--accent)',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <i className={`fa-solid ${loading ? 'fa-circle-notch fa-spin' : 'fa-rotate-right'}`} style={{ fontSize: 10 }} />
            {loading ? 'Analyzing...' : 'Re-analyze'}
          </button>
        </div>
      )}
    </div>
  );
}

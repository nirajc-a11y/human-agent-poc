import React, { useState } from 'react';
import SentimentBadge from '../shared/SentimentBadge';
import CallDetail from './CallDetail';

const DIR = {
  inbound:  { icon: 'fa-arrow-down-left', bg: '#eff6ff', color: '#3b82f6', label: 'Inbound'  },
  outbound: { icon: 'fa-arrow-up-right',  bg: '#fffbeb', color: '#f59e0b', label: 'Outbound' },
  missed:   { icon: 'fa-phone-missed',    bg: '#fef2f2', color: '#ef4444', label: 'Missed'   },
};

function fmtDur(s) {
  if (!s) return '—';
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

function fmtTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const isToday = d.toDateString() === new Date().toDateString();
  return isToday
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function CallRow({ call, onAnalysisUpdate }) {
  const [open, setOpen] = useState(false);
  const cfg = DIR[call.status === 'missed' ? 'missed' : call.direction] || DIR.inbound;
  const analysis = call.analysis
    ? (typeof call.analysis === 'string' ? JSON.parse(call.analysis) : call.analysis)
    : null;

  return (
    <div style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: open ? 'var(--surface-raised)' : 'var(--surface)',
      transition: 'background .1s',
    }}>
      {/* Row */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          padding: '11px 20px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 12,
          borderLeft: `3px solid ${open ? 'var(--accent)' : 'transparent'}`,
        }}
      >
        {/* Icon */}
        <div style={{
          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
          background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className={`fa-solid ${cfg.icon}`} style={{ fontSize: 13, color: cfg.color }} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{call.number}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
            <span>·</span>
            <span>{fmtDur(call.duration_sec)}</span>
            {call.status === 'voicemail' && <><span>·</span><span style={{ color: 'var(--text-3)' }}>Voicemail</span></>}
            {call.analysis === null && call.recording_url && (
              <span style={{ color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 9 }} /> Analyzing
              </span>
            )}
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{fmtTime(call.started_at)}</span>
          {analysis?.sentiment && <SentimentBadge sentiment={analysis.sentiment} />}
        </div>

        <i className={`fa-solid fa-chevron-${open ? 'up' : 'down'}`} style={{ fontSize: 10, color: 'var(--text-3)', flexShrink: 0 }} />
      </div>

      {/* Expanded */}
      {open && (
        <div style={{ padding: '4px 20px 16px 20px', animation: 'slide-up .15s ease' }}>
          <CallDetail call={call} onAnalysisUpdate={onAnalysisUpdate} />
        </div>
      )}
    </div>
  );
}

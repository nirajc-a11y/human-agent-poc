import React from 'react';

const STATUS_CONFIG = {
  disconnected: { label: 'Disconnected', color: '#64748b' },
  connected:    { label: 'Connected',    color: '#22c55e' },
  ringing:      { label: 'Ringing',      color: '#f59e0b', pulse: true },
  oncall:       { label: 'On Call',      color: '#4f6ef7' },
};

export default function StatusBadge({ status = 'disconnected', compact = false }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.disconnected;

  if (compact) {
    return (
      <div title={cfg.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <div style={{
          width: 8, height: 8,
          background: cfg.color,
          animation: cfg.pulse ? 'statusPulse 0.8s infinite' : 'none',
        }} />
        <style>{`@keyframes statusPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
        <span style={{ fontSize: 8, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
          {cfg.label.split(' ')[0]}
        </span>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5, fontSize: 11,
      color: 'var(--color-text-secondary)', background: '#f8fafc',
      border: '1px solid var(--color-border)', padding: '3px 9px',
    }}>
      <div style={{
        width: 6, height: 6, flexShrink: 0,
        background: cfg.color,
        animation: cfg.pulse ? 'statusPulse 0.8s infinite' : 'none',
      }} />
      <style>{`@keyframes statusPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      {cfg.label}
    </div>
  );
}

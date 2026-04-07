import React from 'react';

function fmtDur(s) {
  if (!s) return '—';
  const m = Math.floor(s / 60), r = Math.round(s % 60);
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
}

export default function StatsRow({ stats }) {
  const total    = stats?.total    ?? 0;
  const missed   = stats?.missed   ?? 0;
  const answered = total - missed;
  const rate     = total > 0 ? Math.round((answered / total) * 100) : 0;
  const avg      = stats?.avg_duration ?? 0;

  const cards = [
    { val: total,       sub: 'Calls Today',  icon: 'fa-phone',       iconBg: 'var(--accent-dim)',  iconColor: 'var(--accent)',  valColor: 'var(--accent)' },
    { val: fmtDur(avg), sub: 'Avg Duration', icon: 'fa-clock',       iconBg: '#f1f5f9',            iconColor: '#64748b',        valColor: 'var(--text-1)' },
    { val: `${rate}%`,  sub: 'Answer Rate',  icon: 'fa-circle-check',iconBg: 'var(--green-dim)',   iconColor: 'var(--green)',   valColor: rate > 70 ? 'var(--green)' : rate > 40 ? 'var(--amber)' : 'var(--red)' },
    { val: missed,      sub: 'Missed',       icon: 'fa-phone-missed', iconBg: 'var(--red-dim)',     iconColor: 'var(--red)',     valColor: missed > 0 ? 'var(--red)' : 'var(--text-1)' },
  ];

  return (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
      {cards.map((c, i) => (
        <div key={i} style={{
          flex: 1, padding: '16px 20px',
          borderRight: i < 3 ? '1px solid var(--border)' : 'none',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: c.iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className={`fa-solid ${c.icon}`} style={{ fontSize: 15, color: c.iconColor }} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, color: c.valColor, letterSpacing: '-0.5px' }}>{c.val}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600 }}>{c.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

import React from 'react';

const C = {
  positive: { bg: '#f0fdf4', border: '#86efac', color: '#15803d', icon: 'fa-face-smile'  },
  neutral:  { bg: '#f8fafc', border: '#e2e8f0', color: '#64748b', icon: 'fa-face-meh'    },
  negative: { bg: '#fef2f2', border: '#fca5a5', color: '#dc2626', icon: 'fa-face-frown'  },
};

export default function SentimentBadge({ sentiment }) {
  const key = sentiment?.toLowerCase();
  const c = C[key] || C.neutral;
  return (
    <span style={{
      fontSize: 11, padding: '3px 9px', borderRadius: 99,
      background: c.bg, border: `1px solid ${c.border}`, color: c.color,
      fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5,
    }}>
      <i className={`fa-solid ${c.icon}`} style={{ fontSize: 10 }} />
      {key ? key.charAt(0).toUpperCase() + key.slice(1) : 'Neutral'}
    </span>
  );
}

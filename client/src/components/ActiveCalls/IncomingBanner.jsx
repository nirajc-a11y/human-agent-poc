import React from 'react';

export default function IncomingBanner({ number, onAccept, onReject }) {
  return (
    <div style={{
      background: 'var(--amber-dim)', borderBottom: '1px solid var(--amber-border)',
      padding: '12px 14px', animation: 'slide-up .18s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9, flexShrink: 0,
          background: 'rgba(217,119,6,.1)', border: '1px solid rgba(217,119,6,.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'ring-anim 1s infinite',
        }}>
          <i className="fa-solid fa-phone-arrow-down-left" style={{ fontSize: 13, color: 'var(--amber)' }} />
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Incoming Call</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginTop: 1 }}>{number}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 7 }}>
        <button onClick={onAccept} style={{
          flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
          background: 'var(--green)', color: '#fff', fontSize: 12, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          boxShadow: '0 2px 8px rgba(22,163,74,.25)', cursor: 'pointer',
        }}>
          <i className="fa-solid fa-phone" style={{ fontSize: 10 }} /> Accept
        </button>
        <button onClick={onReject} style={{
          flex: 1, padding: '8px 0', borderRadius: 8,
          background: 'var(--surface)', color: 'var(--text-2)', fontSize: 12, fontWeight: 600,
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          cursor: 'pointer',
        }}>
          <i className="fa-solid fa-phone-slash" style={{ fontSize: 10 }} /> Decline
        </button>
      </div>
    </div>
  );
}

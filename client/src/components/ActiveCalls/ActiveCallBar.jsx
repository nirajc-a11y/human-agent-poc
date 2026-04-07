import React, { useState, useEffect } from 'react';

function fmt(s) {
  return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
}

export default function ActiveCallBar({ callState, onHangup, onMute }) {
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (!callState?.startedAt) return;
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - callState.startedAt) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [callState?.startedAt]);

  function toggleMute() { const n = !muted; setMuted(n); onMute(n); }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
      padding: '12px 14px',
      display: 'flex', alignItems: 'center', gap: 10,
      animation: 'slide-up .18s ease',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 9, flexShrink: 0,
        background: 'rgba(255,255,255,.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'ring-anim 2s infinite',
      }}>
        <i className="fa-solid fa-phone-volume" style={{ fontSize: 14, color: '#93c5fd' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#f0f9ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {callState?.number}
        </div>
        <div style={{ fontSize: 10, color: '#93c5fd', marginTop: 1, display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
          {callState?.direction === 'inbound' ? 'Inbound' : 'Outbound'} · {fmt(elapsed)}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 5 }}>
        <button onClick={toggleMute} title={muted ? 'Unmute' : 'Mute'} style={{
          width: 30, height: 30, borderRadius: 7, border: 'none',
          background: muted ? 'rgba(220,38,38,.5)' : 'rgba(255,255,255,.12)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <i className={`fa-solid ${muted ? 'fa-microphone-slash' : 'fa-microphone'}`} style={{ fontSize: 11 }} />
        </button>
        <button onClick={onHangup} title="End Call" style={{
          width: 30, height: 30, borderRadius: 7, border: 'none',
          background: 'var(--red)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <i className="fa-solid fa-phone-slash" style={{ fontSize: 11 }} />
        </button>
      </div>
    </div>
  );
}

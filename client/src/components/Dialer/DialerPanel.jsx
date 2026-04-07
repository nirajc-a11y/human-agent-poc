import React, { useState } from 'react';
import Keypad from './Keypad';
import ActiveCallBar from '../ActiveCalls/ActiveCallBar';
import IncomingBanner from '../ActiveCalls/IncomingBanner';

export default function DialerPanel({ plivo }) {
  const [number, setNumber] = useState('');
  const isOnCall  = plivo.status === 'oncall';
  const isRinging = plivo.status === 'ringing';
  const isActive  = isOnCall || isRinging;

  function handleKey(key) {
    if (key === 'DEL') setNumber(p => p.slice(0, -1));
    else setNumber(p => p + key);
  }

  return (
    <div style={{
      width: 300, flexShrink: 0,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {plivo.incomingCall && (
        <IncomingBanner number={plivo.incomingCall.number} onAccept={plivo.accept} onReject={plivo.reject} />
      )}
      {plivo.callState && (
        <ActiveCallBar callState={plivo.callState} onHangup={plivo.hangup} onMute={plivo.mute} />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 16px 0', overflow: 'hidden' }}>
        {/* Label */}
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: 10 }}>
          Dial Number
        </div>

        {/* Input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--surface-2)', border: '1.5px solid var(--border)',
          borderRadius: 10, padding: '9px 12px', marginBottom: 14,
          transition: 'border-color .15s, box-shadow .15s',
        }}
          onFocusCapture={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,110,247,.1)'; }}
          onBlurCapture={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <i className="fa-solid fa-phone" style={{ fontSize: 11, color: 'var(--text-4)', flexShrink: 0 }} />
          <input type="tel" value={number}
            onChange={e => setNumber(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isActive && number.trim() && plivo.dial(number.trim())}
            placeholder="+1 (555) 000-0000"
            style={{
              flex: 1, border: 'none', background: 'transparent',
              fontSize: 15, fontWeight: 600, letterSpacing: 1.2,
              fontFamily: "'SF Mono','Fira Code','Roboto Mono',monospace",
              color: 'var(--text-1)',
            }}
          />
          {number && (
            <button onClick={() => setNumber('')} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-4)', cursor: 'pointer', lineHeight: 1 }}>
              <i className="fa-solid fa-xmark" style={{ fontSize: 11 }} />
            </button>
          )}
        </div>

        {/* Keypad */}
        <Keypad onKey={handleKey} />
      </div>

      {/* Call button */}
      <div style={{ padding: '14px 16px 18px' }}>
        {isActive ? (
          <button onClick={plivo.hangup} style={{
            width: '100%', padding: '12px 0', borderRadius: 10, border: 'none',
            background: 'var(--red)', color: '#fff',
            fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 2px 12px rgba(220,38,38,.25)',
          }}>
            <i className="fa-solid fa-phone-slash" />
            {isRinging ? 'Cancel' : 'End Call'}
          </button>
        ) : (
          <button onClick={() => number.trim() && plivo.dial(number.trim())}
            disabled={!number.trim()} style={{
              width: '100%', padding: '12px 0', borderRadius: 10, border: 'none',
              background: number.trim() ? 'var(--green)' : 'var(--surface-3)',
              color: number.trim() ? '#fff' : 'var(--text-4)',
              fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: number.trim() ? '0 2px 12px rgba(22,163,74,.25)' : 'none',
              transition: 'all .15s',
            }}>
            <i className="fa-solid fa-phone" />
            Call
          </button>
        )}
      </div>
    </div>
  );
}

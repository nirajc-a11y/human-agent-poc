import React from 'react';
import ActiveCallBar from './ActiveCallBar';
import IncomingBanner from './IncomingBanner';

export default function ActiveCallsPage({ plivo }) {
  const hasCall     = !!plivo.callState;
  const hasIncoming = !!plivo.incomingCall;

  if (!hasCall && !hasIncoming) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 14,
        background: 'var(--surface)', animation: 'fade-in .2s ease',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'var(--surface-raised)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className="fa-solid fa-tower-broadcast" style={{ fontSize: 28, color: 'var(--text-3)' }} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-2)', textAlign: 'center' }}>No active calls</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', marginTop: 4, lineHeight: 1.6 }}>
            Incoming calls will appear here automatically
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflow: 'hidden', background: 'var(--surface)' }}>
      {hasIncoming && (
        <IncomingBanner
          number={plivo.incomingCall.number}
          onAccept={plivo.accept}
          onReject={plivo.reject}
        />
      )}
      {hasCall && (
        <div style={{ padding: 20 }}>
          <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
            <ActiveCallBar callState={plivo.callState} onHangup={plivo.hangup} onMute={plivo.mute} />
          </div>
        </div>
      )}
    </div>
  );
}

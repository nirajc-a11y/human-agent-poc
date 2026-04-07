import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import DialerPanel from '../Dialer/DialerPanel';
import CallHistoryPage from '../CallHistory/CallHistoryPage';
import ActiveCallsPage from '../ActiveCalls/ActiveCallsPage';
import { usePlivo } from '../../hooks/usePlivo';

const STATUS = {
  disconnected: { color: '#9ca3af', label: 'Offline'  },
  connected:    { color: '#22c55e', label: 'Online'   },
  ringing:      { color: '#f59e0b', label: 'Ringing', pulse: true },
  oncall:       { color: '#4f6ef7', label: 'On Call'  },
};

const NAV = [
  { path: '/history', icon: 'fa-clock-rotate-left', tip: 'Call History' },
  { path: '/active',  icon: 'fa-tower-broadcast',   tip: 'Active Calls' },
];

function Sidebar({ agent, onLogout, status, path }) {
  const nav = useNavigate();
  const s = STATUS[status] || STATUS.disconnected;
  const initials = (agent?.name || agent?.username || '?')
    .split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <aside style={{
      width: 64, flexShrink: 0,
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--sidebar-border)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      {/* Logo tile */}
      <div
        onClick={() => nav('/history')}
        title="VSynergize AI"
        style={{
          width: 64, height: 64, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderBottom: '1px solid var(--sidebar-border)',
          cursor: 'pointer',
        }}
      >
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'rgba(79,110,247,0.18)',
          border: '1px solid rgba(79,110,247,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', padding: 6,
        }}>
          <img
            src="/vsynergize-ai-logo.svg"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
          <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
            <i className="fa-solid fa-phone" style={{ color: '#7c8df8', fontSize: 14 }} />
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0', gap: 4, width: '100%' }}>
        {NAV.map(item => {
          const active = path.startsWith(item.path);
          return (
            <button key={item.path} onClick={() => nav(item.path)} title={item.tip} style={{
              width: 44, height: 44, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: active ? 'rgba(79,110,247,0.18)' : 'transparent',
              color: active ? '#818cf8' : '#6b7280',
              border: 'none', cursor: 'pointer',
              transition: 'all 0.12s',
              position: 'relative',
            }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#d1d5db'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280'; } }}
            >
              <i className={`fa-solid ${item.icon}`} style={{ fontSize: 15 }} />
              {active && (
                <div style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  width: 3, height: 18, background: '#4f6ef7',
                  borderRadius: '0 3px 3px 0',
                }} />
              )}
              {item.path === '/active' && (status === 'oncall' || status === 'ringing') && (
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 6, height: 6, borderRadius: '50%',
                  background: status === 'ringing' ? '#f59e0b' : '#4f6ef7',
                  border: '1.5px solid var(--sidebar-bg)',
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{
        width: '100%', padding: '10px 0',
        borderTop: '1px solid var(--sidebar-border)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      }}>
        <div title={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, animation: s.pulse ? 'pulse-dot 1s infinite' : 'none' }} />
          <span style={{ fontSize: 9, color: '#4b5563', letterSpacing: '0.3px' }}>{s.label}</span>
        </div>
        <button onClick={onLogout} title={`${agent?.name} · Sign out`} style={{
          width: 32, height: 32, borderRadius: 9,
          background: 'linear-gradient(135deg,#3b4fd4,#4f6ef7)',
          border: '2px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.3px',
          cursor: 'pointer', marginBottom: 4,
        }}>
          {initials}
        </button>
      </div>
    </aside>
  );
}

function Topbar({ path, status }) {
  const s = STATUS[status] || STATUS.disconnected;
  const titles = { '/history': 'Call History', '/active': 'Active Calls' };
  const title = Object.entries(titles).find(([p]) => path.startsWith(p))?.[1] || 'Call History';
  return (
    <div style={{
      height: 52, padding: '0 24px', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-0.1px' }}>{title}</span>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: 7, padding: '4px 10px',
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, animation: s.pulse ? 'pulse-dot 1s infinite' : 'none' }} />
        <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>{s.label}</span>
      </div>
    </div>
  );
}

export default function AppShell({ agent, onLogout }) {
  const plivo = usePlivo(agent);
  const { pathname } = useLocation();
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <Sidebar agent={agent} onLogout={onLogout} status={plivo.status} path={pathname} />
      <DialerPanel plivo={plivo} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Topbar path={pathname} status={plivo.status} />
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/history" element={<CallHistoryPage />} />
            <Route path="/active"  element={<ActiveCallsPage plivo={plivo} />} />
            <Route path="*"        element={<Navigate to="/history" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

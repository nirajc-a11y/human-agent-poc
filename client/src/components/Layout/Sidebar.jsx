import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/dialer',  icon: 'fa-solid fa-phone',              title: 'Dialer'       },
  { path: '/history', icon: 'fa-solid fa-clock-rotate-left',  title: 'Call History' },
  { path: '/active',  icon: 'fa-solid fa-tower-broadcast',    title: 'Active Calls' },
];

export default function Sidebar({ agent, onLogout }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const initials = (agent?.name || agent?.username || '?')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{ width: 52, background: 'var(--color-sidebar-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, borderRight: '1px solid var(--color-sidebar-border)' }}>
      {/* Logo */}
      <div style={{ width: 52, height: 52, background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderBottom: '1px solid var(--color-sidebar-border)', cursor: 'pointer' }} onClick={() => navigate('/history')}>
        <img src="/vsynergize-ai-logo.svg" alt="" style={{ width: 24, height: 24 }} onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
        <i className="fa-solid fa-phone" style={{ display: 'none', color: '#fff', fontSize: 18 }} />
      </div>
      {/* Nav */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0', gap: 2, flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const active = pathname.startsWith(item.path);
          return (
            <div key={item.path} title={item.title}
              onClick={() => navigate(item.path)}
              style={{ width: 52, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: active ? 'var(--color-accent)' : '#64748b', background: active ? 'rgba(79,110,247,0.08)' : 'transparent', borderLeft: `2px solid ${active ? 'var(--color-accent)' : 'transparent'}`, transition: 'all 0.1s' }}>
              <i className={item.icon} style={{ fontSize: 15 }} />
            </div>
          );
        })}
      </div>
      {/* Bottom */}
      <div style={{ padding: '12px 0', borderTop: '1px solid var(--color-sidebar-border)', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div title="Settings" style={{ width: 52, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
          <i className="fa-solid fa-gear" style={{ fontSize: 14 }} />
        </div>
        <div title={`${agent?.name} — Click to logout`}
          onClick={onLogout}
          style={{ width: 28, height: 28, background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.5px', cursor: 'pointer', marginBottom: 4 }}>
          {initials}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try { await onLogin(username.trim(), password); }
    catch (err) { setError(err.response?.data?.error || 'Invalid credentials. Please try again.'); }
    finally { setLoading(false); }
  }

  const input = {
    border: '1.5px solid var(--border-strong)', borderRadius: 8,
    padding: '10px 13px', fontSize: 13,
    background: 'var(--surface)', color: 'var(--text-1)',
    width: '100%', transition: 'border-color .15s, box-shadow .15s',
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'var(--surface)', border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', padding: 10,
          }}>
            <img src="/vsynergize-ai-logo.svg" alt="VSynergize AI"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
            />
            <i className="fa-solid fa-phone" style={{ display: 'none', color: 'var(--accent)', fontSize: 20 }} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.3px' }}>Agent Portal</div>
          <div style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 3 }}>VSynergize AI · Call Center</div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 14, padding: '28px 28px 24px',
          boxShadow: 'var(--shadow-md)',
        }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)' }}>Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="sip_username" autoComplete="username" autoFocus style={input}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(79,110,247,.12)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                autoComplete="current-password" style={input}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(79,110,247,.12)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {error && (
              <div style={{
                background: 'var(--red-dim)', border: '1px solid var(--red-border)',
                borderRadius: 7, padding: '8px 12px',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <i className="fa-solid fa-circle-exclamation" style={{ color: 'var(--red)', fontSize: 12, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--red)' }}>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading || !username || !password} style={{
              marginTop: 4, padding: '11px 0', borderRadius: 9, border: 'none',
              background: 'var(--accent)', color: '#fff',
              fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 2px 10px rgba(79,110,247,.3)',
              transition: 'background .15s, box-shadow .15s',
            }}
              onMouseEnter={e => { if (!loading && username && password) { e.currentTarget.style.background = 'var(--accent-hover)'; } }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; }}
            >
              {loading
                ? <><i className="fa-solid fa-circle-notch fa-spin" /> Signing in...</>
                : <><i className="fa-solid fa-arrow-right-to-bracket" /> Sign In</>}
            </button>
          </form>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-4)' }}>Contact your administrator for access credentials</span>
          </div>
        </div>
      </div>
    </div>
  );
}

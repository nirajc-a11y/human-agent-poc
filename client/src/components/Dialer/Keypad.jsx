import React from 'react';

const KEYS = [
  ['1',''],['2','ABC'],['3','DEF'],
  ['4','GHI'],['5','JKL'],['6','MNO'],
  ['7','PQRS'],['8','TUV'],['9','WXYZ'],
  ['*',''],['0','+'],['DEL',''],
];

export default function Keypad({ onKey }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7 }}>
      {KEYS.map(([d, sub]) => (
        <button key={d} onClick={() => onKey(d)} style={{
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 9, padding: '11px 0',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 1, cursor: 'pointer',
          transition: 'background .1s, border-color .1s, transform .08s',
          boxShadow: 'var(--shadow-xs)',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-dim)'; e.currentTarget.style.borderColor = 'var(--accent-muted)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.93)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {d === 'DEL'
            ? <i className="fa-solid fa-delete-left" style={{ fontSize: 15, color: 'var(--text-3)' }} />
            : <>
                <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-1)', lineHeight: 1 }}>{d}</span>
                {sub && <span style={{ fontSize: 8, color: 'var(--text-4)', letterSpacing: '1.2px', fontWeight: 600, marginTop: 1 }}>{sub}</span>}
              </>
          }
        </button>
      ))}
    </div>
  );
}

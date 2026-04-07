import React from 'react';

const FILTERS = [
  { key: '',         label: 'All'      },
  { key: 'inbound',  label: 'Inbound'  },
  { key: 'outbound', label: 'Outbound' },
  { key: 'missed',   label: 'Missed'   },
];

export default function FilterBar({ active, onFilter, search, onSearch, onClear }) {
  return (
    <div style={{
      padding: '10px 16px', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
      background: 'var(--surface)',
    }}>
      {FILTERS.map(f => {
        const on = active === f.key;
        return (
          <button key={f.key} onClick={() => onFilter(f.key)} style={{
            padding: '5px 14px', borderRadius: 7,
            fontSize: 12, fontWeight: on ? 600 : 500,
            border: '1px solid',
            background: on ? 'var(--accent)' : 'var(--surface)',
            color: on ? '#fff' : 'var(--text-2)',
            borderColor: on ? 'var(--accent)' : 'var(--border)',
            cursor: 'pointer', transition: 'all .12s',
          }}>
            {f.label}
          </button>
        );
      })}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        {onClear && (
          <button onClick={onClear} title="Clear all call history" style={{
            padding: '5px 12px', borderRadius: 7,
            fontSize: 12, fontWeight: 500,
            border: '1px solid var(--red)',
            background: 'var(--red-dim)',
            color: 'var(--red)',
            cursor: 'pointer', transition: 'all .12s',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <i className="fa-solid fa-trash" style={{ fontSize: 10 }} />
            Clear
          </button>
        )}

      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        background: 'var(--surface-raised)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '6px 12px',
        transition: 'border-color .15s',
      }}
        onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--accent)'}
        onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        <i className="fa-solid fa-magnifying-glass" style={{ fontSize: 11, color: 'var(--text-3)' }} />
        <input
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search by number..."
          style={{ border: 'none', background: 'transparent', width: 160, color: 'var(--text-1)', fontSize: 12 }}
        />
        {search && (
          <button onClick={() => onSearch('')} style={{ border: 'none', background: 'none', padding: 0, color: 'var(--text-3)', cursor: 'pointer', lineHeight: 1 }}>
            <i className="fa-solid fa-xmark" style={{ fontSize: 11 }} />
          </button>
        )}
      </div>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'classes',   label: '🏫 Classes'   },
  { id: 'students',  label: '👤 Students'  },
  { id: 'analytics', label: '📊 Analytics' },
]

export default function Tabs({ active, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 4,
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 12, padding: 4, marginBottom: 24,
      boxShadow: 'var(--shadow)',
    }}>
      {TABS.map(t => (
        <div key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            flex: 1, textAlign: 'center',
            padding: '10px 16px', borderRadius: 9,
            cursor: 'pointer',
            fontFamily: 'var(--mono)', fontSize: 10,
            letterSpacing: '1.5px', textTransform: 'uppercase',
            transition: 'all 0.2s',
            background: active === t.id ? 'var(--text)' : 'transparent',
            color: active === t.id ? '#fff' : 'var(--muted)',
            fontWeight: active === t.id ? 700 : 400,
          }}
        >{t.label}</div>
      ))}
    </div>
  )
}

export default function LockedOverlay({ message, children }) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ filter: 'blur(7px)', pointerEvents: 'none', userSelect: 'none' }} aria-hidden="true">
        {children}
      </div>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.06)',
      }}>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '20px 28px', boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
          textAlign: 'center', maxWidth: 320,
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Locked</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{message}</div>
        </div>
      </div>
    </div>
  )
}

// Small inline badge used on interactive demo features (attendance, games, etc.)
// so it's always clear the input isn't being saved for real.
export function DemoBadge({ style }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: 1,
      padding: '3px 9px', borderRadius: 20, textTransform: 'uppercase',
      background: 'rgba(124,58,237,0.12)', color: 'var(--elite)',
      border: '1px solid rgba(124,58,237,0.3)',
      ...style,
    }}>
      🧪 Demo — not saved
    </span>
  )
}

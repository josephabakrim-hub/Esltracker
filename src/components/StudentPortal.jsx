export default function StudentPortal({ student, classes, students, isDark, onToggleTheme, onLogout }) {
  const myClass = classes.find(c => c.id === student?.classId)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Header */}
      <div style={{
        background: isDark ? '#0f0e0c' : '#1a1814',
        color: '#fff',
        padding: '16px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>
            <span style={{ color: 'var(--accent)' }}>{student?.nameEn || 'Student'}</span>
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 3, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
            Student Portal
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={onToggleTheme}
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 9, color: '#fff', cursor: 'pointer', fontSize: 16, padding: '7px 11px' }}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <button
            onClick={onLogout}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 1, padding: '7px 14px', textTransform: 'uppercase' }}
          >
            Log out
          </button>
        </div>
      </div>

      {/* Coming soon body */}
      <div style={{ maxWidth: 600, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>

        {/* Student card */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 20, padding: '32px 28px', marginBottom: 24,
          boxShadow: 'var(--shadow)',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(59,130,246,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 800, color: '#3b82f6',
            margin: '0 auto 16px',
          }}>
            {student?.nameEn?.[0] || '?'}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{student?.nameEn}</div>
          {student?.nameVn && <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{student.nameVn}</div>}
          {myClass && (
            <div style={{ display: 'inline-block', marginTop: 12, padding: '4px 14px', borderRadius: 20, background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 1 }}>
              {myClass.name}
            </div>
          )}
        </div>

        {/* Placeholder message */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '28px 24px',
          boxShadow: 'var(--shadow)',
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🚀</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Your portal is being built!</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
            Exercises, quizzes, leaderboards and your personal progress dashboard are coming soon.
            Check back after Teacher Joseph sets everything up.
          </div>
        </div>
      </div>
    </div>
  )
}

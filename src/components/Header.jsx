export default function Header({ onAddClass, onAddStudent, isDark, onToggleTheme, readOnly, role, onSwitchRole, studentName }) {
  const isStudent = role === 'student'

  return (
    <div style={{
      background: isDark ? '#0f0e0c' : '#1a1814',
      color: '#fff',
      padding: '16px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      transition: 'background 0.2s',
    }}>

      {/* Left — always Teacher Joseph branding */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>
          Teacher <span style={{ color: 'var(--accent)' }}>Joseph</span>
        </div>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 3,
          color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
        }}>
          ESL Student Tracker
        </div>
      </div>

      {/* Centre — student name badge (only when a student is logged in) */}
      {isStudent && studentName && (
        <div style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2,
          pointerEvents: 'none',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(59,130,246,0.18)',
            border: '1px solid rgba(59,130,246,0.35)',
            borderRadius: 20, padding: '5px 16px 5px 10px',
          }}>
            {/* Avatar circle */}
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'rgba(59,130,246,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0,
            }}>
              {studentName[0]}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{studentName}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: 2, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>
                Student
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right — actions */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>

        {/* Role badge — only for non-student roles */}
        {role && !isStudent && (
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 1.5,
            color: readOnly ? 'rgba(255,255,255,0.35)' : 'rgba(232,93,38,0.8)',
            textTransform: 'uppercase', paddingRight: 4,
          }}>
            {readOnly ? '👁 View only' : `✏️ ${role}`}
          </div>
        )}

        {onAddClass && (
          <button
            className="btn btn-outline"
            style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.15)' }}
            onClick={onAddClass}
          >
            + Add Class
          </button>
        )}

        {onAddStudent && (
          <button className="btn btn-accent" onClick={onAddStudent}>
            + Add Student
          </button>
        )}

        <button
          onClick={onToggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 9, color: '#fff', cursor: 'pointer',
            fontSize: 16, padding: '7px 11px', transition: 'all 0.15s',
            display: 'inline-flex', alignItems: 'center',
          }}
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        {onSwitchRole && (
          <button
            onClick={onSwitchRole}
            title={isStudent ? 'Log out' : 'Switch role'}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 9, color: 'rgba(255,255,255,0.45)', cursor: 'pointer',
              fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 1,
              padding: '7px 11px', transition: 'all 0.15s',
              textTransform: 'uppercase',
            }}
          >
            {isStudent ? 'Log out' : 'Switch'}
          </button>
        )}
      </div>
    </div>
  )
}

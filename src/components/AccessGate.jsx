import { useState, useEffect, useRef } from 'react'

const ROLES = [
  {
    id:    'student',
    icon:  '👨‍🎓',
    label: 'Student',
    desc:  'View your class results and progress',
    color: '#3b82f6',
  },
  {
    id:    'parent',
    icon:  '👨‍👩‍👧',
    label: 'Parent',
    desc:  "Follow your child's learning journey",
    color: '#22c55e',
  },
  {
    id:    'colleague',
    icon:  '🏫',
    label: 'Colleague / Manager',
    desc:  'View class analytics and student progress',
    color: '#f59e0b',
  },
  {
    id:    'teacher',
    icon:  '🔐',
    label: 'Teacher Joseph',
    desc:  'Full access — password required',
    color: '#7c6aff',
    requiresPassword: true,
  },
]

const CORRECT_PASSWORD = 'Tamazirt'
const MAX_ATTEMPTS     = 3
const LOCKOUT_SECONDS  = 30

export default function AccessGate({ onAccess }) {
  const [step,        setStep]        = useState('select')   // 'select' | 'password'
  const [selectedRole, setSelectedRole] = useState(null)
  const [password,    setPassword]    = useState('')
  const [error,       setError]       = useState('')
  const [attempts,    setAttempts]    = useState(0)
  const [lockedUntil, setLockedUntil] = useState(null)
  const [countdown,   setCountdown]   = useState(0)
  const [shake,       setShake]       = useState(false)
  const inputRef = useRef(null)

  // Countdown ticker when locked out
  useEffect(() => {
    if (!lockedUntil) return
    const tick = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000)
      if (remaining <= 0) {
        setLockedUntil(null)
        setAttempts(0)
        setCountdown(0)
        setError('')
      } else {
        setCountdown(remaining)
      }
    }, 250)
    return () => clearInterval(tick)
  }, [lockedUntil])

  function handleRoleSelect(role) {
    if (!role.requiresPassword) {
      onAccess({ role: role.id, readOnly: true })
      return
    }
    setSelectedRole(role)
    setStep('password')
    setPassword('')
    setError('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handlePasswordSubmit(e) {
    e.preventDefault()
    if (lockedUntil) return

    if (password === CORRECT_PASSWORD) {
      onAccess({ role: 'teacher', readOnly: false })
      return
    }

    const newAttempts = attempts + 1
    setAttempts(newAttempts)
    setPassword('')
    setShake(true)
    setTimeout(() => setShake(false), 500)

    if (newAttempts >= MAX_ATTEMPTS) {
      const until = Date.now() + LOCKOUT_SECONDS * 1000
      setLockedUntil(until)
      setError(`Too many attempts. Locked for ${LOCKOUT_SECONDS} seconds.`)
    } else {
      setError(`Incorrect password. ${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts === 1 ? '' : 's'} remaining.`)
    }
  }

  const isLocked = !!lockedUntil

  // ── styles ────────────────────────────────────────────────────────────────

  const overlay = {
    position: 'fixed', inset: 0, zIndex: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg, #f8f7f4)',
    padding: 24,
  }

  const card = {
    width: '100%', maxWidth: 480,
    background: 'var(--surface, #fff)',
    border: '1px solid var(--border, #e5e3de)',
    borderRadius: 20,
    padding: '36px 32px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
  }

  return (
    <div style={overlay}>
      <div style={card}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 6 }}>🏫</div>
          <div style={{ fontFamily: 'var(--mono, monospace)', fontSize: 11, letterSpacing: 3, color: 'var(--muted, #888)', textTransform: 'uppercase' }}>
            Teacher Joseph
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>
            {step === 'select' ? 'Who are you?' : 'Enter password'}
          </div>
          {step === 'select' && (
            <div style={{ fontSize: 13, color: 'var(--muted, #888)', marginTop: 6 }}>
              Choose your role to view the app
            </div>
          )}
        </div>

        {/* ── Role selection ── */}
        {step === 'select' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ROLES.map(role => (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 18px', borderRadius: 14,
                  border: `2px solid ${role.color}22`,
                  background: `${role.color}08`,
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s',
                  width: '100%',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${role.color}16`; e.currentTarget.style.borderColor = `${role.color}55` }}
                onMouseLeave={e => { e.currentTarget.style.background = `${role.color}08`; e.currentTarget.style.borderColor = `${role.color}22` }}
              >
                <span style={{ fontSize: 28, flexShrink: 0 }}>{role.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: role.color }}>{role.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted, #888)', marginTop: 2 }}>{role.desc}</div>
                </div>
                <span style={{ fontSize: 18, color: `${role.color}88` }}>›</span>
              </button>
            ))}
          </div>
        )}

        {/* ── Password entry ── */}
        {step === 'password' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '10px 14px', borderRadius: 10, background: '#7c6aff10', border: '1px solid #7c6aff30' }}>
              <span style={{ fontSize: 20 }}>🔐</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#7c6aff' }}>Teacher Joseph — full access</span>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div style={{ marginBottom: 14 }}>
                <input
                  ref={inputRef}
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  disabled={isLocked}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 10,
                    border: `2px solid ${error && !isLocked ? '#ef4444' : '#e5e3de'}`,
                    fontSize: 16, background: isLocked ? '#f5f5f5' : 'var(--surface, #fff)',
                    outline: 'none', boxSizing: 'border-box',
                    fontFamily: 'monospace', letterSpacing: 4,
                    animation: shake ? 'tj-shake 0.4s ease' : 'none',
                  }}
                />
              </div>

              {error && (
                <div style={{ fontSize: 12, color: isLocked ? '#f59e0b' : '#ef4444', marginBottom: 14, textAlign: 'center', fontWeight: 600 }}>
                  {isLocked ? `🔒 ${error} ${countdown}s remaining` : `⚠️ ${error}`}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => { setStep('select'); setPassword(''); setError(''); setAttempts(0); setLockedUntil(null) }}
                  style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1.5px solid var(--border, #e5e3de)', background: 'transparent', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--muted, #888)' }}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isLocked || !password}
                  style={{
                    flex: 2, padding: '11px 0', borderRadius: 10, border: 'none',
                    background: isLocked || !password ? '#ccc' : 'linear-gradient(135deg, #7c6aff, #c084fc)',
                    color: '#fff', fontSize: 14, fontWeight: 700, cursor: isLocked || !password ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {isLocked ? `Locked (${countdown}s)` : 'Enter'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 11, color: 'var(--muted, #aaa)' }}>
          {step === 'select'
            ? 'Students, parents and colleagues have view-only access'
            : 'Wrong password? Click Back to select a different role'}
        </div>
      </div>

      {/* Shake keyframe */}
      <style>{`
        @keyframes tj-shake {
          0%,100% { transform: translateX(0) }
          20% { transform: translateX(-8px) }
          40% { transform: translateX(8px) }
          60% { transform: translateX(-5px) }
          80% { transform: translateX(5px) }
        }
      `}</style>
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'

const ROLES = [
  {
    id:    'student',
    icon:  '👨‍🎓',
    label: 'Student',
    desc:  'Log in to do exercises and see your rank',
    color: '#3b82f6',
    requiresStudentLogin: true,
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
  // step: 'select' | 'password' | 'student-class' | 'student-name' | 'student-pin'
  const [step,         setStep]         = useState('select')
  const [selectedRole, setSelectedRole] = useState(null)

  // Teacher password state
  const [password,    setPassword]    = useState('')
  const [error,       setError]       = useState('')
  const [attempts,    setAttempts]    = useState(0)
  const [lockedUntil, setLockedUntil] = useState(null)
  const [countdown,   setCountdown]   = useState(0)
  const [shake,       setShake]       = useState(false)
  const inputRef = useRef(null)

  // Student login state
  const [classes,        setClasses]        = useState([])
  const [students,       setStudents]        = useState([])
  const [selectedClass,  setSelectedClass]  = useState(null)
  const [selectedStudent,setSelectedStudent]= useState(null)
  const [pin,            setPin]            = useState('')
  const [pinDigits,      setPinDigits]      = useState(['', '', '', ''])
  const [pinError,       setPinError]       = useState('')
  const [pinShake,       setPinShake]       = useState(false)
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [loadingStudents,setLoadingStudents]= useState(false)
  const pinRefs = [useRef(), useRef(), useRef(), useRef()]

  // Countdown ticker
  useEffect(() => {
    if (!lockedUntil) return
    const tick = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000)
      if (remaining <= 0) {
        setLockedUntil(null); setAttempts(0); setCountdown(0); setError('')
      } else {
        setCountdown(remaining)
      }
    }, 250)
    return () => clearInterval(tick)
  }, [lockedUntil])

  // Load classes when student flow starts
  useEffect(() => {
    if (step !== 'student-class') return
    setLoadingClasses(true)
    getDocs(collection(db, 'tj_classes'))
      .then(snap => setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .finally(() => setLoadingClasses(false))
  }, [step])

  // Load students when a class is selected
  useEffect(() => {
    if (!selectedClass) return
    setLoadingStudents(true)
    getDocs(query(collection(db, 'tj_students'), where('classId', '==', selectedClass.id)))
      .then(snap => setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .finally(() => setLoadingStudents(false))
  }, [selectedClass])

  // Focus first PIN box when entering PIN step
  useEffect(() => {
    if (step === 'student-pin') {
      setTimeout(() => pinRefs[0].current?.focus(), 80)
    }
  }, [step])

  function handleRoleSelect(role) {
    if (role.requiresStudentLogin) {
      setSelectedRole(role)
      setStep('student-class')
      return
    }
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

  function handleClassSelect(cls) {
    setSelectedClass(cls)
    setSelectedStudent(null)
    setStep('student-name')
  }

  function handleStudentSelect(student) {
    if (!student.pin) {
      // No PIN set — go straight in as read-only student
      onAccess({ role: 'student', readOnly: true, student })
      return
    }
    setSelectedStudent(student)
    setPinDigits(['', '', '', ''])
    setPinError('')
    setStep('student-pin')
  }

  function handlePinDigit(index, value) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...pinDigits]
    next[index] = digit
    setPinDigits(next)
    setPinError('')
    if (digit && index < 3) {
      pinRefs[index + 1].current?.focus()
    }
    // Auto-submit when all 4 filled
    if (digit && index === 3) {
      const fullPin = next.join('')
      if (fullPin.length === 4) verifyPin(fullPin)
    }
  }

  function handlePinKeyDown(index, e) {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      pinRefs[index - 1].current?.focus()
    }
  }

  function verifyPin(fullPin) {
    if (fullPin === String(selectedStudent.pin)) {
      onAccess({ role: 'student', readOnly: false, student: selectedStudent })
    } else {
      setPinShake(true)
      setTimeout(() => setPinShake(false), 500)
      setPinDigits(['', '', '', ''])
      setPinError('Wrong PIN — try again')
      setTimeout(() => pinRefs[0].current?.focus(), 50)
    }
  }

  function handlePinSubmit(e) {
    e.preventDefault()
    const fullPin = pinDigits.join('')
    if (fullPin.length < 4) { setPinError('Enter all 4 digits'); return }
    verifyPin(fullPin)
  }

  function goBack() {
    if (step === 'password')      { setStep('select'); setPassword(''); setError(''); setAttempts(0); setLockedUntil(null) }
    if (step === 'student-class') { setStep('select') }
    if (step === 'student-name')  { setStep('student-class'); setSelectedClass(null); setStudents([]) }
    if (step === 'student-pin')   { setStep('student-name'); setPinDigits(['','','','']); setPinError('') }
  }

  const isLocked = !!lockedUntil

  // ── styles ────────────────────────────────────────────────────────────────
  const overlay = {
    position: 'fixed', inset: 0, zIndex: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg, #f8f7f4)', padding: 24,
  }
  const card = {
    width: '100%', maxWidth: 480,
    background: 'var(--surface, #fff)',
    border: '1px solid var(--border, #e5e3de)',
    borderRadius: 20,
    padding: '36px 32px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
  }

  const stepTitles = {
    'select':       'Who are you?',
    'password':     'Enter password',
    'student-class':'Choose your class',
    'student-name': 'Choose your name',
    'student-pin':  'Enter your PIN',
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
            {stepTitles[step]}
          </div>
          {step === 'select' && (
            <div style={{ fontSize: 13, color: 'var(--muted, #888)', marginTop: 6 }}>
              Choose your role to view the app
            </div>
          )}
          {step === 'student-class' && (
            <div style={{ fontSize: 13, color: 'var(--muted, #888)', marginTop: 6 }}>
              Select your class
            </div>
          )}
          {step === 'student-name' && selectedClass && (
            <div style={{ fontSize: 13, color: '#3b82f6', marginTop: 6, fontWeight: 600 }}>
              {selectedClass.name}
            </div>
          )}
          {step === 'student-pin' && selectedStudent && (
            <div style={{ fontSize: 13, color: 'var(--muted, #888)', marginTop: 6 }}>
              Hi, <strong style={{ color: '#3b82f6' }}>{selectedStudent.nameEn}</strong>! Enter your 4-digit PIN
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
                  transition: 'all 0.15s', width: '100%',
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

        {/* ── Teacher password ── */}
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
                <button type="button" onClick={goBack}
                  style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1.5px solid var(--border, #e5e3de)', background: 'transparent', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--muted, #888)' }}>
                  ← Back
                </button>
                <button type="submit" disabled={isLocked || !password}
                  style={{ flex: 2, padding: '11px 0', borderRadius: 10, border: 'none', background: isLocked || !password ? '#ccc' : 'linear-gradient(135deg, #7c6aff, #c084fc)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: isLocked || !password ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}>
                  {isLocked ? `Locked (${countdown}s)` : 'Enter'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Student: pick class ── */}
        {step === 'student-class' && (
          <div>
            {loadingClasses ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted, #888)', fontFamily: 'var(--mono)', fontSize: 12 }}>Loading classes...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 340, overflowY: 'auto' }}>
                {classes.map(cls => (
                  <button
                    key={cls.id}
                    onClick={() => handleClassSelect(cls)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', borderRadius: 12,
                      border: '2px solid #3b82f622', background: '#3b82f608',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#3b82f616'; e.currentTarget.style.borderColor = '#3b82f655' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#3b82f608'; e.currentTarget.style.borderColor = '#3b82f622' }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#3b82f6' }}>{cls.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted, #888)', marginTop: 2 }}>
                        {cls.day} · {cls.time}
                      </div>
                    </div>
                    <span style={{ fontSize: 18, color: '#3b82f688' }}>›</span>
                  </button>
                ))}
              </div>
            )}
            <button onClick={goBack} style={{ marginTop: 16, width: '100%', padding: '10px 0', borderRadius: 10, border: '1.5px solid var(--border, #e5e3de)', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--muted, #888)' }}>
              ← Back
            </button>
          </div>
        )}

        {/* ── Student: pick name ── */}
        {step === 'student-name' && (
          <div>
            {loadingStudents ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted, #888)', fontFamily: 'var(--mono)', fontSize: 12 }}>Loading students...</div>
            ) : students.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted, #888)', fontSize: 13 }}>No students found in this class.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 340, overflowY: 'auto' }}>
                {students.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleStudentSelect(s)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px', borderRadius: 12,
                      border: '2px solid #3b82f622', background: '#3b82f608',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#3b82f616'; e.currentTarget.style.borderColor = '#3b82f655' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#3b82f608'; e.currentTarget.style.borderColor = '#3b82f622' }}
                  >
                    {/* Avatar circle */}
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                      background: '#3b82f620', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 800, color: '#3b82f6',
                    }}>
                      {s.nameEn?.[0] || '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{s.nameEn}</div>
                      {s.nameVn && <div style={{ fontSize: 11, color: 'var(--muted, #888)' }}>{s.nameVn}</div>}
                    </div>
                    <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: s.pin ? '#22c55e' : 'var(--muted, #bbb)' }}>
                      {s.pin ? '🔑 PIN set' : 'No PIN'}
                    </span>
                  </button>
                ))}
              </div>
            )}
            <button onClick={goBack} style={{ marginTop: 16, width: '100%', padding: '10px 0', borderRadius: 10, border: '1.5px solid var(--border, #e5e3de)', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--muted, #888)' }}>
              ← Back
            </button>
          </div>
        )}

        {/* ── Student: PIN entry ── */}
        {step === 'student-pin' && (
          <div>
            {/* Student card */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: '12px 16px', borderRadius: 12, background: '#3b82f610', border: '1px solid #3b82f630' }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#3b82f625', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#3b82f6' }}>
                {selectedStudent?.nameEn?.[0] || '?'}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{selectedStudent?.nameEn}</div>
                <div style={{ fontSize: 11, color: 'var(--muted, #888)' }}>{selectedClass?.name}</div>
              </div>
            </div>

            <form onSubmit={handlePinSubmit}>
              {/* 4-box PIN input */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 16, animation: pinShake ? 'tj-shake 0.4s ease' : 'none' }}>
                {pinDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={pinRefs[i]}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handlePinDigit(i, e.target.value)}
                    onKeyDown={e => handlePinKeyDown(i, e)}
                    style={{
                      width: 56, height: 64, textAlign: 'center',
                      fontSize: 28, fontFamily: 'var(--mono)', fontWeight: 700,
                      borderRadius: 12, border: `2px solid ${pinError ? '#ef4444' : digit ? '#3b82f6' : '#e5e3de'}`,
                      background: digit ? '#3b82f608' : 'var(--surface, #fff)',
                      outline: 'none', transition: 'border-color 0.15s',
                    }}
                  />
                ))}
              </div>

              {pinError && (
                <div style={{ fontSize: 12, color: '#ef4444', textAlign: 'center', marginBottom: 14, fontWeight: 600 }}>
                  ⚠️ {pinError}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={goBack}
                  style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1.5px solid var(--border, #e5e3de)', background: 'transparent', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--muted, #888)' }}>
                  ← Back
                </button>
                <button type="submit"
                  style={{ flex: 2, padding: '11px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>
                  Enter portal →
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 11, color: 'var(--muted, #aaa)' }}>
          {step === 'select' && 'Students, parents and colleagues have view-only access'}
          {step === 'password' && 'Wrong password? Click Back to select a different role'}
          {step === 'student-class' && 'Can\'t find your class? Ask Teacher Joseph'}
          {step === 'student-name' && 'Can\'t find your name? Ask Teacher Joseph'}
          {step === 'student-pin' && 'Forgot your PIN? Ask Teacher Joseph'}
        </div>
      </div>

      <style>{`
        @keyframes tj-shake {
          0%,100% { transform: translateX(0) }
          20%      { transform: translateX(-8px) }
          40%      { transform: translateX(8px) }
          60%      { transform: translateX(-5px) }
          80%      { transform: translateX(5px) }
        }
      `}</style>
    </div>
  )
}

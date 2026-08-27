import { useState, useRef, useEffect } from 'react'
import { initials } from '../lib/utils'
import { getSpinQuestion, getBook } from '../lib/books'

const WHEEL_COLORS = [
  '#e85d26','#2d6be4','#1a9e5c','#7c3aed',
  '#d4900a','#d63b3b','#0891b2','#059669',
  '#7c2d12','#1e40af','#166534','#6b21a8',
]

// ── Sound Engine (Web Audio API — no external files needed) ──────────────────
function createAudioCtx() {
  try { return new (window.AudioContext || window.webkitAudioContext)() } catch { return null }
}

function playTick(ctx) {
  if (!ctx) return
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.connect(g); g.connect(ctx.destination)
  o.frequency.value = 600
  o.type = 'square'
  g.gain.setValueAtTime(0.08, ctx.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
  o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.04)
}

function playReveal(ctx) {
  if (!ctx) return
  const notes = [523, 659, 784, 1047]
  notes.forEach((freq, i) => {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.type = 'sine'
    o.frequency.value = freq
    const t = ctx.currentTime + i * 0.1
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.25, t + 0.05)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
    o.start(t); o.stop(t + 0.35)
  })
}

function playCorrect(ctx) {
  if (!ctx) return
  const notes = [523, 659, 784, 1047, 1319]
  notes.forEach((freq, i) => {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.type = 'triangle'
    o.frequency.value = freq
    const t = ctx.currentTime + i * 0.08
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.3, t + 0.04)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
    o.start(t); o.stop(t + 0.4)
  })
}

function playWrong(ctx) {
  if (!ctx) return
  const notes = [330, 277, 233]
  notes.forEach((freq, i) => {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.type = 'sawtooth'
    o.frequency.value = freq
    const t = ctx.currentTime + i * 0.15
    g.gain.setValueAtTime(0.2, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
    o.start(t); o.stop(t + 0.3)
  })
}

function playPhoneRing(ctx) {
  if (!ctx) return
  // Two short bursts like a classic phone ring
  [0, 0.5].forEach(offset => {
    [0, 0.12].forEach(sub => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      o.type = 'sine'
      o.frequency.value = 900
      const t = ctx.currentTime + offset + sub
      g.gain.setValueAtTime(0.2, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.1)
      o.start(t); o.stop(t + 0.1)
    })
  })
}

function playTeamwork(ctx) {
  if (!ctx) return
  const notes = [523, 659, 784, 659, 1047]
  notes.forEach((freq, i) => {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.type = 'sine'
    o.frequency.value = freq
    const t = ctx.currentTime + i * 0.1
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.25, t + 0.05)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
    o.start(t); o.stop(t + 0.35)
  })
}

function playLeaderChime(ctx) {
  if (!ctx) return
  // Triumphant little fanfare for a new #1 on the leaderboard
  const notes = [784, 988, 1175, 1568]
  notes.forEach((freq, i) => {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.type = 'triangle'
    o.frequency.value = freq
    const t = ctx.currentTime + i * 0.09
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.28, t + 0.03)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
    o.start(t); o.stop(t + 0.4)
  })
}
// ─────────────────────────────────────────────────────────────────────────────

// ── Live Leaderboard ──────────────────────────────────────────────────────────
function ConfettiBurst() {
  const particles = Array.from({ length: 10 })
  const emojis = ['✨', '⭐', '🎉', '💥']
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}>
      {particles.map((_, i) => (
        <span
          key={i}
          className="confetti-particle"
          style={{
            position: 'absolute', left: '50%', top: '50%', fontSize: 12,
            '--angle': `${(i / particles.length) * 360}deg`,
            animationDelay: `${(i % 4) * 0.03}s`,
          }}
        >
          {emojis[i % emojis.length]}
        </span>
      ))}
    </div>
  )
}

const MEDAL_STYLE = {
  gold:   { border: 'var(--gold)', chip: 'var(--gold)', text: 'var(--gold)',
            bg: 'linear-gradient(135deg, rgba(212,144,10,0.22), rgba(232,93,38,0.12))', icon: '🥇' },
  silver: { border: '#9ca3af', chip: '#9ca3af', text: '#9ca3af',
            bg: 'linear-gradient(135deg, rgba(148,163,184,0.22), rgba(100,116,139,0.10))', icon: '🥈' },
  // Deliberately pushed toward copper/brown so it can't be mistaken for gold
  bronze: { border: '#a05a2c', chip: '#a05a2c', text: '#a05a2c',
            bg: 'linear-gradient(135deg, rgba(160,90,44,0.20), rgba(120,66,32,0.10))', icon: '🥉' },
}

function Leaderboard({ students, scores, celebrateId, leaderBanner }) {
  const sorted = [...students]
    .filter(s => s.nameEn)
    .sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))

  // Rank by distinct point totals (ties share a rank) so medals only appear
  // once ranks are actually clear — and the crown only goes to a sole #1.
  const withPoints = sorted.filter(s => (scores[s.id] || 0) > 0)
  const uniqueScoresDesc = [...new Set(withPoints.map(s => scores[s.id]))].sort((a, b) => b - a)
  function tierOf(s) {
    const pts = scores[s.id] || 0
    if (pts <= 0) return null
    return uniqueScoresDesc.indexOf(pts) + 1
  }
  const tier1Count = withPoints.filter(s => tierOf(s) === 1).length

  // Track rank movement between renders so we can show ▲/▼ momentum arrows
  const prevRanksRef = useRef({})
  const currentRanks = {}
  sorted.forEach((s, i) => { currentRanks[s.id] = i + 1 })
  const rankSignature = sorted.map(s => `${s.id}:${scores[s.id] || 0}`).join('|')
  useEffect(() => {
    prevRanksRef.current = currentRanks
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rankSignature])

  return (
    <div style={{ width: 250, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        🏆 Live Leaderboard
      </div>

      <div style={{ minHeight: 30, marginBottom: leaderBanner ? 10 : 0 }}>
        {leaderBanner && (
          <div className="spin-pop" style={{
            fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 800, letterSpacing: 0.5,
            textAlign: 'center', color: '#fff',
            background: 'linear-gradient(135deg,#d4900a,#e85d26)',
            padding: '8px 8px', borderRadius: 9, lineHeight: 1.3,
          }}>
            👑 {leaderBanner} TAKES THE LEAD!
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 480, overflowY: 'auto' }}>
        {sorted.map((s, i) => {
          const pts = scores[s.id] || 0
          const tier = tierOf(s)
          const medal = tier === 1 ? MEDAL_STYLE.gold : tier === 2 ? MEDAL_STYLE.silver : tier === 3 ? MEDAL_STYLE.bronze : null
          const isSoleLeader = tier === 1 && tier1Count === 1
          const isCelebrating = celebrateId === s.id
          const isAbsent = s.__absentToday

          // Momentum arrow vs. last spin
          const prevRank = prevRanksRef.current[s.id]
          let arrow = null
          if (prevRank !== undefined) {
            if (currentRanks[s.id] < prevRank) arrow = { symbol: '▲', color: 'var(--green)' }
            else if (currentRanks[s.id] > prevRank) arrow = { symbol: '▼', color: 'var(--red)' }
          }

          // Competitive hint line — how close they are to the person right above them
          let hint = null
          if (isAbsent) {
            hint = { text: 'ABSENT', color: 'var(--red)' }
          } else if (i === 0 && pts > 0 && sorted[1]) {
            const margin = pts - (scores[sorted[1].id] || 0)
            if (margin > 0) hint = { text: `🔥 Leading by ${margin}`, color: 'var(--gold)' }
          } else if (i > 0) {
            const above = sorted[i - 1]
            const abovePts = scores[above.id] || 0
            if (pts > 0 || abovePts > 0) {
              const gap = abovePts - pts
              if (gap === 0) hint = { text: `🤝 Tied with ${above.nameEn.split(' ')[0]}`, color: 'var(--accent2)' }
              else if (gap > 0) hint = { text: `+${gap} to pass ${above.nameEn.split(' ')[0]}`, color: 'var(--muted)' }
            }
          }

          return (
            <div key={s.id} style={{
              position: 'relative', overflow: 'hidden',
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '10px 12px', borderRadius: 10,
              background: medal ? medal.bg : 'var(--surface2)',
              border: `1.5px solid ${medal ? medal.border : 'var(--border)'}`,
              opacity: isAbsent ? 0.4 : 1,
              transform: isCelebrating ? 'scale(1.06)' : 'scale(1)',
              boxShadow: isSoleLeader ? '0 0 14px rgba(212,144,10,0.35)' : isCelebrating ? '0 0 16px rgba(212,144,10,0.55)' : 'none',
              transition: 'transform 0.35s cubic-bezier(.34,1.56,.64,1), box-shadow 0.35s ease, background 0.3s ease, border-color 0.3s ease',
            }}>
              {isSoleLeader && <div className="gold-shine" />}

              {isSoleLeader && (
                <div style={{ position: 'absolute', top: -11, left: 28, fontSize: 15, zIndex: 2 }}>👑</div>
              )}
              <div style={{ fontFamily: 'var(--mono)', fontSize: medal ? 16 : 11, fontWeight: 700, color: medal ? medal.text : 'var(--muted)', width: 20, flexShrink: 0, textAlign: 'center', zIndex: 1 }}>
                {medal ? medal.icon : i + 1}
              </div>
              <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0, zIndex: 1,
                background: medal ? medal.chip : 'var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, color: medal ? '#fff' : 'var(--muted)',
              }}>
                {initials(s.nameEn)}
              </div>
              <div style={{ flex: 1, minWidth: 0, zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.nameEn.split(' ')[0]}
                  </div>
                  {arrow && !isAbsent && (
                    <span style={{ fontSize: 9, color: arrow.color, fontWeight: 800 }}>{arrow.symbol}</span>
                  )}
                </div>
                {hint && (
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: hint.color, letterSpacing: 0.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {hint.text}
                  </div>
                )}
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 800, color: medal ? medal.text : 'var(--text)', flexShrink: 0, zIndex: 1 }}>
                {pts}
              </div>
              {isCelebrating && <ConfettiBurst />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────────────────

// Get today's date key matching the attendanceLog format: 'YYYY-MM-DD'
function getTodayKey() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function SpinOfDoomModal({ cls, students, onAwardStars, onUpdateClass, onClose, readOnly }) {
  const canvasRef  = useRef(null)
  const spinRef    = useRef(null)
  const audioCtxRef = useRef(null)
  const tickIntervalRef = useRef(null)

  const book = getBook(cls)

  // Units marked "covered so far" for this class — saved on the class doc
  // (cls.unitsCovered) so it's remembered next time Spin of Doom opens.
  // Only the teacher (not readOnly) sees the check screen to edit this.
  const [coveredUnits, setCoveredUnits] = useState(cls?.unitsCovered || [])
  const [savingUnits, setSavingUnits]   = useState(false)

  const [phase, setPhase] = useState(() => (book && !readOnly ? 'unitCheck' : 'ready'))
  const [pickedStudent, setPickedStudent]       = useState(null)
  const [friendStudent, setFriendStudent]       = useState(null)
  const [currentQuestion, setCurrentQuestion]  = useState(null)
  const [rotation, setRotation]                = useState(0)
  const [saving, setSaving]                    = useState(false)
  const [lastResult, setLastResult]            = useState(null)
  const [soundOn, setSoundOn]                  = useState(true)
  const [showAnswer, setShowAnswer]             = useState(false)
  const [showFriendAnswer, setShowFriendAnswer] = useState(false)

  function toggleUnit(num) {
    setCoveredUnits(prev => prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num])
  }

  async function confirmUnitsAndProceed() {
    setSavingUnits(true)
    if (onUpdateClass && cls?.id) {
      await onUpdateClass(cls.id, { unitsCovered: coveredUnits })
    }
    setSavingUnits(false)
    setPhase('ready')
  }

  // How many times each student has actually landed as the pick this session.
  // Used to quietly weight future spins toward students who've had fewer turns.
  const [pickCounts, setPickCounts] = useState({})

  // Counts every question asked this session (not tied to a specific
  // student) so we can guarantee a fun/general question every 3rd spin —
  // students are never more than 2 spins away from variety.
  const spinIndexRef = useRef(0)

  // ── Live leaderboard (this session only — resets each time the game opens) ──
  const [sessionScores, setSessionScores] = useState({})
  const [celebrateId, setCelebrateId]     = useState(null)
  const [leaderBanner, setLeaderBanner]   = useState(null)
  const prevLeaderRef      = useRef(null)
  const celebrateTimerRef  = useRef(null)
  const bannerTimerRef     = useRef(null)

  function addSessionPoints(studentId, pts) {
    setSessionScores(prev => ({ ...prev, [studentId]: (prev[studentId] || 0) + pts }))
  }

  useEffect(() => { setShowAnswer(false) }, [currentQuestion])
  useEffect(() => { setShowFriendAnswer(false) }, [friendStudent])

  const level   = cls?.level || 'pro'
  const todayKey = getTodayKey()

  // Filter: only students with a name AND not absent today
  const eligible = students.filter(s => {
    if (!s.nameEn) return false
    const log = s.attendanceLog || {}
    // If today has been recorded as absent, exclude
    if (log[todayKey] === 'absent') return false
    return true
  })

  // Students excluded today (absent)
  const absentToday = students.filter(s => {
    if (!s.nameEn) return false
    const log = s.attendanceLog || {}
    return log[todayKey] === 'absent'
  })

  // Full roster for the leaderboard, tagged with today's absence status
  const leaderboardStudents = students
    .filter(s => s.nameEn)
    .map(s => ({ ...s, __absentToday: absentToday.some(a => a.id === s.id) }))

  // Detect when a new student takes the #1 spot on the session leaderboard —
  // only celebrate a *sole* leader (strictly ahead of everyone else), matching
  // the leaderboard's crown rule.
  useEffect(() => {
    const withPoints = students.filter(s => (sessionScores[s.id] || 0) > 0)
    if (withPoints.length === 0) { prevLeaderRef.current = null; return }
    const maxScore = Math.max(...withPoints.map(s => sessionScores[s.id] || 0))
    const leaders  = withPoints.filter(s => (sessionScores[s.id] || 0) === maxScore)
    if (leaders.length !== 1) {
      // Tied for the lead — no sole leader right now. Reset so the next
      // student to break away triggers a fresh celebration.
      prevLeaderRef.current = null
      return
    }
    const top = leaders[0]
    if (top.id !== prevLeaderRef.current) {
      prevLeaderRef.current = top.id
      setCelebrateId(top.id)
      setLeaderBanner(top.nameEn.split(' ')[0])
      playLeaderChime(getAudioCtx())
      if (celebrateTimerRef.current) clearTimeout(celebrateTimerRef.current)
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current)
      celebrateTimerRef.current = setTimeout(() => setCelebrateId(null), 1600)
      bannerTimerRef.current = setTimeout(() => setLeaderBanner(null), 2400)
    }
  }, [sessionScores])

  // Lazy-init AudioContext on first interaction
  function getAudioCtx() {
    if (!soundOn) return null
    if (!audioCtxRef.current) {
      audioCtxRef.current = createAudioCtx()
    }
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }

  // ── Draw wheel ──
  useEffect(() => {
    drawWheel(rotation)
  }, [rotation, eligible.length])

  function drawWheel(rot) {
    const canvas = canvasRef.current
    if (!canvas || eligible.length === 0) return
    const ctx = canvas.getContext('2d')
    const cx  = canvas.width / 2
    const cy  = canvas.height / 2
    const r   = cx - 10
    const slice = (2 * Math.PI) / eligible.length

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const labelFont = Math.max(9, Math.round(r * (eligible.length > 12 ? 0.075 : 0.095)))

    eligible.forEach((s, i) => {
      const start = rot + i * slice
      const end   = start + slice

      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, start, end)
      ctx.closePath()
      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length]
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(start + slice / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#fff'
      ctx.font = `bold ${labelFont}px Sora, sans-serif`
      ctx.shadowColor = 'rgba(0,0,0,0.4)'
      ctx.shadowBlur = 3
      ctx.fillText(s.nameEn.split(' ')[0], r - 10, 5)
      ctx.restore()
    })

    // Center circle
    const centerR = Math.max(22, r * 0.2)
    ctx.beginPath()
    ctx.arc(cx, cy, centerR, 0, 2 * Math.PI)
    ctx.fillStyle = '#1a1814'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 3
    ctx.stroke()

    ctx.fillStyle = '#fff'
    ctx.font = `bold ${Math.max(9, Math.round(centerR * 0.39))}px JetBrains Mono, monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('SPIN', cx, cy)
  }

  function spin() {
    if (phase !== 'ready' || eligible.length === 0) return
    setPhase('spinning')

    const ctx = getAudioCtx()
    const slice = (2 * Math.PI) / eligible.length

    // ── Fair-but-random pick ──────────────────────────────────────────────
    // Students with fewer turns this session get a bigger slice of the odds
    // (never zero, so it's never predictable) — everyone still sees the same
    // dramatic multi-spin, it's just not left to pure chance which segment wins.
    const counts     = eligible.map(s => pickCounts[s.id] || 0)
    const maxCount   = Math.max(0, ...counts)
    const weights    = counts.map(c => (maxCount - c) + 1)
    const totalWeight = weights.reduce((a, b) => a + b, 0)
    let r = Math.random() * totalWeight
    let targetIndex = eligible.length - 1
    for (let i = 0; i < eligible.length; i++) {
      r -= weights[i]
      if (r <= 0) { targetIndex = i; break }
    }
    const picked = eligible[targetIndex]

    // Land solidly inside that student's wedge (not right on the seam) so it
    // still feels like a natural, unpredictable landing spot.
    const wedgeOffset      = slice * (0.18 + Math.random() * 0.64)
    const pointerAngle     = targetIndex * slice + wedgeOffset
    const targetNormalized = (((2 * Math.PI - pointerAngle) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
    const currentNormalized = ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
    const deltaToTarget      = (((targetNormalized - currentNormalized) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)

    const totalSpins = 6 + Math.floor(Math.random() * 4)
    const targetRot  = rotation + totalSpins * 2 * Math.PI + deltaToTarget
    const duration   = 3500
    const startTime  = performance.now()
    const startRot   = rotation

    // Ticking sound — fast at start, slows down
    let lastTickAngle = rotation
    const TICK_THRESHOLD = slice

    function animate(now) {
      const elapsed  = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 3)
      const current  = startRot + (targetRot - startRot) * eased
      setRotation(current)
      drawWheel(current)

      // Play tick each time we pass a segment boundary
      if (Math.abs(current - lastTickAngle) >= TICK_THRESHOLD) {
        playTick(ctx)
        lastTickAngle = current
      }

      if (progress < 1) {
        spinRef.current = requestAnimationFrame(animate)
      } else {
        setPickCounts(prev => ({ ...prev, [picked.id]: (prev[picked.id] || 0) + 1 }))
        const forceGeneral = spinIndexRef.current % 3 === 2
        spinIndexRef.current += 1
        const question = getSpinQuestion(cls, level, coveredUnits, forceGeneral)
        setPickedStudent(picked)
        setCurrentQuestion(question)
        setPhase('picked')
        playReveal(ctx)
      }
    }
    spinRef.current = requestAnimationFrame(animate)
  }

  function showQuestion() { setPhase('question') }

  async function handleCorrect() {
    setSaving(true)
    await onAwardStars(pickedStudent.id, 4, '🎯 Spin of Doom — correct answer!')
    addSessionPoints(pickedStudent.id, 4)
    setSaving(false)
    setLastResult('correct')
    setPhase('result')
    playCorrect(getAudioCtx())
  }

  async function handleWrong() {
    playWrong(getAudioCtx())
    setPhase('friend')
    playPhoneRing(getAudioCtx())
  }

  async function handleFriendCorrect() {
    if (!friendStudent) return
    setSaving(true)
    await onAwardStars(pickedStudent.id, 2, '📞 Phone a Friend — helped friend!')
    await onAwardStars(friendStudent.id, 2, '📞 Phone a Friend — answered correctly!')
    addSessionPoints(pickedStudent.id, 2)
    addSessionPoints(friendStudent.id, 2)
    setSaving(false)
    setLastResult('friend')
    setPhase('result')
    playTeamwork(getAudioCtx())
  }

  async function handleFriendWrong() {
    playWrong(getAudioCtx())
    setLastResult('wrong')
    setPhase('result')
  }

  function nextRound() {
    setPhase('ready')
    setPickedStudent(null)
    setFriendStudent(null)
    setCurrentQuestion(null)
    setLastResult(null)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (spinRef.current) cancelAnimationFrame(spinRef.current)
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current)
      if (celebrateTimerRef.current) clearTimeout(celebrateTimerRef.current)
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current)
    }
  }, [])

  const size = Math.max(320, Math.min(660, window.innerWidth - 560, window.innerHeight - 280))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <style>{`
        @keyframes popIn { from { transform: scale(0.5); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
        @keyframes confettiBurst {
          0%   { transform: translate(-50%,-50%) rotate(var(--angle)) translateY(0) scale(0.6); opacity: 1; }
          100% { transform: translate(-50%,-50%) rotate(var(--angle)) translateY(-34px) scale(1.1); opacity: 0; }
        }
        @keyframes goldShineSweep {
          0%   { transform: translateX(-120%) skewX(-20deg); }
          100% { transform: translateX(220%) skewX(-20deg); }
        }
        .spin-pop   { animation: popIn 0.3s cubic-bezier(.34,1.56,.64,1) }
        .spin-shake { animation: shake 0.5s ease }
        .confetti-particle { animation: confettiBurst 0.9s ease-out forwards; }
        .gold-shine {
          position: absolute; top: 0; bottom: 0; left: 0; width: 40%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent);
          animation: goldShineSweep 2.6s ease-in-out infinite;
          pointer-events: none; z-index: 0;
        }
      `}</style>

      <div className="modal" style={{ width: '96vw', maxWidth: 1400, height: '90vh', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: '#1a1814', padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>
              🎰 Spin of Doom — <span style={{ color: 'var(--accent)' }}>{cls?.name}</span>
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginTop: 2 }}>
              {eligible.length} ON WHEEL
              {absentToday.length > 0 && (
                <span style={{ color: '#ef4444aa', marginLeft: 8 }}>· {absentToday.length} ABSENT TODAY</span>
              )}
              <span style={{ marginLeft: 8 }}>· {level.toUpperCase()} LEVEL</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Sound toggle */}
            <button
              onClick={() => setSoundOn(s => !s)}
              title={soundOn ? 'Mute sounds' : 'Unmute sounds'}
              style={{
                background: 'none', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 8, padding: '4px 8px', cursor: 'pointer',
                fontSize: 16, color: soundOn ? '#fff' : 'rgba(255,255,255,0.3)',
                transition: 'all 0.15s',
              }}
            >
              {soundOn ? '🔊' : '🔇'}
            </button>
            <button className="btn-ghost" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }} onClick={onClose}>✕</button>
          </div>
        </div>

        {/* ── UNIT CHECK — mark units covered so far before spinning ── */}
        {phase === 'unitCheck' && book && (
          <div style={{ padding: '28px 32px', flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: 560 }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📖</div>
                <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>Which units have you covered so far?</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                  Tick the units of <strong>{book.label}</strong> taught so far. Questions will only be pulled from these — untick nothing you don't need to, this is remembered for next time.
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {book.units.map(u => {
                  const checked = coveredUnits.includes(u.num)
                  return (
                    <div key={u.num}
                      onClick={() => toggleUnit(u.num)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                        background: checked ? 'rgba(26,158,92,0.08)' : 'var(--surface2)',
                        border: `1.5px solid ${checked ? 'rgba(26,158,92,0.3)' : 'var(--border)'}`,
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{
                        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                        background: checked ? 'var(--green)' : 'var(--surface)',
                        border: `1.5px solid ${checked ? 'var(--green)' : 'var(--border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 13, fontWeight: 800,
                      }}>
                        {checked ? '✓' : ''}
                      </div>
                      <div style={{ fontSize: 18 }}>{u.emoji}</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>Unit {u.num} — {u.title}</div>
                    </div>
                  )
                })}
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                <button className="btn btn-accent" onClick={confirmUnitsAndProceed} disabled={savingUnits}>
                  {savingUnits ? 'Saving...' : '🎰 Continue to Spin'}
                </button>
              </div>
            </div>
          </div>
        )}

        {phase !== 'unitCheck' && (
        <div style={{ padding: '28px 32px', display: 'flex', justifyContent: 'center', flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <div style={{ display: 'flex', gap: 44, alignItems: 'center', width: '100%', maxWidth: 1180 }}>

          <Leaderboard
            students={leaderboardStudents}
            scores={sessionScores}
            celebrateId={celebrateId}
            leaderBanner={leaderBanner}
          />

          <div style={{ flex: 1, minWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* ── ABSENT TODAY BANNER ── */}
          {absentToday.length > 0 && (phase === 'ready' || phase === 'spinning') && (
            <div style={{
              marginBottom: 16, padding: '10px 14px', borderRadius: 10,
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🚫</span>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#ef4444', letterSpacing: 2, marginBottom: 4 }}>
                  EXCLUDED TODAY (ABSENT)
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {absentToday.map(s => s.nameEn).join(', ')}
                </div>
              </div>
            </div>
          )}

          {/* ── NO STUDENTS WARNING ── */}
          {eligible.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>😴</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>No students on the wheel</div>
              <div style={{ fontSize: 12 }}>
                {students.length === 0
                  ? 'This class has no students yet.'
                  : 'All students are marked absent today.'}
              </div>
            </div>
          )}

          {/* ── WHEEL ── */}
          {eligible.length > 0 && (phase === 'ready' || phase === 'spinning') && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>

              {/* Pointer */}
              <div style={{ position: 'relative', width: size, height: size }}>
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontSize: Math.round(size * 0.08), zIndex: 10, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>▼</div>
                <canvas
                  ref={canvasRef}
                  width={size}
                  height={size}
                  style={{ borderRadius: '50%', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', cursor: phase === 'ready' && !readOnly ? 'pointer' : 'default' }}
                  onClick={readOnly ? undefined : spin}
                />
              </div>

              {phase === 'ready' && (
                <div style={{ textAlign: 'center' }}>
                  {readOnly && (
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', padding: '10px 16px', background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)', marginBottom: 8 }}>
                      👁 View only — only the teacher can spin
                    </div>
                  )}
                  <button onClick={spin} className="btn btn-accent" disabled={readOnly} style={{ fontSize: 16, padding: '14px 40px', borderRadius: 12 }}>
                    🎰 SPIN!
                  </button>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginTop: 10 }}>
                    {readOnly ? '' : 'or tap the wheel'}
                  </div>
                </div>
              )}

              {phase === 'spinning' && (
                <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted)', letterSpacing: 2 }}>SPINNING...</div>
              )}
            </div>
          )}

          {/* ── PICKED ── */}
          {phase === 'picked' && pickedStudent && (
            <div className="spin-pop" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 52, marginBottom: 10 }}>🎯</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: 3, marginBottom: 10 }}>SELECTED</div>
              <div style={{ fontSize: 38, fontWeight: 800, marginBottom: 4 }}>{pickedStudent.nameEn}</div>
              {pickedStudent.nameVn && <div style={{ fontSize: 15, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 18 }}>{pickedStudent.nameVn}</div>}
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 26 }}>
                Category: <strong style={{ color: 'var(--text)' }}>{currentQuestion?.category}</strong>
              </div>
              <button className="btn btn-accent" style={{ padding: '13px 30px', fontSize: 14 }} onClick={showQuestion}>
                Show Question ➜
              </button>
            </div>
          )}

          {/* ── QUESTION ── */}
          {phase === 'question' && currentQuestion && (
            <div className="spin-pop">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                  {initials(pickedStudent.nameEn)}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{pickedStudent.nameEn}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 1 }}>{currentQuestion.category}</div>
                </div>
              </div>

              {/* Question box */}
              <div style={{ background: 'var(--surface2)', borderRadius: 14, padding: '26px 24px', marginBottom: 18, border: '2px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.4, marginBottom: showAnswer ? 18 : 6 }}>
                  {currentQuestion.q}
                </div>
                {!showAnswer ? (
                  <button className="btn btn-outline" style={{ fontSize: 12, padding: '11px 22px' }} onClick={() => setShowAnswer(true)}>
                    👁️ Reveal Answer
                  </button>
                ) : (
                  <div className="spin-pop" style={{
                    fontSize: 34, fontWeight: 900, lineHeight: 1.3, color: '#fff',
                    background: 'linear-gradient(135deg,#1a9e5c,#22c55e)',
                    padding: '20px 22px', borderRadius: 14,
                    boxShadow: '0 10px 30px rgba(26,158,92,0.4)',
                  }}>
                    ✅ {currentQuestion.a}
                  </div>
                )}
              </div>

              {/* Result buttons — hidden in read-only mode */}
              {readOnly ? (
                <div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--surface2)', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: 1 }}>👁 VIEW ONLY — teacher records the result</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  <button className="btn" style={{ background: 'rgba(26,158,92,0.1)', color: 'var(--green)', border: '1.5px solid rgba(26,158,92,0.3)', padding: '10px 8px' }}
                    onClick={handleCorrect} disabled={saving}>
                    ✅ Correct<br/>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 9 }}>+4 ⭐</span>
                  </button>
                  <button className="btn" style={{ background: 'rgba(45,107,228,0.1)', color: 'var(--accent2)', border: '1.5px solid rgba(45,107,228,0.3)', padding: '10px 8px' }}
                    onClick={handleWrong}>
                    📞 Friend<br/>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 9 }}>+2⭐ each</span>
                  </button>
                  <button className="btn" style={{ background: 'rgba(214,59,59,0.08)', color: 'var(--red)', border: '1.5px solid rgba(214,59,59,0.2)', padding: '10px 8px' }}
                    onClick={() => { playWrong(getAudioCtx()); setLastResult('wrong'); setPhase('result') }}>
                    ❌ Wrong<br/>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 9 }}>no stars</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── PHONE A FRIEND ── */}
          {phase === 'friend' && (
            <div className="spin-pop">
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📞</div>
                <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Phone a Friend!</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  <strong>{pickedStudent?.nameEn}</strong> is calling for help. Pick the friend who will answer:
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16, maxHeight: 220, overflowY: 'auto' }}>
                {students.filter(s => s.id !== pickedStudent?.id).map(s => (
                  <div key={s.id}
                    onClick={() => !readOnly && setFriendStudent(s)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                      background: friendStudent?.id === s.id ? 'var(--accent2)' : 'var(--surface2)',
                      color: friendStudent?.id === s.id ? '#fff' : 'var(--text)',
                      border: `1.5px solid ${friendStudent?.id === s.id ? 'var(--accent2)' : 'var(--border)'}`,
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: friendStudent?.id === s.id ? 'rgba(255,255,255,0.3)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                      {initials(s.nameEn)}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{s.nameEn}</div>
                  </div>
                ))}
              </div>

              {friendStudent && (
                <div style={{ background: 'var(--surface2)', borderRadius: 14, padding: '20px 22px', marginBottom: 18, border: '2px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.4, marginBottom: showFriendAnswer ? 16 : 4 }}>{currentQuestion?.q}</div>
                  {!showFriendAnswer ? (
                    <button className="btn btn-outline" style={{ fontSize: 12, padding: '10px 20px' }} onClick={() => setShowFriendAnswer(true)}>
                      👁️ Reveal Answer
                    </button>
                  ) : (
                    <div className="spin-pop" style={{
                      fontSize: 30, fontWeight: 900, lineHeight: 1.3, color: '#fff',
                      background: 'linear-gradient(135deg,#1a9e5c,#22c55e)',
                      padding: '18px 20px', borderRadius: 12,
                      boxShadow: '0 10px 28px rgba(26,158,92,0.4)',
                    }}>
                      ✅ {currentQuestion?.a}
                    </div>
                  )}
                </div>
              )}

              {readOnly ? (
                <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: 1 }}>👁 VIEW ONLY — teacher records the result</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button className="btn" style={{ background: 'rgba(26,158,92,0.1)', color: 'var(--green)', border: '1.5px solid rgba(26,158,92,0.3)', opacity: friendStudent ? 1 : 0.4 }}
                    onClick={handleFriendCorrect} disabled={!friendStudent || saving}>
                    ✅ Friend Correct! (+2⭐ each)
                  </button>
                  <button className="btn" style={{ background: 'rgba(214,59,59,0.08)', color: 'var(--red)', border: '1.5px solid rgba(214,59,59,0.2)' }}
                    onClick={handleFriendWrong}>
                    ❌ Friend Wrong
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── RESULT ── */}
          {phase === 'result' && (
            <div className="spin-pop" style={{ textAlign: 'center', padding: '20px 0' }}>
              {lastResult === 'correct' && (
                <>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green)', marginBottom: 4 }}>Correct!</div>
                  <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>{pickedStudent?.nameEn} earned</div>
                  <div style={{ fontSize: 32, marginBottom: 20 }}>⭐⭐⭐⭐</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--green)' }}>+4 stars added to profile ✓</div>
                </>
              )}
              {lastResult === 'friend' && (
                <>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>🤝</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent2)', marginBottom: 8 }}>Teamwork!</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
                    {pickedStudent?.nameEn} & {friendStudent?.nameEn} each earned
                  </div>
                  <div style={{ fontSize: 28, marginBottom: 20 }}>⭐⭐ + ⭐⭐</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent2)' }}>+2 stars each added to profiles ✓</div>
                </>
              )}
              {lastResult === 'wrong' && (
                <>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>😬</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--red)', marginBottom: 8 }}>Not quite!</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>The answer was:</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', background: 'var(--surface2)', padding: '10px 16px', borderRadius: 10, marginBottom: 20 }}>{currentQuestion?.a}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>No stars this time. Better luck next round!</div>
                </>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24 }}>
                <button className="btn btn-outline" onClick={onClose}>End Game</button>
                <button className="btn btn-accent" onClick={nextRound}>🎰 Spin Again!</button>
              </div>
            </div>
          )}

          </div>
        </div>
        </div>
        )}
      </div>
    </div>
  )
}

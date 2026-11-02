import { useState, useEffect, useRef, useMemo } from 'react'
import { getBook, getBookSlug, BOOKS } from '../lib/books'
import { buildPool, prepareQuestion, shuffle, hasBookBank, bankUnits, reviewBooks, tierForSlug, CATEGORIES, CATEGORY_LABELS, TIER_OPTIONS } from '../lib/quiz'
import { sfx, setMuted, unlockAudio } from '../lib/sounds'

// ─────────────────────────────────────────────────────────────────────────────
//  🚪 ESCAPE ROOM  (the whole class is locked in — answer to open the locks before time runs out!)
//  Each room has 3 locks. A right answer opens a lock. When all 3 are open the door opens and the
//  class moves on to the next room — and gets one digit of the secret code.
//  The last lock of every room is a ⭐ MASTER LOCK with a harder question (optional).
//  Wrong  → the lock stays shut, the clock loses time, and the next student gets a new question.
//  3 right in a row → ⏱ +10 seconds.  Lifelines: two 🔎 50/50 and one ⏰ +20 seconds.
//  Open every door before the clock hits zero and the whole class escapes!
//  Teacher-run, like the other games. Stars are only given when you press the button.
//  (This game has its own look: every room changes the colours of the whole screen.)
// ─────────────────────────────────────────────────────────────────────────────

const ROOMS = {
  library: { id: 'library', name: 'The Haunted Library', scene: ['📚', '🕯️', '🦉', '📜'], bg: ['#1e1b4b', '#6d28d9'], accent: '#fbbf24',
    intro: 'The doors slam shut! Open the locks to find the secret passage.', clear: 'The bookcase slides open…' },
  lab:     { id: 'lab', name: "The Mad Scientist's Lab", scene: ['🧪', '🔬', '⚗️', '🤖'], bg: ['#042f2e', '#0f766e'], accent: '#5eead4',
    intro: 'Bubbling potions everywhere! Crack the locks before the lab explodes.', clear: 'The steel door hisses open…' },
  jungle:  { id: 'jungle', name: 'The Jungle Temple', scene: ['🌴', '🗿', '🐍', '🦜'], bg: ['#052e16', '#15803d'], accent: '#fde047',
    intro: 'Ancient stones rumble. The temple traps are waking up!', clear: 'The stone wall slides away…' },
  space:   { id: 'space', name: 'The Space Station', scene: ['🚀', '🛰️', '👽', '🪐'], bg: ['#0b1033', '#1d4ed8'], accent: '#7dd3fc',
    intro: 'Warning! The airlock is sealed. Unlock it to reach the escape pod.', clear: 'The airlock opens with a hiss…' },
  vault:   { id: 'vault', name: "The Dragon's Vault", scene: ['🐉', '💎', '👑', '🗝️'], bg: ['#431407', '#b91c1c'], accent: '#fdba74',
    intro: 'The last room! A sleeping dragon guards the final door. Do not wake it!', clear: 'The great gate opens — daylight!' },
}
const ROOM_SETS = {
  easy:   ['library', 'jungle', 'vault'],
  normal: ['library', 'lab', 'jungle', 'vault'],
  hard:   ['library', 'lab', 'jungle', 'space', 'vault'],
}
const LEVELS = {
  easy:   { label: '🙂 Easy',   secPerLock: 50, penalty: 10 },
  normal: { label: '😎 Normal', secPerLock: 40, penalty: 15 },
  hard:   { label: '😈 Hard',   secPerLock: 30, penalty: 20 },
}
const LOCKS = 3
const REVIEW_SHARES = [
  { v: 0.2,  label: '🔹 A little (about 1 in 5)' },
  { v: 0.35, label: '🔸 Some (about 1 in 3)' },
  { v: 0.5,  label: '🔶 Half and half' },
]
const LETTERS = ['A', 'B', 'C', 'D']
const STARS = { win: 3, lose: 1, timeBonus: 1, timeShare: 0.25, bonus: 1, bonusMin: 3 }
const OPEN_LINES = ['Click! The lock opens.', 'Clunk! Another lock down!', 'The lock springs open!', 'Great — it opens!', 'Click-click! Open!']
const pick = arr => arr[Math.floor(Math.random() * arr.length)]
const fmt = s => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.ceil(Math.max(0, s)) % 60).padStart(2, '0')}`

function getTodayKey() {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
}
const qKey = q => `${q.q}|${q.correct}`
const cloneGame = g => ({ ...g, code: [...g.code], stats: { ...g.stats } })

const CSS = `
@keyframes erPop { 0% { transform: scale(0.6); opacity: 0 } 70% { transform: scale(1.08) } 100% { transform: scale(1); opacity: 1 } }
@keyframes erShake { 0%,100% { transform: translateX(0) } 20% { transform: translateX(-10px) } 40% { transform: translateX(9px) } 60% { transform: translateX(-6px) } 80% { transform: translateX(4px) } }
@keyframes erGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(251,191,36,0) } 50% { box-shadow: 0 0 22px 4px rgba(251,191,36,0.55) } }
@keyframes erPulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.08) } }
@keyframes erUnlock { 0% { transform: scale(1) rotate(0) } 40% { transform: scale(1.7) rotate(-18deg) } 100% { transform: scale(1) rotate(0) } }
@keyframes erFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-5px) } }
@keyframes erDoorOpen { 0% { transform: perspective(600px) rotateY(0) } 100% { transform: perspective(600px) rotateY(-78deg) } }
@keyframes erFall { 0% { transform: translateY(-40px) rotate(0); opacity: 1 } 100% { transform: translateY(105vh) rotate(540deg); opacity: 0.9 } }
.er-opt { transition: transform .12s, background .15s, border-color .15s; }
.er-opt:hover:not(:disabled) { transform: translateY(-2px); background: rgba(255,255,255,0.18) !important; }
`

function Confetti({ items }) {
  const bits = useMemo(() => Array.from({ length: 26 }, (_, i) => ({
    left: (i * 37 + 11) % 100, delay: (i % 9) * 0.25, dur: 2.6 + (i % 5) * 0.5, emoji: items[i % items.length], size: 18 + (i % 4) * 6,
  })), [items])
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 5 }}>
      {bits.map((b, i) => (
        <span key={i} style={{ position: 'absolute', top: -40, left: `${b.left}%`, fontSize: b.size, animation: `erFall ${b.dur}s linear ${b.delay}s infinite` }}>{b.emoji}</span>
      ))}
    </div>
  )
}

const glass = { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: 20, backdropFilter: 'blur(6px)' }

function Chip({ on, onClick, children, title }) {
  return (
    <button onClick={onClick} title={title} style={{
      fontFamily: 'var(--font)', fontSize: 13, fontWeight: 700, padding: '9px 16px', borderRadius: 12, cursor: 'pointer',
      border: `1.5px solid ${on ? '#fbbf24' : 'rgba(255,255,255,0.2)'}`,
      background: on ? 'linear-gradient(135deg,#fbbf24,#f97316)' : 'rgba(255,255,255,0.07)',
      color: on ? '#1c1917' : '#e0e7ff',
    }}>{children}</button>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontFamily: 'var(--font)', fontSize: 12, fontWeight: 800, letterSpacing: 1.5, color: '#a5b4fc', textTransform: 'uppercase', marginBottom: 9 }}>{title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{children}</div>
    </div>
  )
}

export default function EscapeRoomModal({ cls, students, onAwardStars, onUpdateClass, onClose, readOnly }) {
  const todayKey = getTodayKey()
  const book = getBook(cls)
  const slug = getBookSlug(cls)
  const bookReady = hasBookBank(slug)
  const unitList = useMemo(() => {
    if (!book || !bookReady) return []
    const have = bankUnits(slug)
    return (book.units || []).filter(u => have.includes(u.num))
  }, [book, bookReady, slug])

  // Only students who are here today may play
  const present = students.filter(s => s.nameEn && (s.attendanceLog || {})[todayKey] !== 'absent')
  const absent = students.filter(s => s.nameEn && (s.attendanceLog || {})[todayKey] === 'absent')

  // ── setup state ──
  const [phase, setPhase] = useState('setup') // setup | play | summary
  const saved = (cls?.unitsCovered || []).filter(n => unitList.some(u => u.num === n))
  const [units, setUnits] = useState(saved.length ? saved : unitList.map(u => u.num))
  const [cats, setCats] = useState(bookReady ? ['book', 'real', 'brain'] : ['real', 'general', 'brain'])
  const [levelKey, setLevelKey] = useState('normal')
  const [challenge, setChallenge] = useState(true)
  const [sound, setSound] = useState(true)
  const [tierPick, setTierPick] = useState(0)
  const tier = tierPick || tierForSlug(slug)
  const reviewable = useMemo(() => reviewBooks(slug), [slug])
  const [review, setReview] = useState({})
  const [reviewShare, setReviewShare] = useState(0.35)
  const [sitOut, setSitOut] = useState([])

  // ── game state ──
  const [game, setGame] = useState(null)
  const [paused, setPaused] = useState(false)
  const [clk, setClk] = useState(0)
  const [awarded, setAwarded] = useState(false)
  const [fx, setFx] = useState({ open: 0, miss: 0 }) // counters that retrigger the animations

  const gameRef = useRef(null)
  const pausedRef = useRef(false); pausedRef.current = paused
  const clockRef = useRef(0)
  const deckRef = useRef({ main: [], review: [], master: [] })
  const poolRef = useRef({ main: [], review: [], master: [], share: 0 })
  const usedRef = useRef(new Set())
  const timers = useRef([])
  const act = useRef({})

  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.current.push(t) }
  useEffect(() => () => { timers.current.forEach(clearTimeout) }, [])
  useEffect(() => { setMuted(!sound) }, [sound])

  const commit = g => { gameRef.current = g; setGame(g) }
  const bump = key => setFx(f => ({ ...f, [key]: f[key] + 1 }))
  const setClock = v => { clockRef.current = Math.max(0, v); setClk(clockRef.current) }

  const active = present.filter(s => !sitOut.includes(s.id))
  const level = LEVELS[levelKey]
  const roomIds = ROOM_SETS[levelKey]
  const totalTime = roomIds.length * LOCKS * level.secPerLock
  const reviewEntries = useMemo(() => Object.entries(review).map(([s, us]) => ({ slug: s, units: us })), [review])
  const pool = useMemo(() => buildPool({ slug, units, categories: cats, review: reviewEntries, tier }), [slug, units, cats, reviewEntries, tier])
  // Master-lock questions: exactly one tier above the class (capped at the top tier), from the non-book types
  const challengeTier = Math.min(4, tier + 1)
  const masterPool = useMemo(() => {
    const nonBook = cats.filter(c => c !== 'book')
    return nonBook.length ? buildPool({ slug, categories: nonBook, tierOnly: challengeTier }) : []
  }, [slug, cats, challengeTier])
  const masterOn = challenge && masterPool.length >= 4
  const reviewCount = pool.filter(q => q.category === 'review').length
  const canStart = active.length >= 1 && pool.length >= 10

  const toggleSitOut = id => setSitOut(list => (list.includes(id) ? list.filter(x => x !== id) : [...list, id]))
  function toggleReviewBook(s) {
    setReview(r => { const n = { ...r }; if (n[s]) delete n[s]; else n[s] = bankUnits(s); return n })
  }
  function toggleReviewUnit(s, u) {
    setReview(r => { const cur = r[s] || []; return { ...r, [s]: cur.includes(u) ? cur.filter(x => x !== u) : [...cur, u] } })
  }

  // Draw a question that has not been used yet in this game (decks refill when they run out).
  function takeFrom(key) {
    const pools = poolRef.current, decks = deckRef.current
    for (let tries = 0; tries < 6; tries++) {
      if (decks[key].length === 0) decks[key] = shuffle(pools[key])
      const q = decks[key].pop()
      if (!usedRef.current.has(qKey(q)) || tries === 5) { usedRef.current.add(qKey(q)); return q }
    }
    return pools[key][0]
  }
  function drawQuestion(master) {
    const pools = poolRef.current
    if (master && pools.master.length) return takeFrom('master')
    const hasReview = pools.review.length > 0, hasMain = pools.main.length > 0
    const key = hasReview && (!hasMain || Math.random() < pools.share) ? 'review' : 'main'
    return takeFrom(key)
  }

  // ── game flow ──
  function startGame() {
    if (!canStart) return
    unlockAudio(); sfx.start()
    const mainPool = pool.filter(q => q.category !== 'review')
    const reviewPool = pool.filter(q => q.category === 'review')
    poolRef.current = { main: mainPool, review: reviewPool, master: masterOn ? masterPool : [], share: reviewShare }
    deckRef.current = { main: shuffle(mainPool), review: shuffle(reviewPool), master: shuffle(masterOn ? masterPool : []) }
    usedRef.current = new Set()
    if (!readOnly && onUpdateClass && bookReady && units.length) onUpdateClass(cls.id, { unitsCovered: units })
    const rooms = roomIds.map(id => ROOMS[id])
    const first = drawQuestion(false)
    commit({
      rooms, r: 0, l: 0, master: masterOn, total: totalTime, penalty: level.penalty,
      code: rooms.map(() => Math.floor(Math.random() * 10)), pendingRoom: false,
      order: shuffle(active).map(s => ({ id: s.id, name: s.nameEn })), cur: 0,
      combo: 0, bestCombo: 0, question: prepareQuestion(first), isMaster: false, step: 'asking', picked: null, removed: [], result: null,
      lifelines: 2, boosts: 1, stats: {}, outcome: null, asked: 0, wrongs: 0, timeLeft: 0,
      speech: rooms[0].intro,
    })
    setClock(totalTime); setPaused(false); setAwarded(false); setFx({ open: 0, miss: 0 }); setPhase('play')
  }

  function finish(g, outcome) {
    g.outcome = outcome; g.step = 'over'; g.timeLeft = clockRef.current
    g.speech = outcome === 'win' ? '🎉 The final door swings open — you are FREE!' : "⏰ Time's up! The doors lock forever…"
    commit(g)
    if (outcome === 'win') { sfx.fanfare(); later(() => sfx.boom(), 200) } else sfx.boom()
    later(() => setPhase('summary'), 2800)
  }

  function answer(optIdx) {
    const g0 = gameRef.current
    if (!g0 || pausedRef.current || g0.step !== 'asking') return
    if (optIdx >= g0.question.options.length) return
    if (optIdx >= 0 && g0.removed.includes(optIdx)) return
    const g = cloneGame(g0)
    const q = g.question
    const me = g.order[g.cur % g.order.length]
    g.cur += 1
    g.asked += 1
    g.picked = optIdx
    const st = { correct: 0, wrong: 0, ...(g.stats[me.id] || {}) }
    const right = optIdx >= 0 && q.options[optIdx] === q.correct

    if (right) {
      g.combo += 1
      g.bestCombo = Math.max(g.bestCombo, g.combo)
      st.correct += 1; g.stats[me.id] = st
      g.l += 1
      let text = `🔓 ${g.isMaster ? 'The MASTER LOCK opens!' : pick(OPEN_LINES)} · ${me.name}`
      if (g.combo % 3 === 0) { setClock(clockRef.current + 10); text += ' · ⏱ +10 seconds!' }
      sfx.correct(); later(sfx.pass, 250)
      bump('open')
      const room = g.rooms[g.r]
      if (g.l >= LOCKS) {
        const lastRoom = g.r === g.rooms.length - 1
        g.result = { kind: 'room', text: lastRoom ? `🚪 THE FINAL DOOR IS OPEN! Code digit: ${g.code[g.r]}` : `🚪 Room cleared! Code digit: ${g.code[g.r]} — ${room.clear}` }
        g.speech = room.clear
        g.step = 'reveal'
        if (lastRoom) { commit(g); later(() => sfx.shield(), 300); later(() => finish(cloneGame(gameRef.current), 'win'), 2000) }
        else { g.pendingRoom = true; commit(g); later(() => sfx.shield(), 300); later(nextQuestion, 2700) }
        return
      }
      g.result = { kind: 'open', text }
      g.step = 'reveal'
      commit(g)
      later(nextQuestion, 1700)
      return
    }

    // ── wrong answer (or no answer) ──
    st.wrong += 1; g.stats[me.id] = st
    g.combo = 0; g.wrongs += 1
    setClock(clockRef.current - g.penalty)
    g.result = { kind: 'miss', text: `${optIdx < 0 ? '🤷 No answer' : '❌ Wrong'}! The lock stays shut · ⏱ −${g.penalty} seconds` }
    sfx.wrong(); later(sfx.boom, 120)
    bump('miss')
    g.step = 'reveal'
    commit(g)
    if (clockRef.current <= 0) later(() => finish(cloneGame(gameRef.current), 'lose'), 1500)
    else later(nextQuestion, 2300)
  }

  function nextQuestion() {
    const g0 = gameRef.current
    if (!g0 || g0.step === 'over') return
    const g = cloneGame(g0)
    if (g.pendingRoom) {
      g.pendingRoom = false; g.r += 1; g.l = 0
      g.speech = g.rooms[g.r].intro
      sfx.start()
    }
    g.isMaster = g.master && g.l === LOCKS - 1
    g.question = prepareQuestion(drawQuestion(g.isMaster))
    g.step = 'asking'; g.picked = null; g.removed = []; g.result = null
    commit(g)
  }

  // Teacher tools while a question is open
  function nextStudent() {
    const g0 = gameRef.current
    if (!g0 || g0.step !== 'asking' || g0.order.length < 2) return
    const g = cloneGame(g0); g.cur += 1; commit(g)
  }
  function skipQuestion() {
    const g0 = gameRef.current
    if (!g0 || g0.step !== 'asking') return
    const g = cloneGame(g0)
    g.question = prepareQuestion(drawQuestion(g.isMaster)); g.removed = []
    commit(g)
  }
  function fiftyFifty() {
    const g0 = gameRef.current
    if (!g0 || g0.step !== 'asking' || g0.lifelines < 1 || g0.question.tf || g0.removed.length) return
    const g = cloneGame(g0)
    const wrong = g.question.options.map((o, i) => i).filter(i => g.question.options[i] !== g.question.correct)
    g.removed = shuffle(wrong).slice(0, 2)
    g.lifelines -= 1
    commit(g); sfx.shield()
  }
  function extraTime() {
    const g0 = gameRef.current
    if (!g0 || g0.step !== 'asking' || g0.boosts < 1) return
    const g = cloneGame(g0)
    g.boosts -= 1
    setClock(clockRef.current + 20)
    commit(g); sfx.shield()
  }
  function endNow() {
    const g0 = gameRef.current
    if (!g0 || g0.step === 'over') return
    if (!window.confirm('End the escape now? The class stays locked in.')) return
    timers.current.forEach(clearTimeout)
    finish(cloneGame(g0), 'lose')
  }
  function playAgain() {
    timers.current.forEach(clearTimeout)
    setGame(null); gameRef.current = null; setPaused(false); setAwarded(false); setPhase('setup')
  }

  act.current = { answer, timeUp: () => { const g = gameRef.current; if (g && g.step === 'asking') finish(cloneGame(g), 'lose') } }

  // The big clock only runs while a question is open
  useEffect(() => {
    if (phase !== 'play') return undefined
    const id = setInterval(() => {
      const g = gameRef.current
      if (!g || pausedRef.current || g.step !== 'asking') return
      const next = Math.max(0, clockRef.current - 0.25)
      clockRef.current = next
      setClk(next)
      if (next > 0 && next <= 10 && next === Math.round(next)) sfx.tick(0.6)
      if (next <= 0) act.current.timeUp()
    }, 250)
    return () => clearInterval(id)
  }, [phase])

  // Keyboard: A–D or 1–4 to answer
  useEffect(() => {
    if (phase !== 'play') return undefined
    const h = e => {
      const idx = ['A', 'B', 'C', 'D'].indexOf(String(e.key).toUpperCase())
      const num = ['1', '2', '3', '4'].indexOf(e.key)
      const i = idx >= 0 ? idx : num
      if (i >= 0) act.current.answer(i)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [phase])

  // ── stars ──
  const summary = useMemo(() => {
    if (!game || phase !== 'summary') return null
    const won = game.outcome === 'win'
    const fast = won && game.timeLeft >= game.total * STARS.timeShare
    const rows = game.order.map(m => {
      const s = { correct: 0, wrong: 0, ...(game.stats[m.id] || {}) }
      return { id: m.id, name: m.name, ...s, stars: (won ? STARS.win : STARS.lose) + (fast ? STARS.timeBonus : 0) + (s.correct >= STARS.bonusMin ? STARS.bonus : 0) }
    })
    const best = Math.max(0, ...rows.map(r => r.correct))
    return { won, fast, rows, best }
  }, [game, phase])

  async function awardStars() {
    if (awarded || readOnly || !onAwardStars || !summary) return
    setAwarded(true)
    for (const r of summary.rows) {
      if (r.stars > 0) await onAwardStars(r.id, r.stars, `Escape Room — ${summary.won ? 'escaped!' : 'tried hard'}`)
    }
    sfx.correct()
  }

  // ───────────────────────── RENDER ─────────────────────────
  const playing = phase === 'play' && game
  const room = playing ? game.rooms[game.r] : null
  const bgFor = r => `linear-gradient(160deg, ${r.bg[0]} 0%, ${r.bg[1]} 100%)`
  const shell = {
    position: 'fixed', inset: 0, zIndex: 200, color: '#f8fafc', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font)',
    background: room ? bgFor(room) : 'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#0f766e 100%)', transition: 'background 1.2s',
  }
  const pct = playing ? (clk / game.total) * 100 : 100
  const clockColor = pct > 33 ? '#f8fafc' : pct > 15 ? '#fbbf24' : '#fb7185'
  const header = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
      <div style={{ fontSize: 24 }}>🚪</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 17 }}>Escape Room</div>
        <div style={{ fontSize: 11, color: '#c7d2fe', letterSpacing: 1 }}>{cls?.name}{playing ? ` · ROOM ${game.r + 1} OF ${game.rooms.length}` : ''}</div>
      </div>
      {playing && (
        <div style={{ textAlign: 'center', minWidth: 110 }}>
          <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1, color: clockColor, fontVariantNumeric: 'tabular-nums', animation: pct <= 15 && game.step !== 'over' ? 'erPulse .6s infinite' : 'none' }}>⏱ {fmt(clk)}</div>
          <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.18)', marginTop: 5, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: clockColor, transition: 'width .25s linear' }} />
          </div>
        </div>
      )}
      <button onClick={() => setSound(s => !s)} className="btn btn-ghost" style={{ color: '#e0e7ff', fontSize: 18 }} title="Sound">{sound ? '🔊' : '🔇'}</button>
      {playing && game.step === 'asking' && (
        <button onClick={() => setPaused(p => !p)} className="btn btn-outline" style={{ color: '#fde68a', borderColor: 'rgba(253,230,138,0.5)' }}>{paused ? '▶ Resume' : '⏸ Pause'}</button>
      )}
      {playing && game.step !== 'over' && (
        <button onClick={endNow} className="btn btn-outline" style={{ color: '#fda4af', borderColor: 'rgba(253,164,175,0.5)' }}>🏁 End</button>
      )}
      <button onClick={onClose} className="btn btn-outline" style={{ color: '#f8fafc', borderColor: 'rgba(255,255,255,0.3)' }}>✕ Close</button>
    </div>
  )

  // ── SETUP ──
  if (phase === 'setup') {
    return (
      <div style={shell}>
        <style>{CSS}</style>
        {header}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
          <div style={{ maxWidth: 880, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <div style={{ fontSize: 54, animation: 'erFloat 2.4s ease-in-out infinite' }}>🔐</div>
              <div style={{ fontSize: 26, fontWeight: 900 }}>You are locked in!</div>
              <div style={{ color: '#c7d2fe', fontSize: 14 }}>Open every lock before the clock runs out — together.</div>
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
              <div style={{ ...glass, flex: '1 1 300px', padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, color: '#a5b4fc', marginBottom: 8 }}>ESCAPING TODAY · {active.length}{sitOut.length ? ` · ${sitOut.length} SITTING OUT` : ''}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {present.map(s => {
                    const out = sitOut.includes(s.id)
                    return (
                      <button key={s.id} onClick={() => toggleSitOut(s.id)} title={out ? 'Tap to let them play' : 'Tap if they don\'t want to play'}
                        style={{ cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12, padding: '4px 11px', borderRadius: 999, border: `1px solid ${out ? 'rgba(253,164,175,0.5)' : 'rgba(255,255,255,0.15)'}`,
                          background: out ? 'transparent' : 'rgba(255,255,255,0.12)', color: out ? '#94a3b8' : '#f8fafc', textDecoration: out ? 'line-through' : 'none' }}>
                        {out ? '🙈 ' : ''}{s.nameEn}
                      </button>
                    )
                  })}
                  {present.length === 0 && <span style={{ color: '#fda4af', fontSize: 13 }}>Nobody is present today.</span>}
                </div>
                {present.length > 0 && <div style={{ marginTop: 8, fontSize: 11, color: '#a5b4fc' }}>Tap a name if they don't want to play — tap again to bring them back.</div>}
                {absent.length > 0 && (
                  <div style={{ marginTop: 10, fontSize: 11, color: '#fda4af' }}>
                    {absent.length} absent today (not in game): {absent.map(s => s.nameEn).join(', ')}
                  </div>
                )}
              </div>
              <div style={{ ...glass, flex: '1 1 300px', padding: 16, fontSize: 13, lineHeight: 1.75, color: '#e0e7ff' }}>
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, color: '#a5b4fc', marginBottom: 6 }}>HOW IT WORKS</div>
                🔒 Every room has <b>3 locks</b> — one student answers at a time<br />
                🔓 Right: a lock opens · all 3 open: <b>the door opens</b> and you get a code digit<br />
                ❌ Wrong: the lock stays shut and you lose <b>seconds</b><br />
                ⭐ The last lock of each room is a <b>MASTER LOCK</b> (harder question)<br />
                ⏱ 3 right in a row: <b>+10 seconds</b> · lifelines: 🔎 50/50 ×2, ⏰ +20s ×1
              </div>
            </div>

            <Section title="Difficulty">
              {Object.entries(LEVELS).map(([k, l]) => <Chip key={k} on={levelKey === k} onClick={() => setLevelKey(k)}>{l.label}</Chip>)}
            </Section>
            <div style={{ marginTop: -12, marginBottom: 22, fontSize: 13, color: '#c7d2fe' }}>
              <b style={{ color: '#fde68a' }}>{roomIds.length} rooms</b> · {roomIds.length * LOCKS} locks · <b style={{ color: '#fde68a' }}>{fmt(totalTime)}</b> on the clock · wrong answer: <b style={{ color: '#fde68a' }}>−{level.penalty}s</b>
            </div>

            <Section title="⭐ Master locks (harder question on the last lock of each room)">
              <Chip on={challenge} onClick={() => setChallenge(true)}>⭐ On</Chip>
              <Chip on={!challenge} onClick={() => setChallenge(false)}>Off</Chip>
            </Section>
            {challenge && !masterOn && (
              <div style={{ marginTop: -10, marginBottom: 20, fontSize: 12, color: '#fde68a' }}>
                Master locks need at least one non-book question type (Real-Life, Spelling, World, General or Brain Teasers) — switch one on below.
              </div>
            )}

            {bookReady ? (
              <Section title={`📘 Units covered (${book?.label || ''}) — saved for next time`}>
                {unitList.map(u => (
                  <Chip key={u.num} on={units.includes(u.num)} onClick={() => setUnits(us => us.includes(u.num) ? us.filter(x => x !== u.num) : [...us, u.num])}>
                    {u.emoji} {u.num}. {u.title}
                  </Chip>
                ))}
                <Chip on={false} onClick={() => setUnits(unitList.map(u => u.num))}>all</Chip>
                <Chip on={false} onClick={() => setUnits([])}>none</Chip>
              </Section>
            ) : (
              <div style={{ ...glass, marginBottom: 22, padding: 14, fontSize: 13, color: '#fde68a' }}>
                📘 There is no question bank for {book?.label || 'this class'} yet — the other question types are ready to play.
              </div>
            )}

            {reviewable.length > 0 && (
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, color: '#a5b4fc', textTransform: 'uppercase', marginBottom: 9 }}>🔁 Review earlier books (optional — off unless you pick one)</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {reviewable.map(rs => (
                    <Chip key={rs} on={!!review[rs]} onClick={() => toggleReviewBook(rs)}>{BOOKS[rs]?.label || rs}</Chip>
                  ))}
                </div>
                {Object.keys(review).map(rs => (
                  <div key={rs} style={{ ...glass, marginTop: 12, padding: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#fde68a', marginBottom: 8 }}>{BOOKS[rs]?.label || rs} — units to review</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(BOOKS[rs]?.units || []).filter(u => bankUnits(rs).includes(u.num)).map(u => (
                        <Chip key={u.num} on={(review[rs] || []).includes(u.num)} onClick={() => toggleReviewUnit(rs, u.num)}>{u.emoji} {u.num}. {u.title}</Chip>
                      ))}
                      <Chip on={false} onClick={() => setReview(r => ({ ...r, [rs]: bankUnits(rs) }))}>all</Chip>
                      <Chip on={false} onClick={() => setReview(r => ({ ...r, [rs]: [] }))}>none</Chip>
                    </div>
                  </div>
                ))}
                {Object.keys(review).length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, color: '#a5b4fc', textTransform: 'uppercase', marginBottom: 9 }}>How many review questions?</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {REVIEW_SHARES.map(o => <Chip key={o.v} on={reviewShare === o.v} onClick={() => setReviewShare(o.v)}>{o.label}</Chip>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Section title="Question types">
              {CATEGORIES.filter(c => c.id !== 'book' || bookReady).map(c => (
                <Chip key={c.id} on={cats.includes(c.id)} title={c.desc}
                  onClick={() => setCats(cs => cs.includes(c.id) ? cs.filter(x => x !== c.id) : [...cs, c.id])}>{c.label}</Chip>
              ))}
            </Section>
            {cats.some(c => c !== 'book') && (
              <Section title="Difficulty of the non-book questions">
                {TIER_OPTIONS.map(o => <Chip key={o.v} on={tierPick === o.v} onClick={() => setTierPick(o.v)}>{o.v === 0 ? `🎯 Automatic · level ${tierForSlug(slug)}` : o.label}</Chip>)}
              </Section>
            )}

            <div style={{ textAlign: 'center', padding: '10px 0 40px' }}>
              <button disabled={!canStart} onClick={startGame}
                style={{ cursor: canStart ? 'pointer' : 'not-allowed', border: 'none', borderRadius: 16, fontFamily: 'var(--font)', fontSize: 19, fontWeight: 900, padding: '16px 46px', color: '#1c1917',
                  background: 'linear-gradient(135deg,#fde047,#fb923c)', opacity: canStart ? 1 : 0.45, boxShadow: '0 8px 24px rgba(251,146,60,0.35)' }}>
                🔐 Lock us in!
              </button>
              <div style={{ marginTop: 10, fontSize: 12, color: '#c7d2fe' }}>
                {pool.length - reviewCount} questions ready{reviewCount ? ` + ${reviewCount} review` : ''}{masterOn ? ` + ${masterPool.length} master-lock questions` : ''}
                {active.length < 1 ? ' · need at least 1 player' : ''}{pool.length < 10 ? ' · pick more units or types' : ''}
              </div>
              {readOnly && <div style={{ marginTop: 14, fontSize: 12, color: '#c7d2fe' }}>View only — stars and units will not be saved.</div>}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── SUMMARY ──
  if (phase === 'summary' && game && summary) {
    const stars = summary.best >= STARS.bonusMin ? summary.rows.filter(r => r.correct === summary.best) : []
    const cleared = game.pendingRoom ? game.r + 1 : game.r + (summary.won ? 1 : 0)
    return (
      <div style={shell}>
        <style>{CSS}</style>
        {summary.won && <Confetti items={['🎉', '⭐', '🔓', '🏆', '✨']} />}
        {header}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 20px', position: 'relative', zIndex: 6 }}>
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 72, animation: 'erPop .6s' }}>{summary.won ? '🏆' : '🔒'}</div>
            <div style={{ fontSize: 30, fontWeight: 900, margin: '6px 0 4px', animation: 'erPop .6s' }}>
              {summary.won ? 'You ESCAPED!' : 'Still locked in…'}
            </div>
            <div style={{ color: '#c7d2fe', marginBottom: 6 }}>
              {summary.won ? `Secret code: ${game.code.join(' ')} · ${fmt(game.timeLeft)} left on the clock` : `${Math.min(cleared, game.rooms.length)} of ${game.rooms.length} rooms cleared`}
            </div>
            <div style={{ color: '#a5b4fc', marginBottom: 22, fontSize: 13 }}>
              {game.asked} questions · best streak 🔥{game.bestCombo} · {game.wrongs} wrong
            </div>

            <div style={{ ...glass, padding: 14, textAlign: 'left' }}>
              {summary.rows.map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 14, padding: '4px 0' }}>
                  <span>{stars.some(m => m.id === r.id) ? '🏅 ' : ''}{r.name}</span>
                  <span style={{ color: '#c7d2fe', fontSize: 13 }}>✅ {r.correct} · ❌ {r.wrong} · ⭐ +{r.stars}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: '#a5b4fc' }}>
              Stars: {STARS.win} for everyone if you escape ({STARS.lose} for trying), +{STARS.timeBonus} if a quarter of the time is left, +{STARS.bonus} for {STARS.bonusMin}+ right answers. 🏅 = most right answers.
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
              <button className="btn btn-accent" disabled={awarded || readOnly} onClick={awardStars} style={{ fontSize: 15, padding: '12px 26px', opacity: awarded || readOnly ? 0.5 : 1 }}>
                {readOnly ? 'View only' : awarded ? '✅ Stars awarded!' : '⭐ Award stars to the class'}
              </button>
              <button className="btn btn-outline" onClick={playAgain} style={{ color: '#fde68a', borderColor: 'rgba(253,230,138,0.5)' }}>{summary.won ? '🔁 New escape' : '🔁 Try again'}</button>
              <button className="btn btn-outline" onClick={onClose} style={{ color: '#f8fafc', borderColor: 'rgba(255,255,255,0.3)' }}>Close</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── PLAY ──
  if (!game) return null
  const g = game
  const q = g.question
  const over = g.step === 'over'
  const answering = g.step === 'asking'
  const speaker = g.order[g.cur % g.order.length]
  const accent = room.accent
  const doorOpen = (g.step === 'reveal' && g.result?.kind === 'room') || (over && g.outcome === 'win')
  const label = q.category === 'book' ? `📘 UNIT ${q.unit}`
    : q.category === 'review' ? `🔁 REVIEW · ${BOOKS[q.slug]?.label || ''} · UNIT ${q.unit}`
    : CATEGORY_LABELS[q.category] || '🌍 GENERAL KNOWLEDGE'

  const optStyle = i => {
    const opt = q.options[i]
    const base = { textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 20, fontWeight: 600, padding: '15px 18px', borderRadius: 18, borderWidth: 2, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.22)', background: 'rgba(255,255,255,0.1)', color: '#f8fafc', display: 'flex', gap: 12, alignItems: 'center' }
    if (g.step === 'reveal' || over) {
      if (opt === q.correct) return { ...base, borderColor: '#4ade80', background: 'rgba(34,197,94,0.35)' }
      if (g.picked === i) return { ...base, borderColor: '#fb7185', background: 'rgba(244,63,94,0.35)' }
      return { ...base, opacity: 0.4 }
    }
    if (g.removed.includes(i)) return { ...base, opacity: 0.22, textDecoration: 'line-through', cursor: 'not-allowed' }
    return base
  }
  const resultColors = {
    open: { bg: 'rgba(34,197,94,0.25)', fg: '#bbf7d0' },
    room: { bg: 'rgba(251,191,36,0.28)', fg: '#fef08a' },
    miss: { bg: 'rgba(244,63,94,0.28)', fg: '#fecdd3' },
  }
  const rc = resultColors[g.result?.kind] || resultColors.open

  return (
    <div style={shell}>
      <style>{CSS}</style>
      {over && g.outcome === 'win' && <Confetti items={['🎉', '⭐', '🔓']} />}
      {header}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 28px' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* ── The room ── */}
          <div style={{ ...glass, flex: '0 1 300px', minWidth: 250, padding: '16px 16px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, color: accent }}>ROOM {g.r + 1} OF {g.rooms.length}</div>
            <div style={{ fontSize: 19, fontWeight: 900, margin: '2px 0 8px' }}>{room.name}</div>
            <div style={{ fontSize: 24, letterSpacing: 8, marginBottom: 10 }}>{room.scene.join('')}</div>

            {/* the door */}
            <div style={{ position: 'relative', width: 150, height: 196, margin: '0 auto 12px', borderRadius: '80px 80px 10px 10px', background: `radial-gradient(circle at 50% 60%, ${accent}, transparent 70%)`, overflow: 'hidden' }}>
              <div key={`door-${g.r}-${doorOpen}`} style={{ position: 'absolute', inset: 0, borderRadius: '80px 80px 10px 10px', transformOrigin: 'left center',
                background: 'linear-gradient(160deg, rgba(255,255,255,0.28), rgba(255,255,255,0.08))', border: `3px solid ${accent}`, animation: doorOpen ? 'erDoorOpen 1.1s forwards' : 'none' }}>
                <div style={{ position: 'absolute', right: 16, top: '55%', width: 14, height: 14, borderRadius: 7, background: accent }} />
                <div style={{ position: 'absolute', left: 20, right: 20, top: 40, height: 56, borderRadius: '30px 30px 4px 4px', border: '2px solid rgba(255,255,255,0.3)' }} />
              </div>
            </div>

            {/* the locks */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
              {Array.from({ length: LOCKS }, (_, i) => {
                const done = i < g.l
                const now = i === g.l && !over && (g.step !== 'reveal' || g.result?.kind === 'miss')
                const masterSlot = g.master && i === LOCKS - 1
                return (
                  <div key={i} style={{ width: 54, height: 60, borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 26,
                    background: done ? 'rgba(34,197,94,0.3)' : 'rgba(0,0,0,0.25)', border: `2px solid ${done ? '#4ade80' : now ? accent : 'rgba(255,255,255,0.2)'}`,
                    animation: done && i === g.l - 1 && g.step === 'reveal' ? 'erUnlock .7s' : now ? 'erGlow 1.6s infinite' : 'none' }}>
                    <span>{done ? '🔓' : masterSlot ? '🔐' : '🔒'}</span>
                    {masterSlot && <span style={{ fontSize: 10, fontWeight: 800, color: '#fde68a', marginTop: 1 }}>⭐ MASTER</span>}
                  </div>
                )
              })}
            </div>

            {/* the secret code */}
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: '#c7d2fe', marginBottom: 5 }}>SECRET CODE</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
              {g.code.map((d, i) => {
                const known = i < g.r || (i === g.r && g.l >= LOCKS)
                return (
                  <div key={i} style={{ width: 34, height: 42, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900,
                    background: known ? accent : 'rgba(0,0,0,0.3)', color: known ? '#1c1917' : '#94a3b8', border: '1px solid rgba(255,255,255,0.2)', animation: known && i === g.r && g.l >= LOCKS ? 'erPop .5s' : 'none' }}>
                    {known ? d : '?'}
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: 12, fontSize: 13, color: '#e0e7ff', fontStyle: 'italic', minHeight: 36 }}>{g.speech}</div>
          </div>

          {/* ── The question ── */}
          <div key={`q-${fx.miss}`} style={{ flex: '1 1 420px', minWidth: 300, animation: fx.miss && g.result?.kind === 'miss' && g.step === 'reveal' ? 'erShake .5s' : 'none' }}>
            {!over && (
              <div style={{ ...glass, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '10px 16px' }}>
                <div style={{ fontSize: 24 }}>🎤</div>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ fontWeight: 800, color: accent }}>{speaker.name}'s turn</div>
                  <div style={{ fontSize: 12, color: '#c7d2fe' }}>The class may whisper to help!</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: g.combo >= 2 ? '#fdba74' : '#94a3b8' }}>
                  {g.combo > 0 ? `🔥 STREAK ×${g.combo}${g.combo % 3 === 2 ? ' — next one gives +10s!' : ''}` : 'no streak yet'}
                </div>
                <button className="btn btn-outline" disabled={!answering || g.lifelines < 1 || q.tf || g.removed.length > 0 || paused} onClick={fiftyFifty}
                  style={{ color: '#7dd3fc', borderColor: 'rgba(125,211,252,0.5)', opacity: !answering || g.lifelines < 1 || q.tf || g.removed.length > 0 ? 0.4 : 1 }}
                  title="Remove two wrong answers">🔎 50/50 · {g.lifelines}</button>
                <button className="btn btn-outline" disabled={!answering || g.boosts < 1 || paused} onClick={extraTime}
                  style={{ color: '#d8b4fe', borderColor: 'rgba(216,180,254,0.5)', opacity: !answering || g.boosts < 1 ? 0.4 : 1 }}
                  title="Add 20 seconds to the clock">⏰ +20s · {g.boosts}</button>
              </div>
            )}

            <div style={{ ...glass, padding: '22px 22px 20px', position: 'relative', borderColor: g.isMaster && !over ? '#fde047' : 'rgba(255,255,255,0.16)', borderWidth: g.isMaster && !over ? 2 : 1, animation: g.isMaster && answering ? 'erGlow 2s infinite' : 'none' }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, color: g.isMaster ? '#fde047' : '#c7d2fe', marginBottom: 10 }}>
                {g.isMaster ? '⭐ MASTER LOCK · ' : ''}{label}
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.3, marginBottom: 18 }}>{q.q}</div>
              <div style={{ display: 'grid', gridTemplateColumns: q.tf ? '1fr 1fr' : 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                {q.options.map((o, i) => (
                  <button key={i} className="er-opt" disabled={!answering || paused || g.removed.includes(i)} onClick={() => answer(i)} style={optStyle(i)}>
                    <span style={{ width: 30, height: 30, borderRadius: 15, background: accent, color: '#1c1917', fontSize: 14, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{LETTERS[i]}</span>
                    <span>{o}</span>
                  </button>
                ))}
              </div>
              {paused && (
                <div style={{ position: 'absolute', inset: 0, borderRadius: 20, background: 'rgba(15,23,42,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800 }}>⏸ Paused — the clock is stopped</div>
              )}
            </div>

            {g.step === 'reveal' && (
              <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 14, textAlign: 'center', fontWeight: 800, fontSize: 18, animation: 'erPop .35s', background: rc.bg, color: rc.fg }}>
                {g.result?.text}
                {q.tip && <div style={{ marginTop: 4, fontWeight: 500, fontSize: 13, color: '#e0e7ff' }}>💡 {q.tip}</div>}
              </div>
            )}
            {over && (
              <div style={{ marginTop: 14, padding: 16, borderRadius: 16, textAlign: 'center', fontSize: 26, fontWeight: 900, background: g.outcome === 'win' ? 'rgba(34,197,94,0.3)' : 'rgba(244,63,94,0.3)', animation: 'erPop .5s' }}>
                {g.outcome === 'win' ? '🎉 You escaped!' : "⏰ Time's up — still locked in…"}
              </div>
            )}

            {answering && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
                <button className="btn btn-ghost" onClick={nextStudent} style={{ color: '#c7d2fe', fontSize: 13 }} title="Another student answers (e.g. this one doesn't want to)">↻ Another student</button>
                <button className="btn btn-ghost" onClick={skipQuestion} style={{ color: '#c7d2fe', fontSize: 13 }}>⏭ Different question</button>
                <button className="btn btn-ghost" onClick={() => answer(-1)} style={{ color: '#c7d2fe', fontSize: 13 }}>🤷 No answer</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

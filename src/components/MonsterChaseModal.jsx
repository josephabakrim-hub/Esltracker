import { useState, useEffect, useRef, useMemo } from 'react'
import { getBook, getBookSlug, BOOKS } from '../lib/books'
import { buildPool, prepareQuestion, shuffle, hasBookBank, bankUnits, reviewBooks, tierForSlug, CATEGORIES, CATEGORY_LABELS, TIER_OPTIONS } from '../lib/quiz'
import { sfx, setMuted, unlockAudio } from '../lib/sounds'

// ─────────────────────────────────────────────────────────────────────────────
//  👹 MONSTER CHASE  (the whole class runs for the safe house — a monster is right behind!)
//  The class is a pack of runners on a track. A monster chases them.
//  Right  → the pack runs forward 1 tile. Three right in a row = ⚡ SPRINT (+2 more)
//           — or, if someone was caught, 🛟 RESCUE brings them back into the race.
//  Wrong  → the monster leaps forward 2 tiles.
//  Monster reaches the pack → it grabs the student whose turn it was (they become a 👻 ghost).
//  Reach the 🏠 safe house and the class wins. If every runner is caught, the monster wins.
//  Lifelines: two 🔎 50/50 and one 🛡 Shield (blocks the next wrong answer).
//  Teacher-run, like the other games. Stars are only given when you press the button.
// ─────────────────────────────────────────────────────────────────────────────

const MONSTERS = [
  { id: 'gobbler', name: 'Gobbler',      emoji: '👹', color: '#ef4444', taunts: ['I smell tasty students!', 'Run, run, run!', 'I am so hungry…'] },
  { id: 'zorp',    name: 'Zorp',         emoji: '👾', color: '#a78bfa', taunts: ['Zzzap! I am coming!', 'Beep boop, snack detected!', 'You cannot escape the alien!'] },
  { id: 'snappy',  name: 'Snappy',       emoji: '🐊', color: '#22c55e', taunts: ['Snap snap snap!', 'Crocodiles are FAST!', 'Come closer, little fish…'] },
  { id: 'webster', name: 'Webster',      emoji: '🕷️', color: '#94a3b8', taunts: ['You are stuck in my web!', 'Eight legs are faster than two!', 'Tick tick tick…'] },
  { id: 'wolfie',  name: 'Wolfie',       emoji: '🐺', color: '#38bdf8', taunts: ['Awooooo!', 'The moon makes me fast!', 'I can hear you breathing!'] },
  { id: 'bubba',   name: 'Big Bubba',    emoji: '🦍', color: '#f59e0b', taunts: ['Bubba SMASH!', 'Big feet, big steps!', 'Ooh ooh ah ah!'] },
]
const GOOD = ['Run!', 'Faster!', 'Nice one!', 'You are flying!', 'Keep going!', 'Great answer!']
const LEVELS = {
  easy:   { label: '🙂 Easy',   track: 8,  gap: 4, lunge: 2 },
  normal: { label: '😎 Normal', track: 10, gap: 3, lunge: 2 },
  hard:   { label: '😈 Hard',   track: 12, gap: 3, lunge: 3 },
}
const TIMERS = [
  { k: 0,  label: 'No timer' },
  { k: 20, label: '⏱ 20 seconds' },
  { k: 30, label: '⏱ 30 seconds' },
]
const REVIEW_SHARES = [
  { v: 0.2,  label: '🔹 A little (about 1 in 5)' },
  { v: 0.35, label: '🔸 Some (about 1 in 3)' },
  { v: 0.5,  label: '🔶 Half and half' },
]
const LETTERS = ['A', 'B', 'C', 'D']
const STARS = { safe: 3, ghost: 2, lose: 1, bonus: 1, bonusMin: 3 }
const pick = arr => arr[Math.floor(Math.random() * arr.length)]

function getTodayKey() {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
}

const cloneGame = g => ({ ...g, order: g.order.map(r => ({ ...r })), stats: { ...g.stats } })

// Next runner who is still in the race (skips ghosts). Returns -1 when everybody is caught.
function nextRunner(order, from) {
  for (let k = 1; k <= order.length; k++) {
    const i = (from + k) % order.length
    if (!order[i].caught) return i
  }
  return -1
}

const CSS = `
@keyframes mcPop { 0% { transform: scale(0.6); opacity: 0 } 70% { transform: scale(1.08) } 100% { transform: scale(1); opacity: 1 } }
@keyframes mcRun { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
@keyframes mcStalk { 0%,100% { transform: translateX(0) scale(1) } 50% { transform: translateX(-5px) scale(1.06) } }
@keyframes mcLunge { 0% { transform: translateX(0) scale(1) } 40% { transform: translateX(14px) scale(1.3) } 100% { transform: translateX(0) scale(1) } }
@keyframes mcDash { 0% { transform: translateX(-10px) } 50% { transform: translateX(8px) scale(1.2) } 100% { transform: translateX(0) } }
@keyframes mcDanger { 0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0) } 50% { box-shadow: 0 0 18px 4px rgba(239,68,68,0.55) } }
@keyframes mcPulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.06) } }
@keyframes mcFall { 0% { transform: translateY(-40px) rotate(0); opacity: 1 } 100% { transform: translateY(105vh) rotate(540deg); opacity: 0.9 } }
.mc-opt { transition: transform .12s, background .15s, border-color .15s; }
.mc-opt:hover:not(:disabled) { transform: translateY(-2px); border-color: #fbbf24 !important; }
`

function Chip({ on, onClick, children, title }) {
  return (
    <button onClick={onClick} title={title} style={{
      fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, padding: '8px 14px', borderRadius: 999, cursor: 'pointer',
      border: `1.5px solid ${on ? '#f59e0b' : '#3a342c'}`, background: on ? 'rgba(245,158,11,0.18)' : 'transparent',
      color: on ? '#fbbf24' : '#a39b8f',
    }}>{children}</button>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2, color: '#8a8378', textTransform: 'uppercase', marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{children}</div>
    </div>
  )
}

export default function MonsterChaseModal({ cls, students, onAwardStars, onUpdateClass, onClose, readOnly }) {
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
  const [cats, setCats] = useState(bookReady ? ['book', 'real'] : ['real', 'general'])
  const [monsterId, setMonsterId] = useState('random')
  const [levelKey, setLevelKey] = useState('normal')
  const [timerSec, setTimerSec] = useState(0)
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
  const [tl, setTl] = useState(0)
  const [awarded, setAwarded] = useState(false)
  const [fx, setFx] = useState({ dash: 0, lunge: 0 }) // counters that retrigger the animations

  const gameRef = useRef(null)
  const pausedRef = useRef(false); pausedRef.current = paused
  const timerRef = useRef(0); timerRef.current = timerSec
  const tlRef = useRef(0)
  const deckRef = useRef({ main: [], review: [] })
  const poolRef = useRef({ main: [], review: [], share: 0 })
  const timers = useRef([])
  const act = useRef({})

  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.current.push(t) }
  useEffect(() => () => { timers.current.forEach(clearTimeout) }, [])
  useEffect(() => { setMuted(!sound) }, [sound])

  const commit = g => { gameRef.current = g; setGame(g) }
  const resetTimer = () => { tlRef.current = timerRef.current; setTl(timerRef.current) }
  const bump = key => setFx(f => ({ ...f, [key]: f[key] + 1 }))

  const active = present.filter(s => !sitOut.includes(s.id))
  const level = LEVELS[levelKey]
  const trackLen = level.track + Math.round(active.length / 4)
  const reviewEntries = useMemo(() => Object.entries(review).map(([s, us]) => ({ slug: s, units: us })), [review])
  const pool = useMemo(() => buildPool({ slug, units, categories: cats, review: reviewEntries, tier }), [slug, units, cats, reviewEntries, tier])
  const reviewCount = pool.filter(q => q.category === 'review').length
  const canStart = active.length >= 1 && pool.length >= 8

  const toggleSitOut = id => setSitOut(list => (list.includes(id) ? list.filter(x => x !== id) : [...list, id]))
  function toggleReviewBook(s) {
    setReview(r => { const n = { ...r }; if (n[s]) delete n[s]; else n[s] = bankUnits(s); return n })
  }
  function toggleReviewUnit(s, u) {
    setReview(r => { const cur = r[s] || []; return { ...r, [s]: cur.includes(u) ? cur.filter(x => x !== u) : [...cur, u] } })
  }

  // Review questions (earlier books) are mixed in at the share the teacher chose.
  function drawQuestion() {
    const pools = poolRef.current, decks = deckRef.current
    const hasReview = pools.review.length > 0, hasMain = pools.main.length > 0
    const key = hasReview && (!hasMain || Math.random() < pools.share) ? 'review' : 'main'
    if (decks[key].length === 0) decks[key] = shuffle(pools[key])
    return decks[key].pop()
  }

  // ── game flow ──
  function startGame() {
    if (!canStart) return
    unlockAudio(); sfx.start()
    const mainPool = pool.filter(q => q.category !== 'review')
    const reviewPool = pool.filter(q => q.category === 'review')
    poolRef.current = { main: mainPool, review: reviewPool, share: reviewShare }
    deckRef.current = { main: shuffle(mainPool), review: shuffle(reviewPool) }
    const monster = monsterId === 'random' ? pick(MONSTERS) : MONSTERS.find(m => m.id === monsterId)
    if (!readOnly && onUpdateClass && bookReady && units.length) onUpdateClass(cls.id, { unitsCovered: units })
    commit({
      monster, len: trackLen + level.gap, pos: level.gap, mon: 0, startGap: level.gap, lunge: level.lunge,
      order: shuffle(active).map(s => ({ id: s.id, name: s.nameEn, caught: false, caughtAt: 0 })), cur: 0,
      combo: 0, bestCombo: 0, question: prepareQuestion(drawQuestion()), step: 'asking', picked: null, removed: [], result: null,
      lifelines: 2, shields: 1, shieldOn: false, stats: {}, outcome: null, asked: 0, rescues: 0, catches: 0,
      speech: `${monster.emoji} ${pick(monster.taunts)}`,
    })
    resetTimer(); setPaused(false); setAwarded(false); setFx({ dash: 0, lunge: 0 }); setPhase('play')
  }

  function finish(g, outcome) {
    g.outcome = outcome; g.step = 'over'
    g.speech = outcome === 'win' ? `${g.monster.emoji} Grrr… they reached the safe house!` : `${g.monster.emoji} Yum! I caught everybody!`
    commit(g)
    if (outcome === 'win') sfx.fanfare(); else sfx.boom()
    later(() => setPhase('summary'), 2800)
  }

  function answer(optIdx) {
    const g0 = gameRef.current
    if (!g0 || pausedRef.current || g0.step !== 'asking') return
    if (optIdx >= g0.question.options.length) return
    if (optIdx >= 0 && g0.removed.includes(optIdx)) return
    const g = cloneGame(g0)
    const q = g.question
    const me = g.order[g.cur]
    g.asked += 1
    g.picked = optIdx
    const st = { correct: 0, wrong: 0, ...(g.stats[me.id] || {}) }
    const right = optIdx >= 0 && q.options[optIdx] === q.correct

    if (right) {
      g.combo += 1
      g.bestCombo = Math.max(g.bestCombo, g.combo)
      st.correct += 1; g.stats[me.id] = st
      let step = 1
      let text = `🏃 ${pick(GOOD)} +1 · ${me.name}`
      if (g.combo % 3 === 0) {
        const ghosts = g.order.filter(r => r.caught).sort((a, b) => a.caughtAt - b.caughtAt)
        if (ghosts.length) {
          ghosts[0].caught = false; g.rescues += 1
          text = `🛟 RESCUE! ${ghosts[0].name} is back in the race! · ${me.name}`
          sfx.shield()
        } else {
          step = 3
          text = `⚡ SPRINT! +3 · ${me.name}`
          sfx.shield()
        }
      }
      g.pos = Math.min(g.len, g.pos + step)
      g.result = { kind: step > 1 ? 'sprint' : 'run', text }
      g.speech = `${g.monster.emoji} ${g.pos - g.mon <= 2 ? 'I am RIGHT behind you…' : pick(g.monster.taunts)}`
      sfx.correct(); later(sfx.pass, 250)
      bump('dash')
      g.step = 'reveal'
      g.cur = nextRunner(g.order, g.cur)
      commit(g)
      if (g.pos >= g.len) later(() => finish(cloneGame(gameRef.current), 'win'), 1300)
      else later(nextQuestion, 1900)
      return
    }

    // ── wrong answer (or time is up) ──
    if (g.shieldOn) {
      g.shieldOn = false
      g.result = { kind: 'shield', text: `🛡 The shield blocked the monster! Safe this time, ${me.name}.` }
      g.speech = `${g.monster.emoji} Grrr! Not fair!`
      sfx.shield()
      g.step = 'reveal'
      g.cur = nextRunner(g.order, g.cur)
      commit(g)
      later(nextQuestion, 2300)
      return
    }
    st.wrong += 1; g.stats[me.id] = st
    g.combo = 0
    g.mon = Math.min(g.pos, g.mon + g.lunge)
    sfx.wrong(); later(sfx.boom, 120)
    bump('lunge')
    if (g.mon >= g.pos) {
      // The monster reaches the pack and grabs the runner whose turn it was.
      me.caught = true; me.caughtAt = g.asked; g.catches += 1
      g.mon = g.pos
      g.result = { kind: 'caught', text: `😱 ${me.name} was CAUGHT! 👻` }
      g.speech = `${g.monster.emoji} NOM NOM NOM!`
    } else {
      g.result = { kind: 'miss', text: optIdx < 0 ? `⏰ Time's up! The monster leaps closer · −${g.lunge} tiles` : `💔 Wrong! The monster leaps closer · −${g.lunge} tiles` }
      g.speech = `${g.monster.emoji} ${pick(g.monster.taunts)}`
    }
    g.step = 'reveal'
    g.cur = nextRunner(g.order, g.cur)
    commit(g)
    if (g.cur < 0) later(() => finish(cloneGame(gameRef.current), 'lose'), 1900)
    else later(nextQuestion, g.result.kind === 'caught' ? 2800 : 2400)
  }

  function nextQuestion() {
    const g0 = gameRef.current
    if (!g0 || g0.step === 'over') return
    const g = cloneGame(g0)
    if (g.mon >= g.pos) g.mon = g.pos - g.startGap // the monster is busy chewing — the pack gets a head start
    g.question = prepareQuestion(drawQuestion())
    g.step = 'asking'; g.picked = null; g.removed = []; g.result = null
    commit(g); resetTimer()
  }

  // Teacher tools while a question is open
  function nextStudent() {
    const g0 = gameRef.current
    if (!g0 || g0.step !== 'asking') return
    const n = nextRunner(g0.order, g0.cur)
    if (n < 0 || n === g0.cur) return
    const g = cloneGame(g0); g.cur = n; commit(g)
  }
  function skipQuestion() {
    const g0 = gameRef.current
    if (!g0 || g0.step !== 'asking') return
    const g = cloneGame(g0)
    g.question = prepareQuestion(drawQuestion()); g.removed = []
    commit(g); resetTimer()
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
  function useShield() {
    const g0 = gameRef.current
    if (!g0 || g0.step !== 'asking' || g0.shields < 1 || g0.shieldOn) return
    const g = cloneGame(g0)
    g.shields -= 1; g.shieldOn = true
    commit(g); sfx.shield()
  }
  function endNow() {
    const g0 = gameRef.current
    if (!g0 || g0.step === 'over') return
    if (!window.confirm('End the chase now? The monster wins.')) return
    timers.current.forEach(clearTimeout)
    finish(cloneGame(g0), 'lose')
  }
  function playAgain() {
    timers.current.forEach(clearTimeout)
    setGame(null); gameRef.current = null; setPaused(false); setAwarded(false); setPhase('setup')
  }

  act.current = { answer }

  // Countdown (only when a timer is chosen)
  useEffect(() => {
    if (phase !== 'play') return undefined
    const id = setInterval(() => {
      const g = gameRef.current
      if (!g || pausedRef.current || !timerRef.current || g.step !== 'asking') return
      tlRef.current -= 0.25
      setTl(Math.max(0, tlRef.current))
      if (tlRef.current > 0 && tlRef.current <= 5 && tlRef.current === Math.round(tlRef.current)) sfx.tick(0.6)
      if (tlRef.current <= 0) act.current.answer(-1)
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
    const rows = game.order.map(m => {
      const s = { correct: 0, wrong: 0, ...(game.stats[m.id] || {}) }
      const base = won ? (m.caught ? STARS.ghost : STARS.safe) : STARS.lose
      return { id: m.id, name: m.name, caught: m.caught, ...s, stars: base + (s.correct >= STARS.bonusMin ? STARS.bonus : 0) }
    })
    const best = Math.max(0, ...rows.map(r => r.correct))
    return { won, rows, best }
  }, [game, phase])

  async function awardStars() {
    if (awarded || readOnly || !onAwardStars || !summary) return
    setAwarded(true)
    for (const r of summary.rows) {
      if (r.stars > 0) await onAwardStars(r.id, r.stars, `Monster Chase — ${summary.won ? `escaped ${game.monster.name}` : 'brave runner'}`)
    }
    sfx.correct()
  }

  // ───────────────────────── RENDER ─────────────────────────
  const shell = {
    position: 'fixed', inset: 0, zIndex: 200, background: '#14110f', color: '#f5efe6',
    display: 'flex', flexDirection: 'column', fontFamily: 'var(--font)',
  }
  const playing = phase === 'play' && game
  const header = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', background: '#1a1814', borderBottom: '1px solid #2c2720' }}>
      <div style={{ fontSize: 22 }}>👹</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 17 }}>Monster Chase</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#8a8378', letterSpacing: 1 }}>
          {cls?.name}{playing ? ` · ${game.monster.name.toUpperCase()}` : ''}
        </div>
      </div>
      <button onClick={() => setSound(s => !s)} className="btn btn-ghost" style={{ color: '#a39b8f', fontSize: 18 }} title="Sound">{sound ? '🔊' : '🔇'}</button>
      {playing && game.step === 'asking' && (
        <button onClick={() => setPaused(p => !p)} className="btn btn-outline" style={{ color: '#fbbf24', borderColor: '#4a3f2a' }}>{paused ? '▶ Resume' : '⏸ Pause'}</button>
      )}
      {playing && game.step !== 'over' && (
        <button onClick={endNow} className="btn btn-outline" style={{ color: '#f87171', borderColor: '#4a2a2a' }}>🏁 End chase</button>
      )}
      <button onClick={onClose} className="btn btn-outline" style={{ color: '#f5efe6', borderColor: '#3a342c' }}>✕ Close</button>
    </div>
  )

  // ── SETUP ──
  if (phase === 'setup') {
    return (
      <div style={shell}>
        <style>{CSS}</style>
        {header}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 22 }}>
              <div style={{ flex: '1 1 300px', background: '#1d1a16', border: '1px solid #2c2720', borderRadius: 14, padding: 16 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#8a8378', letterSpacing: 2, marginBottom: 8 }}>RUNNING TODAY · {active.length}{sitOut.length ? ` · ${sitOut.length} SITTING OUT` : ''}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {present.map(s => {
                    const out = sitOut.includes(s.id)
                    return (
                      <button key={s.id} onClick={() => toggleSitOut(s.id)} title={out ? 'Tap to let them play' : 'Tap if they don\'t want to play'}
                        style={{ cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12, padding: '4px 10px', borderRadius: 999, border: `1px solid ${out ? '#4a2a2a' : 'transparent'}`,
                          background: out ? 'transparent' : '#2a2620', color: out ? '#7a6f64' : '#f5efe6', textDecoration: out ? 'line-through' : 'none' }}>
                        {out ? '🙈 ' : ''}{s.nameEn}
                      </button>
                    )
                  })}
                  {present.length === 0 && <span style={{ color: '#f87171', fontSize: 13 }}>Nobody is present today.</span>}
                </div>
                {present.length > 0 && <div style={{ marginTop: 8, fontSize: 11, color: '#6b645a' }}>Tap a name if they don't want to play — tap again to bring them back.</div>}
                {absent.length > 0 && (
                  <div style={{ marginTop: 10, fontFamily: 'var(--mono)', fontSize: 10, color: '#ef4444aa' }}>
                    {absent.length} ABSENT TODAY (not in game): {absent.map(s => s.nameEn).join(', ')}
                  </div>
                )}
              </div>
              <div style={{ flex: '1 1 300px', background: '#1d1a16', border: '1px solid #2c2720', borderRadius: 14, padding: 16, fontSize: 13, lineHeight: 1.7, color: '#d6cfc3' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#8a8378', letterSpacing: 2, marginBottom: 6 }}>HOW IT WORKS</div>
                🏃 The class runs <b>together</b> for the 🏠 safe house — one student answers at a time<br />
                ✅ Right: the pack runs <b>+1</b> · 3 in a row: <b>⚡ SPRINT +3</b><br />
                💔 Wrong: the monster <b>leaps closer</b><br />
                😱 It reaches the pack: that student is <b>caught 👻</b><br />
                🛟 3 in a row when someone is caught: <b>RESCUE</b> — they run again!<br />
                🔎 Two <b>50/50</b> and one 🛡 <b>Shield</b> to help
              </div>
            </div>

            <Section title="Choose the monster">
              <Chip on={monsterId === 'random'} onClick={() => setMonsterId('random')}>🎲 Surprise me</Chip>
              {MONSTERS.map(m => <Chip key={m.id} on={monsterId === m.id} onClick={() => setMonsterId(m.id)}>{m.emoji} {m.name}</Chip>)}
            </Section>

            <Section title="Difficulty">
              {Object.entries(LEVELS).map(([k, l]) => <Chip key={k} on={levelKey === k} onClick={() => setLevelKey(k)}>{l.label}</Chip>)}
            </Section>
            <div style={{ marginTop: -10, marginBottom: 20, fontSize: 12, color: '#8a8378' }}>
              Track: <b style={{ color: '#fbbf24' }}>{trackLen} tiles</b> · Monster starts <b style={{ color: '#fbbf24' }}>{level.gap} tiles</b> behind · Each wrong answer: <b style={{ color: '#fbbf24' }}>−{level.lunge}</b>
            </div>

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
              <div style={{ marginBottom: 20, padding: 14, borderRadius: 12, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: 13, color: '#fbbf24' }}>
                📘 There is no question bank for {book?.label || 'this class'} yet — Real-Life English and General Knowledge questions are ready to play.
              </div>
            )}

            {reviewable.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2, color: '#8a8378', textTransform: 'uppercase', marginBottom: 8 }}>🔁 Review earlier books (optional — off unless you pick one)</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {reviewable.map(rs => (
                    <Chip key={rs} on={!!review[rs]} onClick={() => toggleReviewBook(rs)}>{BOOKS[rs]?.label || rs}</Chip>
                  ))}
                </div>
                {Object.keys(review).map(rs => (
                  <div key={rs} style={{ marginTop: 12, padding: 12, borderRadius: 12, background: '#1d1a16', border: '1px solid #2c2720' }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#fbbf24', marginBottom: 8 }}>{BOOKS[rs]?.label || rs} — units to review</div>
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
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2, color: '#8a8378', textTransform: 'uppercase', marginBottom: 8 }}>How many review questions?</div>
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
            <Section title="Time to answer">
              {TIMERS.map(o => <Chip key={o.k} on={timerSec === o.k} onClick={() => setTimerSec(o.k)}>{o.label}</Chip>)}
            </Section>

            <div style={{ textAlign: 'center', padding: '10px 0 40px' }}>
              <button className="btn btn-accent" disabled={!canStart} onClick={startGame}
                style={{ fontSize: 18, padding: '16px 44px', fontWeight: 800, opacity: canStart ? 1 : 0.45 }}>
                👹 Start the chase
              </button>
              <div style={{ marginTop: 10, fontSize: 12, color: '#8a8378' }}>
                {pool.length - reviewCount} questions ready{reviewCount ? ` + ${reviewCount} review` : ''}
                {active.length < 1 ? ' · need at least 1 player' : ''}{pool.length < 8 ? ' · pick more units or types' : ''}
              </div>
              {readOnly && <div style={{ marginTop: 14, fontSize: 12, color: '#8a8378' }}>View only — stars and units will not be saved.</div>}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── SUMMARY ──
  if (phase === 'summary' && game && summary) {
    const stars = summary.best >= STARS.bonusMin ? summary.rows.filter(r => r.correct === summary.best) : []
    return (
      <div style={shell}>
        <style>{CSS}</style>
        {header}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 20px' }}>
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 70, animation: 'mcPop .6s' }}>{summary.won ? '🏠' : game.monster.emoji}</div>
            <div style={{ fontSize: 30, fontWeight: 900, margin: '6px 0 4px', animation: 'mcPop .6s' }}>
              {summary.won ? `You escaped ${game.monster.name}!` : `${game.monster.name} caught everybody…`}
            </div>
            <div style={{ color: '#a39b8f', marginBottom: 22 }}>
              {game.asked} questions · best streak 🔥{game.bestCombo} · {game.catches} caught · {game.rescues} rescued
            </div>

            <div style={{ background: '#1d1a16', border: '1px solid #2c2720', borderRadius: 14, padding: 14, textAlign: 'left' }}>
              {summary.rows.map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 14, padding: '4px 0' }}>
                  <span>{stars.some(m => m.id === r.id) ? '🏅 ' : ''}{r.caught ? '👻 ' : '🏃 '}{r.name}</span>
                  <span style={{ color: '#a39b8f', fontFamily: 'var(--mono)', fontSize: 12 }}>✅ {r.correct} · ❌ {r.wrong} · ⭐ +{r.stars}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: '#6b645a' }}>
              Stars: {STARS.safe} for runners who made it, {STARS.ghost} for anyone caught at the end, {STARS.lose} for trying if the monster wins, +{STARS.bonus} for {STARS.bonusMin}+ right answers. 🏅 = most right answers.
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
              <button className="btn btn-accent" disabled={awarded || readOnly} onClick={awardStars} style={{ fontSize: 15, padding: '12px 26px', opacity: awarded || readOnly ? 0.5 : 1 }}>
                {readOnly ? 'View only' : awarded ? '✅ Stars awarded!' : '⭐ Award stars to the class'}
              </button>
              <button className="btn btn-outline" onClick={playAgain} style={{ color: '#fbbf24', borderColor: '#4a3f2a' }}>{summary.won ? '🔁 Another monster' : '🔁 Run again'}</button>
              <button className="btn btn-outline" onClick={onClose} style={{ color: '#f5efe6', borderColor: '#3a342c' }}>Close</button>
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
  const speaker = g.cur >= 0 ? g.order[g.cur] : null
  const gap = g.pos - g.mon
  const danger = !over && gap <= 2
  const label = q.category === 'book' ? `📘 UNIT ${q.unit}`
    : q.category === 'review' ? `🔁 REVIEW · ${BOOKS[q.slug]?.label || ''} · UNIT ${q.unit}`
    : CATEGORY_LABELS[q.category] || '🌍 GENERAL KNOWLEDGE'
  const alive = g.order.filter(r => !r.caught).length
  const cells = Array.from({ length: g.len + 1 }, (_, i) => i)
  const monAt = g.mon
  const caughtNow = (g.result?.kind === 'caught' && g.step === 'reveal') || (over && g.outcome === 'lose')

  const optStyle = i => {
    const opt = q.options[i]
    const base = { textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 20, fontWeight: 600, padding: '16px 18px', borderRadius: 14, borderWidth: 2, borderStyle: 'solid', borderColor: '#3a342c', background: '#1d1a16', color: '#f5efe6', display: 'flex', gap: 12, alignItems: 'center' }
    if (g.step === 'reveal' || over) {
      if (opt === q.correct) return { ...base, borderColor: '#22c55e', background: 'rgba(34,197,94,0.18)' }
      if (g.picked === i) return { ...base, borderColor: '#ef4444', background: 'rgba(239,68,68,0.18)' }
      return { ...base, opacity: 0.45 }
    }
    if (g.removed.includes(i)) return { ...base, opacity: 0.25, textDecoration: 'line-through', cursor: 'not-allowed' }
    return base
  }

  const resultColors = {
    run:    { bg: 'rgba(34,197,94,0.12)', fg: '#86efac' },
    sprint: { bg: 'rgba(251,191,36,0.14)', fg: '#fde68a' },
    shield: { bg: 'rgba(56,189,248,0.12)', fg: '#7dd3fc' },
    miss:   { bg: 'rgba(239,68,68,0.12)', fg: '#fca5a5' },
    caught: { bg: 'rgba(239,68,68,0.2)', fg: '#fca5a5' },
  }
  const rc = resultColors[g.result?.kind] || resultColors.run

  return (
    <div style={shell}>
      <style>{CSS}</style>
      {header}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px 28px' }}>
        <div style={{ maxWidth: 940, margin: '0 auto' }}>
          {/* Track */}
          <div style={{ padding: '12px 14px 10px', borderRadius: 18, background: `${g.monster.color}14`, border: `2px solid ${danger ? '#ef4444' : `${g.monster.color}66`}`, animation: danger ? 'mcDanger 1s infinite' : 'none' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${g.len + 1}, 1fr)`, gap: 3 }}>
              {cells.map(i => {
                const isMon = i === monAt
                const isPack = i === g.pos
                const isHome = i === g.len
                return (
                  <div key={i} style={{ position: 'relative', height: 64, borderRadius: 10, background: isHome ? 'rgba(34,197,94,0.18)' : i % 2 ? '#201d18' : '#1a1814', border: `1px solid ${isHome ? '#22c55e88' : '#2c2720'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, lineHeight: 1 }}>
                    {isHome && !isPack && <span>🏠</span>}
                    {isMon && isPack && <span key={`n-${fx.lunge}`} style={{ fontSize: 34, animation: 'mcLunge .6s' }}>{over && g.outcome === 'win' ? '😤' : g.monster.emoji}</span>}
                    {isMon && !isPack && <span key={`m-${fx.lunge}`} style={{ animation: fx.lunge && g.step === 'reveal' && g.result?.kind !== 'run' ? 'mcLunge .6s' : 'mcStalk 1.2s ease-in-out infinite', filter: danger ? 'drop-shadow(0 0 8px #ef4444)' : 'none' }}>{g.monster.emoji}</span>}
                    {isPack && !(isMon && caughtNow) && (
                      <span key={`p-${fx.dash}`} style={{ animation: over && g.outcome === 'win' ? 'mcPop .5s' : g.step === 'reveal' && (g.result?.kind === 'run' || g.result?.kind === 'sprint') ? 'mcDash .5s' : 'mcRun .6s ease-in-out infinite' }}>
                        {over && g.outcome === 'win' ? '🎉' : alive === 0 ? '👻' : '🏃'}
                      </span>
                    )}
                    {isPack && alive > 1 && !over && (
                      <span style={{ position: 'absolute', right: 3, top: 2, fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 800, color: '#fbbf24' }}>×{alive}</span>
                    )}
                                      </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 13, color: '#d6cfc3', fontStyle: 'italic', minHeight: 18, flex: '1 1 260px' }}>{g.speech}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 800, color: gap <= 1 ? '#ef4444' : gap <= 2 ? '#fb923c' : '#a39b8f', animation: gap <= 1 && !over ? 'mcPulse .5s infinite' : 'none' }}>
                {over ? '' : gap <= 1 ? '😱 HE IS RIGHT BEHIND YOU!' : gap <= 2 ? '😬 DANGER — very close!' : `Monster is ${gap} tiles behind`} · 🏠 in {Math.max(0, g.len - g.pos)} tiles
              </div>
            </div>
          </div>

          {/* Runners + lifelines */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', flex: '1 1 300px' }}>
              {g.order.map(r => {
                const turn = !over && speaker && speaker.id === r.id
                return (
                  <span key={r.id} style={{ fontSize: 12, padding: '3px 9px', borderRadius: 999, fontFamily: 'var(--font)', fontWeight: turn ? 800 : 500,
                    background: turn ? 'rgba(245,158,11,0.2)' : r.caught ? 'transparent' : '#2a2620', color: r.caught ? '#6b645a' : turn ? '#fbbf24' : '#f5efe6',
                    border: `1px solid ${turn ? '#f59e0b' : r.caught ? '#3a342c' : 'transparent'}`, opacity: r.caught ? 0.7 : 1 }}>
                    {r.caught ? '👻' : '🏃'} {r.name}
                  </span>
                )
              })}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 800, color: g.combo >= 2 ? '#fb923c' : '#6b645a' }}>
              {g.combo > 0 ? `🔥 STREAK ×${g.combo}${g.combo % 3 === 2 ? (g.order.some(r => r.caught) ? ' — next one RESCUES!' : ' — next one is a SPRINT!') : ''}` : 'no streak yet'}
            </div>
            {!over && (
              <>
                <button className="btn btn-outline" disabled={!answering || g.lifelines < 1 || q.tf || g.removed.length > 0 || paused} onClick={fiftyFifty}
                  style={{ color: '#38bdf8', borderColor: '#25506a', opacity: !answering || g.lifelines < 1 || q.tf || g.removed.length > 0 ? 0.4 : 1 }}
                  title="Remove two wrong answers">🔎 50/50 · {g.lifelines}</button>
                <button className="btn btn-outline" disabled={!answering || g.shields < 1 || g.shieldOn || paused} onClick={useShield}
                  style={{ color: '#a78bfa', borderColor: '#473a72', opacity: !answering || (g.shields < 1 && !g.shieldOn) ? 0.4 : 1 }}
                  title="Blocks the monster if the next answer is wrong">{g.shieldOn ? '🛡 Shield ON' : `🛡 Shield · ${g.shields}`}</button>
              </>
            )}
          </div>

          {/* Whose turn */}
          {!over && speaker && (
            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '10px 16px', borderRadius: 14, background: 'rgba(245,158,11,0.1)', border: '2px solid rgba(245,158,11,0.5)' }}>
              <div style={{ fontSize: 24 }}>🎤</div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontWeight: 800, color: '#fbbf24' }}>{speaker.name}'s turn</div>
                <div style={{ fontSize: 12, color: '#a39b8f' }}>{alive} runner{alive === 1 ? '' : 's'} still in the race — the class may whisper to help!</div>
              </div>
              {timerSec > 0 && answering && (
                <div style={{ fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 22, color: tl <= 5 ? '#ef4444' : '#fbbf24', animation: tl <= 5 ? 'mcPulse .5s infinite' : 'none' }}>⏱ {Math.ceil(tl)}</div>
              )}
            </div>
          )}

          {/* Question */}
          <div style={{ background: '#1a1814', border: '1px solid #2c2720', borderRadius: 18, padding: '22px 22px 20px', position: 'relative' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#8a8378', letterSpacing: 2, marginBottom: 10 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.3, marginBottom: 18 }}>{q.q}</div>
            <div style={{ display: 'grid', gridTemplateColumns: q.tf ? '1fr 1fr' : 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
              {q.options.map((o, i) => (
                <button key={i} className="mc-opt" disabled={!answering || paused || g.removed.includes(i)} onClick={() => answer(i)} style={optStyle(i)}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: '#fbbf24', fontWeight: 800 }}>{LETTERS[i]}</span>
                  <span>{o}</span>
                </button>
              ))}
            </div>
            {paused && (
              <div style={{ position: 'absolute', inset: 0, borderRadius: 18, background: 'rgba(20,17,15,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800 }}>⏸ Paused</div>
            )}
          </div>

          {g.step === 'reveal' && (
            <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 12, textAlign: 'center', fontWeight: 800, fontSize: 18, animation: 'mcPop .35s', background: rc.bg, color: rc.fg }}>
              {g.result?.text}
              {q.tip && <div style={{ marginTop: 4, fontWeight: 500, fontSize: 13, color: '#d6cfc3' }}>💡 {q.tip}</div>}
            </div>
          )}
          {over && (
            <div style={{ marginTop: 14, padding: 16, borderRadius: 14, textAlign: 'center', fontSize: 26, fontWeight: 900, background: g.outcome === 'win' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', animation: 'mcPop .5s' }}>
              {g.outcome === 'win' ? '🏠 Safe! You escaped!' : `💀 ${g.monster.name} caught everybody…`}
            </div>
          )}

          {answering && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
              <button className="btn btn-ghost" onClick={nextStudent} style={{ color: '#a39b8f', fontSize: 13 }} title="Another student answers (e.g. this one doesn't want to)">↻ Another student</button>
              <button className="btn btn-ghost" onClick={skipQuestion} style={{ color: '#a39b8f', fontSize: 13 }}>⏭ Different question</button>
              <button className="btn btn-ghost" onClick={() => answer(-1)} style={{ color: '#a39b8f', fontSize: 13 }}>🤷 No answer</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

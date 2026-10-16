import { useState, useEffect, useRef, useMemo } from 'react'
import { getBook, getBookSlug, BOOKS } from '../lib/books'
import { buildPool, prepareQuestion, shuffle, hasBookBank, bankUnits, reviewBooks, CATEGORIES } from '../lib/quiz'
import { sfx, setMuted, unlockAudio } from '../lib/sounds'

// ─────────────────────────────────────────────────────────────────────────────
//  🪢 TUG OF WAR  (team battle)
//  The class is split into 2–4 teams. Teams take turns: a question appears, the
//  team huddles, ONE team member answers out loud (the spokesperson rotates so
//  everybody gets a turn) and you tap the answer.
//  Right  → the rope moves toward that team (3 right in a row = POWER PULL ×2).
//  Wrong  → the other team gets a chance to STEAL the pull.
//  Two teams play on one rope; with 3–4 teams it becomes a race to the flag.
//  Teacher-run, like Bomb Pass. Stars are only given when you press the button.
// ─────────────────────────────────────────────────────────────────────────────

const TEAMS = [
  { name: 'Red Dragons', emoji: '🐉', color: '#ef4444' },
  { name: 'Blue Sharks', emoji: '🦈', color: '#3b82f6' },
  { name: 'Green Frogs', emoji: '🐸', color: '#22c55e' },
  { name: 'Gold Lions',  emoji: '🦁', color: '#f59e0b' },
]
const ROPES = [
  { k: 5, label: '🪢 Short rope' },
  { k: 7, label: '🪢 Medium rope' },
  { k: 9, label: '🪢 Long rope' },
]
const TURNS = [
  { k: 5,  label: '⚡ Quick · 5 turns each' },
  { k: 8,  label: '⏱️ Normal · 8 turns each' },
  { k: 12, label: '🐢 Long · 12 turns each' },
]
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
const STARS = { winner: 3, other: 1, mvpBonus: 1, mvpMin: 3 }
// How far a team has to pull to win: the rope length with 2 teams, a shorter race with more.
const targetFor = (teamCount, rope) => (teamCount === 2 ? rope : Math.max(3, rope - 2))

function getTodayKey() {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
}

// Deal students into teams, round-robin after a shuffle
function deal(list, teamCount) {
  const out = {}
  shuffle(list).forEach((s, i) => { out[s.id] = i % teamCount })
  return out
}

const cloneGame = g => ({ ...g, teams: g.teams.map(t => ({ ...t })), stats: { ...g.stats } })

const CSS = `
@keyframes twPop { 0% { transform: scale(0.6); opacity: 0 } 70% { transform: scale(1.08) } 100% { transform: scale(1); opacity: 1 } }
@keyframes twHeave { 0%,100% { transform: translateX(0) rotate(0) } 25% { transform: translateX(var(--tw-dir)) rotate(calc(var(--tw-dir) * 0.6)) } 60% { transform: translateX(calc(var(--tw-dir) * -0.4)) } }
@keyframes twPulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.06) } }
@keyframes twFall { 0% { transform: translateY(-40px) rotate(0); opacity: 1 } 100% { transform: translateY(105vh) rotate(540deg); opacity: 0.9 } }
.tw-opt { transition: transform .12s, background .15s, border-color .15s; }
.tw-opt:hover:not(:disabled) { transform: translateY(-2px); border-color: #fbbf24 !important; }
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

export default function TugOfWarModal({ cls, students, onAwardStars, onUpdateClass, onClose, readOnly }) {
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
  const [teamCount, setTeamCount] = useState(2)
  const [assign, setAssign] = useState(() => deal(present, 2)) // studentId → team index, or -1 = sitting out
  const [ropeLen, setRopeLen] = useState(7)
  const [turnsEach, setTurnsEach] = useState(8)
  const [timerSec, setTimerSec] = useState(0)
  const [sound, setSound] = useState(true)
  const reviewable = useMemo(() => reviewBooks(slug), [slug])
  const [review, setReview] = useState({})
  const [reviewShare, setReviewShare] = useState(0.35)

  // ── game state ──
  const [game, setGame] = useState(null)
  const [paused, setPaused] = useState(false)
  const [tl, setTl] = useState(0)
  const [awarded, setAwarded] = useState(false)

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

  const teamOf = id => (assign[id] === undefined ? -1 : assign[id])
  const sittingOut = present.filter(s => !(teamOf(s.id) >= 0 && teamOf(s.id) < teamCount))
  const sizes = Array.from({ length: teamCount }, (_, i) => present.filter(s => teamOf(s.id) === i).length)

  const reviewEntries = useMemo(() => Object.entries(review).map(([s, us]) => ({ slug: s, units: us })), [review])
  const pool = useMemo(() => buildPool({ slug, units, categories: cats, review: reviewEntries }), [slug, units, cats, reviewEntries])
  const reviewCount = pool.filter(q => q.category === 'review').length
  const canStart = sizes.every(n => n >= 1) && pool.length >= 8

  // ── team set-up helpers ──
  function changeTeamCount(n) { setTeamCount(n); setAssign(deal(present, n)) }
  function reshuffle() { setAssign(deal(present, teamCount)) }
  // Tap a name: moves to the next team … then "sitting out" … then back to the first team
  function cycleStudent(id) {
    setAssign(a => {
      const cur = a[id] === undefined ? -1 : a[id]
      const next = cur < 0 ? 0 : cur >= teamCount - 1 ? -1 : cur + 1
      return { ...a, [id]: next }
    })
  }
  function toggleReviewBook(s) {
    setReview(r => { const n = { ...r }; if (n[s]) delete n[s]; else n[s] = bankUnits(s); return n })
  }
  function toggleReviewUnit(s, u) {
    setReview(r => { const cur = r[s] || []; return { ...r, [s]: cur.includes(u) ? cur.filter(x => x !== u) : [...cur, u] } })
  }

  // ── questions ──
  // Earlier-book review questions are mixed in at the share the teacher chose.
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
    const teams = Array.from({ length: teamCount }, (_, i) => ({
      idx: i, score: 0, streak: 0, sp: 0,
      members: shuffle(present.filter(s => teamOf(s.id) === i)).map(s => ({ id: s.id, name: s.nameEn })),
    }))
    if (!readOnly && onUpdateClass && bookReady && units.length) onUpdateClass(cls.id, { unitsCovered: units })
    commit({
      teams, turn: 0, question: prepareQuestion(drawQuestion()), step: 'asking', picked: null, wrongOpt: null,
      result: null, turnsDone: 0, limit: turnsEach * teamCount, golden: 0, stats: {}, winner: null, lastPull: null,
    })
    resetTimer(); setPaused(false); setAwarded(false); setPhase('play')
  }

  const leaders = g => {
    const max = Math.max(...g.teams.map(t => t.score))
    return g.teams.filter(t => t.score === max).map(t => t.idx)
  }

  function finish(g, winners) {
    g.winner = winners; g.step = 'over'
    commit(g)
    sfx.fanfare()
    later(() => setPhase('summary'), 2300)
  }

  // Moves the rope. Returns the winning team list if this pull wins the game.
  function pull(g, idx, amount, kind) {
    g.teams[idx].score += amount
    g.lastPull = { idx, amount, kind, at: Date.now() }
    const n = g.teams.length
    const target = targetFor(n, ropeLen)
    if (n === 2) return Math.abs(g.teams[0].score - g.teams[1].score) >= target ? [idx] : null
    return g.teams[idx].score >= target ? [idx] : null
  }

  function answer(optIdx) {
    const g0 = gameRef.current
    if (!g0 || pausedRef.current || (g0.step !== 'asking' && g0.step !== 'steal')) return
    if (optIdx >= g0.question.options.length) return
    const g = cloneGame(g0)
    const q = g.question
    const n = g.teams.length
    const asking = g.step === 'asking'
    const tIdx = asking ? g.turn : g.stealTeam
    const team = g.teams[tIdx]
    const speaker = team.members[team.sp % team.members.length]
    team.sp += 1
    const st = { correct: 0, wrong: 0, pulls: 0, ...(g.stats[speaker.id] || {}) }
    const right = optIdx >= 0 && q.options[optIdx] === q.correct
    g.picked = optIdx

    if (right) {
      st.correct += 1
      let amount = 1
      let kind = asking ? 'pull' : 'steal'
      if (asking) {
        team.streak += 1
        if (team.streak >= 3) { amount = 2; kind = 'power'; team.streak = 0 }
      }
      st.pulls += amount
      g.stats[speaker.id] = st
      g.result = {
        kind, team: tIdx,
        text: kind === 'power' ? `💪 POWER PULL! +2 for ${TEAMS[tIdx].name}` : kind === 'steal' ? `🕵️ STOLEN! +1 for ${TEAMS[tIdx].name}` : `✅ Pull! +1 for ${TEAMS[tIdx].name}`,
      }
      sfx.correct(); later(kind === 'power' ? sfx.shield : sfx.pass, 250)
      const winners = pull(g, tIdx, amount, kind)
      g.step = 'reveal'
      commit(g)
      if (winners) { later(() => finish(cloneGame(gameRef.current), winners), 1300) } else later(nextTurn, 1900)
      return
    }

    st.wrong += 1
    g.stats[speaker.id] = st
    team.streak = 0
    sfx.wrong()
    if (asking && n >= 2) {
      g.step = 'steal'; g.stealTeam = (g.turn + 1) % n; g.wrongOpt = optIdx
      g.result = null
      commit(g); resetTimer()
      return
    }
    g.step = 'reveal'
    g.result = { kind: 'none', team: tIdx, text: optIdx < 0 ? '⏰ Time\'s up — nobody got it' : '😬 Nobody got it' }
    commit(g)
    later(nextTurn, 2400)
  }

  function nextTurn() {
    const g0 = gameRef.current
    if (!g0 || g0.step === 'over') return
    const g = cloneGame(g0)
    g.turnsDone += 1
    if (g.turnsDone >= g.limit) {
      const lead = leaders(g)
      if (lead.length === 1 || g.golden >= 3) { finish(g, lead); return }
      g.golden += 1; g.limit += g.teams.length // tied → golden round: one more turn for every team
    }
    g.turn = (g.turn + 1) % g.teams.length
    g.question = prepareQuestion(drawQuestion())
    g.step = 'asking'; g.picked = null; g.wrongOpt = null; g.result = null
    commit(g); resetTimer()
  }

  // Teacher tools while a question is open
  function nextStudent() {
    const g0 = gameRef.current
    if (!g0 || (g0.step !== 'asking' && g0.step !== 'steal')) return
    const g = cloneGame(g0)
    const t = g.teams[g.step === 'steal' ? g.stealTeam : g.turn]
    if (t.members.length > 1) t.sp += 1
    commit(g)
  }
  function skipQuestion() {
    const g0 = gameRef.current
    if (!g0 || (g0.step !== 'asking' && g0.step !== 'steal')) return
    const g = cloneGame(g0)
    g.question = prepareQuestion(drawQuestion()); g.wrongOpt = null
    commit(g); resetTimer()
  }
  function endNow() {
    const g0 = gameRef.current
    if (!g0 || g0.step === 'over') return
    if (!window.confirm('End the game now? The team in front wins.')) return
    timers.current.forEach(clearTimeout)
    finish(cloneGame(g0), leaders(g0))
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
      if (!g || pausedRef.current || !timerRef.current || (g.step !== 'asking' && g.step !== 'steal')) return
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
    const winners = game.winner || []
    const rows = []
    game.teams.forEach(t => t.members.forEach(m => {
      const s = game.stats[m.id] || { correct: 0, wrong: 0, pulls: 0 }
      const won = winners.includes(t.idx)
      const stars = (won ? STARS.winner : STARS.other) + (s.correct >= STARS.mvpMin ? STARS.mvpBonus : 0)
      rows.push({ id: m.id, name: m.name, team: t.idx, won, stars, ...s })
    }))
    const bestCorrect = Math.max(0, ...rows.map(r => r.correct))
    return { winners, rows, bestCorrect }
  }, [game, phase])

  async function awardStars() {
    if (awarded || readOnly || !onAwardStars || !summary) return
    setAwarded(true)
    for (const r of summary.rows) {
      if (r.stars > 0) await onAwardStars(r.id, r.stars, `Tug of War — ${r.won ? (summary.winners.length > 1 ? 'draw, great teamwork' : 'winning team') : 'great teamwork'}`)
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
      <div style={{ fontSize: 22 }}>🪢</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 17 }}>Tug of War</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#8a8378', letterSpacing: 1 }}>
          {cls?.name}{playing ? ` · TURN ${Math.min(game.turnsDone + 1, game.limit)} / ${game.limit}${game.golden ? ' · ⚡ GOLDEN ROUND' : ''}` : ''}
        </div>
      </div>
      <button onClick={() => setSound(s => !s)} className="btn btn-ghost" style={{ color: '#a39b8f', fontSize: 18 }} title="Sound">{sound ? '🔊' : '🔇'}</button>
      {playing && (game.step === 'asking' || game.step === 'steal') && (
        <button onClick={() => setPaused(p => !p)} className="btn btn-outline" style={{ color: '#fbbf24', borderColor: '#4a3f2a' }}>{paused ? '▶ Resume' : '⏸ Pause'}</button>
      )}
      {playing && game.step !== 'over' && (
        <button onClick={endNow} className="btn btn-outline" style={{ color: '#f87171', borderColor: '#4a2a2a' }}>🏁 End game</button>
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
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 22 }}>
              <div style={{ flex: '1 1 320px', background: '#1d1a16', border: '1px solid #2c2720', borderRadius: 14, padding: 16, fontSize: 13, lineHeight: 1.7, color: '#d6cfc3' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#8a8378', letterSpacing: 2, marginBottom: 6 }}>HOW IT WORKS</div>
                🎤 Teams take turns. The team huddles, <b>one student answers</b> (the speaker rotates).<br />
                ✅ Right: the rope moves <b>+1</b> toward them<br />
                💪 3 right in a row: <b>POWER PULL +2</b><br />
                🕵️ Wrong: the other team can <b>steal</b> the pull<br />
                🏆 Pull the flag to your end to win. {teamCount > 2 ? 'With 3–4 teams it is a race to the flag.' : ''}
              </div>
              <div style={{ flex: '1 1 260px', background: '#1d1a16', border: '1px solid #2c2720', borderRadius: 14, padding: 16 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#8a8378', letterSpacing: 2, marginBottom: 10 }}>TEAMS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[2, 3, 4].map(n => <Chip key={n} on={teamCount === n} onClick={() => changeTeamCount(n)}>{n} teams</Chip>)}
                  <Chip on={false} onClick={reshuffle} title="Deal everybody into new teams">🔀 Shuffle</Chip>
                </div>
                {absent.length > 0 && (
                  <div style={{ marginTop: 12, fontFamily: 'var(--mono)', fontSize: 10, color: '#ef4444aa' }}>
                    {absent.length} ABSENT TODAY (not in game): {absent.map(s => s.nameEn).join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Team cards */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${teamCount > 2 ? 190 : 260}px, 1fr))`, gap: 12, marginBottom: 8 }}>
              {Array.from({ length: teamCount }, (_, i) => (
                <div key={i} style={{ background: '#1d1a16', border: `2px solid ${TEAMS[i].color}66`, borderRadius: 14, padding: 14 }}>
                  <div style={{ fontWeight: 800, marginBottom: 8, color: TEAMS[i].color }}>{TEAMS[i].emoji} {TEAMS[i].name} · {sizes[i]}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 28 }}>
                    {present.filter(s => teamOf(s.id) === i).map(s => (
                      <button key={s.id} onClick={() => cycleStudent(s.id)} title="Tap to move to the next team"
                        style={{ cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12, padding: '4px 10px', borderRadius: 999, border: 'none', background: '#2a2620', color: '#f5efe6' }}>{s.nameEn}</button>
                    ))}
                    {sizes[i] === 0 && <span style={{ fontSize: 12, color: '#f87171' }}>Needs at least 1 player</span>}
                  </div>
                </div>
              ))}
              {sittingOut.length > 0 && (
                <div style={{ background: 'transparent', border: '2px dashed #3a342c', borderRadius: 14, padding: 14 }}>
                  <div style={{ fontWeight: 800, marginBottom: 8, color: '#8a8378' }}>🙈 Sitting out · {sittingOut.length}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {sittingOut.map(s => (
                      <button key={s.id} onClick={() => cycleStudent(s.id)} title="Tap to put back in a team"
                        style={{ cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12, padding: '4px 10px', borderRadius: 999, border: '1px solid #4a2a2a', background: 'transparent', color: '#7a6f64', textDecoration: 'line-through' }}>{s.nameEn}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={{ marginBottom: 22, fontSize: 11, color: '#6b645a' }}>
              Tap a name to move it to the next team. Keep tapping and it goes to “sitting out” (for a student who doesn't want to play), then back to the first team.
              {present.length === 0 && <span style={{ color: '#f87171' }}> Nobody is present today.</span>}
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
            <Section title={teamCount === 2 ? 'Rope length (how far to pull to win)' : 'Race length (how far to pull to win)'}>
              {ROPES.map(o => <Chip key={o.k} on={ropeLen === o.k} onClick={() => setRopeLen(o.k)}>{o.label} · {targetFor(teamCount, o.k)}</Chip>)}
            </Section>
            <Section title="Game length">
              {TURNS.map(o => <Chip key={o.k} on={turnsEach === o.k} onClick={() => setTurnsEach(o.k)}>{o.label}</Chip>)}
            </Section>
            <Section title="Time to answer">
              {TIMERS.map(o => <Chip key={o.k} on={timerSec === o.k} onClick={() => setTimerSec(o.k)}>{o.label}</Chip>)}
            </Section>

            <div style={{ textAlign: 'center', padding: '10px 0 40px' }}>
              <button className="btn btn-accent" disabled={!canStart} onClick={startGame}
                style={{ fontSize: 18, padding: '16px 44px', fontWeight: 800, opacity: canStart ? 1 : 0.45 }}>
                🪢 Start Tug of War
              </button>
              <div style={{ marginTop: 10, fontSize: 12, color: '#8a8378' }}>
                {pool.length - reviewCount} questions ready{reviewCount ? ` + ${reviewCount} review` : ''}
                {sizes.some(n => n < 1) ? ' · every team needs at least 1 player' : ''}{pool.length < 8 ? ' · pick more units or types' : ''}
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
    const draw = summary.winners.length > 1
    const mvps = summary.bestCorrect > 0 ? summary.rows.filter(r => r.correct === summary.bestCorrect) : []
    return (
      <div style={shell}>
        <style>{CSS}</style>
        {header}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 20px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 64, animation: 'twPop .6s' }}>🏆</div>
            <div style={{ fontSize: 30, fontWeight: 900, margin: '6px 0 4px', animation: 'twPop .6s' }}>
              {draw ? 'It\'s a draw!' : `${TEAMS[summary.winners[0]].emoji} ${TEAMS[summary.winners[0]].name} win!`}
            </div>
            <div style={{ color: '#a39b8f', marginBottom: 22 }}>
              {game.teams.map(t => `${TEAMS[t.idx].emoji} ${t.score}`).join('  ·  ')}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12, textAlign: 'left' }}>
              {game.teams.map(t => {
                const won = summary.winners.includes(t.idx)
                return (
                  <div key={t.idx} style={{ background: '#1d1a16', border: `2px solid ${won ? TEAMS[t.idx].color : '#2c2720'}`, borderRadius: 14, padding: 14 }}>
                    <div style={{ fontWeight: 800, color: TEAMS[t.idx].color, marginBottom: 8 }}>{won ? '🏆 ' : ''}{TEAMS[t.idx].emoji} {TEAMS[t.idx].name} · {t.score}</div>
                    {summary.rows.filter(r => r.team === t.idx).map(r => (
                      <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13, padding: '2px 0' }}>
                        <span>{mvps.some(m => m.id === r.id) ? '⭐ ' : ''}{r.name}</span>
                        <span style={{ color: '#a39b8f', fontFamily: 'var(--mono)', fontSize: 11 }}>✅ {r.correct} · ❌ {r.wrong} · ⭐ +{r.stars}</span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: '#6b645a' }}>
              Stars: {STARS.winner} for the winning team, {STARS.other} for every other team, +{STARS.mvpBonus} for anyone with {STARS.mvpMin} or more right answers.
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
              <button className="btn btn-accent" disabled={awarded || readOnly} onClick={awardStars} style={{ fontSize: 15, padding: '12px 26px', opacity: awarded || readOnly ? 0.5 : 1 }}>
                {readOnly ? 'View only' : awarded ? '✅ Stars awarded!' : '⭐ Award stars to the class'}
              </button>
              <button className="btn btn-outline" onClick={playAgain} style={{ color: '#fbbf24', borderColor: '#4a3f2a' }}>🔁 Play again</button>
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
  const n = g.teams.length
  const target = targetFor(n, ropeLen)
  const q = g.question
  const over = g.step === 'over'
  const answering = g.step === 'asking' || g.step === 'steal'
  const turnTeam = g.teams[g.step === 'steal' ? g.stealTeam : g.turn]
  const speaker = turnTeam.members[turnTeam.sp % turnTeam.members.length]
  const tcol = TEAMS[turnTeam.idx].color
  const heave = g.lastPull ? { key: g.lastPull.at, idx: g.lastPull.idx } : null
  const label = q.category === 'book' ? `📘 UNIT ${q.unit}`
    : q.category === 'review' ? `🔁 REVIEW · ${BOOKS[q.slug]?.label || ''} · UNIT ${q.unit}`
    : q.category === 'real' ? '🗣️ REAL-LIFE ENGLISH' : '🌍 GENERAL KNOWLEDGE'

  const pos = n === 2 ? g.teams[0].score - g.teams[1].score : 0
  const flagLeft = 50 - (Math.max(-target, Math.min(target, pos)) / target) * 44

  const rope = n === 2 ? (
    <div style={{ position: 'relative', height: 120, margin: '4px 8px 0' }}>
      <div style={{ position: 'absolute', left: '4%', right: '4%', top: 18, height: 70, borderRadius: 12, background: '#1d1a16', border: '1px solid #2c2720', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '7%', background: `${TEAMS[0].color}55` }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '7%', background: `${TEAMS[1].color}55` }} />
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, borderLeft: '2px dashed #4a4338' }} />
      </div>
      <div style={{ position: 'absolute', left: '4%', right: '4%', top: 50, height: 8, borderRadius: 4, background: 'repeating-linear-gradient(90deg,#a16207 0 10px,#78350f 10px 14px)' }} />
      <div style={{ position: 'absolute', left: `${4 + flagLeft * 0.92}%`, top: 8, fontSize: 40, transform: 'translateX(-50%)', transition: 'left .8s cubic-bezier(.3,1.4,.5,1)', zIndex: 2 }}>🚩</div>
      {[0, 1].map(i => (
        <div key={i + '-' + (heave && heave.idx === i ? heave.key : 0)} style={{
          position: 'absolute', top: 30, [i === 0 ? 'left' : 'right']: 0, fontSize: 44, zIndex: 3,
          '--tw-dir': i === 0 ? '-10px' : '10px', animation: heave && heave.idx === i ? 'twHeave .7s' : 'none',
        }}>{TEAMS[i].emoji}</div>
      ))}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 11, color: '#8a8378', letterSpacing: 1 }}>
        {pos === 0 ? `LEVEL · pull ${target} ahead to win` : `${TEAMS[pos > 0 ? 0 : 1].emoji} ${Math.abs(pos)} AHEAD · need ${target}`}
      </div>
    </div>
  ) : (
    <div style={{ display: 'grid', gap: 8, padding: '4px 4px 0' }}>
      {g.teams.map(t => (
        <div key={t.idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 150, fontSize: 13, fontWeight: 800, color: TEAMS[t.idx].color, whiteSpace: 'nowrap' }}>{TEAMS[t.idx].emoji} {TEAMS[t.idx].name}</div>
          <div style={{ flex: 1, height: 18, borderRadius: 9, background: '#1d1a16', border: '1px solid #2c2720', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, (t.score / target) * 100)}%`, background: TEAMS[t.idx].color, transition: 'width .6s' }} />
          </div>
          <div style={{ width: 54, textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 12, color: '#a39b8f' }}>{t.score} / {target} 🚩</div>
        </div>
      ))}
    </div>
  )

  const optStyle = i => {
    const opt = q.options[i]
    const base = { textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 20, fontWeight: 600, padding: '16px 18px', borderRadius: 14, borderWidth: 2, borderStyle: 'solid', borderColor: '#3a342c', background: '#1d1a16', color: '#f5efe6', display: 'flex', gap: 12, alignItems: 'center' }
    if (g.step === 'reveal' || over) {
      if (opt === q.correct) return { ...base, borderColor: '#22c55e', background: 'rgba(34,197,94,0.18)' }
      if (g.picked === i) return { ...base, borderColor: '#ef4444', background: 'rgba(239,68,68,0.18)' }
      return { ...base, opacity: 0.45 }
    }
    if (g.step === 'steal' && g.wrongOpt === i) return { ...base, opacity: 0.3, textDecoration: 'line-through', cursor: 'not-allowed' }
    return base
  }

  return (
    <div style={shell}>
      <style>{CSS}</style>
      {header}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 28px' }}>
        <div style={{ maxWidth: 940, margin: '0 auto' }}>
          {rope}

          {/* Whose turn */}
          {!over && (
            <div style={{ margin: '14px 0 12px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '10px 16px', borderRadius: 14, background: `${tcol}22`, border: `2px solid ${tcol}` }}>
              <div style={{ fontSize: 26 }}>{g.step === 'steal' ? '🕵️' : TEAMS[turnTeam.idx].emoji}</div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontWeight: 800, color: tcol }}>
                  {g.step === 'steal' ? `STEAL CHANCE — ${TEAMS[turnTeam.idx].name}` : `${TEAMS[turnTeam.idx].name}'s turn`}
                </div>
                <div style={{ fontSize: 13, color: '#d6cfc3' }}>🎤 {speaker.name} answers · the team may whisper to help</div>
              </div>
              {timerSec > 0 && answering && (
                <div style={{ fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 22, color: tl <= 5 ? '#ef4444' : '#fbbf24', animation: tl <= 5 ? 'twPulse .5s infinite' : 'none' }}>⏱ {Math.ceil(tl)}</div>
              )}
              {g.teams.find(t => t.idx === turnTeam.idx).streak >= 2 && g.step === 'asking' && (
                <div style={{ fontSize: 12, fontWeight: 800, color: '#fb923c' }}>🔥 Next right answer = POWER PULL ×2</div>
              )}
            </div>
          )}

          {/* Question */}
          <div style={{ background: '#1a1814', border: '1px solid #2c2720', borderRadius: 18, padding: '22px 22px 20px', position: 'relative' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#8a8378', letterSpacing: 2, marginBottom: 10 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.3, marginBottom: 18 }}>{q.q}</div>
            <div style={{ display: 'grid', gridTemplateColumns: q.tf ? '1fr 1fr' : 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
              {q.options.map((o, i) => (
                <button key={i} className="tw-opt" disabled={!answering || paused || (g.step === 'steal' && g.wrongOpt === i)} onClick={() => answer(i)} style={optStyle(i)}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: '#fbbf24', fontWeight: 800 }}>{LETTERS[i]}</span>
                  <span>{o}</span>
                </button>
              ))}
            </div>
            {paused && (
              <div style={{ position: 'absolute', inset: 0, borderRadius: 18, background: 'rgba(20,17,15,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800 }}>⏸ Paused</div>
            )}
          </div>

          {/* Result / tip */}
          {g.step === 'reveal' && (
            <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 12, textAlign: 'center', fontWeight: 800, fontSize: 18, animation: 'twPop .35s',
              background: g.result?.kind === 'none' ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)', color: g.result?.kind === 'none' ? '#fca5a5' : '#86efac' }}>
              {g.result?.text}
              {q.tip && <div style={{ marginTop: 4, fontWeight: 500, fontSize: 13, color: '#d6cfc3' }}>💡 {q.tip}</div>}
            </div>
          )}
          {over && (
            <div style={{ marginTop: 14, padding: 16, borderRadius: 14, textAlign: 'center', fontSize: 26, fontWeight: 900, background: 'rgba(245,158,11,0.15)', animation: 'twPop .5s' }}>
              🎉 {g.winner.length > 1 ? 'It\'s a draw!' : `${TEAMS[g.winner[0]].emoji} ${TEAMS[g.winner[0]].name} win!`}
            </div>
          )}

          {/* Teacher tools */}
          {answering && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
              <button className="btn btn-ghost" onClick={nextStudent} style={{ color: '#a39b8f', fontSize: 13 }} title="Another student from this team answers (e.g. the speaker doesn't want to)">↻ Another student</button>
              <button className="btn btn-ghost" onClick={skipQuestion} style={{ color: '#a39b8f', fontSize: 13 }}>⏭ Different question</button>
              <button className="btn btn-ghost" onClick={() => answer(-1)} style={{ color: '#a39b8f', fontSize: 13 }}>🤷 No answer</button>
            </div>
          )}

          {/* Team scoreboard */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, 1fr)`, gap: 10, marginTop: 16 }}>
            {g.teams.map(t => (
              <div key={t.idx} style={{ padding: '10px 12px', borderRadius: 12, background: '#1d1a16', border: `2px solid ${!over && t.idx === turnTeam.idx ? TEAMS[t.idx].color : '#2c2720'}` }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: TEAMS[t.idx].color }}>{TEAMS[t.idx].emoji} {TEAMS[t.idx].name}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#a39b8f', marginTop: 2 }}>
                  pulls: <b style={{ color: '#fbbf24' }}>{t.score}</b>{t.streak > 0 ? ` · 🔥${t.streak}` : ''}
                </div>
                <div style={{ fontSize: 11, color: '#6b645a', marginTop: 4, lineHeight: 1.5 }}>{t.members.map(m => m.name).join(', ')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

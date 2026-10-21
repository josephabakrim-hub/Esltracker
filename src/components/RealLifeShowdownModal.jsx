import { useState, useEffect, useRef, useMemo } from 'react'
import { getBook, getBookSlug } from '../lib/books'
import { buildShowdownPool, SHOWDOWN_TOPICS, shuffle, tierForSlug, TIER_OPTIONS } from '../lib/quiz'
import { sfx, setMuted, unlockAudio } from '../lib/sounds'

// ─────────────────────────────────────────────────────────────────────────────
//  🎭 REAL-LIFE SHOWDOWN
//  A real-life situation appears (ordering food, a lost phone, a job interview…)
//  with FOUR possible responses: a best one, an OK one, a wrong one — and a
//  hilarious one. Every team huddles and secretly chooses; the teacher taps each
//  team's choice, then hits REVEAL and all teams show their answers at once.
//  Best = 2 points · OK = 1 point · others = 0 (the funny pick earns a 🤣).
//  Teacher-run. Stars are only given when you press the button.
// ─────────────────────────────────────────────────────────────────────────────

const TEAMS = [
  { name: 'Red Dragons', emoji: '🐉', color: '#ef4444' },
  { name: 'Blue Sharks', emoji: '🦈', color: '#3b82f6' },
  { name: 'Green Frogs', emoji: '🐸', color: '#22c55e' },
  { name: 'Gold Lions',  emoji: '🦁', color: '#f59e0b' },
]
const ROUNDS = [
  { k: 6,  label: '⚡ Quick · 6 situations' },
  { k: 10, label: '⏱️ Normal · 10 situations' },
  { k: 14, label: '🐢 Long · 14 situations' },
]
const TIMERS = [
  { k: 0,  label: 'No timer' },
  { k: 30, label: '⏱ 30 seconds' },
  { k: 45, label: '⏱ 45 seconds' },
]
const ROLES = {
  best:  { pts: 2, tag: '✅ BEST',          color: '#22c55e', bg: 'rgba(34,197,94,0.16)' },
  ok:    { pts: 1, tag: '👍 OK',            color: '#f59e0b', bg: 'rgba(245,158,11,0.14)' },
  bad:   { pts: 0, tag: '❌ NOT GOOD',      color: '#ef4444', bg: 'rgba(239,68,68,0.14)' },
  funny: { pts: 0, tag: '🤣 HILARIOUS!',    color: '#c084fc', bg: 'rgba(192,132,252,0.18)' },
}
const LETTERS = ['A', 'B', 'C', 'D']
const STARS = { winner: 3, other: 1, mvpBonus: 1, mvpMin: 2 }

function getTodayKey() {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
}
function deal(list, teamCount) {
  const out = {}
  shuffle(list).forEach((s, i) => { out[s.id] = i % teamCount })
  return out
}
const prepare = sit => ({
  ...sit,
  options: shuffle([['best', sit.best], ['ok', sit.ok], ['bad', sit.bad], ['funny', sit.funny]].map(([role, text]) => ({ role, text }))),
})
const cloneGame = g => ({ ...g, teams: g.teams.map(t => ({ ...t })), stats: { ...g.stats }, picks: { ...g.picks } })

const CSS = `
@keyframes rsPop { 0% { transform: scale(0.6); opacity: 0 } 70% { transform: scale(1.08) } 100% { transform: scale(1); opacity: 1 } }
@keyframes rsWobble { 0%,100% { transform: rotate(0) } 25% { transform: rotate(-4deg) } 75% { transform: rotate(4deg) } }
@keyframes rsPulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.06) } }
.rs-pick { transition: transform .12s, background .15s; }
.rs-pick:hover:not(:disabled) { transform: translateY(-2px); }
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

export default function RealLifeShowdownModal({ cls, students, onAwardStars, onClose, readOnly }) {
  const todayKey = getTodayKey()
  const book = getBook(cls)
  const slug = getBookSlug(cls)

  const present = students.filter(s => s.nameEn && (s.attendanceLog || {})[todayKey] !== 'absent')
  const absent = students.filter(s => s.nameEn && (s.attendanceLog || {})[todayKey] === 'absent')

  // ── setup state ──
  const [phase, setPhase] = useState('setup') // setup | play | summary
  const [teamCount, setTeamCount] = useState(2)
  const [assign, setAssign] = useState(() => deal(present, 2)) // studentId → team index, or -1 = sitting out
  const [rounds, setRounds] = useState(10)
  const [timerSec, setTimerSec] = useState(0)
  const [tierPick, setTierPick] = useState(0)
  const [topics, setTopics] = useState([]) // empty = all topics
  const [sound, setSound] = useState(true)
  const tier = tierPick || tierForSlug(slug)

  // ── game state ──
  const [game, setGame] = useState(null)
  const [paused, setPaused] = useState(false)
  const [tl, setTl] = useState(0)
  const [awarded, setAwarded] = useState(false)

  const gameRef = useRef(null)
  const pausedRef = useRef(false); pausedRef.current = paused
  const timerRef = useRef(0); timerRef.current = timerSec
  const tlRef = useRef(0)
  const deckRef = useRef([])
  const poolRef = useRef([])
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

  const pool = useMemo(() => buildShowdownPool({ slug, tier, topics }), [slug, tier, topics])
  const canStart = sizes.every(n => n >= 1) && pool.length >= 4

  function changeTeamCount(n) { setTeamCount(n); setAssign(deal(present, n)) }
  function reshuffle() { setAssign(deal(present, teamCount)) }
  function cycleStudent(id) {
    setAssign(a => {
      const cur = a[id] === undefined ? -1 : a[id]
      const next = cur < 0 ? 0 : cur >= teamCount - 1 ? -1 : cur + 1
      return { ...a, [id]: next }
    })
  }
  const toggleTopic = id => setTopics(ts => (ts.includes(id) ? ts.filter(x => x !== id) : [...ts, id]))

  function draw() {
    if (deckRef.current.length === 0) deckRef.current = shuffle(poolRef.current)
    return prepare(deckRef.current.pop())
  }

  // ── game flow ──
  function startGame() {
    if (!canStart) return
    unlockAudio(); sfx.start()
    poolRef.current = pool
    deckRef.current = shuffle(pool)
    const teams = Array.from({ length: teamCount }, (_, i) => ({
      idx: i, score: 0, sp: 0,
      members: shuffle(present.filter(s => teamOf(s.id) === i)).map(s => ({ id: s.id, name: s.nameEn })),
    }))
    commit({ teams, round: 0, limit: rounds, golden: 0, situation: draw(), picks: {}, step: 'choosing', results: null, stats: {}, winner: null })
    resetTimer(); setPaused(false); setAwarded(false); setPhase('play')
  }

  function setPick(teamIdx, optIdx) {
    const g0 = gameRef.current
    if (!g0 || g0.step !== 'choosing') return
    const g = cloneGame(g0)
    g.picks[teamIdx] = optIdx
    commit(g); sfx.tick(0.2)
  }

  function reveal() {
    const g0 = gameRef.current
    if (!g0 || g0.step !== 'choosing') return
    const g = cloneGame(g0)
    const opts = g.situation.options
    let anyBest = false, anyFunny = false
    g.results = g.teams.map(t => {
      const speaker = t.members[t.sp % t.members.length]
      t.sp += 1
      const pickIdx = g.picks[t.idx]
      const role = pickIdx === undefined ? null : opts[pickIdx].role
      const pts = role ? ROLES[role].pts : 0
      t.score += pts
      if (role === 'best') anyBest = true
      if (role === 'funny') anyFunny = true
      const st = { rounds: 0, best: 0, funny: 0, pts: 0, ...(g.stats[speaker.id] || {}) }
      st.rounds += 1; st.pts += pts
      if (role === 'best') st.best += 1
      if (role === 'funny') st.funny += 1
      g.stats[speaker.id] = st
      return { team: t.idx, pickIdx, role, pts, speaker: speaker.name }
    })
    g.step = 'reveal'
    commit(g)
    if (anyBest) sfx.correct(); else sfx.wrong()
    if (anyFunny) later(() => sfx.pass(), 350)
  }

  function leaders(g) {
    const max = Math.max(...g.teams.map(t => t.score))
    return g.teams.filter(t => t.score === max).map(t => t.idx)
  }

  function finish(g, winners) {
    g.winner = winners; g.step = 'over'
    commit(g); sfx.fanfare()
    later(() => setPhase('summary'), 1800)
  }

  function nextRound() {
    const g0 = gameRef.current
    if (!g0 || g0.step !== 'reveal') return
    const g = cloneGame(g0)
    g.round += 1
    if (g.round >= g.limit) {
      const lead = leaders(g)
      if (lead.length === 1 || g.golden >= 3) { finish(g, lead); return }
      g.golden += 1; g.limit += 1 // tied → golden situation
    }
    g.situation = draw(); g.picks = {}; g.step = 'choosing'; g.results = null
    commit(g); resetTimer()
  }

  function newSituation() {
    const g0 = gameRef.current
    if (!g0 || g0.step !== 'choosing') return
    const g = cloneGame(g0)
    g.situation = draw(); g.picks = {}
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

  act.current = { reveal }

  // Optional countdown: when it hits zero the answers are revealed automatically
  useEffect(() => {
    if (phase !== 'play') return undefined
    const id = setInterval(() => {
      const g = gameRef.current
      if (!g || pausedRef.current || !timerRef.current || g.step !== 'choosing') return
      tlRef.current -= 0.25
      setTl(Math.max(0, tlRef.current))
      if (tlRef.current > 0 && tlRef.current <= 5 && tlRef.current === Math.round(tlRef.current)) sfx.tick(0.6)
      if (tlRef.current <= 0) act.current.reveal()
    }, 250)
    return () => clearInterval(id)
  }, [phase])

  // ── stars ──
  const summary = useMemo(() => {
    if (!game || phase !== 'summary') return null
    const winners = game.winner || []
    const rows = []
    game.teams.forEach(t => t.members.forEach(m => {
      const s = { rounds: 0, best: 0, funny: 0, pts: 0, ...(game.stats[m.id] || {}) }
      const won = winners.includes(t.idx)
      rows.push({ id: m.id, name: m.name, team: t.idx, won, ...s, stars: (won ? STARS.winner : STARS.other) + (s.best >= STARS.mvpMin ? STARS.mvpBonus : 0) })
    }))
    const funnies = rows.filter(r => r.funny > 0)
    return { winners, rows, funnies }
  }, [game, phase])

  async function awardStars() {
    if (awarded || readOnly || !onAwardStars || !summary) return
    setAwarded(true)
    for (const r of summary.rows) {
      if (r.stars > 0) await onAwardStars(r.id, r.stars, `Real-Life Showdown — ${r.won ? (summary.winners.length > 1 ? 'draw, great teamwork' : 'winning team') : 'great teamwork'}`)
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
      <div style={{ fontSize: 22 }}>🎭</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 17 }}>Real-Life Showdown</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#8a8378', letterSpacing: 1 }}>
          {cls?.name}{playing ? ` · SITUATION ${Math.min(game.round + 1, game.limit)} / ${game.limit}${game.golden ? ' · ⚡ GOLDEN ROUND' : ''}` : ''}
        </div>
      </div>
      <button onClick={() => setSound(s => !s)} className="btn btn-ghost" style={{ color: '#a39b8f', fontSize: 18 }} title="Sound">{sound ? '🔊' : '🔇'}</button>
      {playing && game.step === 'choosing' && timerSec > 0 && (
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
                🎭 A real-life situation appears with <b>4 possible responses</b><br />
                🤝 Each team huddles and <b>secretly</b> picks the best response<br />
                🎬 You reveal — all teams show their answers at once<br />
                ✅ Best <b>+2</b> · 👍 OK <b>+1</b> · ❌ wrong <b>0</b><br />
                🤣 Watch out for the <b>hilarious</b> answer!
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

            <Section title={`Topics (${topics.length === 0 ? 'all' : topics.length + ' chosen'})`}>
              {Object.entries(SHOWDOWN_TOPICS).map(([id, t]) => (
                <Chip key={id} on={topics.includes(id)} onClick={() => toggleTopic(id)}>{t.emoji} {t.label}</Chip>
              ))}
              <Chip on={false} onClick={() => setTopics([])}>all topics</Chip>
            </Section>
            <Section title="Difficulty of the situations">
              {TIER_OPTIONS.map(o => <Chip key={o.v} on={tierPick === o.v} onClick={() => setTierPick(o.v)}>{o.v === 0 ? `🎯 Automatic · level ${tierForSlug(slug)}${book?.label ? ` (${book.label})` : ''}` : o.label}</Chip>)}
            </Section>
            <Section title="Game length">
              {ROUNDS.map(o => <Chip key={o.k} on={rounds === o.k} onClick={() => setRounds(o.k)}>{o.label}</Chip>)}
            </Section>
            <Section title="Time to decide">
              {TIMERS.map(o => <Chip key={o.k} on={timerSec === o.k} onClick={() => setTimerSec(o.k)}>{o.label}</Chip>)}
            </Section>

            <div style={{ textAlign: 'center', padding: '10px 0 40px' }}>
              <button className="btn btn-accent" disabled={!canStart} onClick={startGame}
                style={{ fontSize: 18, padding: '16px 44px', fontWeight: 800, opacity: canStart ? 1 : 0.45 }}>
                🎭 Start the Showdown
              </button>
              <div style={{ marginTop: 10, fontSize: 12, color: '#8a8378' }}>
                {pool.length} situations ready
                {sizes.some(n => n < 1) ? ' · every team needs at least 1 player' : ''}{pool.length < 4 ? ' · pick more topics' : ''}
              </div>
              {readOnly && <div style={{ marginTop: 14, fontSize: 12, color: '#8a8378' }}>View only — stars will not be saved.</div>}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── SUMMARY ──
  if (phase === 'summary' && game && summary) {
    const draws = summary.winners.length > 1
    return (
      <div style={shell}>
        <style>{CSS}</style>
        {header}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 20px' }}>
          <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 64, animation: 'rsPop .6s' }}>🏆</div>
            <div style={{ fontSize: 30, fontWeight: 900, margin: '6px 0 4px', animation: 'rsPop .6s' }}>
              {draws ? 'It\'s a draw!' : `${TEAMS[summary.winners[0]].emoji} ${TEAMS[summary.winners[0]].name} win!`}
            </div>
            <div style={{ color: '#a39b8f', marginBottom: 22 }}>{game.teams.map(t => `${TEAMS[t.idx].emoji} ${t.score}`).join('  ·  ')}</div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, textAlign: 'left' }}>
              {game.teams.map(t => {
                const won = summary.winners.includes(t.idx)
                return (
                  <div key={t.idx} style={{ background: '#1d1a16', border: `2px solid ${won ? TEAMS[t.idx].color : '#2c2720'}`, borderRadius: 14, padding: 14 }}>
                    <div style={{ fontWeight: 800, color: TEAMS[t.idx].color, marginBottom: 8 }}>{won ? '🏆 ' : ''}{TEAMS[t.idx].emoji} {TEAMS[t.idx].name} · {t.score}</div>
                    {summary.rows.filter(r => r.team === t.idx).map(r => (
                      <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13, padding: '2px 0' }}>
                        <span>{r.name}</span>
                        <span style={{ color: '#a39b8f', fontFamily: 'var(--mono)', fontSize: 11 }}>✅ {r.best} · 🤣 {r.funny} · ⭐ +{r.stars}</span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>

            {summary.funnies.length > 0 && (
              <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 12, background: ROLES.funny.bg, color: '#e9d5ff', fontSize: 14 }}>
                🤣 <b>Funniest picks award:</b> {summary.funnies.map(r => `${r.name} (×${r.funny})`).join(', ')}
              </div>
            )}
            <div style={{ marginTop: 10, fontSize: 11, color: '#6b645a' }}>
              Stars: {STARS.winner} for the winning team, {STARS.other} for every other team, +{STARS.mvpBonus} for anyone who spoke for a “best” answer {STARS.mvpMin} or more times.
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
  const sit = g.situation
  const topic = SHOWDOWN_TOPICS[sit.topic] || { emoji: '🎭', label: 'Real life' }
  const choosing = g.step === 'choosing'
  const revealed = g.step === 'reveal' || g.step === 'over'
  const pickedCount = Object.keys(g.picks).length
  const lastRound = g.round + 1 >= g.limit

  return (
    <div style={shell}>
      <style>{CSS}</style>
      {header}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px 28px' }}>
        <div style={{ maxWidth: 940, margin: '0 auto' }}>
          {/* Scoreboard */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, 1fr)`, gap: 10, marginBottom: 14 }}>
            {g.teams.map(t => (
              <div key={t.idx} style={{ padding: '8px 12px', borderRadius: 12, background: '#1d1a16', border: `2px solid ${TEAMS[t.idx].color}88`, textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: TEAMS[t.idx].color }}>{TEAMS[t.idx].emoji} {TEAMS[t.idx].name}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#fbbf24', lineHeight: 1.2 }}>{t.score}</div>
              </div>
            ))}
          </div>

          {/* Situation */}
          <div style={{ background: '#1a1814', border: '1px solid #2c2720', borderRadius: 18, padding: '20px 22px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 40 }}>{topic.emoji}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#8a8378', letterSpacing: 2 }}>{topic.label.toUpperCase()}</div>
              <div style={{ flex: 1 }} />
              {choosing && timerSec > 0 && (
                <div style={{ fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 22, color: tl <= 5 ? '#ef4444' : '#fbbf24', animation: tl <= 5 ? 'rsPulse .5s infinite' : 'none' }}>⏱ {Math.ceil(tl)}</div>
              )}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.3, marginBottom: 6 }}>{sit.situation}</div>
            <div style={{ fontSize: 13, color: '#a39b8f', marginBottom: 16 }}>What is the BEST thing to say?</div>

            <div style={{ display: 'grid', gap: 10 }}>
              {sit.options.map((o, i) => {
                const r = ROLES[o.role]
                const pickers = revealed && g.results ? g.results.filter(x => x.pickIdx === i) : []
                const style = {
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 14, fontSize: 19, fontWeight: 600,
                  borderWidth: 2, borderStyle: 'solid', borderColor: revealed ? r.color : '#3a342c', background: revealed ? r.bg : '#1d1a16',
                  animation: revealed && o.role === 'funny' ? 'rsWobble .6s 2' : 'none',
                }
                return (
                  <div key={i} style={style}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: '#fbbf24', fontWeight: 800 }}>{LETTERS[i]}</span>
                    <span style={{ flex: 1 }}>{o.text}</span>
                    {revealed && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        {pickers.map(p => <span key={p.team} title={TEAMS[p.team].name} style={{ fontSize: 22 }}>{TEAMS[p.team].emoji}</span>)}
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 800, color: r.color }}>{r.tag}{r.pts ? ` +${r.pts}` : ''}</span>
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
            {paused && (
              <div style={{ position: 'absolute', inset: 0, borderRadius: 18, background: 'rgba(20,17,15,0.94)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800 }}>⏸ Paused</div>
            )}
          </div>

          {/* Choosing: one row of A–D buttons per team */}
          {choosing && (
            <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
              {g.teams.map(t => {
                const speaker = t.members[t.sp % t.members.length]
                const chosen = g.picks[t.idx]
                return (
                  <div key={t.idx} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '8px 12px', borderRadius: 12, background: `${TEAMS[t.idx].color}14`, border: `1px solid ${TEAMS[t.idx].color}66` }}>
                    <div style={{ minWidth: 190, flex: '1 1 190px' }}>
                      <div style={{ fontWeight: 800, color: TEAMS[t.idx].color, fontSize: 14 }}>{TEAMS[t.idx].emoji} {TEAMS[t.idx].name}</div>
                      <div style={{ fontSize: 12, color: '#a39b8f' }}>🎤 {speaker.name} speaks for the team</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {sit.options.map((o, i) => (
                        <button key={i} className="rs-pick" disabled={paused} onClick={() => setPick(t.idx, i)}
                          style={{ cursor: 'pointer', width: 52, height: 44, borderRadius: 10, fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 800,
                            borderWidth: 2, borderStyle: 'solid', borderColor: chosen === i ? TEAMS[t.idx].color : '#3a342c',
                            background: chosen === i ? TEAMS[t.idx].color : '#1d1a16', color: chosen === i ? '#14110f' : '#f5efe6' }}>{LETTERS[i]}</button>
                      ))}
                    </div>
                    <div style={{ width: 70, textAlign: 'right', fontSize: 12, color: chosen === undefined ? '#6b645a' : '#86efac' }}>{chosen === undefined ? 'thinking…' : '🔒 chosen'}</div>
                  </div>
                )
              })}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 6 }}>
                <button className="btn btn-accent" disabled={paused || pickedCount === 0} onClick={reveal}
                  style={{ fontSize: 17, padding: '12px 32px', fontWeight: 800, opacity: pickedCount === 0 ? 0.5 : 1 }}>
                  🎬 Reveal answers {pickedCount < n ? `(${pickedCount}/${n} chosen)` : ''}
                </button>
                <button className="btn btn-ghost" onClick={newSituation} style={{ color: '#a39b8f', fontSize: 13 }}>⏭ Different situation</button>
              </div>
            </div>
          )}

          {/* Reveal: explanation + results */}
          {revealed && g.results && (
            <div style={{ marginTop: 14 }}>
              <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(34,197,94,0.1)', fontSize: 15, color: '#d6cfc3', animation: 'rsPop .35s' }}>
                💡 <b>Why?</b> {sit.why}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10, justifyContent: 'center' }}>
                {g.results.map(r => (
                  <div key={r.team} style={{ padding: '8px 14px', borderRadius: 999, background: '#1d1a16', border: `1.5px solid ${TEAMS[r.team].color}`, fontSize: 13 }}>
                    {TEAMS[r.team].emoji} <b>{r.speaker}</b>: {r.role ? ROLES[r.role].tag : '⏰ no answer'}{r.pts ? ` · +${r.pts}` : ''}
                  </div>
                ))}
              </div>
              {g.results.some(r => r.role === 'funny') && (
                <div style={{ marginTop: 10, textAlign: 'center', fontSize: 20, fontWeight: 800, color: '#e9d5ff', animation: 'rsPop .4s' }}>
                  🤣 {g.results.filter(r => r.role === 'funny').map(r => TEAMS[r.team].name).join(' & ')} picked the hilarious one!
                </div>
              )}
              {g.step === 'reveal' && (
                <div style={{ textAlign: 'center', marginTop: 14 }}>
                  <button className="btn btn-accent" onClick={nextRound} style={{ fontSize: 17, padding: '12px 32px', fontWeight: 800 }}>
                    {lastRound ? '🏆 Final result' : '▶ Next situation'}
                  </button>
                </div>
              )}
            </div>
          )}
          {g.step === 'over' && (
            <div style={{ marginTop: 14, padding: 16, borderRadius: 14, textAlign: 'center', fontSize: 26, fontWeight: 900, background: 'rgba(245,158,11,0.15)', animation: 'rsPop .5s' }}>
              🎉 {g.winner.length > 1 ? 'It\'s a draw!' : `${TEAMS[g.winner[0]].emoji} ${TEAMS[g.winner[0]].name} win!`}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

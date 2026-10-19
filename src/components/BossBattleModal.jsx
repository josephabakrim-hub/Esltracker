import { useState, useEffect, useRef, useMemo } from 'react'
import { getBook, getBookSlug, BOOKS } from '../lib/books'
import { buildPool, prepareQuestion, shuffle, hasBookBank, bankUnits, reviewBooks, tierForSlug, CATEGORIES, CATEGORY_LABELS, TIER_OPTIONS } from '../lib/quiz'
import { sfx, setMuted, unlockAudio } from '../lib/sounds'

// ─────────────────────────────────────────────────────────────────────────────
//  🐲 BOSS BATTLE  (the whole class vs one monster — cooperative)
//  A monster with an HP bar attacks the class. Students take turns answering.
//  Right  → the class hits the boss. 3 right in a row = 💥 CRITICAL HIT (×2).
//  Wrong  → the boss strikes back and the class loses a ❤️.
//  5 right in a row heals a ❤️. Two 🔎 50/50 lifelines per battle.
//  Beat the boss before the hearts run out and everybody wins stars.
//  Teacher-run, like the other games. Stars are only given when you press the button.
// ─────────────────────────────────────────────────────────────────────────────

const BOSSES = [
  { id: 'dragon', name: 'Grammar Dragon',   emoji: '🐲', color: '#ef4444', taunts: ['Your English is no match for my fire!', 'Burn, little grammar mistakes!', 'Is that all you know?'] },
  { id: 'kraken', name: 'Vocab Kraken',     emoji: '🐙', color: '#8b5cf6', taunts: ['My tentacles swallow every word!', 'You will forget everything!', 'Splash! Wrong word!'] },
  { id: 'zombie', name: 'Homework Zombie',  emoji: '🧟', color: '#22c55e', taunts: ['Braaains… and homework…', 'You forgot your homework!', 'Grooan! Try again!'] },
  { id: 'rex',    name: 'Test-Rex',         emoji: '🦖', color: '#f59e0b', taunts: ['ROAR! Surprise test!', 'Study harder, tiny humans!', 'Chomp! Wrong answer!'] },
  { id: 'ghost',  name: 'Mistake Ghost',    emoji: '👻', color: '#94a3b8', taunts: ['Boo! I love mistakes!', 'Woooo… that was wrong…', 'Your mistakes make me stronger!'] },
  { id: 'robot',  name: 'Robo-Tester',      emoji: '🤖', color: '#38bdf8', taunts: ['ERROR. ANSWER INCORRECT.', 'BEEP BOOP. TRY AGAIN.', 'MY CIRCUITS ARE UNBEATABLE.'] },
]
const HITS = ['Boss is hurt!', 'Nice hit!', 'Ouch! The boss staggers!', 'Direct hit!', 'The boss roars in pain!']
const LEVELS = {
  easy:   { label: '🙂 Easy',   base: 8,  perPlayer: 1,   hearts: 6 },
  normal: { label: '😎 Normal', base: 12, perPlayer: 1.5, hearts: 5 },
  hard:   { label: '😈 Hard',   base: 15, perPlayer: 2,   hearts: 4 },
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
const STARS = { win: 3, lose: 1, mvpBonus: 1, mvpMin: 3 }
const pick = arr => arr[Math.floor(Math.random() * arr.length)]

function getTodayKey() {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
}

const cloneGame = g => ({ ...g, stats: { ...g.stats } })

const CSS = `
@keyframes bbPop { 0% { transform: scale(0.6); opacity: 0 } 70% { transform: scale(1.08) } 100% { transform: scale(1); opacity: 1 } }
@keyframes bbIdle { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
@keyframes bbHit { 0%,100% { transform: translateX(0) } 15% { transform: translateX(-14px) rotate(-6deg); filter: brightness(2.2) } 40% { transform: translateX(12px) rotate(5deg) } 70% { transform: translateX(-6px) } }
@keyframes bbStrike { 0% { transform: scale(1) } 30% { transform: scale(1.35) translateY(14px) } 100% { transform: scale(1) } }
@keyframes bbHeart { 0% { transform: scale(1) } 40% { transform: scale(1.5) } 100% { transform: scale(1) } }
@keyframes bbFloat { 0% { transform: translateY(0); opacity: 1 } 100% { transform: translateY(-50px); opacity: 0 } }
@keyframes bbPulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.06) } }
@keyframes bbFall { 0% { transform: translateY(-40px) rotate(0); opacity: 1 } 100% { transform: translateY(105vh) rotate(540deg); opacity: 0.9 } }
.bb-opt { transition: transform .12s, background .15s, border-color .15s; }
.bb-opt:hover:not(:disabled) { transform: translateY(-2px); border-color: #fbbf24 !important; }
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

export default function BossBattleModal({ cls, students, onAwardStars, onUpdateClass, onClose, readOnly }) {
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
  const [bossId, setBossId] = useState('random')
  const [levelKey, setLevelKey] = useState('normal')
  const [timerSec, setTimerSec] = useState(0)
  const [sound, setSound] = useState(true)
  // Difficulty of the non-book questions: 0 = automatic (from the class book), or 1 / 2 / 3
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
  const [fx, setFx] = useState({ hit: 0, strike: 0, heal: 0 }) // counters that retrigger the animations

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
  const bossHp = Math.max(level.base, Math.round(active.length * level.perPlayer))
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
    const boss = bossId === 'random' ? pick(BOSSES) : BOSSES.find(b => b.id === bossId)
    if (!readOnly && onUpdateClass && bookReady && units.length) onUpdateClass(cls.id, { unitsCovered: units })
    commit({
      boss, hp: bossHp, maxHp: bossHp, hearts: level.hearts, maxHearts: level.hearts,
      combo: 0, bestCombo: 0, order: shuffle(active).map(s => ({ id: s.id, name: s.nameEn })), turn: 0,
      question: prepareQuestion(drawQuestion()), step: 'asking', picked: null, removed: [], result: null,
      lifelines: 2, stats: {}, outcome: null, asked: 0, speech: `${boss.emoji} ${pick(boss.taunts)}`,
    })
    resetTimer(); setPaused(false); setAwarded(false); setFx({ hit: 0, strike: 0, heal: 0 }); setPhase('play')
  }

  function finish(g, outcome) {
    g.outcome = outcome; g.step = 'over'
    g.speech = outcome === 'win' ? `${g.boss.emoji} Noooo! You defeated me…` : `${g.boss.emoji} Hahaha! I win this time!`
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
    const speaker = g.order[g.turn % g.order.length]
    g.turn += 1
    g.asked += 1
    g.picked = optIdx
    const st = { correct: 0, wrong: 0, damage: 0, ...(g.stats[speaker.id] || {}) }
    const right = optIdx >= 0 && q.options[optIdx] === q.correct

    if (right) {
      g.combo += 1
      g.bestCombo = Math.max(g.bestCombo, g.combo)
      const crit = g.combo % 3 === 0
      const dmg = crit ? 2 : 1
      st.correct += 1; st.damage += Math.min(dmg, g.hp)
      g.stats[speaker.id] = st
      g.hp = Math.max(0, g.hp - dmg)
      let text = crit ? `💥 CRITICAL HIT! −2 · ${speaker.name}` : `⚔️ ${pick(HITS)} −1 · ${speaker.name}`
      if (g.combo % 5 === 0 && g.hearts < g.maxHearts) { g.hearts += 1; text += ' · 💚 +1 heart!'; bump('heal') }
      g.result = { kind: crit ? 'crit' : 'hit', text }
      g.speech = g.hp > 0 ? `${g.boss.emoji} ${g.hp <= g.maxHp / 3 ? 'ARGH! I am getting weak…' : 'Ouch!'}` : g.speech
      sfx.correct(); later(crit ? sfx.shield : sfx.pass, 250)
      bump('hit')
      g.step = 'reveal'
      commit(g)
      if (g.hp <= 0) { later(() => finish(cloneGame(gameRef.current), 'win'), 1300) } else later(nextQuestion, 1900)
      return
    }

    st.wrong += 1
    g.stats[speaker.id] = st
    g.combo = 0
    g.hearts = Math.max(0, g.hearts - 1)
    g.result = { kind: 'miss', text: optIdx < 0 ? `⏰ Time's up! The boss strikes · −1 ❤️` : `💔 Wrong! The boss strikes back · −1 ❤️` }
    g.speech = `${g.boss.emoji} ${pick(g.boss.taunts)}`
    sfx.wrong(); later(sfx.boom, 120)
    bump('strike')
    g.step = 'reveal'
    commit(g)
    if (g.hearts <= 0) { later(() => finish(cloneGame(gameRef.current), 'lose'), 1700) } else later(nextQuestion, 2400)
  }

  function nextQuestion() {
    const g0 = gameRef.current
    if (!g0 || g0.step === 'over') return
    const g = cloneGame(g0)
    g.question = prepareQuestion(drawQuestion())
    g.step = 'asking'; g.picked = null; g.removed = []; g.result = null
    commit(g); resetTimer()
  }

  // Teacher tools while a question is open
  function nextStudent() {
    const g0 = gameRef.current
    if (!g0 || g0.step !== 'asking' || g0.order.length < 2) return
    const g = cloneGame(g0); g.turn += 1; commit(g)
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
  function endNow() {
    const g0 = gameRef.current
    if (!g0 || g0.step === 'over') return
    if (!window.confirm('End the battle now? The boss wins.')) return
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
      const s = { correct: 0, wrong: 0, damage: 0, ...(game.stats[m.id] || {}) }
      return { id: m.id, name: m.name, ...s, stars: (won ? STARS.win : STARS.lose) + (s.correct >= STARS.mvpMin ? STARS.mvpBonus : 0) }
    })
    const bestDamage = Math.max(0, ...rows.map(r => r.damage))
    return { won, rows, bestDamage }
  }, [game, phase])

  async function awardStars() {
    if (awarded || readOnly || !onAwardStars || !summary) return
    setAwarded(true)
    for (const r of summary.rows) {
      if (r.stars > 0) await onAwardStars(r.id, r.stars, `Boss Battle — ${summary.won ? `defeated the ${game.boss.name}` : 'brave fighter'}`)
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
      <div style={{ fontSize: 22 }}>🐲</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 17 }}>Boss Battle</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#8a8378', letterSpacing: 1 }}>
          {cls?.name}{playing ? ` · ${game.boss.name.toUpperCase()}` : ''}
        </div>
      </div>
      <button onClick={() => setSound(s => !s)} className="btn btn-ghost" style={{ color: '#a39b8f', fontSize: 18 }} title="Sound">{sound ? '🔊' : '🔇'}</button>
      {playing && game.step === 'asking' && (
        <button onClick={() => setPaused(p => !p)} className="btn btn-outline" style={{ color: '#fbbf24', borderColor: '#4a3f2a' }}>{paused ? '▶ Resume' : '⏸ Pause'}</button>
      )}
      {playing && game.step !== 'over' && (
        <button onClick={endNow} className="btn btn-outline" style={{ color: '#f87171', borderColor: '#4a2a2a' }}>🏁 End battle</button>
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
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#8a8378', letterSpacing: 2, marginBottom: 8 }}>FIGHTING TODAY · {active.length}{sitOut.length ? ` · ${sitOut.length} SITTING OUT` : ''}</div>
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
                🤝 The whole class fights <b>together</b>, one student answers at a time<br />
                ⚔️ Right: hit the boss <b>−1</b> · 3 in a row: <b>💥 CRITICAL −2</b><br />
                💔 Wrong: the boss strikes — the class loses a <b>❤️</b><br />
                💚 5 right in a row heals a heart<br />
                🔎 Two <b>50/50</b> lifelines to help a student
              </div>
            </div>

            <Section title="Choose the boss">
              <Chip on={bossId === 'random'} onClick={() => setBossId('random')}>🎲 Surprise me</Chip>
              {BOSSES.map(b => <Chip key={b.id} on={bossId === b.id} onClick={() => setBossId(b.id)}>{b.emoji} {b.name}</Chip>)}
            </Section>

            <Section title="Difficulty">
              {Object.entries(LEVELS).map(([k, l]) => <Chip key={k} on={levelKey === k} onClick={() => setLevelKey(k)}>{l.label}</Chip>)}
            </Section>
            <div style={{ marginTop: -10, marginBottom: 20, fontSize: 12, color: '#8a8378' }}>
              Boss HP: <b style={{ color: '#fbbf24' }}>{bossHp} hits</b> · Class hearts: <b style={{ color: '#fbbf24' }}>{level.hearts} ❤️</b> (scaled to {active.length} student{active.length === 1 ? '' : 's'})
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
                🐲 Start the battle
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
    const mvps = summary.bestDamage > 0 ? summary.rows.filter(r => r.damage === summary.bestDamage) : []
    return (
      <div style={shell}>
        <style>{CSS}</style>
        {header}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 20px' }}>
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 70, animation: 'bbPop .6s' }}>{summary.won ? '🏆' : game.boss.emoji}</div>
            <div style={{ fontSize: 30, fontWeight: 900, margin: '6px 0 4px', animation: 'bbPop .6s' }}>
              {summary.won ? `You defeated the ${game.boss.name}!` : `The ${game.boss.name} won this time…`}
            </div>
            <div style={{ color: '#a39b8f', marginBottom: 22 }}>
              {game.asked} questions · best combo 🔥{game.bestCombo} · {game.hearts} ❤️ left{summary.won ? '' : ` · boss had ${game.hp} HP left`}
            </div>

            <div style={{ background: '#1d1a16', border: '1px solid #2c2720', borderRadius: 14, padding: 14, textAlign: 'left' }}>
              {summary.rows.map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 14, padding: '4px 0' }}>
                  <span>{mvps.some(m => m.id === r.id) ? '⚔️ ' : ''}{r.name}</span>
                  <span style={{ color: '#a39b8f', fontFamily: 'var(--mono)', fontSize: 12 }}>✅ {r.correct} · ❌ {r.wrong} · 💥 {r.damage} · ⭐ +{r.stars}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: '#6b645a' }}>
              Stars: {STARS.win} for everyone if the boss is beaten ({STARS.lose} for trying), +{STARS.mvpBonus} for anyone with {STARS.mvpMin} or more right answers. ⚔️ = most damage.
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
              <button className="btn btn-accent" disabled={awarded || readOnly} onClick={awardStars} style={{ fontSize: 15, padding: '12px 26px', opacity: awarded || readOnly ? 0.5 : 1 }}>
                {readOnly ? 'View only' : awarded ? '✅ Stars awarded!' : '⭐ Award stars to the class'}
              </button>
              <button className="btn btn-outline" onClick={playAgain} style={{ color: '#fbbf24', borderColor: '#4a3f2a' }}>{summary.won ? '🔁 Another boss' : '🔁 Fight again'}</button>
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
  const speaker = g.order[g.turn % g.order.length]
  const hpPct = (g.hp / g.maxHp) * 100
  const enraged = g.hp > 0 && g.hp <= g.maxHp / 3
  const hpColor = hpPct > 66 ? '#22c55e' : hpPct > 33 ? '#f59e0b' : '#ef4444'
  const label = q.category === 'book' ? `📘 UNIT ${q.unit}`
    : q.category === 'review' ? `🔁 REVIEW · ${BOOKS[q.slug]?.label || ''} · UNIT ${q.unit}`
    : CATEGORY_LABELS[q.category] || '🌍 GENERAL KNOWLEDGE'

  const bossAnim = over && g.outcome === 'win' ? 'none' : g.step === 'reveal' && g.result?.kind !== 'miss' ? 'bbHit .6s' : g.step === 'reveal' ? 'bbStrike .6s' : 'bbIdle 2.2s ease-in-out infinite'

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

  return (
    <div style={shell}>
      <style>{CSS}</style>
      {header}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px 28px' }}>
        <div style={{ maxWidth: 940, margin: '0 auto' }}>
          {/* Boss */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '12px 16px', borderRadius: 18, background: `${g.boss.color}18`, border: `2px solid ${g.boss.color}66` }}>
            <div key={`boss-${fx.hit}-${fx.strike}`} style={{ fontSize: over && g.outcome === 'win' ? 70 : 84, lineHeight: 1, animation: bossAnim, filter: over && g.outcome === 'win' ? 'grayscale(1)' : enraged ? 'drop-shadow(0 0 14px #ef4444)' : 'none', transform: over && g.outcome === 'win' ? 'rotate(90deg)' : undefined }}>
              {over && g.outcome === 'win' ? '💀' : g.boss.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                <div style={{ fontWeight: 900, fontSize: 18, color: g.boss.color }}>{g.boss.name}{enraged && !over ? ' 😡 ENRAGED' : ''}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#a39b8f' }}>HP {g.hp} / {g.maxHp}</div>
              </div>
              <div style={{ height: 22, borderRadius: 11, background: '#1d1a16', border: '1px solid #2c2720', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${hpPct}%`, background: hpColor, transition: 'width .6s, background .4s' }} />
              </div>
              <div style={{ marginTop: 8, fontSize: 13, color: '#d6cfc3', fontStyle: 'italic', minHeight: 18 }}>{g.speech}</div>
            </div>
          </div>

          {/* Class hearts + combo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '12px 0', flexWrap: 'wrap' }}>
            <div key={`hearts-${fx.heal}-${fx.strike}`} style={{ fontSize: 26, letterSpacing: 2, animation: fx.strike || fx.heal ? 'bbHeart .5s' : 'none' }}>
              {Array.from({ length: g.maxHearts }, (_, i) => (i < g.hearts ? '❤️' : '🖤')).join('')}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 800, color: g.combo >= 2 ? '#fb923c' : '#6b645a' }}>
              {g.combo > 0 ? `🔥 COMBO ×${g.combo}${g.combo % 3 === 2 ? ' — next hit is CRITICAL!' : ''}` : 'no combo yet'}
            </div>
            <div style={{ flex: 1 }} />
            {!over && (
              <button className="btn btn-outline" disabled={!answering || g.lifelines < 1 || q.tf || g.removed.length > 0 || paused} onClick={fiftyFifty}
                style={{ color: '#38bdf8', borderColor: '#25506a', opacity: !answering || g.lifelines < 1 || q.tf || g.removed.length > 0 ? 0.4 : 1 }}
                title="Remove two wrong answers">🔎 50/50 · {g.lifelines} left</button>
            )}
          </div>

          {/* Whose turn */}
          {!over && (
            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '10px 16px', borderRadius: 14, background: 'rgba(245,158,11,0.1)', border: '2px solid rgba(245,158,11,0.5)' }}>
              <div style={{ fontSize: 24 }}>🎤</div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontWeight: 800, color: '#fbbf24' }}>{speaker.name}'s turn</div>
                <div style={{ fontSize: 12, color: '#a39b8f' }}>The class may whisper to help!</div>
              </div>
              {timerSec > 0 && answering && (
                <div style={{ fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 22, color: tl <= 5 ? '#ef4444' : '#fbbf24', animation: tl <= 5 ? 'bbPulse .5s infinite' : 'none' }}>⏱ {Math.ceil(tl)}</div>
              )}
            </div>
          )}

          {/* Question */}
          <div style={{ background: '#1a1814', border: '1px solid #2c2720', borderRadius: 18, padding: '22px 22px 20px', position: 'relative' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#8a8378', letterSpacing: 2, marginBottom: 10 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.3, marginBottom: 18 }}>{q.q}</div>
            <div style={{ display: 'grid', gridTemplateColumns: q.tf ? '1fr 1fr' : 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
              {q.options.map((o, i) => (
                <button key={i} className="bb-opt" disabled={!answering || paused || g.removed.includes(i)} onClick={() => answer(i)} style={optStyle(i)}>
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
            <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 12, textAlign: 'center', fontWeight: 800, fontSize: 18, animation: 'bbPop .35s',
              background: g.result?.kind === 'miss' ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)', color: g.result?.kind === 'miss' ? '#fca5a5' : '#86efac' }}>
              {g.result?.text}
              {q.tip && <div style={{ marginTop: 4, fontWeight: 500, fontSize: 13, color: '#d6cfc3' }}>💡 {q.tip}</div>}
            </div>
          )}
          {over && (
            <div style={{ marginTop: 14, padding: 16, borderRadius: 14, textAlign: 'center', fontSize: 26, fontWeight: 900, background: g.outcome === 'win' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', animation: 'bbPop .5s' }}>
              {g.outcome === 'win' ? `🎉 ${g.boss.name} defeated!` : `💀 The ${g.boss.name} wins…`}
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

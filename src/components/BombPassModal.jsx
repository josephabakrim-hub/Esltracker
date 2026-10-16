import { useState, useEffect, useRef, useMemo } from 'react'
import { getBook, getBookSlug, BOOKS } from '../lib/books'
import { buildPool, prepareQuestion, shuffle, hasBookBank, bankUnits, reviewBooks, CATEGORIES } from '../lib/quiz'
import { sfx, setMuted, unlockAudio } from '../lib/sounds'

// ─────────────────────────────────────────────────────────────────────────────
//  💣 BOMB PASS
//  A hidden fuse is burning. Whoever holds the bomb must answer a question.
//  Right  → points + you throw the bomb at a classmate.
//  Wrong  → the fuse burns faster and you stay in the hot seat.
//  Boom   → the holder loses points. Whoever threw it to them earns an assist.
//  Teacher-run: students answer out loud, the teacher taps the answer.
// ─────────────────────────────────────────────────────────────────────────────

const FUSES = {
  short:  { label: '⚡ Short',  min: 12, max: 25 },
  normal: { label: '🔥 Normal', min: 18, max: 40 },
  long:   { label: '🐢 Long',   min: 30, max: 55 },
}
const REVIEW_SHARES = [
  { v: 0.2,  label: '🔹 A little (about 1 in 5)' },
  { v: 0.35, label: '🔸 Some (about 1 in 3)' },
  { v: 0.5,  label: '🔶 Half and half' },
]
const POINTS = { correct: 10, speed: 5, speedWithin: 5, streakStep: 2, streakCap: 8, boom: 15, assist: 5, wrongBurn: 4 }
const MEDALS = ['🥇', '🥈', '🥉']
const LETTERS = ['A', 'B', 'C', 'D']

function getTodayKey() {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
}
const rand = (a, b) => a + Math.random() * (b - a)

const CSS = `
@keyframes bpPulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.08) } }
@keyframes bpShake { 0%,100% { transform: translate(0,0) rotate(0) } 20% { transform: translate(-6px,3px) rotate(-4deg) } 40% { transform: translate(6px,-3px) rotate(4deg) } 60% { transform: translate(-5px,-3px) rotate(-3deg) } 80% { transform: translate(5px,3px) rotate(3deg) } }
@keyframes bpPop { 0% { transform: scale(0.6); opacity: 0 } 70% { transform: scale(1.08) } 100% { transform: scale(1); opacity: 1 } }
@keyframes bpFloat { 0% { transform: translateY(0); opacity: 1 } 100% { transform: translateY(-26px); opacity: 0 } }
@keyframes bpBoom { 0% { transform: scale(0.2); opacity: 1 } 100% { transform: scale(2.6); opacity: 0 } }
@keyframes bpFall { 0% { transform: translateY(-40px) rotate(0); opacity: 1 } 100% { transform: translateY(105vh) rotate(540deg); opacity: 0.9 } }
.bp-opt { transition: transform .12s, background .15s, border-color .15s; }
.bp-opt:hover:not(:disabled) { transform: translateY(-2px); border-color: #fbbf24 !important; }
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

export default function BombPassModal({ cls, students, onAwardStars, onUpdateClass, onClose, readOnly }) {
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
  const [phase, setPhase] = useState('setup') // setup | play | boom | summary
  const saved = (cls?.unitsCovered || []).filter(n => unitList.some(u => u.num === n))
  const [units, setUnits] = useState(saved.length ? saved : unitList.map(u => u.num))
  const [cats, setCats] = useState(bookReady ? ['book', 'real'] : ['real', 'general'])
  const [totalRounds, setTotalRounds] = useState(5)
  const [fuseKey, setFuseKey] = useState('normal')
  const [chooseTarget, setChooseTarget] = useState(true)
  const [sound, setSound] = useState(true)
  // Optional revision of earlier books: { [bookSlug]: [unit numbers] }
  const reviewable = useMemo(() => reviewBooks(slug), [slug])
  const [review, setReview] = useState({})
  const [reviewShare, setReviewShare] = useState(0.35)
  // Students who are present but don't want to play (tap their name to sit out)
  const [sitOut, setSitOut] = useState([])
  const [confirmRemove, setConfirmRemove] = useState(null)

  // ── game state ──
  const [players, setPlayers] = useState([])
  const [holder, setHolder] = useState(null)
  const [question, setQuestion] = useState(null)
  const [step, setStep] = useState('asking') // asking | reveal | choose
  const [picked, setPicked] = useState(null)
  const [roundsDone, setRoundsDone] = useState(0)
  const [heat, setHeat] = useState(0)
  const [paused, setPaused] = useState(false)
  const [flash, setFlash] = useState({})
  const [toast, setToast] = useState(null)
  const [boomInfo, setBoomInfo] = useState(null)
  const [awarded, setAwarded] = useState(false)

  const playersRef = useRef([]); playersRef.current = players
  const holderRef = useRef(null); holderRef.current = holder
  const lastPasserRef = useRef(null)
  const deckRef = useRef({ main: [], review: [] })
  const poolRef = useRef({ main: [], review: [], share: 0 })
  const elapsedRef = useRef(0)
  const totalRef = useRef(30000)
  const runningRef = useRef(false)
  const shownAtRef = useRef(0)
  const lastTickRef = useRef(0)
  const timers = useRef([])
  const explodeRef = useRef(() => {})

  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.current.push(t) }
  useEffect(() => () => { timers.current.forEach(clearTimeout); runningRef.current = false }, [])
  useEffect(() => { setMuted(!sound) }, [sound])

  const active = present.filter(s => !sitOut.includes(s.id))
  const reviewEntries = useMemo(() => Object.entries(review).map(([s, us]) => ({ slug: s, units: us })), [review])
  const pool = useMemo(() => buildPool({ slug, units, categories: cats, review: reviewEntries }), [slug, units, cats, reviewEntries])
  const reviewCount = pool.filter(q => q.category === 'review').length
  const canStart = active.length >= 2 && pool.length >= 8

  // ── fuse loop ──
  useEffect(() => {
    if (phase !== 'play') return
    const id = setInterval(() => {
      if (!runningRef.current) return
      elapsedRef.current += 100
      const h = Math.min(1, elapsedRef.current / totalRef.current)
      setHeat(h)
      const gap = Math.max(220, 1000 - h * 780)
      const now = Date.now()
      if (now - lastTickRef.current >= gap) { lastTickRef.current = now; sfx.tick(h) }
      if (elapsedRef.current >= totalRef.current) explodeRef.current()
    }, 100)
    return () => clearInterval(id)
  }, [phase])

  // ── helpers ──
  function patch(id, fn) { setPlayers(ps => ps.map(p => (p.id === id ? { ...p, ...fn(p) } : p))) }
  function say(text) { setToast({ text, k: Date.now() }); later(() => setToast(t => (t && Date.now() - t.k >= 2400 ? null : t)), 2500) }
  function pop(id, text) { setFlash(f => ({ ...f, [id]: text })); later(() => setFlash(f => { const n = { ...f }; delete n[id]; return n }), 1600) }
  function randomOther(excludeId) {
    const others = playersRef.current.filter(p => p.id !== excludeId)
    return (shuffle(others)[0] || playersRef.current[0]).id
  }
  // Draws the next question. Review questions (earlier books) are mixed in at
  // the share the teacher chose; each deck is reshuffled when it runs out.
  function drawQuestion() {
    const pools = poolRef.current, decks = deckRef.current
    const hasReview = pools.review.length > 0, hasMain = pools.main.length > 0
    const key = hasReview && (!hasMain || Math.random() < pools.share) ? 'review' : 'main'
    if (decks[key].length === 0) decks[key] = shuffle(pools[key])
    return decks[key].pop()
  }
  function nextQuestion() {
    setQuestion(prepareQuestion(drawQuestion()))
    setPicked(null)
    shownAtRef.current = Date.now()
  }
  function armFuse(burnedFraction = 0) {
    const f = FUSES[fuseKey]
    totalRef.current = rand(f.min, f.max) * 1000
    elapsedRef.current = totalRef.current * burnedFraction
    setHeat(burnedFraction)
  }
  function startBomb(excludeId) {
    armFuse()
    lastPasserRef.current = null
    setHolder(randomOther(excludeId || '__none__'))
    nextQuestion()
    setStep('asking'); setPaused(false); setBoomInfo(null)
    runningRef.current = true
    setPhase('play')
  }

  // ── start / reset ──
  function startGame() {
    unlockAudio(); sfx.start()
    const mainPool = pool.filter(q => q.category !== 'review')
    const reviewPool = pool.filter(q => q.category === 'review')
    poolRef.current = { main: mainPool, review: reviewPool, share: reviewShare }
    deckRef.current = { main: shuffle(mainPool), review: shuffle(reviewPool) }
    const fresh = active.map(s => ({ id: s.id, name: s.nameEn, pts: 0, streak: 0, shield: false, correct: 0, wrong: 0, booms: 0, assists: 0 }))
    setPlayers(fresh)
    playersRef.current = fresh
    setRoundsDone(0); setAwarded(false)
    if (!readOnly && onUpdateClass && bookReady && units.length) onUpdateClass(cls.id, { unitsCovered: units })
    startBomb(null)
  }

  // ── sitting out (for students who don't want to play) ──
  function toggleSitOut(id) { setSitOut(list => (list.includes(id) ? list.filter(x => x !== id) : [...list, id])) }

  function removePlayer(id) {
    if (phase !== 'play' || step !== 'asking') return
    const p = playersRef.current.find(x => x.id === id)
    if (!p) return
    setConfirmRemove(null)
    const remaining = playersRef.current.filter(x => x.id !== id)
    if (remaining.length < 2) { say('You need at least 2 players to keep playing.'); return }
    setSitOut(list => (list.includes(id) ? list : [...list, id]))
    playersRef.current = remaining
    setPlayers(remaining)
    if (lastPasserRef.current === id) lastPasserRef.current = null
    if (holderRef.current === id) {
      // The bomb was in their hands — pass it on with a fresh question
      if (!paused) runningRef.current = false
      const next = shuffle(remaining)[0]
      holderRef.current = next.id
      setHolder(next.id)
      nextQuestion()
      say(`🙈 ${p.name} sat out — the bomb goes to ${next.name}`)
      if (!paused) later(() => { runningRef.current = true }, 700)
    } else {
      say(`🙈 ${p.name} is sitting out`)
    }
  }

  function addBack(id) {
    const st = present.find(x => x.id === id)
    if (!st) return
    setSitOut(list => list.filter(x => x !== id))
    if (phase === 'play' && !playersRef.current.some(x => x.id === id)) {
      const np = { id, name: st.nameEn, pts: 0, streak: 0, shield: false, correct: 0, wrong: 0, booms: 0, assists: 0 }
      playersRef.current = [...playersRef.current, np]
      setPlayers(ps => [...ps, np])
      say(`👋 ${st.nameEn} is back in the game!`)
    }
  }
  function askRemove(id) {
    if (confirmRemove === id) { removePlayer(id); return }
    setConfirmRemove(id)
    later(() => setConfirmRemove(c => (c === id ? null : c)), 3000)
  }

  // ── review of earlier books ──
  function toggleReviewBook(s) {
    setReview(r => {
      const n = { ...r }
      if (n[s]) delete n[s]; else n[s] = bankUnits(s)
      return n
    })
  }
  function toggleReviewUnit(s, u) {
    setReview(r => {
      const cur = r[s] || []
      return { ...r, [s]: cur.includes(u) ? cur.filter(x => x !== u) : [...cur, u] }
    })
  }

  // ── answering ──
  function answer(i) {
    if (phase !== 'play' || step !== 'asking' || paused || !question) return
    runningRef.current = false
    setPicked(i); setStep('reveal')
    const hid = holderRef.current
    const p = playersRef.current.find(x => x.id === hid)
    const right = question.options[i] === question.correct
    if (right) {
      const secs = (Date.now() - shownAtRef.current) / 1000
      const streak = p.streak + 1
      const speed = secs <= POINTS.speedWithin ? POINTS.speed : 0
      const combo = Math.min((streak - 1) * POINTS.streakStep, POINTS.streakCap)
      const gain = POINTS.correct + speed + combo
      const gainShield = streak % 3 === 0 && !p.shield
      patch(hid, q => ({ pts: q.pts + gain, streak, correct: q.correct + 1, shield: q.shield || gainShield }))
      pop(hid, `+${gain}`)
      if (gainShield) { sfx.shield(); say(`🛡️ ${p.name} earned a SHIELD! (${streak} in a row)`) }
      else { sfx.correct(); if (speed) say(`⚡ Lightning fast! +${speed} bonus`); else if (streak >= 2) say(`🔥 ${streak} in a row!`) }
      later(() => {
        if (chooseTarget && playersRef.current.length > 2) setStep('choose')
        else passTo(randomOther(hid))
      }, 1400)
    } else {
      patch(hid, () => ({ streak: 0, wrong: p.wrong + 1 }))
      elapsedRef.current += POINTS.wrongBurn * 1000
      sfx.wrong()
      say('🔥 Wrong! The fuse burns faster…')
      later(() => { nextQuestion(); setStep('asking'); runningRef.current = true }, 2400)
    }
  }

  function passTo(targetId) {
    sfx.pass()
    lastPasserRef.current = holderRef.current
    setHolder(targetId)
    nextQuestion()
    setStep('asking')
    runningRef.current = true
  }

  // ── explosion ──
  explodeRef.current = function explode() {
    if (!runningRef.current) return
    runningRef.current = false
    const hid = holderRef.current
    const p = playersRef.current.find(x => x.id === hid)
    if (!p) return
    if (p.shield) {
      sfx.shield()
      patch(hid, () => ({ shield: false }))
      say(`🛡️ ${p.name}'s shield saved them! The bomb flies away…`)
      armFuse()
      const next = randomOther(hid)
      lastPasserRef.current = hid
      setHolder(next); nextQuestion(); setStep('asking')
      later(() => { runningRef.current = true }, 900)
      return
    }
    sfx.boom()
    const passer = lastPasserRef.current
    const assist = passer && passer !== hid ? playersRef.current.find(x => x.id === passer) : null
    patch(hid, q => ({ pts: Math.max(0, q.pts - POINTS.boom), booms: q.booms + 1, streak: 0 }))
    pop(hid, `-${POINTS.boom}`)
    if (assist) { patch(assist.id, q => ({ pts: q.pts + POINTS.assist, assists: q.assists + 1 })); pop(assist.id, `+${POINTS.assist}`) }
    const done = roundsDone + 1
    setRoundsDone(done)
    setBoomInfo({ name: p.name, assist: assist ? assist.name : null, last: done >= totalRounds })
    setPhase('boom')
  }

  function nextAfterBoom() {
    if (boomInfo?.last) { sfx.fanfare(); setPhase('summary') } else { sfx.start(); startBomb(holderRef.current) }
  }
  function endNow() { runningRef.current = false; sfx.fanfare(); setPhase('summary') }
  function togglePause() {
    if (step !== 'asking') return
    runningRef.current = paused
    setPaused(p => !p)
  }

  // keyboard: A-D or 1-4 to answer
  useEffect(() => {
    function onKey(e) {
      if (phase !== 'play') return
      const k = e.key.toLowerCase()
      const i = ['a', 'b', 'c', 'd'].indexOf(k) >= 0 ? ['a', 'b', 'c', 'd'].indexOf(k) : ['1', '2', '3', '4'].indexOf(k)
      if (i >= 0 && question && i < question.options.length) answer(i)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // ── ranking ──
  const ranked = useMemo(
    () => [...players].sort((a, b) => b.pts - a.pts || b.correct - a.correct || a.booms - b.booms),
    [players]
  )
  const starsFor = (p, rank) => (p.pts > 0 ? [3, 2, 1][rank] || 0 : 0) + (p.correct >= 5 ? 1 : 0)

  async function awardStars() {
    if (awarded || readOnly || !onAwardStars) return
    setAwarded(true)
    for (let i = 0; i < ranked.length; i++) {
      const n = starsFor(ranked[i], i)
      if (n > 0) await onAwardStars(ranked[i].id, n, `Bomb Pass — ${i < 3 && ranked[i].pts > 0 ? ['1st', '2nd', '3rd'][i] + ' place' : 'great effort'}`)
    }
    sfx.correct()
  }

  const holderP = players.find(p => p.id === holder)

  // ───────────────────────── RENDER ─────────────────────────
  const shell = {
    position: 'fixed', inset: 0, zIndex: 200, background: '#14110f', color: '#f5efe6',
    display: 'flex', flexDirection: 'column', fontFamily: 'var(--font)',
  }
  const header = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', background: '#1a1814', borderBottom: '1px solid #2c2720' }}>
      <div style={{ fontSize: 22 }}>💣</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 17 }}>Bomb Pass</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#8a8378', letterSpacing: 1 }}>
          {cls?.name}{phase === 'play' || phase === 'boom' ? ` · BOMB ${Math.min(roundsDone + (phase === 'play' ? 1 : 0), totalRounds)} / ${totalRounds}` : ''}
        </div>
      </div>
      <button onClick={() => setSound(s => !s)} className="btn btn-ghost" style={{ color: '#a39b8f', fontSize: 18 }} title="Sound">{sound ? '🔊' : '🔇'}</button>
      {phase === 'play' && step === 'asking' && (
        <button onClick={togglePause} className="btn btn-outline" style={{ color: '#fbbf24', borderColor: '#4a3f2a' }}>{paused ? '▶ Resume' : '⏸ Pause'}</button>
      )}
      {(phase === 'play' || phase === 'boom') && (
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
          <div style={{ maxWidth: 820, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 22 }}>
              <div style={{ flex: '1 1 300px', background: '#1d1a16', border: '1px solid #2c2720', borderRadius: 14, padding: 16 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#8a8378', letterSpacing: 2, marginBottom: 8 }}>PLAYING TODAY · {active.length}{sitOut.length ? ` · ${sitOut.length} SITTING OUT` : ''}</div>
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
                ✅ Right answer: <b>+{POINTS.correct}</b> (+{POINTS.speed} if under {POINTS.speedWithin}s) and you <b>throw the bomb</b><br />
                ❌ Wrong: the hidden fuse burns faster<br />
                🔥 3 right in a row: earn a <b>🛡️ shield</b><br />
                🎯 Throw it at the player who then explodes: <b>+{POINTS.assist}</b><br />
                💥 Holding it when it explodes: <b>−{POINTS.boom}</b>
              </div>
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
                📘 There is no Bomb Pass question bank for {book?.label || 'this class'} yet — Real-Life English and General Knowledge questions are ready to play.
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
                <Chip key={c.id} title={c.desc} on={cats.includes(c.id)} onClick={() => setCats(cs => cs.includes(c.id) ? cs.filter(x => x !== c.id) : [...cs, c.id])}>{c.label}</Chip>
              ))}
            </Section>
            <Section title="Number of bombs (rounds)">
              {[3, 5, 8].map(n => <Chip key={n} on={totalRounds === n} onClick={() => setTotalRounds(n)}>💣 × {n}</Chip>)}
            </Section>
            <Section title="Fuse length (students never see the timer)">
              {Object.entries(FUSES).map(([k, f]) => <Chip key={k} on={fuseKey === k} onClick={() => setFuseKey(k)}>{f.label}</Chip>)}
            </Section>
            <Section title="After a right answer">
              <Chip on={chooseTarget} onClick={() => setChooseTarget(true)}>🎯 Student chooses who gets the bomb</Chip>
              <Chip on={!chooseTarget} onClick={() => setChooseTarget(false)}>🎲 Random</Chip>
            </Section>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
              <button className="btn btn-accent" disabled={!canStart} onClick={startGame}
                style={{ fontSize: 17, padding: '14px 34px', opacity: canStart ? 1 : 0.4 }}>💣 Start the game</button>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#8a8378' }}>
                {pool.length - reviewCount} questions ready{reviewCount ? ` + ${reviewCount} review` : ''}{active.length < 2 ? ' · need at least 2 players' : ''}{pool.length < 8 ? ' · pick more units or types' : ''}
              </span>
            </div>
            {readOnly && <div style={{ marginTop: 14, fontSize: 12, color: '#8a8378' }}>View only — stars and units will not be saved.</div>}
          </div>
        </div>
      </div>
    )
  }

  // ── SUMMARY ──
  if (phase === 'summary') {
    const podium = ranked.slice(0, 3)
    const order = [1, 0, 2].filter(i => podium[i])
    return (
      <div style={shell}>
        <style>{CSS}</style>
        {header}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} style={{ position: 'absolute', left: `${(i * 37) % 100}%`, top: 0, fontSize: 22, animation: `bpFall ${3 + (i % 5)}s linear ${(i % 7) * 0.3}s infinite` }}>{['🎉', '⭐', '🎊', '✨'][i % 4]}</div>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '26px 20px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 34, fontWeight: 800, marginBottom: 4 }}>🏆 Game over!</div>
            <div style={{ color: '#a39b8f', marginBottom: 24, fontSize: 14 }}>{roundsDone} bomb{roundsDone === 1 ? '' : 's'} exploded</div>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, marginBottom: 26 }}>
              {order.map(i => {
                const p = podium[i]
                const h = [150, 115, 90][i]
                return (
                  <div key={p.id} style={{ width: 170, animation: 'bpPop .5s both', animationDelay: `${(2 - i) * 0.25}s` }}>
                    <div style={{ fontSize: 30 }}>{MEDALS[i]}</div>
                    <div style={{ fontWeight: 800, fontSize: 17, margin: '2px 0 6px' }}>{p.name}</div>
                    <div style={{ height: h, borderRadius: '12px 12px 0 0', background: ['#d4900a', '#9ca3af', '#b45309'][i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#14110f' }}>{p.pts}</div>
                  </div>
                )
              })}
            </div>

            <div style={{ background: '#1d1a16', border: '1px solid #2c2720', borderRadius: 14, padding: 14, textAlign: 'left', marginBottom: 18 }}>
              {ranked.map((p, i) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', borderBottom: i < ranked.length - 1 ? '1px solid #2c2720' : 'none' }}>
                  <div style={{ width: 28, textAlign: 'center', fontFamily: 'var(--mono)', color: '#8a8378' }}>{MEDALS[i] || i + 1}</div>
                  <div style={{ flex: 1, fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#8a8378' }}>✅ {p.correct} · 🎯 {p.assists} · 💥 {p.booms}</div>
                  <div style={{ width: 52, textAlign: 'right', fontWeight: 800, color: '#fbbf24' }}>{p.pts}</div>
                  <div style={{ width: 52, textAlign: 'right', fontSize: 12, color: starsFor(p, i) ? '#fbbf24' : '#5c564c' }}>{starsFor(p, i) ? `+${starsFor(p, i)} ⭐` : '—'}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#8a8378', fontFamily: 'var(--mono)', marginBottom: 14 }}>
              STARS: 🥇 3 · 🥈 2 · 🥉 1 (need points) · +1 for 5 or more correct answers
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-accent" disabled={awarded || readOnly} onClick={awardStars} style={{ fontSize: 15, padding: '12px 26px', opacity: awarded || readOnly ? 0.5 : 1 }}>
                {readOnly ? 'View only' : awarded ? '✅ Stars awarded!' : '⭐ Award stars to the class'}
              </button>
              <button className="btn btn-outline" onClick={() => setPhase('setup')} style={{ color: '#f5efe6', borderColor: '#3a342c' }}>🔁 Play again</button>
              <button className="btn btn-outline" onClick={onClose} style={{ color: '#f5efe6', borderColor: '#3a342c' }}>Close</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── PLAY / BOOM ──
  const hot = heat > 0.75
  const tipHeat = Math.min(1, heat)
  return (
    <div style={shell}>
      <style>{CSS}</style>
      {header}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, flexWrap: 'wrap' }}>
        {/* MAIN */}
        <div style={{ flex: '1 1 520px', minWidth: 0, display: 'flex', flexDirection: 'column', padding: '18px 22px', overflowY: 'auto', position: 'relative' }}>
          {/* holder + bomb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 14 }}>
            <div style={{
              fontSize: 64, lineHeight: 1, filter: `drop-shadow(0 0 ${6 + tipHeat * 26}px rgba(239,68,68,${0.25 + tipHeat * 0.75}))`,
              animation: `${hot ? 'bpShake .35s' : `bpPulse ${(1.1 - tipHeat * 0.75).toFixed(2)}s`} infinite`,
            }}>💣</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 3, color: '#8a8378' }}>THE BOMB IS WITH</div>
              <div style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 900, color: '#fbbf24', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {holderP?.name} {holderP?.shield && <span title="Shield">🛡️</span>}
              </div>
            </div>
            {/* heat strip — a vague glow, not an exact timer */}
            <div style={{ width: 14, alignSelf: 'stretch', borderRadius: 8, background: '#2a2620', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
              <div style={{ width: '100%', height: `${Math.round(tipHeat * 100)}%`, background: 'linear-gradient(#fbbf24,#ef4444)', transition: 'height .2s' }} />
            </div>
          </div>

          {/* toast */}
          <div style={{ minHeight: 30, marginBottom: 8, textAlign: 'center' }}>
            {toast && <span key={toast.k} style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 999, background: 'rgba(251,191,36,0.14)', color: '#fbbf24', fontWeight: 700, fontSize: 14, animation: 'bpPop .3s both' }}>{toast.text}</span>}
          </div>

          {/* question */}
          {question && (
            <div style={{ opacity: paused ? 0.15 : 1, transition: 'opacity .2s' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2, color: '#8a8378', marginBottom: 8 }}>
                {question.category === 'book' ? `📘 UNIT ${question.unit}` : question.category === 'review' ? `🔁 REVIEW · ${BOOKS[question.slug]?.label || ''} · UNIT ${question.unit}` : question.category === 'real' ? '🗣️ REAL-LIFE ENGLISH' : '🌍 GENERAL KNOWLEDGE'}
              </div>
              <div style={{ fontSize: 'clamp(22px, 3.4vw, 38px)', fontWeight: 800, lineHeight: 1.25, marginBottom: 18 }}>{question.q}</div>
              <div style={{ display: 'grid', gridTemplateColumns: question.options.length === 2 ? '1fr 1fr' : 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
                {question.options.map((o, i) => {
                  const isRight = o === question.correct
                  const show = step !== 'asking'
                  let bg = '#1d1a16', bd = '#3a342c', col = '#f5efe6'
                  if (show && isRight) { bg = 'rgba(34,197,94,0.2)'; bd = '#22c55e' }
                  else if (show && picked === i) { bg = 'rgba(239,68,68,0.22)'; bd = '#ef4444' }
                  else if (show) col = '#6b645a'
                  return (
                    <button key={i} className="bp-opt" disabled={step !== 'asking' || paused} onClick={() => answer(i)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', cursor: step === 'asking' ? 'pointer' : 'default', padding: '14px 16px', borderRadius: 14, border: `2px solid ${bd}`, background: bg, color: col, fontFamily: 'var(--font)', fontSize: 'clamp(16px, 2.2vw, 24px)', fontWeight: 700 }}>
                      <span style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 10, background: '#2a2620', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 15, color: '#fbbf24' }}>{question.tf ? (i === 0 ? '✔' : '✘') : LETTERS[i]}</span>
                      <span>{o}</span>
                    </button>
                  )
                })}
              </div>
              {step === 'reveal' && picked !== null && question.options[picked] !== question.correct && (
                <div style={{ marginTop: 14, padding: '12px 16px', borderRadius: 12, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', fontSize: 17 }}>
                  ✅ Correct answer: <b>{question.correct}</b>{question.tip ? <span style={{ color: '#a7c9b0' }}> — {question.tip}</span> : null}
                </div>
              )}
              {step === 'reveal' && picked !== null && question.options[picked] === question.correct && question.tip && (
                <div style={{ marginTop: 14, fontSize: 15, color: '#a7c9b0' }}>💡 {question.tip}</div>
              )}
            </div>
          )}
          {paused && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46, fontWeight: 900, color: '#fbbf24' }}>⏸ PAUSED</div>}
          <div style={{ marginTop: 'auto', paddingTop: 14, fontFamily: 'var(--mono)', fontSize: 10, color: '#5c564c' }}>
            Tap the answer the student says out loud · or press A B C D
          </div>
        </div>

        {/* LEADERBOARD */}
        <div style={{ flex: '0 0 300px', maxWidth: '100%', background: '#1a1814', borderLeft: '1px solid #2c2720', padding: 14, overflowY: 'auto', flexGrow: 0 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 3, color: '#8a8378', marginBottom: 10 }}>LEADERBOARD</div>
          {ranked.map((p, i) => {
            const isHolder = p.id === holder
            return (
              <div key={p.id} style={{
                position: 'relative', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', marginBottom: 6, borderRadius: 11,
                background: isHolder ? 'rgba(239,68,68,0.16)' : '#221f1a', border: `1.5px solid ${isHolder ? '#ef4444' : 'transparent'}`,
              }}>
                <div style={{ width: 26, textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 13, color: '#8a8378' }}>{MEDALS[i] || i + 1}</div>
                <div style={{ flex: 1, minWidth: 0, fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {isHolder && '💣 '}{p.name}
                </div>
                <div style={{ fontSize: 12 }}>{p.shield ? '🛡️' : ''}{p.streak >= 2 ? `🔥${p.streak}` : ''}</div>
                <div style={{ width: 40, textAlign: 'right', fontWeight: 800, color: '#fbbf24' }}>{p.pts}</div>
                {phase === 'play' && step === 'asking' && (
                  <button onClick={() => askRemove(p.id)} title="Sit out — doesn't want to play"
                    style={{ cursor: 'pointer', flexShrink: 0, border: 'none', borderRadius: 6, padding: confirmRemove === p.id ? '3px 7px' : '3px 6px', fontSize: confirmRemove === p.id ? 10 : 12, fontWeight: 700,
                      background: confirmRemove === p.id ? '#ef4444' : 'transparent', color: confirmRemove === p.id ? '#fff' : '#6b645a' }}>
                    {confirmRemove === p.id ? 'Sit out?' : '✕'}
                  </button>
                )}
                {flash[p.id] && (
                  <div style={{ position: 'absolute', right: 56, top: -2, fontWeight: 900, fontSize: 16, color: flash[p.id].startsWith('+') ? '#4ade80' : '#f87171', animation: 'bpFloat 1.5s forwards' }}>{flash[p.id]}</div>
                )}
              </div>
            )
          })}
          {sitOut.length > 0 && present.some(s => sitOut.includes(s.id)) && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 3, color: '#6b645a', marginBottom: 8 }}>SITTING OUT</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {present.filter(s => sitOut.includes(s.id)).map(s => (
                  <button key={s.id} onClick={() => addBack(s.id)} title="Bring back into the game"
                    style={{ cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12, padding: '4px 10px', borderRadius: 999, border: '1px solid #3a342c', background: 'transparent', color: '#a39b8f' }}>
                    ↩ {s.nameEn}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CHOOSE TARGET */}
      {phase === 'play' && step === 'choose' && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,8,6,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 5 }}>
          <div style={{ maxWidth: 760, width: '100%', textAlign: 'center', animation: 'bpPop .3s both' }}>
            <div style={{ fontSize: 30, fontWeight: 900, color: '#4ade80', marginBottom: 4 }}>✅ Correct, {holderP?.name}!</div>
            <div style={{ fontSize: 20, marginBottom: 18 }}>🎯 Who gets the bomb?</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              {players.filter(p => p.id !== holder).map(p => (
                <button key={p.id} onClick={() => passTo(p.id)} style={{ cursor: 'pointer', padding: '14px 22px', borderRadius: 14, border: '2px solid #3a342c', background: '#1d1a16', color: '#f5efe6', fontFamily: 'var(--font)', fontSize: 20, fontWeight: 800 }}>
                  {p.name}{p.shield ? ' 🛡️' : ''}
                </button>
              ))}
              <button onClick={() => passTo(randomOther(holder))} style={{ cursor: 'pointer', padding: '14px 22px', borderRadius: 14, border: '2px solid #f59e0b', background: 'rgba(245,158,11,0.15)', color: '#fbbf24', fontFamily: 'var(--font)', fontSize: 20, fontWeight: 800 }}>🎲 Random</button>
            </div>
          </div>
        </div>
      )}

      {/* BOOM */}
      {phase === 'boom' && boomInfo && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,6,6,0.94)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 6, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(#fde68a, #f97316 45%, transparent 70%)', animation: 'bpBoom .9s ease-out forwards' }} />
          <div style={{ position: 'relative', textAlign: 'center', animation: 'bpShake .5s 2' }}>
            <div style={{ fontSize: 'clamp(60px, 14vw, 130px)', fontWeight: 900, color: '#ef4444', lineHeight: 1 }}>💥 BOOM!</div>
            <div style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, margin: '10px 0 4px' }}>{boomInfo.name} <span style={{ color: '#f87171' }}>−{POINTS.boom}</span></div>
            {boomInfo.assist && <div style={{ fontSize: 20, color: '#4ade80', marginBottom: 6 }}>🎯 {boomInfo.assist} threw it — +{POINTS.assist}</div>}
            <button className="btn btn-accent" onClick={nextAfterBoom} style={{ marginTop: 22, fontSize: 18, padding: '14px 34px' }}>
              {boomInfo.last ? '🏆 See the results' : '💣 Next bomb'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

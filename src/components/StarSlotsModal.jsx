import { useState, useEffect, useRef } from 'react'
import { initials } from '../lib/utils'

// ── Slot symbols with weights (lower weight = rarer)
const SYMBOLS = [
  { id: 'cherry', icon: '🍒', label: 'Cherry',  weight: 30 },
  { id: 'bell',   icon: '🔔', label: 'Bell',    weight: 25 },
  { id: 'lemon',  icon: '🍋', label: 'Lemon',   weight: 20 },
  { id: 'star',   icon: '⭐', label: 'Star',    weight: 15 },
  { id: 'seven',  icon: '7️⃣', label: 'Seven',   weight: 8  },
  { id: 'diamond',icon: '💎', label: 'Diamond', weight: 2  },
]

const THREE_MULT = { cherry: 2, bell: 3, lemon: 4, star: 6, seven: 10, diamond: 25 }

function weightedRandom() {
  const total = SYMBOLS.reduce((s, sym) => s + sym.weight, 0)
  let r = Math.random() * total
  for (const sym of SYMBOLS) { r -= sym.weight; if (r <= 0) return sym }
  return SYMBOLS[0]
}

function evalResult(reels, bet, leverage) {
  const [a, b, c] = reels
  if (a.id === b.id && b.id === c.id) {
    const gross = Math.floor(bet * leverage * THREE_MULT[a.id])
    return { type: 'three', gross, net: gross - bet, label: `3× ${a.icon} — JACKPOT!` }
  }
  if (a.id === b.id || b.id === c.id || a.id === c.id) {
    const gross = Math.floor(bet * leverage * 0.5)
    return { type: 'two', gross, net: gross - bet, label: 'Pair — small win' }
  }
  return { type: 'none', gross: 0, net: -bet, label: 'No match — bust!' }
}

// ── Web Audio Sound Engine ──────────────────────────────────────────────────
function createAudioContext() {
  try {
    return new (window.AudioContext || window.webkitAudioContext)()
  } catch (e) { return null }
}

function playSpinSound(ctx, stopRef) {
  if (!ctx) return
  let running = true
  stopRef.current = () => { running = false }
  function tick() {
    if (!running) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'square'
    osc.frequency.setValueAtTime(80 + Math.random() * 40, ctx.currentTime)
    gain.gain.setValueAtTime(0.06, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.04)
    if (running) setTimeout(tick, 80 + Math.random() * 40)
  }
  tick()
}

function playReelStopSound(ctx, reelIndex) {
  if (!ctx) return
  const freqs = [180, 220, 260]
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freqs[reelIndex], ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(freqs[reelIndex] * 0.6, ctx.currentTime + 0.15)
  gain.gain.setValueAtTime(0.3, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.2)
}

function playWinSound(ctx, type) {
  if (!ctx) return
  if (type === 'three') {
    const notes = [523, 659, 784, 1047, 1319]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'triangle'
      const t = ctx.currentTime + i * 0.12
      osc.frequency.setValueAtTime(freq, t)
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.35, t + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
      osc.start(t)
      osc.stop(t + 0.35)
    })
    setTimeout(() => {
      [1047, 1319, 1568, 2093].forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        const t = ctx.currentTime + i * 0.08
        osc.frequency.setValueAtTime(freq, t)
        gain.gain.setValueAtTime(0.15, t)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25)
        osc.start(t)
        osc.stop(t + 0.25)
      })
    }, 650)
  } else if (type === 'two') {
    [523, 659].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      const t = ctx.currentTime + i * 0.15
      osc.frequency.setValueAtTime(freq, t)
      gain.gain.setValueAtTime(0.25, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
      osc.start(t)
      osc.stop(t + 0.3)
    })
  }
}

function playLoseSound(ctx) {
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(300, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5)
  gain.gain.setValueAtTime(0.2, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.55)
  setTimeout(() => {
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.type = 'sawtooth'
    osc2.frequency.setValueAtTime(200, ctx.currentTime)
    osc2.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4)
    gain2.gain.setValueAtTime(0.15, ctx.currentTime)
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45)
    osc2.start(ctx.currentTime)
    osc2.stop(ctx.currentTime + 0.45)
  }, 200)
}

function playStarChime(ctx) {
  if (!ctx) return
  const notes = [784, 988, 1175, 1568]
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    const t = ctx.currentTime + i * 0.1
    osc.frequency.setValueAtTime(freq, t)
    gain.gain.setValueAtTime(0.2, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
    osc.start(t)
    osc.stop(t + 0.3)
  })
}
// ───────────────────────────────────────────────────────────────────────────

export default function StarSlotsModal({ cls, students, onAwardStars, onClose, readOnly }) {
  const [phase, setPhase]               = useState('select')
  const [selectedStudent, setSelected]  = useState(null)
  const [bet, setBet]                   = useState(1)
  const [leverage, setLeverage]         = useState(1)
  const [reels, setReels]               = useState([SYMBOLS[0], SYMBOLS[1], SYMBOLS[2]])
  const [result, setResult]             = useState(null)
  const [spinning, setSpinning]         = useState(false)
  const [saving, setSaving]             = useState(false)
  const [history, setHistory]           = useState([])

  const [reel0, setReel0] = useState(SYMBOLS[0])
  const [reel1, setReel1] = useState(SYMBOLS[1])
  const [reel2, setReel2] = useState(SYMBOLS[2])
  const spinTimers = useRef([])

  const audioCtxRef = useRef(null)
  const stopSpinRef = useRef(null)

  function getAudioCtx() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = createAudioContext()
    }
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }

  useEffect(() => {
    return () => {
      if (stopSpinRef.current) stopSpinRef.current()
      if (audioCtxRef.current) audioCtxRef.current.close()
    }
  }, [])

  const eligible = students.filter(s => s.nameEn)
  function getStars(s) { return s?.totalStars ?? 0 }

  function doSpin() {
    if (spinning || saving) return
    const stars = getStars(selectedStudent)
    if (stars < bet) return

    setSpinning(true)
    setResult(null)

    const ctx = getAudioCtx()
    playSpinSound(ctx, stopSpinRef)

    const finalReels = [weightedRandom(), weightedRandom(), weightedRandom()]
    const outcome    = evalResult(finalReels, bet, leverage)

    const REEL_DURATION = [1200, 1800, 2400]
    const setters = [setReel0, setReel1, setReel2]

    const intervals = setters.map((setter, i) => {
      const interval = setInterval(() => setter(weightedRandom()), 80 + i * 20)
      return interval
    })
    spinTimers.current = intervals

    REEL_DURATION.forEach((dur, i) => {
      setTimeout(() => {
        clearInterval(intervals[i])
        setters[i](finalReels[i])
        playReelStopSound(getAudioCtx(), i)

        if (i === 2) {
          if (stopSpinRef.current) { stopSpinRef.current(); stopSpinRef.current = null }
          setReels(finalReels)
          setResult(outcome)
          setSpinning(false)

          setTimeout(() => {
            const c = getAudioCtx()
            if (outcome.type !== 'none') {
              playWinSound(c, outcome.type)
            } else {
              playLoseSound(c)
            }
          }, 150)
        }
      }, dur)
    })
  }

  async function confirmResult() {
    if (!result || saving || readOnly) return
    setSaving(true)
    const net = result.net
    const label = `🎰 Star Slots — ${result.label} (${leverage}x leverage, bet: ${bet}⭐)`
    await onAwardStars(selectedStudent.id, net, label)

    playStarChime(getAudioCtx())

    setHistory(h => [{
      name: selectedStudent.nameEn,
      reels: [...reels],
      result,
      bet,
      leverage,
    }, ...h].slice(0, 5))

    setSaving(false)
    setPhase('result')
  }

  function playAgain() {
    setPhase('bet')
    setResult(null)
    setReel0(SYMBOLS[0]); setReel1(SYMBOLS[1]); setReel2(SYMBOLS[2])
  }

  function changePlayer() {
    setPhase('select')
    setSelected(null)
    setResult(null)
    setBet(1)
    setLeverage(1)
  }

  const stars = getStars(selectedStudent)
  const maxBet = Math.min(stars, 20)
  const leverageColor = leverage === 1 ? 'var(--green)' : leverage === 2 ? 'var(--gold)' : 'var(--red)'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <style>{`
        @keyframes slotPop { from { transform: scale(0.7); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        @keyframes reelSpin { 0%{transform:translateY(-4px)} 50%{transform:translateY(4px)} 100%{transform:translateY(-4px)} }
        @keyframes winPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        .slot-pop { animation: slotPop 0.25s cubic-bezier(.34,1.56,.64,1) both }
        .reel-spin { animation: reelSpin 0.12s linear infinite }
        .win-pulse { animation: winPulse 0.6s ease-in-out infinite }
      `}</style>

      <div className="modal"
        style={{ maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', padding: 0 }}
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER */}
        <div style={{ background: 'var(--text)', color: '#fff', padding: '18px 22px', borderRadius: '20px 20px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800 }}>🎰 Star Slots</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 2, marginTop: 2 }}>
              {cls?.name} · Risk &amp; Reward Game
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>×</button>
        </div>

        <div style={{ padding: '20px 22px' }}>

          {/* SELECT PLAYER */}
          {phase === 'select' && (
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 3, color: 'var(--muted)', marginBottom: 14 }}>SELECT PLAYER</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {eligible.map(s => (
                  <div key={s.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.15s' }}
                    onClick={() => { setSelected(s); setPhase('bet') }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff' }}>
                      {initials(s.nameEn)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{s.nameEn}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--gold)', fontWeight: 700 }}>
                      {getStars(s)} ⭐
                    </div>
                  </div>
                ))}
              </div>

              {history.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 3, color: 'var(--muted)', marginBottom: 10 }}>RECENT SPINS</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {history.map((h, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: 'var(--surface2)', fontSize: 11 }}>
                        <span style={{ fontWeight: 700, flex: 1 }}>{h.name}</span>
                        <span>{h.reels.map(r => r.icon).join(' ')}</span>
                        <span style={{ fontFamily: 'var(--mono)', color: h.result.net >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>
                          {h.result.net >= 0 ? '+' : ''}{h.result.net}⭐
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BET SETUP */}
          {phase === 'bet' && selectedStudent && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: 'var(--surface2)', border: '1px solid var(--border)', marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff' }}>
                  {initials(selectedStudent.nameEn)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{selectedStudent.nameEn}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--gold)' }}>{stars} ⭐ available</div>
                </div>
                <button className="btn btn-outline" style={{ fontSize: 11, padding: '4px 10px' }} onClick={changePlayer}>Change</button>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2, color: 'var(--muted)' }}>BET AMOUNT</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: 'var(--gold)' }}>{bet} ⭐</div>
                </div>
                <input type="range" min={1} max={maxBet || 1} value={bet}
                  onChange={e => setBet(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--gold)' }}
                  disabled={maxBet < 1}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)' }}>1</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)' }}>{maxBet || 1} max</span>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2, color: 'var(--muted)', marginBottom: 8 }}>LEVERAGE (RISK MULTIPLIER)</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 5].map(lv => (
                    <button key={lv}
                      onClick={() => setLeverage(lv)}
                      style={{
                        flex: 1, padding: '10px', borderRadius: 10, border: '2px solid',
                        borderColor: leverage === lv ? leverageColor : 'var(--border)',
                        background: leverage === lv ? `${leverageColor}22` : 'var(--surface2)',
                        fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 800,
                        color: leverage === lv ? leverageColor : 'var(--muted)',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      {lv}×
                      <div style={{ fontSize: 8, marginTop: 2, letterSpacing: 1 }}>
                        {lv === 1 ? 'SAFE' : lv === 2 ? 'RISKY' : 'YOLO'}
                      </div>
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 8, fontFamily: 'var(--mono)', fontSize: 10, color: leverageColor, textAlign: 'center' }}>
                  Best case win: +{Math.floor(bet * leverage * THREE_MULT['diamond']) - bet} ⭐ &nbsp;·&nbsp; Worst case: −{bet} ⭐
                </div>
              </div>

              <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: '12px 14px', marginBottom: 20, border: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, marginBottom: 8 }}>PAYOUT TABLE (with {leverage}× leverage)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {SYMBOLS.slice().reverse().map(sym => (
                    <div key={sym.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                      <span style={{ fontSize: 14 }}>{sym.icon}{sym.icon}{sym.icon}</span>
                      <span style={{ flex: 1, color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 10 }}>{sym.label}</span>
                      <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: sym.id === 'diamond' ? 'var(--gold)' : 'var(--text)' }}>
                        +{Math.floor(bet * leverage * THREE_MULT[sym.id]) - bet} ⭐
                      </span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, borderTop: '1px solid var(--border)', paddingTop: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 14 }}>Any pair</span>
                    <span style={{ flex: 1, color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 10 }}>2 matching</span>
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--muted)' }}>
                      {Math.floor(bet * leverage * 0.5) - bet >= 0 ? '+' : ''}{Math.floor(bet * leverage * 0.5) - bet} ⭐
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                    <span style={{ fontSize: 14 }}>No match</span>
                    <span style={{ flex: 1, color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 10 }}>Bust</span>
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--red)' }}>−{bet} ⭐</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => { setPhase('spinning'); doSpin() }}
                disabled={stars < bet}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12,
                  background: stars < bet ? 'var(--border)' : 'linear-gradient(135deg,#f5a623,#d4900a)',
                  color: stars < bet ? 'var(--muted)' : '#1a1814',
                  border: 'none', fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 800,
                  cursor: stars < bet ? 'not-allowed' : 'pointer',
                  letterSpacing: 2, transition: 'all 0.15s',
                  boxShadow: stars < bet ? 'none' : '0 4px 0 #a05a20',
                }}
              >
                {stars < bet ? '⭐ Not enough stars' : `🎰 SPIN — Bet ${bet}⭐ × ${leverage}×`}
              </button>
            </div>
          )}

          {/* SPINNING + RESULT */}
          {(phase === 'spinning' || phase === 'result') && selectedStudent && (
            <div className="slot-pop" style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff' }}>
                  {initials(selectedStudent.nameEn)}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{selectedStudent.nameEn}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--gold)' }}>{bet}⭐ × {leverage}×</div>
              </div>

              <div style={{
                display: 'flex', gap: 8, justifyContent: 'center',
                background: '#1a1814', borderRadius: 16, padding: '24px 20px',
                marginBottom: 20, border: '3px solid var(--gold)',
                boxShadow: '0 0 30px rgba(212,144,10,0.2)',
              }}>
                {[reel0, reel1, reel2].map((sym, i) => (
                  <div key={i} style={{
                    width: 80, height: 80, borderRadius: 12,
                    background: 'var(--surface2)',
                    border: result && result.type !== 'none' && reels[i]?.id === (result.type === 'three' ? reels[0].id : null) ? '2px solid var(--gold)' : '2px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 40,
                    animation: spinning ? 'reelSpin 0.12s linear infinite' : 'none',
                  }}>
                    {sym.icon}
                  </div>
                ))}
              </div>

              {result && !saving && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{
                    fontSize: 18, fontWeight: 800, marginBottom: 6,
                    color: result.type === 'none' ? 'var(--red)' : result.type === 'two' ? 'var(--gold)' : 'var(--green)',
                    animation: result.type !== 'none' ? 'winPulse 0.6s ease-in-out infinite' : 'none',
                  }}>
                    {result.type === 'three' ? '🎉 ' : result.type === 'two' ? '✨ ' : '💸 '}
                    {result.label}
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: result.net >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>
                    {result.net >= 0 ? '+' : ''}{result.net} ⭐ &nbsp;·&nbsp; {stars} → {stars + result.net} ⭐
                  </div>
                  <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)', fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
                    {result.type === 'none' && leverage === 5 && '⚠️ High leverage amplified your loss. Risk management matters.'}
                    {result.type === 'none' && leverage === 2 && '📉 A loss at 2× leverage. How does it feel compared to 1×?'}
                    {result.type === 'none' && leverage === 1 && '😌 A small loss — safe leverage protected you from bigger damage.'}
                    {result.type === 'two'  && '✅ A cautious win. Pairs pay less but they\'re more common.'}
                    {result.type === 'three' && leverage === 5 && '🚀 High risk, high reward — 5× leverage paid off this time!'}
                    {result.type === 'three' && leverage < 5  && '🎯 Smart play — a clean win!'}
                  </div>
                </div>
              )}

              {result && !saving && (
                readOnly ? (
                  <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: 1 }}>
                    👁 VIEW ONLY — teacher records the result
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                    <button className="btn btn-accent" onClick={confirmResult} disabled={saving} style={{ padding: '12px', fontSize: 13, fontWeight: 700 }}>
                      {saving ? 'Saving...' : `✅ Confirm — Update ${selectedStudent.nameEn}'s stars`}
                    </button>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-outline" style={{ flex: 1 }} onClick={changePlayer}>Change Player</button>
                      <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>End Game</button>
                    </div>
                  </div>
                )
              )}

              {saving && (
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', textAlign: 'center', padding: 16 }}>
                  Updating stars...
                </div>
              )}
            </div>
          )}

          {/* SAVED RESULT */}
          {phase === 'result' && (
            <div className="slot-pop" style={{ textAlign: 'center', paddingTop: 8 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>
                {result?.type === 'three' ? '🏆' : result?.type === 'two' ? '✨' : '💸'}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6, color: result?.net >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {result?.net >= 0 ? 'Winner!' : 'Busted!'}
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>
                Stars updated in {selectedStudent?.nameEn}'s profile ✓
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-accent" onClick={playAgain}>🎰 Same Player — Spin Again</button>
                <button className="btn btn-outline" onClick={changePlayer}>👥 Different Player</button>
                <button className="btn btn-outline" onClick={onClose}>End Game</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

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

// Win multipliers
// 3 of a kind: symbol-specific bonus × leverage
// 2 of a kind: flat 0.5× bet back × leverage (partial win)
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

export default function StarSlotsModal({ cls, students, onAwardStars, onClose, readOnly }) {
  // ── phases: select | bet | spinning | result
  const [phase, setPhase]               = useState('select')
  const [selectedStudent, setSelected]  = useState(null)
  const [bet, setBet]                   = useState(1)
  const [leverage, setLeverage]         = useState(1)
  const [reels, setReels]               = useState([SYMBOLS[0], SYMBOLS[1], SYMBOLS[2]])
  const [result, setResult]             = useState(null)
  const [spinning, setSpinning]         = useState(false)
  const [saving, setSaving]             = useState(false)
  const [history, setHistory]           = useState([]) // last 5 results

  // Reel animation state — each reel has its own symbol cycling
  const [reel0, setReel0] = useState(SYMBOLS[0])
  const [reel1, setReel1] = useState(SYMBOLS[1])
  const [reel2, setReel2] = useState(SYMBOLS[2])
  const spinTimers = useRef([])

  const eligible = students.filter(s => s.nameEn)

  function getStars(s) { return s?.totalStars ?? 0 }

  // ── SPIN
  function doSpin() {
    if (spinning || saving) return
    const stars = getStars(selectedStudent)
    if (stars < bet) return

    setSpinning(true)
    setResult(null)

    // Pick final outcome now
    const finalReels = [weightedRandom(), weightedRandom(), weightedRandom()]
    const outcome    = evalResult(finalReels, bet, leverage)

    // Animate each reel stopping at different times
    const REEL_DURATION = [1200, 1800, 2400]
    const setters = [setReel0, setReel1, setReel2]

    // Fast cycling
    const intervals = setters.map((setter, i) => {
      const interval = setInterval(() => setter(weightedRandom()), 80 + i * 20)
      return interval
    })

    spinTimers.current = intervals

    // Stop each reel in sequence
    REEL_DURATION.forEach((dur, i) => {
      setTimeout(() => {
        clearInterval(intervals[i])
        setters[i](finalReels[i])
        if (i === 2) {
          // All done
          setReels(finalReels)
          setResult(outcome)
          setSpinning(false)
        }
      }, dur)
    })
  }

  // ── CONFIRM RESULT (save to Firebase)
  async function confirmResult() {
    if (!result || saving || readOnly) return
    setSaving(true)

    const net = result.net
    const label = `🎰 Star Slots — ${result.label} (${leverage}x leverage, bet: ${bet}⭐)`

    // We always deduct bet first, then add winnings
    // net can be negative (loss), zero or positive (win)
    // We use onAwardStars with negative for losses
    await onAwardStars(selectedStudent.id, net, label)

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
  const potentialWin = selectedStudent
    ? Math.floor(bet * leverage * THREE_MULT['diamond']) // show best case
    : 0

  // Leverage risk colour
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
        {/* ── HEADER ── */}
        <div style={{ background: 'var(--text)', color: '#fff', padding: '18px 22px', borderRadius: '20px 20px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800 }}>🎰 Star Slots</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginTop: 2 }}>
              {cls?.name?.toUpperCase()} · BET YOUR STARS · HIGH RISK HIGH REWARD
            </div>
          </div>
          <button className="btn-ghost" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }} onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '22px 22px 28px' }}>

          {/* ══ SELECT PLAYER ══ */}
          {phase === 'select' && (
            <div className="slot-pop">
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: 3, marginBottom: 16 }}>SELECT PLAYER</div>

              {eligible.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 40, fontFamily: 'var(--mono)', fontSize: 12 }}>
                  No students in this class yet.
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 380, overflowY: 'auto' }}>
                {eligible.map(s => {
                  const st = getStars(s)
                  const broke = st < 1
                  return (
                    <div key={s.id}
                      onClick={() => { if (!broke) { setSelected(s); setPhase('bet'); setBet(1); setLeverage(1) } }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 14px', borderRadius: 12,
                        background: 'var(--surface2)',
                        border: '1.5px solid var(--border)',
                        cursor: broke ? 'not-allowed' : 'pointer',
                        opacity: broke ? 0.45 : 1,
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { if (!broke) e.currentTarget.style.borderColor = 'var(--gold)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                        {initials(s.nameEn)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{s.nameEn}</div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                          {broke ? '💸 No stars — earn more in class first' : `${st} ⭐ available to bet`}
                        </div>
                      </div>
                      {!broke && (
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: 'var(--gold)' }}>
                          {st} ⭐
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Recent history */}
              {history.length > 0 && (
                <div style={{ marginTop: 20, padding: '12px 14px', background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, marginBottom: 8 }}>RECENT RESULTS</div>
                  {history.map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>
                      <span>{h.reels.map(r => r.icon).join('')}</span>
                      <span style={{ fontWeight: 600, color: h.result.net >= 0 ? 'var(--green)' : 'var(--red)' }}>
                        {h.result.net >= 0 ? '+' : ''}{h.result.net}⭐
                      </span>
                      <span>{h.name}</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 9 }}>{h.leverage}x</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ BET & LEVERAGE ══ */}
          {phase === 'bet' && selectedStudent && (
            <div className="slot-pop">
              {/* Player info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--surface2)', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 22 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff' }}>
                  {initials(selectedStudent.nameEn)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{selectedStudent.nameEn}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--gold)' }}>{stars} ⭐ available</div>
                </div>
                <button className="btn-ghost" style={{ fontSize: 12, color: 'var(--muted)' }} onClick={changePlayer}>change</button>
              </div>

              {/* BET */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: 2, marginBottom: 10 }}>BET AMOUNT</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[1, 2, 3, 5, 10].filter(b => b <= maxBet).map(b => (
                    <button key={b}
                      onClick={() => setBet(b)}
                      style={{
                        padding: '8px 16px', borderRadius: 10, border: '2px solid',
                        borderColor: bet === b ? 'var(--gold)' : 'var(--border)',
                        background: bet === b ? 'rgba(212,144,10,0.12)' : 'var(--surface2)',
                        color: bet === b ? 'var(--gold)' : 'var(--text)',
                        fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700,
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >{b} ⭐</button>
                  ))}
                  {maxBet > 10 && (
                    <button
                      onClick={() => setBet(maxBet)}
                      style={{
                        padding: '8px 16px', borderRadius: 10, border: '2px solid',
                        borderColor: bet === maxBet ? 'var(--red)' : 'var(--border)',
                        background: bet === maxBet ? 'rgba(214,59,59,0.1)' : 'var(--surface2)',
                        color: bet === maxBet ? 'var(--red)' : 'var(--text)',
                        fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700,
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >ALL IN ({maxBet} ⭐)</button>
                  )}
                </div>
              </div>

              {/* LEVERAGE */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: 2, marginBottom: 10 }}>
                  LEVERAGE &nbsp;<span style={{ color: leverageColor, fontWeight: 700 }}>{leverage}×</span>
                  <span style={{ color: 'var(--muted)', fontWeight: 400, marginLeft: 8 }}>
                    {leverage === 1 ? '— Safe play' : leverage === 2 ? '— Medium risk' : '— MAX RISK ⚠️'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { val: 1, label: '1×', sub: 'Safe',   color: 'var(--green)' },
                    { val: 2, label: '2×', sub: 'Medium', color: 'var(--gold)'  },
                    { val: 5, label: '5×', sub: 'Max',    color: 'var(--red)'   },
                  ].map(lev => (
                    <button key={lev.val}
                      onClick={() => setLeverage(lev.val)}
                      style={{
                        flex: 1, padding: '10px 8px', borderRadius: 10, border: '2px solid',
                        borderColor: leverage === lev.val ? lev.color : 'var(--border)',
                        background: leverage === lev.val ? `rgba(0,0,0,0.06)` : 'var(--surface2)',
                        cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center',
                      }}
                    >
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 800, color: lev.color }}>{lev.label}</div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', marginTop: 2 }}>{lev.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* PAYOUT TABLE */}
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

              {/* SPIN BUTTON */}
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

          {/* ══ SPINNING + RESULT ══ */}
          {(phase === 'spinning' || phase === 'result') && selectedStudent && (
            <div className="slot-pop" style={{ textAlign: 'center' }}>
              {/* Player */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff' }}>
                  {initials(selectedStudent.nameEn)}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{selectedStudent.nameEn}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--gold)' }}>{bet}⭐ × {leverage}×</div>
              </div>

              {/* REELS */}
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
                    className: spinning ? 'reel-spin' : '',
                    animation: spinning ? 'reelSpin 0.12s linear infinite' : 'none',
                  }}>
                    {sym.icon}
                  </div>
                ))}
              </div>

              {/* RESULT DISPLAY */}
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

                  {/* Risk management lesson */}
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

              {/* CONFIRM / ACTIONS */}
              {result && !saving && (
                readOnly ? (
                  <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: 1 }}>
                    👁 VIEW ONLY — teacher records the result
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                    <button
                      className="btn btn-accent"
                      onClick={confirmResult}
                      disabled={saving}
                      style={{ padding: '12px', fontSize: 13, fontWeight: 700 }}
                    >
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

          {/* ══ SAVED RESULT ══ */}
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

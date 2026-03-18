import { useState, useRef, useEffect } from 'react'
import { initials } from '../lib/utils'
import { getRandomQuestion } from '../lib/questions'

const WHEEL_COLORS = [
  '#e85d26','#2d6be4','#1a9e5c','#7c3aed',
  '#d4900a','#d63b3b','#0891b2','#059669',
  '#7c2d12','#1e40af','#166534','#6b21a8',
]

export default function SpinOfDoomModal({ cls, students, onAwardStars, onClose }) {
  const canvasRef = useRef(null)
  const spinRef   = useRef(null)

  const [phase, setPhase] = useState('ready') // ready | spinning | picked | question | result | friend
  const [pickedStudent, setPickedStudent]   = useState(null)
  const [friendStudent, setFriendStudent]   = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [rotation, setRotation]             = useState(0)
  const [saving, setSaving]                 = useState(false)
  const [lastResult, setLastResult]         = useState(null) // 'correct' | 'wrong'

  const level = cls?.level || 'pro'
  const eligible = students.filter(s => s.nameEn)

  // ── Draw wheel ──
  useEffect(() => {
    drawWheel(rotation)
  }, [rotation, eligible])

  function drawWheel(rot) {
    const canvas = canvasRef.current
    if (!canvas || eligible.length === 0) return
    const ctx = canvas.getContext('2d')
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const r  = cx - 10
    const slice = (2 * Math.PI) / eligible.length

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    eligible.forEach((s, i) => {
      const start = rot + i * slice
      const end   = start + slice

      // Slice
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, start, end)
      ctx.closePath()
      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length]
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Text
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(start + slice / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#fff'
      ctx.font = `bold ${eligible.length > 12 ? 10 : 13}px Sora, sans-serif`
      ctx.shadowColor = 'rgba(0,0,0,0.4)'
      ctx.shadowBlur = 3
      ctx.fillText(s.nameEn.split(' ')[0], r - 10, 5)
      ctx.restore()
    })

    // Center circle
    ctx.beginPath()
    ctx.arc(cx, cy, 28, 0, 2 * Math.PI)
    ctx.fillStyle = '#1a1814'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 3
    ctx.stroke()

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 11px JetBrains Mono, monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('SPIN', cx, cy)
  }

  function spin() {
    if (phase !== 'ready' || eligible.length === 0) return
    setPhase('spinning')

    const totalSpins  = 6 + Math.random() * 4 // 6–10 full rotations
    const extraAngle  = Math.random() * 2 * Math.PI
    const targetRot   = rotation + totalSpins * 2 * Math.PI + extraAngle
    const duration    = 3500
    const startTime   = performance.now()
    const startRot    = rotation

    function animate(now) {
      const elapsed  = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased    = 1 - Math.pow(1 - progress, 3)
      const current  = startRot + (targetRot - startRot) * eased
      setRotation(current)
      drawWheel(current)

      if (progress < 1) {
        spinRef.current = requestAnimationFrame(animate)
      } else {
        // Figure out who is at the top (pointer is at -π/2 = top)
        const normalized = ((current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
        const slice       = (2 * Math.PI) / eligible.length
        // Pointer at top = angle 0 relative to rotation
        const pointerAngle = ((2 * Math.PI - normalized) % (2 * Math.PI))
        const index        = Math.floor(pointerAngle / slice) % eligible.length
        const picked       = eligible[index]
        const question     = getRandomQuestion(level)
        setPickedStudent(picked)
        setCurrentQuestion(question)
        setPhase('picked')
      }
    }
    spinRef.current = requestAnimationFrame(animate)
  }

  function showQuestion() { setPhase('question') }

  async function handleCorrect() {
    setSaving(true)
    await onAwardStars(pickedStudent.id, 4, '🎯 Spin of Doom — correct answer!')
    setSaving(false)
    setLastResult('correct')
    setPhase('result')
  }

  async function handleWrong() {
    setPhase('friend')
  }

  async function handleFriendCorrect() {
    if (!friendStudent) return
    setSaving(true)
    await onAwardStars(pickedStudent.id,  2, '📞 Phone a Friend — helped friend!')
    await onAwardStars(friendStudent.id,  2, '📞 Phone a Friend — answered correctly!')
    setSaving(false)
    setLastResult('friend')
    setPhase('result')
  }

  async function handleFriendWrong() {
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

  const size = Math.min(320, window.innerWidth - 80)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <style>{`
        @keyframes popIn { from { transform: scale(0.5); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
        .spin-pop { animation: popIn 0.3s cubic-bezier(.34,1.56,.64,1) }
        .spin-shake { animation: shake 0.5s ease }
      `}</style>

      <div className="modal" style={{ maxWidth: 520, padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: '#1a1814', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>
              🎰 Spin of Doom — <span style={{ color: 'var(--accent)' }}>{cls?.name}</span>
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginTop: 2 }}>
              {eligible.length} STUDENTS · {level.toUpperCase()} LEVEL
            </div>
          </div>
          <button className="btn-ghost" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }} onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: 24 }}>

          {/* ── WHEEL ── */}
          {(phase === 'ready' || phase === 'spinning') && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>

              {/* Pointer */}
              <div style={{ position: 'relative', width: size, height: size }}>
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontSize: 24, zIndex: 10, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>▼</div>
                <canvas
                  ref={canvasRef}
                  width={size}
                  height={size}
                  style={{ borderRadius: '50%', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', cursor: phase === 'ready' ? 'pointer' : 'default' }}
                  onClick={spin}
                />
              </div>

              {phase === 'ready' && (
                <div style={{ textAlign: 'center' }}>
                  <button onClick={spin} className="btn btn-accent" style={{ fontSize: 14, padding: '12px 32px', borderRadius: 12 }}>
                    🎰 SPIN!
                  </button>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', marginTop: 8 }}>or tap the wheel</div>
                </div>
              )}

              {phase === 'spinning' && (
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', letterSpacing: 2 }}>SPINNING...</div>
              )}
            </div>
          )}

          {/* ── PICKED ── */}
          {phase === 'picked' && pickedStudent && (
            <div className="spin-pop" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🎯</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: 3, marginBottom: 8 }}>SELECTED</div>
              <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{pickedStudent.nameEn}</div>
              {pickedStudent.nameVn && <div style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 16 }}>{pickedStudent.nameVn}</div>}
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 24 }}>
                Category: <strong style={{ color: 'var(--text)' }}>{currentQuestion?.category}</strong>
              </div>
              <button className="btn btn-accent" style={{ padding: '12px 28px', fontSize: 13 }} onClick={showQuestion}>
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
              <div style={{ background: 'var(--surface2)', borderRadius: 14, padding: '20px 20px', marginBottom: 16, border: '2px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.4, marginBottom: 12 }}>
                  {currentQuestion.q}
                </div>
                <details style={{ cursor: 'pointer' }}>
                  <summary style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: 1, outline: 'none' }}>SHOW ANSWER</summary>
                  <div style={{ marginTop: 10, fontSize: 14, fontWeight: 700, color: 'var(--green)', padding: '8px 14px', background: 'rgba(26,158,92,0.08)', borderRadius: 8 }}>
                    ✅ {currentQuestion.a}
                  </div>
                </details>
              </div>

              {/* Result buttons */}
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
                  onClick={() => { setLastResult('wrong'); setPhase('result') }}>
                  ❌ Wrong<br/>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9 }}>no stars</span>
                </button>
              </div>
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
                    onClick={() => setFriendStudent(s)}
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
                <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, border: '1px solid var(--border)', textAlign: 'center', fontSize: 13 }}>
                  <strong>{currentQuestion?.q}</strong>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, fontFamily: 'var(--mono)' }}>Answer: {currentQuestion?.a}</div>
                </div>
              )}

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
            </div>
          )}

          {/* ── RESULT ── */}
          {phase === 'result' && (
            <div className={`spin-pop`} style={{ textAlign: 'center', padding: '20px 0' }}>
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
  )
}

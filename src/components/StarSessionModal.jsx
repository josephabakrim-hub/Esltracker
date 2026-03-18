import { useState } from 'react'
import { initials } from '../lib/utils'

// Star tiers: as a student accumulates stars in a session, the visual changes
function StarDisplay({ count }) {
  if (count === 0) return <span style={{ fontSize: 13, color: 'var(--border)' }}>—</span>

  // Tier thresholds
  const getStar = (index) => {
    const total = index + 1
    if (total <= 3) return { emoji: '⭐', color: '#f5a623', label: null }
    if (total <= 5) return { emoji: '🌟', color: '#e85d26', label: total === 4 ? 'Hot!' : null }
    return { emoji: '💫', color: '#7c3aed', label: total === 6 ? 'Superstar!' : null }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap', maxWidth: 200 }}>
      {Array.from({ length: count }).map((_, i) => {
        const { emoji, color } = getStar(i)
        return (
          <span key={i} style={{
            fontSize: i >= 5 ? 20 : i >= 3 ? 17 : 15,
            filter: i >= 5 ? 'drop-shadow(0 0 4px #7c3aed)' : i >= 3 ? 'drop-shadow(0 0 3px #e85d26)' : 'none',
            animation: i >= 5 ? 'pulse 1s infinite' : 'none',
            display: 'inline-block',
          }}>{emoji}</span>
        )
      })}
    </div>
  )
}

function TierBadge({ count }) {
  if (count === 0) return null
  if (count >= 6) return (
    <span style={{ fontFamily: 'var(--mono)', fontSize: 8, padding: '2px 7px', borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#e85d26)', color: '#fff', fontWeight: 700, letterSpacing: 1, marginLeft: 6 }}>
      💫 SUPERSTAR
    </span>
  )
  if (count >= 4) return (
    <span style={{ fontFamily: 'var(--mono)', fontSize: 8, padding: '2px 7px', borderRadius: 10, background: 'linear-gradient(135deg,#e85d26,#f5a623)', color: '#fff', fontWeight: 700, letterSpacing: 1, marginLeft: 6 }}>
      🌟 ON FIRE
    </span>
  )
  return null
}

export default function StarSessionModal({ cls, students, onSave, onClose }) {
  // sessionStars: { [studentId]: number }
  const [sessionStars, setSessionStars] = useState(() => {
    const init = {}
    students.forEach(s => { init[s.id] = 0 })
    return init
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function addStar(id) {
    setSessionStars(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }))
  }

  function removeStar(id) {
    setSessionStars(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }))
  }

  function resetStudent(id) {
    setSessionStars(prev => ({ ...prev, [id]: 0 }))
  }

  const totalAwarded = Object.values(sessionStars).reduce((a, b) => a + b, 0)
  const topCount = Math.max(...Object.values(sessionStars), 0)
  const topStudents = students.filter(s => sessionStars[s.id] === topCount && topCount > 0)

  // Sort: most stars first
  const sorted = [...students].sort((a, b) => (sessionStars[b.id] || 0) - (sessionStars[a.id] || 0))

  async function handleSave() {
    const hasAny = Object.values(sessionStars).some(v => v > 0)
    if (!hasAny) return
    setSaving(true)
    await onSave(sessionStars)
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <style>{`
        @keyframes pulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.2) } }
        @keyframes pop   { 0% { transform: scale(0.5); opacity:0 } 60% { transform: scale(1.3) } 100% { transform: scale(1); opacity:1 } }
        .star-add-btn { transition: all 0.1s; }
        .star-add-btn:active { transform: scale(0.85); }
      `}</style>

      <div className="modal" style={{ maxWidth: 600, maxHeight: '92vh', overflowY: 'auto', padding: 0 }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: 'var(--text)', color: '#fff', padding: '20px 24px', borderRadius: '20px 20px 0 0' }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>
            ⭐ Star Session — <span style={{ color: 'var(--accent)' }}>{cls?.name}</span>
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>
            TAP + TO AWARD STARS DURING CLASS
          </div>
        </div>

        {/* Live scoreboard */}
        <div style={{ padding: '20px 24px' }}>

          {/* Summary bar */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1, background: 'var(--surface2)', borderRadius: 12, padding: '12px 16px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--gold)' }}>{totalAwarded}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 1 }}>TOTAL STARS</div>
            </div>
            <div style={{ flex: 2, background: 'var(--surface2)', borderRadius: 12, padding: '12px 16px', border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 1, marginBottom: 4 }}>
                {topStudents.length > 0 ? (topCount >= 6 ? '💫 SUPERSTARS' : topCount >= 4 ? '🌟 ON FIRE' : '🏆 LEADING') : 'NO STARS YET'}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: topCount >= 6 ? '#7c3aed' : topCount >= 4 ? 'var(--accent)' : 'var(--text)' }}>
                {topStudents.length > 0 ? topStudents.map(s => s.nameEn.split(' ')[0]).join(', ') : '—'}
              </div>
            </div>
          </div>

          {/* Tier legend */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
            {[
              { range: '1–3', icon: '⭐', label: 'Stars', color: '#f5a623' },
              { range: '4–5', icon: '🌟', label: 'On Fire', color: '#e85d26' },
              { range: '6+',  icon: '💫', label: 'Superstar', color: '#7c3aed' },
            ].map(t => (
              <div key={t.range} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', background: 'var(--surface2)', padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border)' }}>
                <span>{t.icon}</span>
                <span style={{ color: t.color, fontWeight: 700 }}>{t.range}</span>
                <span>{t.label}</span>
              </div>
            ))}
          </div>

          {/* Student rows */}
          {saved ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Stars Saved!</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>All stars have been added to student profiles.</div>
              <button className="btn btn-dark" onClick={onClose}>Close</button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {sorted.map(s => {
                  const count = sessionStars[s.id] || 0
                  const isSuperstar = count >= 6
                  const isOnFire    = count >= 4 && count < 6

                  return (
                    <div key={s.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 12,
                      background: isSuperstar ? 'linear-gradient(135deg,rgba(124,58,237,0.08),rgba(232,93,38,0.06))'
                                : isOnFire    ? 'rgba(232,93,38,0.06)'
                                : 'var(--surface2)',
                      border: isSuperstar ? '1.5px solid rgba(124,58,237,0.3)'
                            : isOnFire    ? '1.5px solid rgba(232,93,38,0.25)'
                            : '1.5px solid var(--border)',
                      transition: 'all 0.2s',
                    }}>
                      {/* Avatar */}
                      <div style={{
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        background: isSuperstar ? 'linear-gradient(135deg,#7c3aed,#e85d26)'
                                  : isOnFire    ? 'var(--accent)'
                                  : s.level === 'elite' ? 'var(--elite)' : s.level === 'starter' ? 'var(--starter)' : 'var(--pro)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 800, color: '#fff',
                        boxShadow: isSuperstar ? '0 0 12px rgba(124,58,237,0.4)' : 'none',
                      }}>
                        {initials(s.nameEn)}
                      </div>

                      {/* Name + badge */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{s.nameEn}</span>
                          <TierBadge count={count} />
                        </div>
                        <StarDisplay count={count} />
                      </div>

                      {/* Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        {/* Remove */}
                        <button className="btn-ghost star-add-btn"
                          style={{ width: 30, height: 30, borderRadius: 8, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: count === 0 ? 0.3 : 1 }}
                          onClick={() => removeStar(s.id)} disabled={count === 0}>
                          −
                        </button>

                        {/* Count badge */}
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 800,
                          background: isSuperstar ? 'linear-gradient(135deg,#7c3aed,#e85d26)'
                                    : isOnFire    ? 'var(--accent)'
                                    : count > 0   ? 'var(--gold)'
                                    : 'var(--border)',
                          color: count > 0 ? '#fff' : 'var(--muted)',
                          transition: 'all 0.2s',
                          boxShadow: isSuperstar ? '0 0 10px rgba(124,58,237,0.5)' : 'none',
                        }}>
                          {count}
                        </div>

                        {/* Add */}
                        <button className="btn-ghost star-add-btn"
                          style={{ width: 36, height: 36, borderRadius: 10, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gold)', color: '#fff', fontWeight: 800 }}
                          onClick={() => addStar(s.id)}>
                          +
                        </button>

                        {/* Reset */}
                        {count > 0 && (
                          <button className="btn-ghost" style={{ fontSize: 11, color: 'var(--muted)', padding: '2px 6px' }}
                            onClick={() => resetStudent(s.id)} title="Reset">✕</button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                <button className="btn btn-accent"
                  style={{ opacity: totalAwarded === 0 ? 0.5 : 1 }}
                  onClick={handleSave} disabled={saving || totalAwarded === 0}>
                  {saving ? 'Saving...' : `💾 Save Session (${totalAwarded} ⭐)`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

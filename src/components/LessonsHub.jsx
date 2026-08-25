// ── LESSONS HUB ──
// Duolingo-style winding roadmap + race leaderboard
// Games: public/games/unit{N}-{bookSlug}.html
// Completion signal: postMessage({ type:'UNIT_COMPLETE', unit:N, book:'slug' })
// Progress: student.unitsCompleted = { slug: [0,1,2,...] }

import { useState, useEffect, useRef, useCallback } from 'react'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { initials, avgSkills } from '../lib/utils'
import { BOOKS, getBookSlug } from '../lib/books'

const BASE = 'https://teacherjoseph.vercel.app/games'

async function markUnitComplete(studentId, bookSlug, unitNum) {
  if (!studentId) return
  const ref  = doc(db, 'tj_students', studentId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const existing = snap.data().unitsCompleted || {}
  const bookDone = existing[bookSlug] || []
  if (bookDone.includes(unitNum)) return
  await updateDoc(ref, { [`unitsCompleted.${bookSlug}`]: [...bookDone, unitNum] })
}

// ─────────────────────────────────────────────────────────────────────────────
export default function LessonsHub({ cls, studentId, completedUnits = {}, students = [], onClose, readOnly, inline = false }) {
  const bookSlug  = getBookSlug(cls)
  const book      = BOOKS[bookSlug]
  const done      = completedUnits[bookSlug] || []
  const bookColor = book?.color || 'var(--accent)'

  const [openUnit,  setOpenUnit]  = useState(null)
  const [activeTab, setActiveTab] = useState('map')
  const iframeRef = useRef(null)

  const handleMessage = useCallback(async (e) => {
    if (e.data?.type !== 'UNIT_COMPLETE' || e.data.book !== bookSlug) return
    await markUnitComplete(studentId, bookSlug, e.data.unit)
    setOpenUnit(null)
  }, [studentId, bookSlug])

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  if (!bookSlug || !book) {
    if (inline) return (
      <div style={{ padding: '20px', color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 12 }}>
        No book assigned to <strong>{cls?.name}</strong>.
      </div>
    )
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-title">📚 Lessons Hub</div>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>No book assigned to <strong>{cls?.name}</strong>.</p>
          <div className="modal-actions"><button className="btn btn-outline" onClick={onClose}>Close</button></div>
        </div>
      </div>
    )
  }


  const units     = book.units
  const totalDone = done.length
  const pctDone   = Math.round((totalDone / units.length) * 100)
  const nextIdx   = units.findIndex((u, i) =>
    i === 0 ? !done.includes(u.num) : done.includes(units[i-1].num) && !done.includes(u.num)
  )

  function isUnlocked(unitNum, idx) {
    if (!readOnly) return true
    if (idx === 0) return true
    return done.includes(units[idx - 1].num)
  }

  function handleUnitClick(unit, idx) {
    if (!isUnlocked(unit.num, idx)) return
    const url = `${BASE}/unit${unit.num}-${bookSlug}.html`
    if (!readOnly) window.open(url, '_blank')
    else setOpenUnit({ ...unit, url })
  }

  // Race data
  const raceStudents = [...students]
    .map(s => ({ ...s, unitsDone: ((s.unitsCompleted || {})[bookSlug] || []).length, skillAvg: avgSkills(s) }))
    .sort((a, b) => b.unitsDone - a.unitsDone || b.skillAvg - a.skillAvg)

  // Build rows of 3 for zigzag
  const COLS = 3
  const rows = []
  for (let i = 0; i < units.length; i += COLS) rows.push(units.slice(i, i + COLS))

  // ── Iframe ────────────────────────────────────────────────────────────────
  if (openUnit) {
    return (
      <div className="modal-overlay">
        <div style={{ width: '100%', maxWidth: 960, height: '93vh', background: 'var(--surface)', borderRadius: 20, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.35)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'var(--text)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 28 }}>{openUnit.emoji}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Unit {openUnit.num} — {openUnit.title}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: 2 }}>{book.label.toUpperCase()}</div>
              </div>
            </div>
            <button className="btn-ghost" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 20 }} onClick={() => setOpenUnit(null)}>✕</button>
          </div>
          <iframe ref={iframeRef} src={openUnit.url} style={{ flex: 1, border: 'none', width: '100%' }} title={`Unit ${openUnit.num}`} />
        </div>
      </div>
    )
  }

  // ── Main render ───────────────────────────────────────────────────────────
  const innerContent = (
    <>
      <style>{`
        @keyframes lh-pop     { 0%{transform:scale(0.6);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        @keyframes lh-pulse   { 0%,100%{box-shadow:0 0 0 0 ${bookColor}66} 60%{box-shadow:0 0 0 12px transparent} }
        @keyframes lh-bounce  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .lh-node  { animation: lh-pop 0.3s ease both; }
        .lh-next  { animation: lh-pulse 1.8s ease infinite; }
        .lh-arr   { animation: lh-bounce 2s ease infinite; }
      `}</style>

      {/* Header */}
      <div style={{ background: 'var(--text)', padding: '20px 24px 0', flexShrink: 0, borderRadius: inline ? '14px 14px 0 0' : 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: bookColor }} />
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: 3, textTransform: 'uppercase' }}>{book.label}</div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>📚 Lessons Hub</div>
          </div>
          {!inline && <button className="btn-ghost" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 20 }} onClick={onClose}>✕</button>}
        </div>
          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 7, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pctDone}%`, background: bookColor, borderRadius: 4, transition: 'width 0.5s ease' }} />
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>{totalDone}/{units.length}</div>
          </div>
          {/* Tabs */}
          <div style={{ display: 'flex' }}>
            {[['map','🗺️ Road Map'], ['race','🏁 Race Track'], ...(book.homework?.length > 0 ? [['homework','📝 Homework']] : [])].map(([id, label]) => (
              <div key={id} onClick={() => setActiveTab(id)} style={{ flex: 1, textAlign: 'center', padding: '9px 0', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 1.5, fontWeight: activeTab === id ? 700 : 400, color: activeTab === id ? '#fff' : 'rgba(255,255,255,0.3)', borderBottom: `3px solid ${activeTab === id ? bookColor : 'transparent'}`, transition: 'all 0.15s', textTransform: 'uppercase' }}>
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 20px 36px' }}>

          {/* ═══ ROAD MAP ═══ */}
          {activeTab === 'map' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
              {rows.map((row, rowIdx) => {
                const globalStart = rowIdx * COLS
                const orderedRow  = rowIdx % 2 === 0 ? row : [...row].reverse()

                return (
                  <div key={rowIdx} style={{ width: '100%' }}>
                    {/* Node row */}
                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '4px 0' }}>
                      {orderedRow.map((unit, colIdx) => {
                        const trueIdx  = rowIdx % 2 === 0 ? globalStart + colIdx : globalStart + (row.length - 1 - colIdx)
                        const unlocked  = isUnlocked(unit.num, trueIdx)
                        const completed = done.includes(unit.num)
                        const isNext    = trueIdx === nextIdx && readOnly

                        const size = isNext ? 72 : 64

                        return (
                          <div key={unit.num}
                            className={`lh-node${isNext ? ' lh-next' : ''}`}
                            style={{ animationDelay: `${trueIdx * 0.04}s`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, width: 100, cursor: unlocked ? 'pointer' : 'default' }}
                            onClick={() => handleUnitClick(unit, trueIdx)}
                          >
                            {/* Bubble */}
                            <div style={{
                              width: size, height: size, borderRadius: '50%',
                              background: completed
                                ? `linear-gradient(135deg, ${bookColor}dd, ${bookColor}88)`
                                : unlocked ? (isNext ? `linear-gradient(135deg, ${bookColor}44, ${bookColor}22)` : 'var(--surface)')
                                : 'var(--surface2)',
                              border: `3px solid ${completed || unlocked ? bookColor : 'var(--border)'}`,
                              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                              boxShadow: completed ? `0 6px 24px ${bookColor}44` : isNext ? `0 4px 16px ${bookColor}33` : 'var(--shadow)',
                              opacity: unlocked ? 1 : 0.35,
                              position: 'relative',
                              transition: 'transform 0.15s',
                            }}
                              onMouseEnter={e => { if (unlocked) e.currentTarget.style.transform = 'scale(1.08)' }}
                              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                            >
                              {completed
                                ? <div style={{ fontSize: 24, color: '#fff', fontWeight: 800 }}>✓</div>
                                : unlocked
                                  ? <div style={{ fontSize: isNext ? 26 : 22 }}>{unit.emoji}</div>
                                  : <div style={{ fontSize: 20 }}>🔒</div>
                              }
                              {isNext && !completed && (
                                <div className="lh-arr" style={{ fontSize: 9, color: bookColor, fontWeight: 800, fontFamily: 'var(--mono)' }}>▼ PLAY</div>
                              )}
                              {/* Unit number chip */}
                              <div style={{ position: 'absolute', top: -5, right: -5, width: 20, height: 20, borderRadius: '50%', background: completed ? bookColor : 'var(--surface)', border: `2px solid ${bookColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 800, color: completed ? '#fff' : bookColor }}>{unit.num}</div>
                            </div>
                            {/* Label */}
                            <div style={{ textAlign: 'center', fontSize: 10, fontWeight: completed ? 700 : 500, color: unlocked ? 'var(--text)' : 'var(--muted)', lineHeight: 1.3, maxWidth: 90 }}>
                              {unit.title}
                            </div>
                          </div>
                        )
                      })}
                      {/* Pad short rows */}
                      {Array.from({ length: COLS - row.length }).map((_, i) => (
                        <div key={`p${i}`} style={{ width: 100 }} />
                      ))}
                    </div>

                    {/* Connector dots between rows */}
                    {rowIdx < rows.length - 1 && (
                      <div style={{ display: 'flex', justifyContent: rowIdx % 2 === 0 ? 'flex-end' : 'flex-start', paddingRight: rowIdx % 2 === 0 ? 50 : 0, paddingLeft: rowIdx % 2 === 0 ? 0 : 50, margin: '6px 0' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {[0,1,2,3].map(i => (
                            <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--border)' }} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Finish trophy */}
              {pctDone === 100 && (
                <div style={{ textAlign: 'center', paddingTop: 28 }}>
                  <div style={{ fontSize: 52 }}>🏆</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: bookColor, marginTop: 8 }}>Book Complete!</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>All units finished — incredible work!</div>
                </div>
              )}

              {/* Tip */}
              <div style={{ marginTop: 24, padding: '10px 14px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 11, color: 'var(--muted)', lineHeight: 1.6, width: '100%' }}>
                {readOnly
                  ? '🔒 Finish each unit to unlock the next one. Tap a glowing bubble to play!'
                  : '👁 Teacher view — all units accessible. Students unlock sequentially.'}
              </div>
            </div>
          )}

          {/* ═══ RACE TRACK ═══ */}
          {activeTab === 'race' && (
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 20 }}>
                🏁 Unit Race — {book.label}
              </div>

              {raceStudents.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)', fontSize: 13 }}>No students yet.</div>
              )}

              <div style={{ position: 'relative' }}>
                {/* Finish line */}
                <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 3, background: 'repeating-linear-gradient(180deg,#1a1814 0,#1a1814 8px,#fff 8px,#fff 16px)', borderRadius: 2 }} />
                <div style={{ position: 'absolute', right: 5, top: -22, fontSize: 18 }}>🏁</div>

                {raceStudents.map((s, i) => {
                  const pct    = units.length > 0 ? (s.unitsDone / units.length) * 100 : 0
                  const carPct = Math.round(pct * 0.83)
                  const medal  = ['🥇','🥈','🥉'][i] || null

                  return (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < raceStudents.length - 1 ? '1px dashed var(--border)' : 'none' }}>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 12, width: 24, textAlign: 'center', flexShrink: 0 }}>
                        {medal || <span style={{ color: 'var(--muted)' }}>{i+1}</span>}
                      </div>

                      {/* Track */}
                      <div style={{ flex: 1, height: 40, background: 'var(--surface2)', borderRadius: 10, position: 'relative', overflow: 'hidden', marginRight: 10 }}>
                        <div style={{ position: 'absolute', inset: 0, width: `${carPct}%`, background: `${bookColor}18`, borderRadius: 10, minWidth: s.unitsDone > 0 ? 42 : 0, transition: 'width 0.9s cubic-bezier(.34,1.56,.64,1)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 5 }}>
                          {/* Avatar */}
                          <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: i === 0 ? `linear-gradient(135deg,${bookColor},${bookColor}88)` : 'var(--surface)', border: `2px solid ${bookColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: i === 0 ? '#fff' : bookColor, boxShadow: `0 2px 8px ${bookColor}33` }}>
                            {initials(s.nameEn)}
                          </div>
                        </div>
                        {/* Progress label */}
                        <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', opacity: carPct > 75 ? 0 : 1 }}>
                          {s.unitsDone}/{units.length}
                        </div>
                      </div>

                      {/* Name */}
                      <div style={{ minWidth: 90 }}>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>{s.nameEn.split(' ')[0]}</div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', marginTop: 2 }}>📚 {s.unitsDone} · ⭐ {s.totalStars || 0}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ marginTop: 20, padding: '10px 14px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>
                Ranked by units completed in this book. Complete more units on the Road Map to move up! 🚀
              </div>
            </div>
          )}

          {/* ═══ HOMEWORK ═══ */}
          {activeTab === 'homework' && (
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 20 }}>
                📝 Homework — {book.label}
              </div>

              {(!book.homework || book.homework.length === 0) && (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)', fontSize: 13 }}>
                  No homework assignments added for this book yet.
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(book.homework || []).map(hw => {
                  const unit = units.find(u => u.num === hw.unit)
                  return (
                    <div key={hw.unit} style={{
                      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
                      padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start',
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                        background: `${bookColor}22`, border: `1.5px solid ${bookColor}55`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                      }}>
                        {unit?.emoji || '📝'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{hw.title}</div>
                          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: bookColor, letterSpacing: 0.5 }}>
                            UNIT {hw.unit}{unit ? ` · ${unit.title}` : ''}
                          </div>
                          {hw.estMinutes && (
                            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)' }}>⏱ ~{hw.estMinutes} min</div>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{hw.instructions}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ marginTop: 20, padding: '10px 14px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>
                These are reference assignments to set as homework each unit. Online auto-graded homework is planned for a future update.
              </div>
            </div>
          )}
        </div>
    </>
  )

  if (inline) {
    return (
      <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        {innerContent}
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 560, maxHeight: '92vh', borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.25)', background: 'var(--bg)' }}
        onClick={e => e.stopPropagation()}>
        {innerContent}
      </div>
    </div>
  )
}

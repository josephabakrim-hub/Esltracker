import { useState } from 'react'
import { scoreColor, initials, avgSkills } from '../lib/utils'
import { getBookSlug, getBookUnitCount } from '../lib/books'
import LessonsHub from './LessonsHub'

export default function ClassDetail({ cls, students, onBack, onSelectStudent, onAddStudent, onEditClass, onOpenAttendance, onOpenStarSession, onOpenSpinOfDoom, onOpenStarSlots, onOpenLessonsHub, readOnly, studentId, completedUnits }) {
  const ranked = [...students].sort((a, b) => avgSkills(b) - avgSkills(a))
  const top3 = ranked.slice(0, 3)
  const podiumOrder   = [top3[1], top3[0], top3[2]].filter(Boolean)
  const podiumMedals  = ['🥈','🥇','🥉'].slice(0, podiumOrder.length)
  const podiumNums    = ['2','1','3'].slice(0, podiumOrder.length)
  const podiumHeights = [60, 80, 45]
  const podiumGradients = [
    'linear-gradient(135deg,#c0c0c0,#a0a0a0)',
    'linear-gradient(135deg,#f5d020,#f5a623)',
    'linear-gradient(135deg,#cd7f32,#a05a20)',
  ]

  const bookSlug   = getBookSlug(cls)
  const totalUnits = bookSlug ? getBookUnitCount(bookSlug) : 0

  const [vnVisible, setVnVisible] = useState({})
  function toggleVn(id, e) { e.stopPropagation(); setVnVisible(v => ({ ...v, [id]: !v[id] })) }

  function NameWithVn({ s, size = 13 }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: size, fontWeight: 700 }}>{s.nameEn}</span>
        {s.nameVn && <button className="vn-btn" onClick={e => toggleVn(s.id, e)}>🇻🇳 VN</button>}
        {vnVisible[s.id] && s.nameVn && <span className="vn-popup">{s.nameVn}</span>}
      </div>
    )
  }

  const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, boxShadow: 'var(--shadow)', marginBottom: 20 }
  const sectionTitle = { fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 20 }

  return (
    <div>
      <button className="btn-back" onClick={onBack}>← Back to Classes</button>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{cls.name}</div>
            {!readOnly && (
              <button className="btn-ghost" onClick={() => onEditClass(cls)} title="Edit class name">✏️</button>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 4 }}>
            {cls.day && `${cls.day} · `}{cls.time && `${cls.time} · `}{ranked.length} students
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {onOpenAttendance && <button className="btn btn-outline" onClick={onOpenAttendance}>📅 Attendance</button>}
          {onOpenStarSession && (
            <button className="btn btn-outline"
              style={{ background: 'rgba(212,144,10,0.08)', borderColor: 'rgba(212,144,10,0.3)', color: 'var(--gold)' }}
              onClick={onOpenStarSession}>⭐ Star Session</button>
          )}
          {onOpenSpinOfDoom && (
            <button className="btn btn-outline"
              style={{ background: 'rgba(214,59,59,0.08)', borderColor: 'rgba(214,59,59,0.25)', color: 'var(--red)', fontWeight: 700 }}
              onClick={onOpenSpinOfDoom}>🎰 Spin of Doom</button>
          )}
          {onOpenStarSlots && (
            <button className="btn btn-outline"
              style={{ background: 'rgba(212,144,10,0.08)', borderColor: 'rgba(212,144,10,0.3)', color: 'var(--gold)', fontWeight: 700 }}
              onClick={onOpenStarSlots}>🃏 Star Slots</button>
          )}
          {!readOnly && (
            <button className="btn btn-accent" onClick={onAddStudent}>+ Add Student</button>
          )}
        </div>
      </div>

      {ranked.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 12 }}>
          No students in this class yet.{!readOnly && <span> Click <strong>+ Add Student</strong>.</span>}
        </div>
      )}

      {ranked.length > 0 && <>
        {/* LEADERBOARD */}
        <div style={card}>
          <div style={sectionTitle}>🏆 Class Leaderboard</div>

          {top3.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, marginBottom: 28, height: 150 }}>
              {podiumOrder.map((s, i) => {
                const avg = avgSkills(s)
                const isFirst = podiumNums[i] === '1'
                return (
                  <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ position: 'relative', width: isFirst?52:44, height: isFirst?52:44, borderRadius: 14, background: scoreColor(avg), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isFirst?17:14, fontWeight: 800, color: '#fff' }}>
                      {initials(s.nameEn)}
                      <div style={{ position: 'absolute', top: -8, right: -8, fontSize: 16 }}>{podiumMedals[i]}</div>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, textAlign: 'center', maxWidth: 70 }}>{s.nameEn.split(' ')[0]}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: scoreColor(avg) }}>{avg}%</div>
                    <div style={{ width: 70, height: podiumHeights[i], borderRadius: '8px 8px 0 0', background: podiumGradients[i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff' }}>
                      {podiumNums[i]}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ranked.map((s, i) => {
              const avg = avgSkills(s)
              const unitsDone = bookSlug ? ((s.unitsCompleted || {})[bookSlug] || []).length : 0
              const unitPct = totalUnits > 0 ? Math.round((unitsDone / totalUnits) * 100) : 0

              return (
                <div key={s.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'var(--surface2)', cursor: 'pointer', transition: 'all 0.15s' }}
                  onClick={() => onSelectStudent(s)}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--surface2)'}
                >
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: 'var(--muted)', width: 24, textAlign: 'center' }}>{i + 1}</div>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: scoreColor(avg), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                    {initials(s.nameEn)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <NameWithVn s={s} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                      <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{s.attendance ?? 100}% attendance</div>
                      {(s.totalStars || 0) > 0 && (
                        <div style={{ fontSize: 10, color: 'var(--gold)', fontFamily: 'var(--mono)' }}>
                          {(s.totalStars || 0) >= 6 ? '💫' : (s.totalStars || 0) >= 4 ? '🌟' : '⭐'} {s.totalStars}
                        </div>
                      )}
                      {totalUnits > 0 && (
                        <div style={{ fontSize: 10, color: 'var(--accent2)', fontFamily: 'var(--mono)' }}>
                          📚 {unitsDone}/{totalUnits}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills bar */}
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', marginBottom: totalUnits > 0 ? 4 : 0 }}>
                      <div style={{ width: `${avg}%`, height: '100%', borderRadius: 3, background: scoreColor(avg) }} />
                    </div>
                    {/* Unit progress mini-bar */}
                    {totalUnits > 0 && (
                      <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${unitPct}%`, height: '100%', borderRadius: 2, background: 'var(--accent2)' }} />
                      </div>
                    )}
                  </div>

                  <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, width: 40, textAlign: 'right', color: scoreColor(avg) }}>{avg}%</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── LESSONS HUB inline ── */}
        <LessonsHub
          cls={cls}
          students={students}
          studentId={studentId}
          completedUnits={completedUnits || {}}
          readOnly={readOnly}
          inline
        />
      </>}
    </div>
  )
}

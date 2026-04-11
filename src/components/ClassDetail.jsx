import { useState } from 'react'
import { scoreColor, initials, avgSkills } from '../lib/utils'
import LessonsHub from './LessonsHub'

// Map class name → book slug (mirrors LessonsHub)
const CLASS_BOOK = {
  'Elite2_2':  'thinkl2',    'Elite3_S':  'thinkstarter', 'Elite1_3':  'thinkl3',
  'ATB_Elite3_S': 'thinkstarter', 'ATB_Elite1_3': 'thinkl3',
  'Pro1_3':    'kidsboxng3', 'Pro5_4':    'kidsboxng4',   'Pro1_2':    'kidsboxng2',
  'Pro3_S':    'kidsboxng1', 'Pro2_2':    'kidsboxng2',   'Pro3_1':    'kidsboxng1',
  'Pro6_2':    'kidsboxng3',
  'ATB_Pro1_3': 'kidsboxng3', 'ATB_Pro5_4': 'kidsboxng4',
  'HTB_Pro1-2': 'kidsboxng2', 'HTB_Pro2_2': 'kidsboxng2',
  'HTB_Pro4-3': 'kidsboxng4', 'HTB_Pro3_1': 'kidsboxng1', 'HTB_Pro1_2': 'kidsboxng2',
}
const BOOK_UNIT_COUNTS = {
  kidsboxng1: 13, kidsboxng2: 12, kidsboxng3: 9, kidsboxng4: 9,
  thinkstarter: 13, thinkl2: 13, thinkl3: 13,
}
function getBookSlug(className) {
  if (CLASS_BOOK[className]) return CLASS_BOOK[className]
  const stripped = className?.replace(/^(ATB_|HTB_)/, '')
  return CLASS_BOOK[stripped] || null
}

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

  const bookSlug   = getBookSlug(cls?.name)
  const totalUnits = bookSlug ? (BOOK_UNIT_COUNTS[bookSlug] || 0) : 0

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
          {!readOnly && <button className="btn btn-outline" onClick={onOpenAttendance}>📅 Attendance</button>}
          {!readOnly && (
            <button className="btn btn-outline"
              style={{ background: 'rgba(212,144,10,0.08)', borderColor: 'rgba(212,144,10,0.3)', color: 'var(--gold)' }}
              onClick={onOpenStarSession}>⭐ Star Session</button>
          )}
          {!readOnly && (
            <button className="btn btn-outline"
              style={{ background: 'rgba(214,59,59,0.08)', borderColor: 'rgba(214,59,59,0.25)', color: 'var(--red)', fontWeight: 700 }}
              onClick={onOpenSpinOfDoom}>🎰 Spin of Doom</button>
          )}
          {!readOnly && (
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

        {/* RACE TRACK */}
        <div style={card}>
          <div style={sectionTitle}>🏁 Performance Race Track</div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 3, background: 'repeating-linear-gradient(180deg,#1a1814 0,#1a1814 10px,#fff 10px,#fff 20px)', borderRadius: 2 }} />
            <div style={{ position: 'absolute', right: 6, top: -26, fontSize: 20 }}>🏁</div>
            {ranked.map((s, i) => {
              const avg = avgSkills(s)
              const pct = Math.round((avg / 100) * 86)
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: i < ranked.length - 1 ? '1px dashed var(--border)' : 'none' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', width: 18, textAlign: 'center', flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1, height: 36, background: 'var(--surface2)', borderRadius: 8, position: 'relative', overflow: 'hidden', marginRight: 12 }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${pct}%`, background: `${scoreColor(avg)}22`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 4, minWidth: 36, transition: 'width 0.8s cubic-bezier(.34,1.56,.64,1)' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: scoreColor(avg), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', flexShrink: 0 }}>
                        {initials(s.nameEn)}
                      </div>
                    </div>
                  </div>
                  <div style={{ minWidth: 100 }}>
                    <NameWithVn s={s} size={11} />
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, width: 36, textAlign: 'right', color: scoreColor(avg) }}>{avg}%</div>
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

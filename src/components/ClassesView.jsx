import { useState } from 'react'
import { SKILLS, scoreColor, initials, avgSkills } from '../lib/utils'

const LEVEL_ACCENT = { starter: 'var(--starter)', pro: 'var(--pro)', elite: 'var(--elite)' }
const BADGE_STYLE  = {
  starter: { background: 'rgba(245,158,66,0.12)',  color: 'var(--starter)' },
  pro:     { background: 'rgba(45,107,228,0.12)',   color: 'var(--pro)'     },
  elite:   { background: 'rgba(124,58,237,0.12)',   color: 'var(--elite)'   },
}

export default function ClassesView({ classes, students, onSelectClass, onAddClass, onEditClass, onDeleteClass, readOnly }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>Your Classes</div>
        {!readOnly && (
          <button className="btn btn-dark" onClick={onAddClass}>+ Add Class</button>
        )}
      </div>

      {classes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 12 }}>
          No classes yet. {!readOnly && <span>Click <strong>+ Add Class</strong> to get started.</span>}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 14 }}>
        {classes.map(c => {
          const classStudents = students.filter(s => s.classId === c.id)
          const classAvg = classStudents.length
            ? Math.round(classStudents.reduce((sum, s) => sum + avgSkills(s), 0) / classStudents.length)
            : 0
          const skillAverages = SKILLS.map(sk => ({
            sk,
            avg: classStudents.length
              ? Math.round(classStudents.reduce((sum, s) => sum + (s[sk] || 0), 0) / classStudents.length)
              : 0
          }))

          return (
            <div key={c.id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: 20,
              boxShadow: 'var(--shadow)', cursor: 'pointer',
              transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow)' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: LEVEL_ACCENT[c.level] || 'var(--pro)' }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, marginTop: 6 }}>
                <div style={{ fontSize: 16, fontWeight: 700, cursor: 'pointer' }} onClick={() => onSelectClass(c)}>{c.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: 2, padding: '4px 10px', borderRadius: 20, textTransform: 'uppercase', ...BADGE_STYLE[c.level] }}>{c.level}</span>
                  {!readOnly && (
                    <>
                      <button className="btn-ghost" title="Edit class" onClick={e => { e.stopPropagation(); onEditClass(c) }}>✏️</button>
                      <button className="btn-ghost" title="Delete class" onClick={e => { e.stopPropagation(); if (window.confirm(`Delete class "${c.name}"?`)) onDeleteClass(c.id) }}>🗑️</button>
                    </>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--muted)', marginBottom: 14, fontFamily: 'var(--mono)' }}
                onClick={() => onSelectClass(c)}>
                <span>👥 {classStudents.length} students</span>
                {c.day && <span>📅 {c.day}</span>}
                {c.time && <span>🕐 {c.time}</span>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }} onClick={() => onSelectClass(c)}>
                {skillAverages.map(({ sk, avg }) => (
                  <div key={sk} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', width: 80, flexShrink: 0, fontFamily: 'var(--mono)' }}>{sk}</div>
                    <div style={{ flex: 1, height: 5, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${avg}%`, height: '100%', borderRadius: 3, background: scoreColor(avg) }} />
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, width: 30, textAlign: 'right' }}>{avg}%</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

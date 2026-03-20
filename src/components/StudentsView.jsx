import { useState } from 'react'
import { SKILLS, scoreColor, scoreClass, initials, avgSkills, goalStyle } from '../lib/utils'

export default function StudentsView({ students, classes, onSelectStudent, onAddStudent, onEditStudent, readOnly }) {
  const [filterLevel, setFilterLevel] = useState('all')
  const [filterClass, setFilterClass] = useState('all')
  const [vnVisible, setVnVisible] = useState({})
  function toggleVn(id, e) { e.stopPropagation(); setVnVisible(v => ({ ...v, [id]: !v[id] })) }

  const filtered = students.filter(s => {
    if (filterLevel !== 'all' && s.level !== filterLevel) return false
    if (filterClass !== 'all' && s.classId !== filterClass) return false
    return true
  })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>All Students</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select style={{ fontFamily: 'var(--mono)', fontSize: 10, padding: '7px 12px', borderRadius: 9, border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--muted)', cursor: 'pointer' }}
            value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
            <option value="all">All Levels</option>
            <option value="starter">Starters</option>
            <option value="pro">Pros</option>
            <option value="elite">Elites</option>
          </select>
          <select style={{ fontFamily: 'var(--mono)', fontSize: 10, padding: '7px 12px', borderRadius: 9, border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--muted)', cursor: 'pointer' }}
            value={filterClass} onChange={e => setFilterClass(e.target.value)}>
            <option value="all">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {!readOnly && (
            <button className="btn btn-dark" onClick={onAddStudent}>+ Add Student</button>
          )}
        </div>
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 12 }}>
          No students found.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 12 }}>
        {filtered.map(s => {
          const avg = avgSkills(s)
          const cls = classes.find(c => c.id === s.classId)
          return (
            <div key={s.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 18, boxShadow: 'var(--shadow)', cursor: 'pointer', transition: 'all 0.2s' }}
              onClick={() => onSelectStudent(s)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow)' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: s.level === 'elite' ? 'var(--elite)' : s.level === 'starter' ? 'var(--starter)' : 'var(--pro)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff' }}>{initials(s.nameEn)}</div>
                {!readOnly && (
                  <button className="btn-ghost" style={{ fontSize: 14 }} onClick={e => { e.stopPropagation(); onEditStudent(s) }}>✏️</button>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{s.nameEn}</span>
                {s.nameVn && <button className="vn-btn" onClick={e => toggleVn(s.id, e)}>🇻🇳 VN</button>}
              </div>
              {vnVisible[s.id] && s.nameVn && <div className="vn-popup" style={{ marginBottom: 2 }}>{s.nameVn}</div>}
              <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', marginBottom: 12 }}>{cls ? cls.name : '—'}</div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', letterSpacing: 1 }}>Overall</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: scoreColor(avg) }}>{avg}%</span>
              </div>

              <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                {SKILLS.map(sk => <div key={sk} style={{ flex: 1, height: 4, borderRadius: 2, background: scoreColor(s[sk] || 0) }} />)}
              </div>

              <div style={{ display: 'inline-block', fontFamily: 'var(--mono)', fontSize: 9, padding: '3px 8px', borderRadius: 10, letterSpacing: 1, ...goalStyle(s.goal) }}>{s.goal}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

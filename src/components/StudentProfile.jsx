import { useState } from 'react'
import { SKILLS, SKILL_ICONS, scoreColor, scoreClass, initials, avgSkills, goalStyle } from '../lib/utils'

export default function StudentProfile({ student, classes, onBack, onEdit, onUpdateSkills, onAddNote, onDelete }) {
  const s = student
  const avg = avgSkills(s)
  const cls = classes.find(c => c.id === s.classId)
  const [vnVisible, setVnVisible] = useState(false)

  const notes = s.notes || []

  const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, boxShadow: 'var(--shadow)', marginBottom: 20 }
  const sectionTitle = { fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 20 }

  return (
    <div>
      <button className="btn-back" onClick={onBack}>← Back to Students</button>

      {/* PROFILE HEADER */}
      <div style={{ ...card, display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ width: 72, height: 72, borderRadius: 18, flexShrink: 0, background: s.level === 'elite' ? 'var(--elite)' : s.level === 'starter' ? 'var(--starter)' : 'var(--pro)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: '#fff' }}>
          {initials(s.nameEn)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{s.nameEn}</div>
            {s.nameVn && <button className="vn-btn" onClick={() => setVnVisible(v => !v)}>🇻🇳 VN</button>}
            <button className="btn-ghost" onClick={onEdit} title="Edit student">✏️</button>
          </div>
          {vnVisible && s.nameVn && <div className="vn-popup" style={{ fontSize: 15, marginBottom: 4 }}>{s.nameVn}</div>}
          <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)', marginBottom: 14 }}>
            {cls ? cls.name : '—'} · {s.level?.toUpperCase()} · {s.attendance ?? 100}% attendance
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              `Overall: ${avg}%`,
              s.goal,
              s.level === 'pro' ? 'Age: 6–9 yrs' : s.level === 'elite' ? 'Age: 10–15 yrs' : 'Age: Under 5'
            ].map(tag => (
              <span key={tag} style={{ fontFamily: 'var(--mono)', fontSize: 10, padding: '5px 12px', borderRadius: 20, border: '1px solid var(--border)', color: 'var(--muted)', letterSpacing: 1 }}>{tag}</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="btn btn-accent" onClick={onEdit}>✏️ Update Skills</button>
          <button className="btn btn-danger" onClick={() => { if (window.confirm(`Delete ${s.nameEn}?`)) onDelete(s.id) }}>🗑️ Delete</button>
        </div>
      </div>

      {/* SKILLS */}
      <div style={card}>
        <div style={sectionTitle}>Skill Breakdown</div>
        {SKILLS.map(sk => (
          <div key={sk} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{SKILL_ICONS[sk]}</div>
            <div style={{ fontSize: 13, fontWeight: 600, width: 100, flexShrink: 0 }}>{sk.charAt(0).toUpperCase()+sk.slice(1)}</div>
            <div style={{ flex: 1, height: 8, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${s[sk] || 0}%`, height: '100%', borderRadius: 4, background: scoreColor(s[sk] || 0) }} />
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, width: 40, textAlign: 'right', color: scoreColor(s[sk] || 0) }}>{s[sk] || 0}%</div>
          </div>
        ))}
      </div>

      {/* NOTES */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={sectionTitle}>📝 Teacher Notes</div>
          <button className="btn btn-dark" onClick={onAddNote}>+ Add Note</button>
        </div>
        {notes.length === 0 && (
          <div style={{ color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 12 }}>No notes yet.</div>
        )}
        {[...notes].reverse().map((n, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: i < notes.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)', minWidth: 80, paddingTop: 2 }}>{n.date}</div>
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>{n.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

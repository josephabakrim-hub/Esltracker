import { useState } from 'react'
import { SKILLS, SKILL_ICONS, scoreColor, initials, avgSkills } from '../lib/utils'

export default function StudentProfile({ student, classes, onBack, onEdit, onAddNote, onDelete, onAddStars }) {
  const s = student
  const avg = avgSkills(s)
  const cls = classes.find(c => c.id === s.classId)
  const [vnVisible, setVnVisible] = useState(false)

  // Stars UI state
  const [showStarPanel, setShowStarPanel] = useState(false)
  const [starCount, setStarCount]         = useState(1)
  const [starReason, setStarReason]       = useState('')
  const [starSaving, setStarSaving]       = useState(false)

  const notes    = s.notes    || []
  const starsLog = s.starsLog || []
  const totalStars = s.totalStars || 0

  async function handleSaveStars() {
    if (starCount < 1) return
    setStarSaving(true)
    await onAddStars(s.id, starCount, starReason)
    setStarSaving(false)
    setShowStarPanel(false)
    setStarCount(1)
    setStarReason('')
  }

  const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, boxShadow: 'var(--shadow)', marginBottom: 20 }
  const sectionTitle = { fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 16 }

  return (
    <div>
      <button className="btn-back" onClick={onBack}>
        ← Back{cls ? ` to ${cls.name}` : ' to Students'}
      </button>

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
              s.level === 'pro' ? 'Age: 6–9 yrs' : s.level === 'elite' ? 'Age: 10–15 yrs' : 'Age: Under 5',
              totalStars > 0 ? `⭐ ${totalStars} stars` : null,
            ].filter(Boolean).map(tag => (
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

      {/* STARS */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={sectionTitle}>⭐ Star Rewards</div>
          <button className="btn btn-dark" onClick={() => setShowStarPanel(v => !v)}>+ Award Stars</button>
        </div>

        {/* Award panel */}
        {showStarPanel && (
          <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: 16, marginBottom: 16, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', width: 60 }}>Stars</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setStarCount(n)}
                    style={{ width: 36, height: 36, borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 16, background: starCount >= n ? 'var(--gold)' : 'var(--border)', transition: 'all 0.15s' }}>
                    ⭐
                  </button>
                ))}
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: 'var(--gold)' }}>{starCount}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', width: 60 }}>Reason</div>
              <input className="form-input" style={{ flex: 1 }} placeholder="e.g. Great participation, Good behaviour..."
                value={starReason} onChange={e => setStarReason(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowStarPanel(false)}>Cancel</button>
              <button className="btn btn-accent" onClick={handleSaveStars} disabled={starSaving}>
                {starSaving ? 'Saving...' : `Award ${starCount} ⭐`}
              </button>
            </div>
          </div>
        )}

        {/* Total */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, padding: '12px 16px', borderRadius: 12, background: totalStars > 0 ? 'rgba(212,144,10,0.08)' : 'var(--surface2)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 32 }}>⭐</div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--gold)' }}>{totalStars}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2 }}>TOTAL STARS</div>
          </div>
        </div>

        {/* History */}
        {starsLog.length === 0 && (
          <div style={{ color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 12 }}>No stars awarded yet.</div>
        )}
        {[...starsLog].reverse().map((entry, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: i < starsLog.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)', minWidth: 80 }}>{entry.date}</div>
            <div style={{ fontSize: 16, minWidth: 40 }}>{'⭐'.repeat(Math.min(entry.count, 5))}{entry.count > 5 ? ` x${entry.count}` : ''}</div>
            <div style={{ fontSize: 13, color: entry.reason ? 'var(--text)' : 'var(--muted)', fontStyle: entry.reason ? 'normal' : 'italic' }}>
              {entry.reason || 'No reason given'}
            </div>
          </div>
        ))}
      </div>

      {/* NOTES */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={sectionTitle}>📝 Teacher Notes</div>
          <button className="btn btn-dark" onClick={onAddNote}>+ Add Note</button>
        </div>
        {notes.length === 0 && (
          <div style={{ color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 12 }}>No notes yet.</div>
        )}
        {[...notes].map((n, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: i < notes.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)', minWidth: 80, paddingTop: 2 }}>{n.date}</div>
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>{n.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

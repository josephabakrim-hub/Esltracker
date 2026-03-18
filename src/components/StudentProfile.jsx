import { useState } from 'react'
import { SKILLS, SKILL_ICONS, scoreColor, initials, avgSkills } from '../lib/utils'

const PRESET_REASONS = [
  { label: '🙋 Participation',     value: 'Great participation' },
  { label: '🤝 Teamwork',          value: 'Excellent teamwork' },
  { label: '😊 Good behaviour',    value: 'Good behaviour' },
  { label: '💡 Creative answer',   value: 'Creative answer' },
  { label: '📖 Reading aloud',     value: 'Confident reading aloud' },
  { label: '🗣️ Speaking up',       value: 'Spoke up in class' },
  { label: '✍️ Great writing',     value: 'Great writing effort' },
  { label: '🎯 Correct answer',    value: 'Correct answer' },
  { label: '⚡ Fast finisher',     value: 'Finished first correctly' },
  { label: '🌟 Helped classmate',  value: 'Helped a classmate' },
  { label: '📝 Homework done',     value: 'Homework completed' },
  { label: '💪 Most improved',     value: 'Most improved today' },
]

function starEmoji(index) {
  if (index >= 5) return '💫'
  if (index >= 3) return '🌟'
  return '⭐'
}

function renderStars(count) {
  return Array.from({ length: Math.min(count, 8) }).map((_, i) => (
    <span key={i} style={{
      fontSize: i >= 5 ? 18 : i >= 3 ? 16 : 14,
      filter: i >= 5 ? 'drop-shadow(0 0 4px #7c3aed)' : i >= 3 ? 'drop-shadow(0 0 3px #e85d26)' : 'none',
    }}>{starEmoji(i)}</span>
  ))
}

export default function StudentProfile({ student, classes, onBack, onEdit, onAddNote, onDelete, onAddStars, onDeleteStar }) {
  const s = student
  const avg = avgSkills(s)
  const cls = classes.find(c => c.id === s.classId)
  const [vnVisible, setVnVisible] = useState(false)

  // Stars panel state
  const [showStarPanel,   setShowStarPanel]   = useState(false)
  const [showStarHistory, setShowStarHistory] = useState(false) // ← collapsible
  const [starCount,       setStarCount]       = useState(1)
  const [starReason,      setStarReason]      = useState('')
  const [customReason,    setCustomReason]    = useState('')
  const [starSaving,      setStarSaving]      = useState(false)
  const todayISO = new Date().toISOString().split('T')[0]
  const [starDateISO, setStarDateISO] = useState(todayISO)

  const notes      = s.notes    || []
  const starsLog   = s.starsLog || []
  const totalStars = s.totalStars || 0

  function formatDate(iso) {
    const d = new Date(iso + 'T00:00:00')
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  function resetStarPanel() {
    setShowStarPanel(false)
    setStarCount(1)
    setStarReason('')
    setCustomReason('')
    setStarDateISO(todayISO)
  }

  async function handleSaveStars() {
    if (starCount < 1) return
    const finalReason = customReason.trim() || starReason
    setStarSaving(true)
    await onAddStars(s.id, starCount, finalReason, formatDate(starDateISO))
    setStarSaving(false)
    resetStarPanel()
    setShowStarHistory(true) // auto-open history after awarding
  }

  async function handleDeleteStar(index) {
    if (!window.confirm('Remove this star entry?')) return
    await onDeleteStar(s.id, index)
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
          <button className="btn btn-dark" onClick={() => setShowStarPanel(v => !v)}>
            {showStarPanel ? 'Cancel' : '+ Award Stars'}
          </button>
        </div>

        {/* ── AWARD PANEL ── */}
        {showStarPanel && (
          <div style={{ background: 'var(--surface2)', borderRadius: 14, padding: 20, marginBottom: 20, border: '1px solid var(--border)' }}>

            {/* Date picker */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 7 }}>Date</div>
              <input type="date" className="form-input" value={starDateISO} onChange={e => setStarDateISO(e.target.value)} style={{ maxWidth: 200 }} />
              <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 4 }}>{formatDate(starDateISO)}</div>
            </div>

            {/* Star count */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 7 }}>Number of Stars</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setStarCount(n)} style={{
                    width: 40, height: 40, borderRadius: 10, border: 'none', cursor: 'pointer',
                    fontSize: 18, transition: 'all 0.15s',
                    background: starCount >= n ? (n >= 4 ? 'var(--accent)' : 'var(--gold)') : 'var(--border)',
                    transform: starCount >= n ? 'scale(1.08)' : 'scale(1)',
                  }}>
                    {n >= 4 ? '🌟' : '⭐'}
                  </button>
                ))}
                <div style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 800, color: 'var(--gold)', marginLeft: 4 }}>{starCount}</div>
              </div>
            </div>

            {/* Preset reasons */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 7 }}>Reason</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {PRESET_REASONS.map(r => (
                  <button key={r.value} onClick={() => { setStarReason(r.value); setCustomReason('') }}
                    style={{
                      padding: '6px 12px', borderRadius: 20, border: '1.5px solid',
                      cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font)',
                      transition: 'all 0.15s',
                      background: starReason === r.value && !customReason ? 'var(--text)' : 'var(--surface)',
                      color: starReason === r.value && !customReason ? '#fff' : 'var(--muted)',
                      borderColor: starReason === r.value && !customReason ? 'var(--text)' : 'var(--border)',
                    }}>
                    {r.label}
                  </button>
                ))}
              </div>
              <input className="form-input" placeholder="Or type a custom reason..."
                value={customReason} onChange={e => { setCustomReason(e.target.value); setStarReason('') }} />
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={resetStarPanel}>Cancel</button>
              <button className="btn btn-accent" onClick={handleSaveStars} disabled={starSaving || (!starReason && !customReason.trim())}>
                {starSaving ? 'Saving...' : `Award ${starCount} ⭐`}
              </button>
            </div>
          </div>
        )}

        {/* ── TOTAL + COLLAPSIBLE HISTORY ── */}
        <div
          onClick={() => starsLog.length > 0 && setShowStarHistory(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '12px 16px', borderRadius: 12,
            background: totalStars > 0 ? 'rgba(212,144,10,0.08)' : 'var(--surface2)',
            border: '1px solid var(--border)',
            cursor: starsLog.length > 0 ? 'pointer' : 'default',
            transition: 'all 0.15s',
            userSelect: 'none',
          }}
        >
          <div style={{ fontSize: 32 }}>⭐</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--gold)' }}>{totalStars}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2 }}>TOTAL STARS</div>
          </div>
          {starsLog.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>
                {starsLog.length} {starsLog.length === 1 ? 'entry' : 'entries'}
              </span>
              <span style={{
                fontSize: 12, color: 'var(--muted)',
                transform: showStarHistory ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
                display: 'inline-block',
              }}>▼</span>
            </div>
          )}
        </div>

        {starsLog.length === 0 && (
          <div style={{ color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 12, marginTop: 12 }}>No stars awarded yet.</div>
        )}

        {/* History — only shown when expanded */}
        {showStarHistory && starsLog.length > 0 && (
          <div style={{
            marginTop: 8, borderRadius: 12, overflow: 'hidden',
            border: '1px solid var(--border)',
            animation: 'fadeIn 0.15s ease',
          }}>
            {[...starsLog].reverse().map((entry, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px',
                borderBottom: i < starsLog.length - 1 ? '1px solid var(--border)' : 'none',
                background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface2)',
              }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)', minWidth: 80 }}>{entry.date}</div>
                <div style={{ display: 'flex', gap: 2, minWidth: 80 }}>
                  {renderStars(entry.count)}
                  {entry.count > 8 && <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--gold)', marginLeft: 4 }}>x{entry.count}</span>}
                </div>
                <div style={{ flex: 1, fontSize: 12, color: entry.reason ? 'var(--text)' : 'var(--muted)', fontStyle: entry.reason ? 'normal' : 'italic' }}>
                  {entry.reason || 'No reason given'}
                </div>
                <button className="btn-ghost" title="Delete this entry"
                  style={{ fontSize: 13, color: 'var(--red)', opacity: 0.6, flexShrink: 0 }}
                  onClick={() => handleDeleteStar(starsLog.length - 1 - i)}>
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
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

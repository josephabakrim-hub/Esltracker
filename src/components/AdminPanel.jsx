// ── ADMIN PANEL — Teacher Joseph only ──────────────────────────────────────
import { useState } from 'react'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { initials } from '../lib/utils'
import { BOOKS } from '../lib/books'
import { useAccessControl } from '../hooks/useAccessControl'
import {
  CONTROLLABLE_ROLES, ROLE_LABELS, TABS as ACCESS_TABS, FEATURES as ACCESS_FEATURES, ACTIONS as ACCESS_ACTIONS,
  TAB_MODES, FEATURE_MODES, ACTION_MODES,
} from '../lib/accessControl'

// ── Pre-written ESL notes ────────────────────────────────────────────────────
const NOTE_TEMPLATES = {
  pro: {
    '🗣️ Speaking': [
      { label: 'Great participation', text: 'Excellent participation in speaking activities today. Spoke confidently and contributed to class discussions with enthusiasm.' },
      { label: 'Improving fluency', text: 'Showing good improvement in spoken fluency. Sentences are becoming more natural and hesitation is decreasing.' },
      { label: 'Needs more practice', text: 'Speaking confidence is still developing. Encourage student to practise speaking aloud at home and not be afraid to make mistakes.' },
      { label: 'Strong pronunciation', text: 'Pronunciation is a clear strength. Sounds and stress patterns are well-formed for this level.' },
    ],
    '👂 Listening': [
      { label: 'Active listener', text: 'Demonstrates strong listening skills. Follows instructions accurately and responds well to audio activities.' },
      { label: 'Needs focus', text: 'Listening comprehension needs more attention. Student benefits from shorter, clearer instructions and repetition of key content.' },
    ],
    '📖 Reading': [
      { label: 'Reads well aloud', text: 'Reads passages aloud with good clarity and pacing. Demonstrates understanding of punctuation cues.' },
      { label: 'Comprehension improving', text: 'Reading comprehension is steadily improving. Student can now identify main ideas in short texts.' },
      { label: 'Needs vocabulary support', text: 'Vocabulary gaps are occasionally affecting reading comprehension. Focus on building core topic vocabulary.' },
    ],
    '✍️ Writing': [
      { label: 'Neat and accurate', text: 'Written work is neat and shows good accuracy with spelling and basic sentence structure.' },
      { label: 'Creative writer', text: 'Shows creativity in written tasks. Ideas are imaginative and student attempts to use varied vocabulary.' },
      { label: 'Needs structure', text: 'Writing tasks need more attention to sentence structure and punctuation. Practise short writing exercises at home.' },
    ],
    '📐 Grammar': [
      { label: 'Good grammar base', text: 'Demonstrates a solid understanding of key grammar structures for this level, including present simple and basic question forms.' },
      { label: 'Tense confusion', text: 'Some confusion between present and past tenses. Review and practice of verb forms would be beneficial.' },
      { label: 'Articles & prepositions', text: 'Working on correct use of articles (a/an/the) and prepositions. Common area for improvement at this stage.' },
    ],
    '📚 Vocabulary': [
      { label: 'Strong topic vocab', text: 'Has retained topic vocabulary well and uses new words in context appropriately.' },
      { label: 'Needs revision', text: 'Vocabulary retention needs support. Regular review of unit word lists at home is strongly recommended.' },
    ],
    '⭐ General': [
      { label: 'Excellent session', text: 'Had an outstanding session today. Engaged throughout, contributed positively, and showed great effort across all activities.' },
      { label: 'Good effort', text: 'Made a solid effort today. Stayed focused and attempted all activities with a positive attitude.' },
      { label: 'Needs more focus', text: 'Focus during class activities needs improvement. Gentle reminders help, and shorter task segments may be more effective.' },
      { label: 'Ready to advance', text: 'Performance this session suggests student is approaching readiness to advance to the next level. Will monitor over the next few sessions.' },
      { label: 'Absent — note logged', text: 'Student was absent this session. Please ensure any missed material is reviewed before the next class.' },
      { label: 'Great teamwork', text: 'Worked exceptionally well in group and pair activities. Supportive of classmates and a positive presence in the room.' },
    ],
  },
  elite: {
    '🗣️ Speaking': [
      { label: 'Sophisticated expression', text: 'Using increasingly sophisticated language in spoken tasks. Able to express opinions, speculate, and justify views with good range.' },
      { label: 'Fluent and confident', text: 'Speaking fluency is a clear strength. Communicates naturally with good command of pace, intonation and turn-taking.' },
      { label: 'Needs more complex output', text: 'Encouraged to push beyond simple responses and attempt more complex spoken structures. The ability is there — more ambition needed.' },
    ],
    '👂 Listening': [
      { label: 'Excellent inference', text: 'Demonstrates strong inference skills in listening tasks. Able to pick up on implied meaning and speaker attitude.' },
      { label: 'Detail work needed', text: 'Good at grasping main ideas but needs to work on listening for specific detail and nuance in longer texts.' },
    ],
    '📖 Reading': [
      { label: 'Critical reader', text: 'Approaching texts critically. Able to identify author purpose, tone, and underlying argument — key skills at this level.' },
      { label: 'Speed vs accuracy', text: 'Reads quickly but occasionally misses nuance. Slowing down on inference questions will improve accuracy.' },
    ],
    '✍️ Writing': [
      { label: 'Cohesive and structured', text: 'Written work is well-organised with clear paragraphing and effective use of linking language. A strong performance this session.' },
      { label: 'Needs more range', text: 'Writing is accurate but could show more lexical and grammatical range. Encourage use of more complex sentence structures.' },
      { label: 'Opinion essays improving', text: 'Opinion and discursive writing is developing well. Arguments are becoming more balanced and supported with examples.' },
    ],
    '📐 Grammar': [
      { label: 'Complex structures', text: 'Handling complex grammatical structures well, including conditionals, passive forms, and reported speech.' },
      { label: 'Accuracy focus needed', text: 'Good ambition with complex grammar but accuracy needs attention. Proof-reading work carefully before submission is advised.' },
    ],
    '📚 Vocabulary': [
      { label: 'Rich vocabulary', text: 'Vocabulary range is impressive for this level. Using idiomatic expressions and formal/informal register appropriately.' },
      { label: 'Collocations & idioms', text: 'Working on natural collocations and idiomatic usage. This is a key differentiator at B2+ level and worth dedicated focus.' },
    ],
    '⭐ General': [
      { label: 'Outstanding session', text: 'Outstanding performance today. Demonstrated real depth of language ability and consistently challenged themselves throughout.' },
      { label: 'Consistent effort', text: 'Consistent, focused effort this session. Engaging meaningfully with all tasks and showing real commitment to improvement.' },
      { label: 'Needs to push further', text: 'Capable of more. Encourage student to take more risks with language and aim for less predictable, more ambitious responses.' },
      { label: 'IELTS readiness note', text: 'Based on today\'s performance, student is making solid progress toward IELTS readiness. Focus areas: task response and vocabulary range.' },
      { label: 'Excellent critical thinking', text: 'Showed strong critical thinking in discussion tasks. Able to present, support and counter arguments effectively in English.' },
      { label: 'Ready to advance', text: 'Consistently performing above level expectations. Would benefit from being considered for advancement to the next stage.' },
    ],
  },
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const card  = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, boxShadow: 'var(--shadow)', marginBottom: 20 }
const label = { fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 7, display: 'block' }
const inputStyle = { width: '100%', padding: '10px 13px', border: '1.5px solid var(--border)', borderRadius: 10, fontFamily: 'var(--font)', fontSize: 14, color: 'var(--text)', background: 'var(--bg)', outline: 'none' }
const sectionTitle = { fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }

function Tag({ active, onClick, children, color }) {
  return (
    <div onClick={onClick} style={{
      padding: '5px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 11, fontWeight: active ? 700 : 400,
      fontFamily: 'var(--mono)', letterSpacing: 0.5, transition: 'all 0.15s',
      background: active ? (color || 'var(--accent)') : 'var(--surface2)',
      color: active ? '#fff' : 'var(--muted)',
      border: `1.5px solid ${active ? (color || 'var(--accent)') : 'var(--border)'}`,
    }}>{children}</div>
  )
}

function ModeToggle({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {options.map(o => (
        <div key={o.id} title={o.desc} onClick={() => onChange(o.id)}
          style={{
            padding: '5px 10px', borderRadius: 8, cursor: 'pointer',
            fontFamily: 'var(--mono)', fontSize: 9, fontWeight: value === o.id ? 700 : 400,
            letterSpacing: 0.5, transition: 'all 0.15s', whiteSpace: 'nowrap',
            background: value === o.id ? 'var(--text)' : 'var(--bg)',
            color: value === o.id ? '#fff' : 'var(--muted)',
            border: `1.5px solid ${value === o.id ? 'var(--text)' : 'var(--border)'}`,
          }}>{o.label}</div>
      ))}
    </div>
  )
}

function LockMessageInput({ initialValue, onCommit, placeholder }) {
  const [val, setVal] = useState(initialValue || '')
  return (
    <input
      className="form-input"
      style={{ fontSize: 11, padding: '6px 10px', marginTop: 6 }}
      placeholder={placeholder}
      value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={() => onCommit(val)}
    />
  )
}

function Toast({ msg, onDone }) {
  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
      background: 'var(--text)', color: '#fff', padding: '12px 24px', borderRadius: 12,
      fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: 1, zIndex: 999,
      boxShadow: '0 8px 32px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease',
    }}>
      ✅ {msg}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
export default function AdminPanel({ classes, students, updateClass, updateStudent }) {
  const [activeSection, setActiveSection] = useState('books')
  const [toast, setToast] = useState(null)
  const [busy, setBusy] = useState(false)

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // ── 1. Book Assignment ──────────────────────────────────────────────────
  const [bookAssignments, setBookAssignments] = useState(() => {
    const map = {}
    classes.forEach(c => { map[c.id] = c.bookSlug || '' })
    return map
  })

  async function handleSaveBooks() {
    setBusy(true)
    for (const [classId, slug] of Object.entries(bookAssignments)) {
      await updateClass(classId, { bookSlug: slug || null })
    }
    setBusy(false)
    showToast('Book assignments saved!')
  }

  // ── 2. Bulk Notes ───────────────────────────────────────────────────────
  const [noteClassId,   setNoteClassId]   = useState('')
  const [noteDate,      setNoteDate]      = useState(new Date().toISOString().split('T')[0])
  const [noteLevel,     setNoteLevel]     = useState('pro')
  const [noteCategory,  setNoteCategory]  = useState('⭐ General')
  const [selectedNote,  setSelectedNote]  = useState(null)   // { label, text }
  const [customNote,    setCustomNote]    = useState('')
  const [targetStudents,setTargetStudents]= useState([])      // ids

  const noteClassStudents = students.filter(s => s.classId === noteClassId)
  const categories = Object.keys(NOTE_TEMPLATES[noteLevel] || NOTE_TEMPLATES.pro)
  const templates  = (NOTE_TEMPLATES[noteLevel] || NOTE_TEMPLATES.pro)[noteCategory] || []
  const noteText   = customNote || selectedNote?.text || ''

  function formatDate(iso) {
    if (!iso) return ''
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  function toggleStudent(id) {
    setTargetStudents(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function handlePushNotes() {
    if (!noteText.trim() || targetStudents.length === 0) return
    setBusy(true)
    const dateLabel = formatDate(noteDate)
    for (const sid of targetStudents) {
      const s = students.find(st => st.id === sid)
      if (!s) continue
      const notes = [...(s.notes || []), { date: dateLabel, text: noteText.trim() }]
      notes.sort((a, b) => new Date(b.date) - new Date(a.date))
      await updateStudent(sid, { notes })
    }
    setBusy(false)
    setTargetStudents([])
    setSelectedNote(null)
    setCustomNote('')
    showToast(`Note pushed to ${targetStudents.length} student${targetStudents.length > 1 ? 's' : ''}!`)
  }

  // ── 3. Bulk Stars ───────────────────────────────────────────────────────
  const [starClassId,   setStarClassId]   = useState('')
  const [starDate,      setStarDate]      = useState(new Date().toISOString().split('T')[0])
  const [starCounts,    setStarCounts]    = useState({})   // { studentId: number }
  const [starReason,    setStarReason]    = useState('Class session')

  const starClassStudents = students.filter(s => s.classId === starClassId)

  function setStarCount(id, val) {
    setStarCounts(prev => ({ ...prev, [id]: Math.max(0, val) }))
  }

  async function handlePushStars() {
    const entries = Object.entries(starCounts).filter(([, v]) => v > 0)
    if (entries.length === 0) return
    setBusy(true)
    const dateLabel = formatDate(starDate)
    for (const [sid, count] of entries) {
      const s = students.find(st => st.id === sid)
      if (!s) continue
      const starsLog = [...(s.starsLog || []), { date: dateLabel, count, reason: starReason || 'Class session' }]
      const totalStars = starsLog.reduce((sum, e) => sum + e.count, 0)
      await updateStudent(sid, { starsLog, totalStars })
    }
    setBusy(false)
    setStarCounts({})
    showToast(`Stars pushed to ${entries.length} student${entries.length > 1 ? 's' : ''}!`)
  }

  // ── 4. Bulk Goal Update ─────────────────────────────────────────────────
  const [goalClassId, setGoalClassId] = useState('')
  const [goalMap,     setGoalMap]     = useState({})

  const goalClassStudents = students.filter(s => s.classId === goalClassId)
  const GOALS = ['On track', 'Ready to advance', 'Needs attention']
  const GOAL_COLORS = { 'Ready to advance': 'var(--green)', 'On track': 'var(--accent2)', 'Needs attention': 'var(--red)' }

  async function handlePushGoals() {
    const entries = Object.entries(goalMap).filter(([, v]) => v)
    if (entries.length === 0) return
    setBusy(true)
    for (const [sid, goal] of entries) {
      await updateStudent(sid, { goal })
    }
    setBusy(false)
    setGoalMap({})
    showToast(`Goals updated for ${entries.length} student${entries.length > 1 ? 's' : ''}!`)
  }

  // ── 5. Attendance Reset ─────────────────────────────────────────────────
  const [resetClassId, setResetClassId] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)

  async function handleResetAttendance() {
    if (!resetClassId || !confirmReset) return
    setBusy(true)
    const target = students.filter(s => s.classId === resetClassId)
    for (const s of target) {
      await updateStudent(s.id, { attendanceLog: {}, attendance: 100 })
    }
    setBusy(false)
    setConfirmReset(false)
    showToast(`Attendance reset for ${target.length} students!`)
  }

  // ── 6. Quick Skill Boost ────────────────────────────────────────────────
  const [boostClassId, setBoostClassId] = useState('')
  const [boostSkill,   setBoostSkill]   = useState('speaking')
  const [boostAmount,  setBoostAmount]  = useState(5)

  const SKILLS = ['speaking','listening','reading','writing','grammar','vocabulary']
  const SKILL_ICONS = { speaking:'🗣️', listening:'👂', reading:'📖', writing:'✍️', grammar:'📐', vocabulary:'📚' }

  async function handleSkillBoost() {
    if (!boostClassId) return
    setBusy(true)
    const target = students.filter(s => s.classId === boostClassId)
    for (const s of target) {
      const current = s[boostSkill] || 0
      await updateStudent(s.id, { [boostSkill]: Math.min(100, current + boostAmount) })
    }
    setBusy(false)
    showToast(`+${boostAmount}% ${boostSkill} applied to ${target.length} students!`)
  }

  // ── 7. Access Control (Student / Parent / Colleague permissions) ───────────
  const { config: accessConfig, updateRoleConfig } = useAccessControl()
  const [accessRole, setAccessRole] = useState('student')

  function setTabMode(role, tabId, mode) {
    updateRoleConfig(role, { tabs: { [tabId]: mode } })
  }
  function setFeatureMode(role, featureId, mode) {
    updateRoleConfig(role, { features: { [featureId]: mode } })
  }
  function setLockMsg(role, id, msg) {
    updateRoleConfig(role, { lockMessages: { [id]: msg } })
  }
  function toggleClassFilter(role, classId) {
    const current = accessConfig[role]?.classFilter || []
    const next = current.includes(classId) ? current.filter(x => x !== classId) : [...current, classId]
    updateRoleConfig(role, { classFilter: next })
  }
  function toggleDemoBanner(role) {
    updateRoleConfig(role, { demoBanner: !(accessConfig[role]?.demoBanner !== false) })
  }

  // ── Nav sections ─────────────────────────────────────────────────────────
  const SECTIONS = [
    { id: 'books',      label: '📚 Book Assignment' },
    { id: 'notes',      label: '📝 Bulk Notes' },
    { id: 'stars',      label: '⭐ Bulk Stars' },
    { id: 'goals',      label: '🎯 Bulk Goals' },
    { id: 'skills',     label: '📈 Skill Boost' },
    { id: 'attendance', label: '🔄 Reset Attendance' },
    { id: 'access',     label: '🔐 Access Control' },
  ]

  return (
    <div>
      {toast && <Toast msg={toast} />}

      <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 20 }}>
        🔐 Admin Panel
      </div>

      {/* Nav pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
        {SECTIONS.map(s => (
          <Tag key={s.id} active={activeSection === s.id} onClick={() => setActiveSection(s.id)} color="var(--accent)">
            {s.label}
          </Tag>
        ))}
      </div>

      {/* ══ 1. BOOK ASSIGNMENT ══════════════════════════════════════════════ */}
      {activeSection === 'books' && (
        <div style={card}>
          <div style={sectionTitle}>📚 Assign Books to Classes</div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>
            Each class uses one textbook. Assigning a book here determines which units, Spin of Doom questions, and homework appear for that class — everywhere in the app, instantly.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {classes.map(c => {
              const selectedSlug = bookAssignments[c.id] || ''
              const selectedBook = BOOKS[selectedSlug]
              const hasContent   = selectedBook && selectedBook.spinQuestions?.length > 0
              return (
                <div key={c.id} style={{ padding: '12px 16px', borderRadius: 12, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{c.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 2 }}>{c.day} · {c.time}</div>
                    </div>
                    <select
                      value={selectedSlug}
                      onChange={e => setBookAssignments(prev => ({ ...prev, [c.id]: e.target.value }))}
                      style={{ ...inputStyle, width: 240, fontSize: 12 }}
                    >
                      <option value="">— No book assigned —</option>
                      {Object.values(BOOKS).map(book => (
                        <option key={book.slug} value={book.slug}>{book.label}</option>
                      ))}
                    </select>
                  </div>
                  {selectedBook && (
                    <div style={{ marginTop: 8, fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 0.5, color: hasContent ? 'var(--green)' : 'var(--gold)' }}>
                      {hasContent
                        ? `✓ ${selectedBook.units.length} units · Spin of Doom & homework ready`
                        : `⚠ ${selectedBook.units.length} units set up · Spin of Doom & homework not built yet`}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-accent" onClick={handleSaveBooks} disabled={busy}>
              {busy ? 'Saving...' : '💾 Save All Assignments'}
            </button>
          </div>
        </div>
      )}

      {/* ══ 2. BULK NOTES ═══════════════════════════════════════════════════ */}
      {activeSection === 'notes' && (
        <div style={card}>
          <div style={sectionTitle}>📝 Push Notes to Students</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            <div>
              <span style={label}>Class</span>
              <select style={inputStyle} value={noteClassId} onChange={e => { setNoteClassId(e.target.value); setTargetStudents([]) }}>
                <option value="">— Select class —</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <span style={label}>Date</span>
              <input type="date" style={inputStyle} value={noteDate} onChange={e => setNoteDate(e.target.value)} />
            </div>
          </div>

          {noteClassId && (
            <>
              {/* Level toggle */}
              <div style={{ marginBottom: 16 }}>
                <span style={label}>Student Level</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['pro','elite'].map(l => (
                    <Tag key={l} active={noteLevel === l} onClick={() => { setNoteLevel(l); setNoteCategory('⭐ General'); setSelectedNote(null) }} color={l === 'elite' ? 'var(--elite)' : 'var(--pro)'}>
                      {l === 'pro' ? '🔵 Pro' : '🟣 Elite'}
                    </Tag>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div style={{ marginBottom: 16 }}>
                <span style={label}>Category</span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {categories.map(cat => (
                    <Tag key={cat} active={noteCategory === cat} onClick={() => { setNoteCategory(cat); setSelectedNote(null) }}>
                      {cat}
                    </Tag>
                  ))}
                </div>
              </div>

              {/* Templates */}
              <div style={{ marginBottom: 16 }}>
                <span style={label}>Choose Template</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {templates.map(t => (
                    <div key={t.label} onClick={() => { setSelectedNote(t); setCustomNote('') }}
                      style={{ padding: '10px 14px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
                        background: selectedNote?.label === t.label ? 'rgba(232,93,38,0.08)' : 'var(--surface2)',
                        border: `1.5px solid ${selectedNote?.label === t.label ? 'var(--accent)' : 'var(--border)'}` }}>
                      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 3 }}>{t.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>{t.text}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom override */}
              <div style={{ marginBottom: 20 }}>
                <span style={label}>Or write a custom note</span>
                <textarea
                  style={{ ...inputStyle, resize: 'vertical' }} rows={3}
                  placeholder="Type your own note here — this overrides the template above…"
                  value={customNote}
                  onChange={e => { setCustomNote(e.target.value); setSelectedNote(null) }}
                />
              </div>

              {/* Preview */}
              {noteText && (
                <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 10, background: 'rgba(45,107,228,0.06)', border: '1.5px solid rgba(45,107,228,0.2)' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--accent2)', letterSpacing: 2, marginBottom: 6 }}>PREVIEW — {formatDate(noteDate)}</div>
                  <div style={{ fontSize: 12, lineHeight: 1.6 }}>{noteText}</div>
                </div>
              )}

              {/* Student picker */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={label}>Select Students</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: 9 }}
                      onClick={() => setTargetStudents(noteClassStudents.map(s => s.id))}>All</button>
                    <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: 9 }}
                      onClick={() => setTargetStudents([])}>None</button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {noteClassStudents.map(s => {
                    const sel = targetStudents.includes(s.id)
                    return (
                      <div key={s.id} onClick={() => toggleStudent(s.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 13px', borderRadius: 10, cursor: 'pointer',
                          background: sel ? 'rgba(232,93,38,0.07)' : 'var(--surface2)',
                          border: `1.5px solid ${sel ? 'var(--accent)' : 'var(--border)'}`, transition: 'all 0.15s' }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: sel ? 'var(--accent)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: sel ? '#fff' : 'var(--muted)', flexShrink: 0 }}>
                          {sel ? '✓' : initials(s.nameEn)}
                        </div>
                        <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{s.nameEn}</div>
                        {s.nameVn && <div style={{ fontSize: 10, color: 'var(--muted)' }}>{s.nameVn}</div>}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-accent"
                  disabled={busy || !noteText.trim() || targetStudents.length === 0}
                  style={{ opacity: (!noteText.trim() || targetStudents.length === 0) ? 0.5 : 1 }}
                  onClick={handlePushNotes}>
                  {busy ? 'Pushing...' : `📝 Push Note to ${targetStudents.length} Student${targetStudents.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══ 3. BULK STARS ═══════════════════════════════════════════════════ */}
      {activeSection === 'stars' && (
        <div style={card}>
          <div style={sectionTitle}>⭐ Push Stars in Bulk</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            <div>
              <span style={label}>Class</span>
              <select style={inputStyle} value={starClassId} onChange={e => { setStarClassId(e.target.value); setStarCounts({}) }}>
                <option value="">— Select class —</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <span style={label}>Date</span>
              <input type="date" style={inputStyle} value={starDate} onChange={e => setStarDate(e.target.value)} />
            </div>
          </div>

          {starClassId && (
            <>
              <div style={{ marginBottom: 16 }}>
                <span style={label}>Reason</span>
                <input style={inputStyle} placeholder="e.g. Great participation, Speaking activity…"
                  value={starReason} onChange={e => setStarReason(e.target.value)} />
              </div>

              {/* Quick presets */}
              <div style={{ marginBottom: 16 }}>
                <span style={label}>Quick Presets</span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { label: 'All get 1 ⭐', count: 1 },
                    { label: 'All get 2 ⭐', count: 2 },
                    { label: 'All get 3 ⭐', count: 3 },
                  ].map(p => (
                    <button key={p.label} className="btn btn-outline" style={{ fontSize: 10 }}
                      onClick={() => {
                        const all = {}
                        starClassStudents.forEach(s => { all[s.id] = p.count })
                        setStarCounts(all)
                      }}>{p.label}</button>
                  ))}
                  <button className="btn btn-outline" style={{ fontSize: 10 }} onClick={() => setStarCounts({})}>Clear all</button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {starClassStudents.map(s => {
                  const count = starCounts[s.id] || 0
                  return (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: count > 0 ? 'rgba(212,144,10,0.07)' : 'var(--surface2)', border: `1.5px solid ${count > 0 ? 'rgba(212,144,10,0.3)' : 'var(--border)'}`, transition: 'all 0.15s' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                        {initials(s.nameEn)}
                      </div>
                      <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{s.nameEn}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button className="btn-ghost" style={{ width: 28, height: 28, borderRadius: 7, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: count === 0 ? 0.3 : 1 }}
                          onClick={() => setStarCount(s.id, count - 1)} disabled={count === 0}>−</button>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 800, width: 32, textAlign: 'center', color: count > 0 ? 'var(--gold)' : 'var(--muted)' }}>{count}</div>
                        <button className="btn-ghost" style={{ width: 32, height: 32, borderRadius: 9, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gold)', color: '#fff', fontWeight: 800 }}
                          onClick={() => setStarCount(s.id, count + 1)}>+</button>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--gold)', fontFamily: 'var(--mono)', minWidth: 40, textAlign: 'right' }}>
                        {count > 0 ? (count >= 6 ? '💫' : count >= 4 ? '🌟' : '⭐').repeat(Math.min(count, 3)) : ''}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-accent"
                  disabled={busy || Object.values(starCounts).every(v => v === 0)}
                  style={{ opacity: Object.values(starCounts).every(v => v === 0) ? 0.5 : 1 }}
                  onClick={handlePushStars}>
                  {busy ? 'Pushing...' : `⭐ Push Stars (${Object.values(starCounts).reduce((a, b) => a + b, 0)} total)`}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══ 4. BULK GOALS ═══════════════════════════════════════════════════ */}
      {activeSection === 'goals' && (
        <div style={card}>
          <div style={sectionTitle}>🎯 Update Goal Status in Bulk</div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>
            Update multiple students' goal status at once. Only students you change will be saved.
          </p>

          <div style={{ marginBottom: 20 }}>
            <span style={label}>Class</span>
            <select style={inputStyle} value={goalClassId} onChange={e => { setGoalClassId(e.target.value); setGoalMap({}) }}>
              <option value="">— Select class —</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {goalClassId && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {goalClassStudents.map(s => {
                  const current = goalMap[s.id] || s.goal || 'On track'
                  return (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--accent2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                        {initials(s.nameEn)}
                      </div>
                      <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{s.nameEn}</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {GOALS.map(g => (
                          <button key={g} onClick={() => setGoalMap(prev => ({ ...prev, [s.id]: g }))}
                            style={{ padding: '5px 10px', borderRadius: 20, border: `1.5px solid ${current === g ? GOAL_COLORS[g] : 'var(--border)'}`,
                              background: current === g ? `${GOAL_COLORS[g]}18` : 'transparent',
                              color: current === g ? GOAL_COLORS[g] : 'var(--muted)',
                              fontFamily: 'var(--mono)', fontSize: 9, cursor: 'pointer', fontWeight: current === g ? 700 : 400 }}>
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-accent"
                  disabled={busy || Object.keys(goalMap).length === 0}
                  style={{ opacity: Object.keys(goalMap).length === 0 ? 0.5 : 1 }}
                  onClick={handlePushGoals}>
                  {busy ? 'Saving...' : `🎯 Save Goals (${Object.keys(goalMap).length} changed)`}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══ 5. SKILL BOOST ══════════════════════════════════════════════════ */}
      {activeSection === 'skills' && (
        <div style={card}>
          <div style={sectionTitle}>📈 Skill Boost — Apply to Whole Class</div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>
            Apply a score increase to a specific skill across an entire class at once. Useful after a strong group performance or assessment.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            <div>
              <span style={label}>Class</span>
              <select style={inputStyle} value={boostClassId} onChange={e => setBoostClassId(e.target.value)}>
                <option value="">— Select class —</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <span style={label}>Skill</span>
              <select style={inputStyle} value={boostSkill} onChange={e => setBoostSkill(e.target.value)}>
                {SKILLS.map(sk => <option key={sk} value={sk}>{SKILL_ICONS[sk]} {sk.charAt(0).toUpperCase()+sk.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <span style={label}>Amount to add: +{boostAmount}%</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <input type="range" min={1} max={20} value={boostAmount} onChange={e => setBoostAmount(Number(e.target.value))}
                className="skill-slider" style={{ flex: 1, background: `linear-gradient(to right, var(--green) ${boostAmount*5}%, var(--border) ${boostAmount*5}%)` }} />
              <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 800, color: 'var(--green)', width: 48 }}>+{boostAmount}</div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
              Scores are capped at 100%. Students already at 100% won't change.
            </div>
          </div>

          {boostClassId && (
            <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 10, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', fontSize: 12, color: 'var(--muted)' }}>
              Will apply <strong style={{ color: 'var(--green)' }}>+{boostAmount}% {SKILL_ICONS[boostSkill]} {boostSkill}</strong> to <strong>{students.filter(s => s.classId === boostClassId).length} students</strong> in <strong>{classes.find(c => c.id === boostClassId)?.name}</strong>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-accent" disabled={busy || !boostClassId} style={{ opacity: !boostClassId ? 0.5 : 1 }} onClick={handleSkillBoost}>
              {busy ? 'Applying...' : `📈 Apply Boost`}
            </button>
          </div>
        </div>
      )}

      {/* ══ 6. RESET ATTENDANCE ═════════════════════════════════════════════ */}
      {activeSection === 'attendance' && (
        <div style={card}>
          <div style={sectionTitle}>🔄 Reset Attendance</div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>
            Reset the full attendance log for a class — useful at the start of a new term. This clears all session records and resets every student's attendance back to 100%.
          </p>

          <div style={{ marginBottom: 20 }}>
            <span style={label}>Class</span>
            <select style={inputStyle} value={resetClassId} onChange={e => { setResetClassId(e.target.value); setConfirmReset(false) }}>
              <option value="">— Select class —</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {resetClassId && (
            <>
              <div onClick={() => setConfirmReset(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                  background: confirmReset ? 'rgba(214,59,59,0.08)' : 'var(--surface2)',
                  border: `1.5px solid ${confirmReset ? 'var(--red)' : 'var(--border)'}`, marginBottom: 20, transition: 'all 0.15s' }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${confirmReset ? 'var(--red)' : 'var(--border)'}`, background: confirmReset ? 'var(--red)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {confirmReset && <span style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>✓</span>}
                </div>
                <span style={{ fontSize: 13, color: confirmReset ? 'var(--red)' : 'var(--muted)' }}>
                  I understand this will permanently delete all attendance records for <strong>{classes.find(c => c.id === resetClassId)?.name}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-danger"
                  disabled={busy || !confirmReset}
                  style={{ opacity: !confirmReset ? 0.4 : 1, padding: '10px 20px', fontSize: 11 }}
                  onClick={handleResetAttendance}>
                  {busy ? 'Resetting...' : '🔄 Reset Attendance'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══ 7. ACCESS CONTROL ═══════════════════════════════════════════════ */}
      {activeSection === 'access' && (() => {
        const roleCfg = accessConfig[accessRole] || {}
        return (
          <div>
            <div style={card}>
              <div style={sectionTitle}>🔐 Access Control</div>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 18, lineHeight: 1.6 }}>
                Control exactly what Students, Parents, and Colleagues can see and do when they log in.
                Nothing here affects you — Teacher Joseph always has full access. Anything set to <strong>Demo</strong> lets
                that role click around and try it out, but the input is never saved to your real students or classes.
              </p>

              {/* Role picker */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
                {CONTROLLABLE_ROLES.map(r => (
                  <Tag key={r} active={accessRole === r} onClick={() => setAccessRole(r)} color="var(--accent2)">
                    {ROLE_LABELS[r]}
                  </Tag>
                ))}
              </div>

              {/* Tabs */}
              <div style={{ marginBottom: 26 }}>
                <div style={{ ...label, marginBottom: 12, fontSize: 10 }}>Tab Access</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {ACCESS_TABS.map(t => {
                    const mode = roleCfg.tabs?.[t.id] || 'hidden'
                    return (
                      <div key={t.id} style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{t.label}</span>
                          <ModeToggle options={TAB_MODES} value={mode} onChange={m => setTabMode(accessRole, t.id, m)} />
                        </div>
                        {mode === 'blurred' && (
                          <LockMessageInput
                            initialValue={roleCfg.lockMessages?.[t.id] || ''}
                            placeholder='Custom lock message (default: "This is for Teacher Joseph only.")'
                            onCommit={v => setLockMsg(accessRole, t.id, v)}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Features */}
              <div style={{ marginBottom: 26 }}>
                <div style={{ ...label, marginBottom: 12, fontSize: 10 }}>In-Class Feature Access</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.5 }}>
                  These appear inside a class's detail page. <strong>Demo</strong> = fully clickable but not saved. <strong>View only</strong> = they can see the real data (e.g. today's attendance) but can't change anything.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {ACCESS_FEATURES.map(f => {
                    const mode = roleCfg.features?.[f.id] || 'hidden'
                    return (
                      <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '12px 14px', borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{f.label}</span>
                        <ModeToggle options={FEATURE_MODES} value={mode} onChange={m => setFeatureMode(accessRole, f.id, m)} />
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Structural actions */}
              <div style={{ marginBottom: 26 }}>
                <div style={{ ...label, marginBottom: 12, fontSize: 10 }}>Header Actions</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.5 }}>
                  The <strong>+ Add Class</strong> / <strong>+ Add Student</strong> buttons in the header and on the Classes/Students pages. These create real records, so they only ever run in Demo mode for non-teacher roles — the form opens and "Save" appears to work, but nothing is actually created.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {ACCESS_ACTIONS.map(a => {
                    const mode = roleCfg.features?.[a.id] || 'hidden'
                    return (
                      <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '12px 14px', borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{a.label}</span>
                        <ModeToggle options={ACTION_MODES} value={mode} onChange={m => setFeatureMode(accessRole, a.id, m)} />
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Demo banner toggle */}
              <div style={{ marginBottom: 26 }}>
                <div onClick={() => toggleDemoBanner(accessRole)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                    background: roleCfg.demoBanner !== false ? 'rgba(124,58,237,0.06)' : 'var(--surface2)',
                    border: `1.5px solid ${roleCfg.demoBanner !== false ? 'rgba(124,58,237,0.3)' : 'var(--border)'}` }}>
                  <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${roleCfg.demoBanner !== false ? 'var(--elite)' : 'var(--border)'}`, background: roleCfg.demoBanner !== false ? 'var(--elite)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {roleCfg.demoBanner !== false && <span style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                    Show a "🧪 Demo — not saved" badge on demo features, so it's always clear to them
                  </span>
                </div>
              </div>

              {/* Class visibility filter */}
              <div>
                <div style={{ ...label, marginBottom: 8, fontSize: 10 }}>Visible Classes</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.5 }}>
                  Leave all unchecked to allow every class. Check specific classes to restrict this role to only those.
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {classes.map(c => {
                    const checked = (roleCfg.classFilter || []).includes(c.id)
                    return (
                      <Tag key={c.id} active={checked} onClick={() => toggleClassFilter(accessRole, c.id)} color="var(--accent2)">
                        {checked ? '✓ ' : ''}{c.name}
                      </Tag>
                    )
                  })}
                  {classes.length === 0 && <span style={{ fontSize: 11, color: 'var(--muted)' }}>No classes yet.</span>}
                </div>
                {(roleCfg.classFilter || []).length > 0 && (
                  <div style={{ marginTop: 10, fontSize: 11, color: 'var(--accent2)' }}>
                    {ROLE_LABELS[accessRole]} will only see {roleCfg.classFilter.length} of {classes.length} classes.
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

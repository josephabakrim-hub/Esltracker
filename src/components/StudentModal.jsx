import { useState, useEffect } from 'react'
import { LEVELS, GOALS, SKILLS, SKILL_ICONS, scoreColor } from '../lib/utils'

export default function StudentModal({ student, classes, onSave, onClose }) {
  const editing = !!student
  const [form, setForm] = useState({
    nameEn: '', nameVn: '', classId: '', level: 'pro', attendance: 100, goal: 'On track',
    speaking: 0, listening: 0, reading: 0, writing: 0, grammar: 0, vocabulary: 0,
    pin: '',
  })
  const [pinError, setPinError] = useState('')

  useEffect(() => {
    if (student) {
      setForm({
        nameEn:     student.nameEn     || '',
        nameVn:     student.nameVn     || '',
        classId:    student.classId    || '',
        level:      student.level      || 'pro',
        attendance: student.attendance ?? 100,
        goal:       student.goal       || 'On track',
        speaking:   student.speaking   || 0,
        listening:  student.listening  || 0,
        reading:    student.reading    || 0,
        writing:    student.writing    || 0,
        grammar:    student.grammar    || 0,
        vocabulary: student.vocabulary || 0,
        pin:        student.pin        || '',
      })
    }
  }, [student])

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function handlePinChange(v) {
    const digits = v.replace(/\D/g, '').slice(0, 4)
    set('pin', digits)
    setPinError('')
  }

  function handleSave() {
    if (!form.nameEn.trim()) return
    if (form.pin && form.pin.length !== 4) {
      setPinError('PIN must be exactly 4 digits')
      return
    }
    onSave({ ...form, attendance: parseInt(form.attendance) || 100 })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div className="modal-title">{editing ? '✏️ Edit Student' : '👤 Add New Student'}</div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">English Name</label>
            <input className="form-input" placeholder="e.g. Emily Nguyen"
              value={form.nameEn} onChange={e => set('nameEn', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Vietnamese Name</label>
            <input className="form-input" placeholder="e.g. Nguyễn Thùy Linh"
              value={form.nameVn} onChange={e => set('nameVn', e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Class</label>
            <select className="form-input" value={form.classId} onChange={e => set('classId', e.target.value)}>
              <option value="">— Select Class —</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Level</label>
            <select className="form-input" value={form.level} onChange={e => set('level', e.target.value)}>
              {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase()+l.slice(1)}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Attendance %</label>
            <input className="form-input" type="number" min="0" max="100"
              value={form.attendance} onChange={e => set('attendance', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Goal Status</label>
            <select className="form-input" value={form.goal} onChange={e => set('goal', e.target.value)}>
              {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        {/* ── Student PIN ── */}
        <div className="form-group">
          <label className="form-label">Student Portal PIN</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              className="form-input"
              type="text"
              inputMode="numeric"
              placeholder="4-digit PIN  e.g. 1234"
              value={form.pin}
              onChange={e => handlePinChange(e.target.value)}
              maxLength={4}
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 20,
                letterSpacing: 8,
                maxWidth: 160,
                borderColor: pinError ? 'var(--red)' : undefined,
              }}
            />
            <span style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>
              Students use this PIN<br />to log into their portal
            </span>
          </div>
          {pinError && (
            <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 5 }}>{pinError}</div>
          )}
          {!form.pin && (
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5 }}>
              Leave blank if not using the student portal yet
            </div>
          )}
        </div>

        {editing && (
          <div className="form-group" style={{ marginTop: 8 }}>
            <label className="form-label" style={{ marginBottom: 14 }}>Skill Scores</label>
            {SKILLS.map(sk => (
              <div key={sk} className="skill-slider-row">
                <span className="skill-slider-icon">{SKILL_ICONS[sk]}</span>
                <span className="skill-slider-label">{sk.charAt(0).toUpperCase()+sk.slice(1)}</span>
                <input type="range" min="0" max="100" className="skill-slider"
                  style={{ background: `linear-gradient(to right, ${scoreColor(form[sk])} ${form[sk]}%, var(--border) ${form[sk]}%)` }}
                  value={form[sk]} onChange={e => set(sk, parseInt(e.target.value))} />
                <span className="skill-slider-val" style={{ color: scoreColor(form[sk]) }}>{form[sk]}%</span>
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-accent" onClick={handleSave}>{editing ? 'Save Changes' : 'Add Student'}</button>
        </div>
      </div>
    </div>
  )
}

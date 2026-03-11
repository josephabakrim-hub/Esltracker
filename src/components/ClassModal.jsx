import { useState, useEffect } from 'react'
import { LEVELS, DAYS } from '../lib/utils'

export default function ClassModal({ cls, onSave, onClose }) {
  const editing = !!cls
  const [form, setForm] = useState({
    name: '', level: 'pro', day: 'MON', time: '', students: ''
  })

  useEffect(() => {
    if (cls) setForm({ name: cls.name || '', level: cls.level || 'pro', day: cls.day || 'MON', time: cls.time || '', students: cls.students || '' })
  }, [cls])

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function handleSave() {
    if (!form.name.trim()) return
    onSave({ ...form, students: parseInt(form.students) || 0 })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{editing ? '✏️ Edit Class' : '🏫 Add New Class'}</div>

        <div className="form-group">
          <label className="form-label">Class Name</label>
          <input className="form-input" placeholder="e.g. ATB_Pro1_3"
            value={form.name} onChange={e => set('name', e.target.value)} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Level</label>
            <select className="form-input" value={form.level} onChange={e => set('level', e.target.value)}>
              {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase()+l.slice(1)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Day</label>
            <select className="form-input" value={form.day} onChange={e => set('day', e.target.value)}>
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Time</label>
            <input className="form-input" placeholder="e.g. 17:30-19:00"
              value={form.time} onChange={e => set('time', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">No. of Students</label>
            <input className="form-input" type="number" min="1" placeholder="e.g. 18"
              value={form.students} onChange={e => set('students', e.target.value)} />
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-accent" onClick={handleSave}>{editing ? 'Save Changes' : 'Add Class'}</button>
        </div>
      </div>
    </div>
  )
}

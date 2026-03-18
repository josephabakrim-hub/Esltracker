import { useState } from 'react'

export default function NoteModal({ studentName, onSave, onClose }) {
  const [text, setText] = useState('')
  // Default to today in yyyy-mm-dd for the input, display as readable
  const todayISO = new Date().toISOString().split('T')[0]
  const [dateISO, setDateISO] = useState(todayISO)

  function formatDisplay(iso) {
    if (!iso) return ''
    const d = new Date(iso + 'T00:00:00')
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  function handleSave() {
    if (!text.trim()) return
    onSave(text.trim(), formatDisplay(dateISO))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">📝 Add Note — {studentName}</div>

        <div className="form-group">
          <label className="form-label">Date</label>
          <input
            type="date"
            className="form-input"
            value={dateISO}
            onChange={e => setDateISO(e.target.value)}
          />
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5, fontFamily: 'var(--mono)' }}>
            Will be saved as: {formatDisplay(dateISO)}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Note</label>
          <textarea
            className="form-input"
            rows={4}
            placeholder="e.g. Great improvement in speaking today..."
            style={{ resize: 'vertical' }}
            value={text}
            onChange={e => setText(e.target.value)}
          />
        </div>

        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-accent" onClick={handleSave}>Save Note</button>
        </div>
      </div>
    </div>
  )
}

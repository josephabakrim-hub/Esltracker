import { useState } from 'react'

export default function NoteModal({ studentName, onSave, onClose }) {
  const [text, setText] = useState('')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">📝 Add Note — {studentName}</div>
        <div className="form-group">
          <label className="form-label">Note</label>
          <textarea className="form-input" rows={4}
            placeholder="e.g. Great improvement in speaking today..."
            style={{ resize: 'vertical' }}
            value={text} onChange={e => setText(e.target.value)} />
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-accent" onClick={() => { if (text.trim()) onSave(text.trim()) }}>Save Note</button>
        </div>
      </div>
    </div>
  )
}

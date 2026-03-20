import { useState } from 'react'
import { initials } from '../lib/utils'

export default function AttendanceModal({ cls, students, onSave, onClose, readOnly }) {
  const today = new Date()
  const [viewYear,  setViewYear]  = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth()) // 0-indexed
  const [selectedDate, setSelectedDate] = useState(null) // 'YYYY-MM-DD'
  const [records, setRecords] = useState({}) // { studentId: 'present'|'absent' }
  const [saving, setSaving] = useState(false)

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  // Build calendar days
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  function dateKey(d) {
    return `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
  }

  function hasRecord(d) {
    const key = dateKey(d)
    return students.some(s => s.attendanceLog && s.attendanceLog[key] !== undefined)
  }

  function selectDate(d) {
    const key = dateKey(d)
    setSelectedDate(key)
    // Pre-fill existing records if any
    const existing = {}
    students.forEach(s => {
      existing[s.id] = (s.attendanceLog && s.attendanceLog[key]) || 'present'
    })
    setRecords(existing)
  }

  function toggleStudent(id) {
    setRecords(r => ({ ...r, [id]: r[id] === 'present' ? 'absent' : 'present' }))
  }

  function markAll(status) {
    const all = {}
    students.forEach(s => { all[s.id] = status })
    setRecords(all)
  }

  async function handleSave() {
    if (!selectedDate) return
    setSaving(true)
    await onSave(cls.id, selectedDate, records)
    setSaving(false)
    setSelectedDate(null)
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
    setSelectedDate(null)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
    setSelectedDate(null)
  }

  const presentCount = selectedDate ? Object.values(records).filter(v => v === 'present').length : 0
  const absentCount  = selectedDate ? Object.values(records).filter(v => v === 'absent').length  : 0

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div className="modal-title">📅 Attendance — {cls?.name}</div>

        {/* CALENDAR */}
        <div style={{ marginBottom: 20 }}>
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <button className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={prevMonth}>‹</button>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{MONTHS[viewMonth]} {viewYear}</div>
            <button className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={nextMonth}>›</button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 3 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', padding: '4px 0', letterSpacing: 1 }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
            {cells.map((d, i) => {
              if (!d) return <div key={`e${i}`} />
              const key = dateKey(d)
              const isSelected = selectedDate === key
              const isToday = key === today.toISOString().split('T')[0]
              const recorded = hasRecord(d)
              return (
                <div key={key} onClick={() => !readOnly && selectDate(d)}
                  style={{
                    textAlign: 'center', padding: '8px 4px', borderRadius: 8,
                    cursor: readOnly ? 'default' : 'pointer', fontSize: 13, fontWeight: isToday ? 800 : 400,
                    transition: 'all 0.15s',
                    background: isSelected ? 'var(--accent)' : recorded ? 'rgba(45,107,228,0.12)' : 'var(--surface2)',
                    color: isSelected ? '#fff' : isToday ? 'var(--accent)' : 'var(--text)',
                    border: isToday && !isSelected ? '2px solid var(--accent)' : '2px solid transparent',
                    position: 'relative',
                  }}
                >
                  {d}
                  {recorded && !isSelected && (
                    <div style={{ position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: 'var(--accent2)' }} />
                  )}
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: 8, fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
            {readOnly ? '🔵 = session recorded — view only' : '🔵 = session already recorded \u00a0|\u00a0 click any day to mark attendance'}
          </div>
        </div>

        {/* STUDENT LIST */}
        {selectedDate && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
              {!readOnly && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-outline" style={{ padding: '5px 10px', fontSize: 9 }} onClick={() => markAll('present')}>All Present</button>
                  <button className="btn btn-outline" style={{ padding: '5px 10px', fontSize: 9 }} onClick={() => markAll('absent')}>All Absent</button>
                </div>
              )}
            </div>

            {students.length === 0 && (
              <div style={{ color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 12, padding: '20px 0' }}>No students in this class yet.</div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              {students.map(s => {
                const isPresent = records[s.id] !== 'absent'
                return (
                  <div key={s.id}
                    onClick={() => !readOnly && toggleStudent(s.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px', borderRadius: 10, cursor: readOnly ? 'default' : 'pointer',
                      background: isPresent ? 'rgba(26,158,92,0.08)' : 'rgba(214,59,59,0.07)',
                      border: `1.5px solid ${isPresent ? 'rgba(26,158,92,0.25)' : 'rgba(214,59,59,0.2)'}`,
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: isPresent ? 'var(--green)' : 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                      {initials(s.nameEn)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{s.nameEn}</div>
                      {s.nameVn && <div style={{ fontSize: 10, color: 'var(--muted)' }}>{s.nameVn}</div>}
                    </div>
                    <div style={{
                      fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
                      padding: '4px 12px', borderRadius: 20, letterSpacing: 1,
                      background: isPresent ? 'var(--green)' : 'var(--red)', color: '#fff'
                    }}>
                      {isPresent ? '✓ Present' : '✗ Absent'}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, padding: '10px 14px', borderRadius: 10, background: 'rgba(26,158,92,0.08)', border: '1px solid rgba(26,158,92,0.2)', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green)' }}>{presentCount}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 1 }}>Present</div>
              </div>
              <div style={{ flex: 1, padding: '10px 14px', borderRadius: 10, background: 'rgba(214,59,59,0.07)', border: '1px solid rgba(214,59,59,0.2)', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--red)' }}>{absentCount}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 1 }}>Absent</div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setSelectedDate(null)}>{readOnly ? 'Close' : 'Cancel'}</button>
              {!readOnly && (
                <button className="btn btn-accent" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : '💾 Save Attendance'}
                </button>
              )}
            </div>
          </div>
        )}

        {!selectedDate && (
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  )
}

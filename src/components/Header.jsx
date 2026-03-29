import { useState } from 'react'

export default function Header({ onAddClass, onAddStudent, isDark, onToggleTheme, readOnly, role, onSwitchRole }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div style={{
      background: isDark ? '#0f0e0c' : '#1a1814',
      color: '#fff',
      padding: '12px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 100,
      transition: 'background 0.2s',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' }}>
          Teacher <span style={{ color: 'var(--accent)' }}>Joseph</span>
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: 3, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
          ESL Student Tracker
        </div>
      </div>

      {/* Desktop actions */}
      <div className="tj-header-desktop" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {!readOnly && onAddClass && (
          <button className="btn btn-outline"
            style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.15)' }}
            onClick={onAddClass}>+ Add Class</button>
        )}
        {!readOnly && onAddStudent && (
          <button className="btn btn-accent" onClick={onAddStudent}>+ Add Student</button>
        )}
        {onSwitchRole && (
          <button onClick={onSwitchRole}
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 9, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 11, padding: '7px 12px' }}>
            {role || 'Switch'}
          </button>
        )}
        <button onClick={onToggleTheme}
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 9, color: '#fff', cursor: 'pointer', fontSize: 16, padding: '7px 11px', display: 'inline-flex', alignItems: 'center' }}>
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Mobile actions */}
      <div className="tj-header-mobile" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button onClick={onToggleTheme}
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 9, color: '#fff', cursor: 'pointer', fontSize: 15, padding: '6px 10px', display: 'inline-flex', alignItems: 'center' }}>
          {isDark ? '☀️' : '🌙'}
        </button>
        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(m => !m)}
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 9, color: '#fff', cursor: 'pointer', fontSize: 18, padding: '6px 10px', lineHeight: 1 }}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div style={{
          position: 'absolute', top: '100%', right: 12, left: 12,
          background: isDark ? '#1a1814' : '#1a1814',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12, padding: 12,
          display: 'flex', flexDirection: 'column', gap: 8,
          zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {!readOnly && onAddClass && (
            <button className="btn btn-outline"
              style={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)', width: '100%', justifyContent: 'center' }}
              onClick={() => { onAddClass(); setMenuOpen(false) }}>
              + Add Class
            </button>
          )}
          {!readOnly && onAddStudent && (
            <button className="btn btn-accent"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => { onAddStudent(); setMenuOpen(false) }}>
              + Add Student
            </button>
          )}
          {onSwitchRole && (
            <button
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 9, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 12, padding: '8px 12px', width: '100%' }}
              onClick={() => { onSwitchRole(); setMenuOpen(false) }}>
              Switch Role ({role})
            </button>
          )}
        </div>
      )}
    </div>
  )
}

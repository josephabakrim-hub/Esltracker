import { useState } from 'react'

export default function Header({ onAddClass, onAddStudent, isDark, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <style>{`
        .header-root {
          background: ${isDark ? '#0f0e0c' : '#1a1814'};
          color: #fff;
          padding: 13px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
          transition: background 0.2s;
        }

        .header-brand-name {
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.5px;
          line-height: 1.1;
        }

        .header-brand-sub {
          font-family: var(--mono);
          font-size: 8px;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          margin-top: 2px;
        }

        /* Desktop actions */
        .header-actions-desktop {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        /* Mobile hamburger */
        .header-hamburger {
          display: none;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 9px;
          color: #fff;
          cursor: pointer;
          font-size: 18px;
          padding: 7px 10px;
          line-height: 1;
          align-items: center;
          justify-content: center;
        }

        /* Theme toggle always visible */
        .header-theme-btn {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 9px;
          color: #fff;
          cursor: pointer;
          font-size: 15px;
          padding: 7px 10px;
          transition: all 0.15s;
          display: inline-flex;
          align-items: center;
        }

        /* Mobile dropdown */
        .header-mobile-menu {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: ${isDark ? '#1a1814' : '#2a2620'};
          border-top: 1px solid rgba(255,255,255,0.08);
          padding: 12px 16px;
          flex-direction: column;
          gap: 8px;
          z-index: 99;
          animation: slideDown 0.15s ease;
        }

        .header-mobile-menu.open {
          display: flex;
        }

        .header-mobile-menu .btn {
          width: 100%;
          justify-content: center;
          padding: 12px;
          font-size: 11px;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: none; }
        }

        @media (max-width: 600px) {
          .header-actions-desktop { display: none; }
          .header-hamburger       { display: inline-flex; }
          .header-brand-name      { font-size: 16px; }
        }
      `}</style>

      <div className="header-root" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <div className="header-brand-name">
            Teacher <span style={{ color: 'var(--accent)' }}>Joseph</span>
          </div>
          <div className="header-brand-sub">ESL Student Tracker</div>
        </div>

        {/* Desktop */}
        <div className="header-actions-desktop">
          <button className="btn btn-outline"
            style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.15)' }}
            onClick={onAddClass}>+ Add Class</button>
          <button className="btn btn-accent" onClick={onAddStudent}>+ Add Student</button>
          <button className="header-theme-btn" onClick={onToggleTheme}
            title={isDark ? 'Light mode' : 'Dark mode'}>
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Mobile right side — theme + hamburger */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="header-theme-btn" onClick={onToggleTheme}
            style={{ display: 'none' }}
            id="mobile-theme-btn"
            title={isDark ? 'Light mode' : 'Dark mode'}>
            {isDark ? '☀️' : '🌙'}
          </button>
          <button
            className="header-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <div className={`header-mobile-menu ${menuOpen ? 'open' : ''}`}
        style={{ position: 'sticky', top: 48, zIndex: 99 }}>
        <button className="btn btn-outline"
          style={{ color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.15)' }}
          onClick={() => { onAddClass(); setMenuOpen(false) }}>+ Add Class</button>
        <button className="btn btn-accent"
          onClick={() => { onAddStudent(); setMenuOpen(false) }}>+ Add Student</button>
        <button className="btn btn-outline"
          style={{ color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.15)' }}
          onClick={() => { onToggleTheme(); setMenuOpen(false) }}>
          {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>
    </>
  )
}

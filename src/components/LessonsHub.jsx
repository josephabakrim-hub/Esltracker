// ── LESSONS HUB ──
// Each class maps to a book. Units show as available or coming soon.
// When a unit has a game file URL, it opens in a new tab.

// Kids Box New Generation Level 2 units
const KIDS_BOX_NG2_UNITS = [
  { num: 1,  title: 'Hello Again!',   url: null },
  { num: 2,  title: 'Back to School', url: null },
  { num: 3,  title: 'Play Time!',     url: null },
  { num: 4,  title: 'At Home',        url: null },
  { num: 5,  title: 'Meet My Family', url: 'https://teacherjoseph.vercel.app/games/unit5-meet-my-family-htbpro2.html' },
  { num: 6,  title: 'Dinner Time',    url: null },
  { num: 7,  title: 'At the Farm',    url: null },
  { num: 8,  title: 'My Town',        url: null },
  { num: 9,  title: 'Our Clothes',    url: null },
  { num: 10, title: 'Our Hobbies',    url: null },
  { num: 11, title: 'My Birthday',    url: null },
  { num: 12, title: 'On Holiday!',    url: null },
]

const CLASS_BOOKS = {
  // Elite classes → Think B1 Level 2
  'Elite2_2':     { book: 'Think B1 — Level 2', level: 'elite' },
  'ATB_Elite3_S': { book: 'Think B1 — Level 2', level: 'elite' },
  'ATB_Elite1_3': { book: 'Think B1 — Level 2', level: 'elite' },
  // Pro classes → Kids Box
  'ATB_Pro1_3':   { book: 'Kids Box', level: 'pro' },
  'ATB_Pro5_4':   { book: 'Kids Box', level: 'pro' },
  'HTB_Pro1-2':   { book: 'Kids Box', level: 'pro' },
  'Pro3_S':       { book: 'Kids Box', level: 'pro' },
  'HTB_Pro2_2':   { book: 'Kids Box NG — Level 2', level: 'pro2' },
  'HTB_Pro4-3':   { book: 'Kids Box', level: 'pro' },
  'HTB_Pro3_1':   { book: 'Kids Box', level: 'pro' },
  'HTB_Pro1_2':   { book: 'Kids Box', level: 'pro' },
}

// Think B1 Level 2 units
const THINK_B1_UNITS = [
  { num: 0,  title: 'Welcome',              url: null },
  { num: 1,  title: 'Amazing People',       url: null },
  { num: 2,  title: 'The Ways We Learn',    url: null },
  { num: 3,  title: "That's Entertainment", url: null },
  { num: 4,  title: 'Social Networking',    url: null },
  { num: 5,  title: 'My Life in Music',     url: 'https://teacherjoseph.vercel.app/games/unit5-my-life-in-music.html' },
  { num: 6,  title: 'Making a Difference',  url: null },
  { num: 7,  title: 'Future Fun',           url: null },
  { num: 8,  title: 'Science Counts',       url: null },
  { num: 9,  title: "What a Job!",          url: null },
  { num: 10, title: 'Keep Healthy',         url: null },
  { num: 11, title: 'Making the News',      url: null },
  { num: 12, title: 'Playing by the Rules', url: null },
]

// Kids Box New Generation Level 1 units
const KIDS_BOX_UNITS = [
  { num: 1, title: 'Hello!',         url: null },
  { num: 2, title: 'My School',      url: null },
  { num: 3, title: 'Favourite Toys', url: 'https://teacherjoseph.vercel.app/games/unit3-favourite-toys-pro3s.html' },
  { num: 4, title: 'My Family',      url: null },
  { num: 5, title: 'My Body',        url: null },
  { num: 6, title: 'Animals',        url: null },
  { num: 7, title: 'Food',           url: null },
  { num: 8, title: 'My Home',        url: null },
]

export default function LessonsHub({ cls, onClose }) {
  const bookInfo = CLASS_BOOKS[cls?.name] || { book: 'Unknown Book', level: cls?.level || 'pro' }
  const units = bookInfo.level === 'elite' ? THINK_B1_UNITS : bookInfo.level === 'pro2' ? KIDS_BOX_NG2_UNITS : KIDS_BOX_UNITS
  const available = units.filter(u => u.url).length

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 580, maxHeight: '88vh', overflowY: 'auto', padding: 0 }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: 'var(--text)', color: '#fff', padding: '20px 24px', borderRadius: '20px 20px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>
                📚 Lessons Hub — <span style={{ color: 'var(--accent)' }}>{cls?.name}</span>
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>
                {bookInfo.book.toUpperCase()} · {available} OF {units.length} UNITS READY
              </div>
            </div>
            <button className="btn-ghost" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }} onClick={onClose}>✕</button>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 14, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(available / units.length) * 100}%`, background: 'var(--accent)', borderRadius: 2, transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* Unit list */}
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {units.map(unit => {
              const isReady = !!unit.url
              return (
                <div
                  key={unit.num}
                  onClick={() => isReady && window.open(unit.url, '_blank')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: 12,
                    background: isReady ? 'var(--surface)' : 'var(--surface2)',
                    border: `1.5px solid ${isReady ? 'var(--border)' : 'transparent'}`,
                    cursor: isReady ? 'pointer' : 'default',
                    opacity: isReady ? 1 : 0.55,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (isReady) { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateX(4px)' }}}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = '' }}
                >
                  {/* Unit number badge */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: isReady ? 'var(--accent)' : 'var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 800,
                    color: isReady ? '#1a1814' : 'var(--muted)',
                  }}>
                    {unit.num}
                  </div>

                  {/* Title */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: isReady ? 'var(--text)' : 'var(--muted)' }}>
                      {unit.title}
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 1, marginTop: 2 }}>
                      {isReady ? 'Vocabulary · Grammar · True/False · Speaking · Writing' : 'Coming soon'}
                    </div>
                  </div>

                  {/* Status badge */}
                  {isReady ? (
                    <div style={{
                      fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700,
                      padding: '4px 10px', borderRadius: 20, letterSpacing: 1,
                      background: 'rgba(26,158,92,0.12)', color: 'var(--green)',
                      border: '1px solid rgba(26,158,92,0.2)',
                    }}>
                      ▶ PLAY
                    </div>
                  ) : (
                    <div style={{
                      fontFamily: 'var(--mono)', fontSize: 9,
                      padding: '4px 10px', borderRadius: 20, letterSpacing: 1,
                      background: 'var(--border)', color: 'var(--muted)',
                    }}>
                      🔒 SOON
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Footer note */}
          <div style={{ marginTop: 20, padding: '12px 14px', borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, marginBottom: 4 }}>HOW IT WORKS</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
              New units are added as you teach them. Each unit opens a full interactive lesson with vocabulary games, grammar exercises, speaking prompts and writing tasks — all based on the actual book content.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

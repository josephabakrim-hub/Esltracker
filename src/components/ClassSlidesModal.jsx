import { useMemo } from 'react'
import { getBook, getBookSlug } from '../lib/books'
import { slidesForBook } from '../lib/slides'

// ─────────────────────────────────────────────────────────────────────────────
//  📂 SLIDES & FILES
//  Your slides / flashcards for this class's book, grouped by unit.
//  PDFs and pictures open in a NEW browser tab (so the book can stay open in
//  another tab). PowerPoint files can be downloaded or viewed online.
//  Files live in  src/slides/<book>/  — see lib/slides.js.
// ─────────────────────────────────────────────────────────────────────────────

const officeViewer = url => `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(window.location.origin + url)}`

function FileRow({ f }) {
  const isPpt = f.ext === 'pptx' || f.ext === 'ppt'
  const btn = { textDecoration: 'none', fontSize: 12, padding: '7px 12px' }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface)', flexWrap: 'wrap' }}>
      <div style={{ fontSize: 26 }}>{f.kind.icon}</div>
      <div style={{ flex: '1 1 180px', minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, wordBreak: 'break-word' }}>{f.title}</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: 1 }}>{f.kind.label}</div>
      </div>
      {!isPpt && (
        <a className="btn btn-accent" style={btn} href={f.url} target="_blank" rel="noopener noreferrer">🖥️ Open in new tab</a>
      )}
      {isPpt && (
        <a className="btn btn-accent" style={btn} href={officeViewer(f.url)} target="_blank" rel="noopener noreferrer" title="Opens in Microsoft's free online viewer">🌐 View online</a>
      )}
      <a className="btn btn-outline" style={btn} href={f.url} download={f.file}>⬇ Download</a>
    </div>
  )
}

export default function ClassSlidesModal({ cls, onClose }) {
  const slug = getBookSlug(cls)
  const book = getBook(cls)
  const files = useMemo(() => slidesForBook(slug), [slug])

  // Group by unit (null = not tied to a unit)
  const groups = useMemo(() => {
    const map = new Map()
    files.forEach(f => {
      const k = f.unit === null ? 'other' : f.unit
      if (!map.has(k)) map.set(k, [])
      map.get(k).push(f)
    })
    return [...map.entries()]
  }, [files])

  const unitTitle = k => {
    if (k === 'other') return '📁 Other files'
    const u = (book?.units || []).find(x => x.num === k)
    return u ? `${u.emoji || '📘'} Unit ${u.num} — ${u.title}` : `📘 Unit ${k}`
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 720, width: '100%', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-title">📂 Slides &amp; Files — {cls?.name}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
          {book?.label ? `${book.label} · ` : ''}Opens in a new tab, so your book can stay open in another tab.
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gap: 18, paddingRight: 2 }}>
          {groups.length === 0 && (
            <div style={{ padding: 16, borderRadius: 12, background: 'var(--surface2)', fontSize: 13, lineHeight: 1.7 }}>
              <b>No files yet for this class.</b><br />
              Export your slides as a <b>PDF</b>, copy the file into your project folder
              <code style={{ display: 'block', margin: '6px 0', padding: '6px 8px', background: 'var(--surface)', borderRadius: 8, fontFamily: 'var(--mono)', fontSize: 12 }}>
                src\slides\{slug || 'general'}\unit-3 Flashcards.pdf
              </code>
              and push to GitHub. It will appear here by itself.
            </div>
          )}
          {groups.map(([k, list]) => (
            <div key={k}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--muted)', marginBottom: 8 }}>{unitTitle(k)}</div>
              <div style={{ display: 'grid', gap: 8 }}>{list.map(f => <FileRow key={f.url} f={f} />)}</div>
            </div>
          ))}
        </div>

        <div className="modal-actions"><button className="btn btn-outline" onClick={onClose}>Close</button></div>
      </div>
    </div>
  )
}

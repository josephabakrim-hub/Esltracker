// ── CLASS SLIDES & FILES ─────────────────────────────────────────────────────
// Your teaching files (slides exported as PDF, flashcards, pictures, …) live in
//   src/slides/<book>/        e.g.  src/slides/kidsboxng5/unit-3 Flashcards.pdf
//   src/slides/general/       files for every class
// There is NOTHING to register: drop a file in the folder, push to GitHub, and it
// appears on the class screen under "📂 Slides & Files", sorted by unit.
// The unit is read from the file name ("unit-3", "Unit 3", "unit3"…).

const found = import.meta.glob('../slides/**/*.{pdf,ppt,pptx,png,jpg,jpeg,webp,gif,mp4,mp3}', {
  query: '?url',
  import: 'default',
  eager: true,
})

const KINDS = {
  pdf:  { icon: '📄', label: 'PDF' },
  pptx: { icon: '📊', label: 'PowerPoint' },
  ppt:  { icon: '📊', label: 'PowerPoint' },
  png:  { icon: '🖼️', label: 'Image' },
  jpg:  { icon: '🖼️', label: 'Image' },
  jpeg: { icon: '🖼️', label: 'Image' },
  webp: { icon: '🖼️', label: 'Image' },
  gif:  { icon: '🖼️', label: 'Image' },
  mp4:  { icon: '🎬', label: 'Video' },
  mp3:  { icon: '🎧', label: 'Audio' },
}

const ALL = Object.entries(found).map(([path, url]) => {
  const parts = path.split('/')                // ['..', 'slides', '<folder>', …, 'file.ext']
  const folder = parts[2]
  const file = parts[parts.length - 1]
  const ext = file.split('.').pop().toLowerCase()
  const base = file.slice(0, file.length - ext.length - 1)
  const m = /unit[\s_-]*(\d+)/i.exec(base)
  return {
    folder, file, ext, url,
    title: base.replace(/[_]+/g, ' ').trim(),
    unit: m ? Number(m[1]) : null,
    kind: KINDS[ext] || { icon: '📎', label: ext.toUpperCase() },
  }
}).sort((a, b) => (a.unit ?? 999) - (b.unit ?? 999) || a.title.localeCompare(b.title, undefined, { numeric: true }))

/** Files for a class's book, plus the ones in the "general" folder. */
export function slidesForBook(slug) {
  return ALL.filter(f => f.folder === slug || f.folder === 'general')
}

/** Does any file exist for this book? (used to show a count on the button) */
export function slideCount(slug) {
  return slidesForBook(slug).length
}

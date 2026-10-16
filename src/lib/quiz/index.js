// ── Bomb Pass question engine ────────────────────────────────────────────────
// One bank per book slug. To add a new book (e.g. Level 6):
//   1. create  src/lib/quiz/kidsboxng6.js  (same shape as kidsboxng4.js)
//   2. import it below and add it to BOOK_BANKS.
// Nothing else in the app needs to change.

import kidsboxng1 from './kidsboxng1'
import kidsboxng2 from './kidsboxng2'
import kidsboxng3 from './kidsboxng3'
import kidsboxng4 from './kidsboxng4'
import kidsboxng5 from './kidsboxng5'
import { REAL_LIFE, GENERAL } from './general'

const BOOK_BANKS = {
  kidsboxng1,
  kidsboxng2,
  kidsboxng3,
  kidsboxng4,
  kidsboxng5,
}

export const CATEGORIES = [
  { id: 'book',    label: '📘 Book',            desc: 'Questions from the units you pick' },
  { id: 'real',    label: '🗣️ Real-Life English', desc: 'Phrases, spelling, polite English' },
  { id: 'general', label: '🌍 General Knowledge', desc: 'Things every student should know' },
]

export function hasBookBank(slug) {
  return !!(slug && BOOK_BANKS[slug])
}

/** Unit numbers that actually have questions for this book. */
export function bankUnits(slug) {
  return slug && BOOK_BANKS[slug] ? Object.keys(BOOK_BANKS[slug]).map(Number) : []
}

function toQuestion(row, category, unit = null, bookSlug = null) {
  const [q, correct, ...rest] = row
  const isTF = (correct === 'True' || correct === 'False') && (rest[0] === 'True' || rest[0] === 'False')
  const tip = (isTF ? rest[1] : rest[3]) || ''
  const options = isTF ? ['True', 'False'] : [correct, ...rest.slice(0, 3)]
  return { q, correct, options, tip, category, unit, slug: bookSlug, tf: isTF }
}

/**
 * Earlier levels of the same series that have a question bank, nearest first.
 * e.g. reviewBooks('kidsboxng3') → ['kidsboxng2', 'kidsboxng1']
 * Used for the optional "Review earlier books" setting.
 */
export function reviewBooks(slug) {
  const parse = s => /^(.*?)(\d+)$/.exec(s || '')
  const me = parse(slug)
  if (!me) return []
  return Object.keys(BOOK_BANKS)
    .map(s => ({ s, m: parse(s) }))
    .filter(x => x.m && x.m[1] === me[1] && Number(x.m[2]) < Number(me[2]))
    .sort((a, b) => Number(b.m[2]) - Number(a.m[2]))
    .map(x => x.s)
}

/**
 * Build the full question pool.
 *   slug, units, categories → the class's own book + Real-Life / General
 *   review                  → optional earlier books: [{ slug, units }]
 * Review questions are tagged category 'review' so the game can mix them in
 * at the share the teacher chose.
 */
export function buildPool({ slug, units = [], categories = [], review = [] }) {
  const pool = []
  if (categories.includes('book') && slug && BOOK_BANKS[slug]) {
    units.forEach(u => (BOOK_BANKS[slug][u] || []).forEach(r => pool.push(toQuestion(r, 'book', u, slug))))
  }
  if (categories.includes('real')) REAL_LIFE.forEach(r => pool.push(toQuestion(r, 'real')))
  if (categories.includes('general')) GENERAL.forEach(r => pool.push(toQuestion(r, 'general')))
  review.forEach(({ slug: rs, units: ru }) => {
    if (!BOOK_BANKS[rs]) return
    ;(ru || []).forEach(u => (BOOK_BANKS[rs][u] || []).forEach(r => pool.push(toQuestion(r, 'review', u, rs))))
  })
  return pool
}

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Produce a playable question: options shuffled (True/False kept in order). */
export function prepareQuestion(q) {
  return { ...q, options: q.tf ? q.options : shuffle(q.options) }
}

// ── Bomb Pass question engine ────────────────────────────────────────────────
// One bank per book slug. To add Book 1, 2, 3 or 5 later:
//   1. create  src/lib/quiz/kidsboxng1.js  (same shape as kidsboxng4.js)
//   2. import it below and add it to BOOK_BANKS.
// Nothing else in the app needs to change.

import kidsboxng4 from './kidsboxng4'
import { REAL_LIFE, GENERAL } from './general'

const BOOK_BANKS = {
  kidsboxng4,
  // kidsboxng1,
  // kidsboxng2,
  // kidsboxng3,
  // kidsboxng5,
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

function toQuestion(row, category, unit = null) {
  const [q, correct, ...rest] = row
  const isTF = row.length === 3 && correct === 'True'
  const tip = isTF ? '' : (rest.length > 3 ? rest[3] : '')
  const options = isTF ? ['True', 'False'] : [correct, ...rest.slice(0, 3)]
  return { q, correct, options, tip, category, unit, tf: isTF }
}

/** Build the full question pool for the chosen book / units / categories. */
export function buildPool({ slug, units = [], categories = [] }) {
  const pool = []
  if (categories.includes('book') && slug && BOOK_BANKS[slug]) {
    units.forEach(u => (BOOK_BANKS[slug][u] || []).forEach(r => pool.push(toQuestion(r, 'book', u))))
  }
  if (categories.includes('real')) REAL_LIFE.forEach(r => pool.push(toQuestion(r, 'real')))
  if (categories.includes('general')) GENERAL.forEach(r => pool.push(toQuestion(r, 'general')))
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

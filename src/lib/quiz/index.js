// ── Bomb Pass question engine ────────────────────────────────────────────────
// One bank per book slug. To add a new book (e.g. Level 6):
//   1. create  src/lib/quiz/kidsboxng6.js  (same shape as kidsboxng4.js)
//   2. import it below and add it to BOOK_BANKS.
// Nothing else in the app needs to change.
//
// Non-book questions live in real.js · spelling.js · world.js · knowledge.js · brain.js,
// each split into 3 difficulty tiers. To add a new question type, create a file like
// brain.js, import it and add it to TIERED + CATEGORIES (+ CATEGORY_LABELS) below.

import kidsboxng1 from './kidsboxng1'
import kidsboxng2 from './kidsboxng2'
import kidsboxng3 from './kidsboxng3'
import kidsboxng4 from './kidsboxng4'
import kidsboxng5 from './kidsboxng5'
import real from './real'
import spelling from './spelling'
import world from './world'
import knowledge from './knowledge'
import brain from './brain'

const BOOK_BANKS = {
  kidsboxng1,
  kidsboxng2,
  kidsboxng3,
  kidsboxng4,
  kidsboxng5,
}

// Question types the teacher can switch on. Everything except 'book' and 'review'
// lives in a file with three difficulty tiers (1 easy · 2 medium · 3 challenging).
const TIERED = { real, spelling, world, general: knowledge, brain }

export const CATEGORIES = [
  { id: 'book',     label: '📘 Book',                  desc: 'Questions from the units you pick' },
  { id: 'real',     label: '🗣️ Real-Life English',      desc: 'Everyday phrases, polite English, signs, idioms' },
  { id: 'spelling', label: '✏️ Spelling & Words',       desc: 'Spelling, opposites, plurals, past tense, word meanings' },
  { id: 'world',    label: '🗺️ World & Geography',      desc: 'Capital cities, continents, landmarks' },
  { id: 'general',  label: '🌟 General Knowledge',     desc: 'Science, animals, famous people, sport, culture' },
  { id: 'brain',    label: '🧠 Brain Teasers',         desc: 'Patterns, logic, riddles and number puzzles' },
]

// Short labels shown above each question during a game
export const CATEGORY_LABELS = {
  real: '🗣️ REAL-LIFE ENGLISH',
  spelling: '✏️ SPELLING & WORDS',
  world: '🗺️ WORLD & GEOGRAPHY',
  general: '🌟 GENERAL KNOWLEDGE',
  brain: '🧠 BRAIN TEASER',
}

export const TIER_OPTIONS = [
  { v: 0, label: '🎯 Automatic (matches the class book)' },
  { v: 1, label: '🌱 Easier' },
  { v: 2, label: '🌿 Medium' },
  { v: 3, label: '🌳 Challenging' },
]

/** Difficulty tier that suits a class, from its book: Kids Box 1–2 → 1, 3–4 → 2, 5+ → 3. */
export function tierForSlug(slug) {
  const m = /(\d+)$/.exec(slug || '')
  const n = m ? Number(m[1]) : 3
  return n <= 2 ? 1 : n <= 4 ? 2 : 3
}

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
export function buildPool({ slug, units = [], categories = [], review = [], tier = 0 }) {
  const pool = []
  if (categories.includes('book') && slug && BOOK_BANKS[slug]) {
    units.forEach(u => (BOOK_BANKS[slug][u] || []).forEach(r => pool.push(toQuestion(r, 'book', u, slug))))
  }
  // Non-book questions: the class's tier plus the one just below it (tier 1 gets only tier 1)
  const top = tier || tierForSlug(slug)
  const tiers = top === 1 ? [1] : [top - 1, top]
  Object.entries(TIERED).forEach(([id, bank]) => {
    if (!categories.includes(id)) return
    tiers.forEach(t => (bank[t] || []).forEach(r => pool.push(toQuestion(r, id))))
  })
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

// ── BOOK LIBRARY ─────────────────────────────────────────────────────────────
// Single source of truth for every textbook: its units, Spin of Doom question
// bank, and homework assignments. Assign a bookSlug to a class in
// Admin → Book Assignment and the class automatically gets everything defined
// here — nothing needs to be re-entered per class.
//
// To add a new book: add an entry below with a unique slug. `units` is
// required for the Lessons Hub to work; `spinQuestions` and `homework` can
// start empty and be filled in later — nothing else needs to change.
//
// Content build log:
//   kidsboxng3 — fully populated (units, Spin of Doom bank, homework),
//   verified against the teacher's own Language Summary pages, Aug 2026.
//   All other books — units only, carried over from the original app.
//   Their Spin of Doom / homework content has not been built yet.

import { getRandomQuestion as getGeneralQuestion } from './questions'

export const BOOKS = {

  // ═══════════════════════════════════════════════════════════════════════
  // KIDS BOX NEW GENERATION 3 — Pro track — A1 (Cambridge Movers prep)
  // Content verified against the teacher's own book, Aug 2026.
  // ═══════════════════════════════════════════════════════════════════════
  kidsboxng3: {
    slug: 'kidsboxng3',
    label: 'Kids Box NG — Level 3',
    series: 'Kids Box New Generation',
    track: 'pro',
    cefr: 'A1 (Movers)',
    color: '#22c55e',

    units: [
      { num: 0, title: 'Hello!',             emoji: '👋' },
      { num: 1, title: 'Family Matters',     emoji: '👨‍👩‍👧' },
      { num: 2, title: 'Home Sweet Home',    emoji: '🏠' },
      { num: 3, title: 'A Day in the Life',  emoji: '⏰' },
      { num: 4, title: 'In the City',        emoji: '🏙️' },
      { num: 5, title: 'Fit and Well',       emoji: '💪' },
      { num: 6, title: 'In the Countryside', emoji: '🌳' },
      { num: 7, title: 'World of Animals',   emoji: '🦁' },
      { num: 8, title: 'Weather Report',     emoji: '⛅' },
    ],

    // Spin of Doom question bank — grouped by unit, using only vocabulary
    // and grammar confirmed on the book's own Language Summary pages.
    spinQuestions: [
      // Unit 0 — Hello!
      { unit: 0, category: '👋 Unit 0: Hello!', q: "What color do you get when you mix blue and yellow?", a: "Green" },
      { unit: 0, category: '👋 Unit 0: Hello!', q: "Count out loud from one to five in English.", a: "One, two, three, four, five" },
      { unit: 0, category: '👋 Unit 0: Hello!', q: "Name one toy that starts with the letter K.", a: "Kite" },
      { unit: 0, category: '👋 Unit 0: Hello!', q: "If a cat is 'under the table', where is it?", a: "Below/underneath the table" },
      { unit: 0, category: '👋 Unit 0: Hello!', q: "Ask a friend 'What's your name?' — how would they answer if their name is Suzy?", a: "My name's Suzy." },

      // Unit 1 — Family Matters
      { unit: 1, category: '👨‍👩‍👧 Unit 1: Family Matters', q: "What do you call your mother's sister?", a: "Aunt" },
      { unit: 1, category: '👨‍👩‍👧 Unit 1: Family Matters', q: "What do you call your parents' parents?", a: "Grandparents" },
      { unit: 1, category: '👨‍👩‍👧 Unit 1: Family Matters', q: "What do you call your son's daughter?", a: "Granddaughter" },
      { unit: 1, category: '👨‍👩‍👧 Unit 1: Family Matters', q: "What do we call hair that isn't straight, but grows in curls?", a: "Curly hair" },
      { unit: 1, category: '👨‍👩‍👧 Unit 1: Family Matters', q: "Say a sentence using 's to show something belongs to Tom.", a: "e.g. That's Tom's bike." },

      // Unit 2 — Home Sweet Home
      { unit: 2, category: '🏠 Unit 2: Home Sweet Home', q: "What do you call the floor of a house that is under the ground?", a: "Basement" },
      { unit: 2, category: '🏠 Unit 2: Home Sweet Home', q: "What is the British English word for the machine that takes you up between floors?", a: "A lift" },
      { unit: 2, category: '🏠 Unit 2: Home Sweet Home', q: "What do we call the outdoor space attached to a flat, often with a nice view?", a: "Balcony" },
      { unit: 2, category: '🏠 Unit 2: Home Sweet Home', q: "Is London a city, a town, or a village?", a: "A city" },
      { unit: 2, category: '🏠 Unit 2: Home Sweet Home', q: "What is 30 + 40 in English?", a: "Seventy" },

      // Unit 3 — A Day in the Life
      { unit: 3, category: '⏰ Unit 3: A Day in the Life', q: "Which comes first in the morning: waking up or getting up?", a: "Waking up" },
      { unit: 3, category: '⏰ Unit 3: A Day in the Life', q: "Name the seven days of the week, starting with Monday.", a: "Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday" },
      { unit: 3, category: '⏰ Unit 3: A Day in the Life', q: "If you do something every single day, do you say 'always', 'sometimes', or 'never'?", a: "Always" },
      { unit: 3, category: '⏰ Unit 3: A Day in the Life', q: "What phrase means getting on the bus to travel somewhere?", a: "Catch the bus" },
      { unit: 3, category: '⏰ Unit 3: A Day in the Life', q: "What do you do in the shower every morning?", a: "Wash / have a shower" },

      // Unit 4 — In the City
      { unit: 4, category: '🏙️ Unit 4: In the City', q: "Where do you go to watch a film?", a: "Cinema" },
      { unit: 4, category: '🏙️ Unit 4: In the City', q: "Where do you go if you are very sick?", a: "Hospital" },
      { unit: 4, category: '🏙️ Unit 4: In the City', q: "Where do you go to borrow books?", a: "Library" },
      { unit: 4, category: '🏙️ Unit 4: In the City', q: "Where do you go to do the weekly food shopping?", a: "Supermarket" },
      { unit: 4, category: '🏙️ Unit 4: In the City', q: "Where in the city can you swim indoors?", a: "Swimming pool" },

      // Unit 5 — Fit and Well
      { unit: 5, category: '💪 Unit 5: Fit and Well', q: "If your tooth hurts, what's the matter with you?", a: "I've got a toothache." },
      { unit: 5, category: '💪 Unit 5: Fit and Well', q: "If your head hurts, what's the matter with you?", a: "I've got a headache." },
      { unit: 5, category: '💪 Unit 5: Fit and Well', q: "Which of these means jumping on one foot: hop, climb, or swim?", a: "Hop" },
      { unit: 5, category: '💪 Unit 5: Fit and Well', q: "How do you say you have a fever in English?", a: "I've got a temperature." },
      { unit: 5, category: '💪 Unit 5: Fit and Well', q: "Name three things your body can do: climb, dance, hop, jump, run, skip, or swim.", a: "Any three, e.g. run, jump, swim" },

      // Unit 6 — In the Countryside
      { unit: 6, category: '🌳 Unit 6: In the Countryside', q: "Where would you find lots of trees close together?", a: "Forest" },
      { unit: 6, category: '🌳 Unit 6: In the Countryside', q: "What falls from a tree, and is one single word for a leaf?", a: "A leaf" },
      { unit: 6, category: '🌳 Unit 6: In the Countryside', q: "What natural feature is water falling from a high place called?", a: "Waterfall" },
      { unit: 6, category: '🌳 Unit 6: In the Countryside', q: "What's the opposite of 'strong'?", a: "Weak" },
      { unit: 6, category: '🌳 Unit 6: In the Countryside', q: "What do you call a meal you eat outdoors, often sitting on the grass?", a: "A picnic" },

      // Unit 7 — World of Animals
      { unit: 7, category: '🦁 Unit 7: World of Animals', q: "What animal carries its baby in a pouch?", a: "Kangaroo" },
      { unit: 7, category: '🦁 Unit 7: World of Animals', q: "What is the biggest animal in the sea?", a: "Whale" },
      { unit: 7, category: '🦁 Unit 7: World of Animals', q: "What black-and-white animal loves eating bamboo?", a: "Panda" },
      { unit: 7, category: '🦁 Unit 7: World of Animals', q: "What bird can learn to copy human speech?", a: "Parrot" },
      { unit: 7, category: '🦁 Unit 7: World of Animals', q: "Say a comparative sentence: which is bigger, a shark or a dolphin?", a: "A shark is bigger than a dolphin." },

      // Unit 8 — Weather Report
      { unit: 8, category: '⛅ Unit 8: Weather Report', q: "What do you wear on your hands when it's cold?", a: "Gloves" },
      { unit: 8, category: '⛅ Unit 8: Weather Report', q: "What colourful arc can you sometimes see in the sky after it rains?", a: "A rainbow" },
      { unit: 8, category: '⛅ Unit 8: Weather Report', q: "What do you wear when you go swimming?", a: "Swim shorts" },
      { unit: 8, category: '⛅ Unit 8: Weather Report', q: "Finish the sentence: 'Yesterday, the weather ___ sunny.'", a: "was" },
      { unit: 8, category: '⛅ Unit 8: Weather Report', q: "What do you wear on your head to keep warm in windy weather?", a: "A hat" },
    ],

    // Homework — one short assignment per unit, reinforcing that unit's
    // vocabulary/grammar. These are reference assignments for now (shown to
    // the teacher and student to complete together); online auto-graded
    // versions can be built on top of this later without changing anything
    // here.
    homework: [
      { unit: 0, title: 'Toy Box', instructions: "Draw and label 5 toys from class using the words: bike, doll, kite, train, monster.", estMinutes: 15 },
      { unit: 1, title: 'My Family Tree', instructions: "Draw your family tree. Label at least 5 people using: mother, father, aunt, uncle, grandparents, son, daughter.", estMinutes: 20 },
      { unit: 2, title: 'My Home', instructions: "Draw a picture of your home. Label 5 parts of it using words like balcony, stairs, upstairs, basement.", estMinutes: 20 },
      { unit: 3, title: 'My Daily Routine', instructions: "Write 5 sentences about your day using always/sometimes/never — e.g. 'I always wake up at 7.'", estMinutes: 15 },
      { unit: 4, title: 'Around My City', instructions: "Write 3 sentences saying where you go in your city to do different things, e.g. 'I go to the supermarket to buy food.'", estMinutes: 15 },
      { unit: 5, title: 'Staying Fit', instructions: "Choose 2 sports from climb, dance, hop, jump, run, skip, swim — write a sentence about each and say why you like it.", estMinutes: 15 },
      { unit: 6, title: 'Countryside Picture', instructions: "Draw a countryside scene and label it using 5 words: field, forest, lake, river, waterfall.", estMinutes: 20 },
      { unit: 7, title: 'Animal Comparisons', instructions: "Choose 3 animals from the unit and write one comparative sentence for each, e.g. 'A whale is bigger than a shark.'", estMinutes: 15 },
      { unit: 8, title: 'Weather Report', instructions: "Write today's weather report! Describe the weather and say what clothes you should wear.", estMinutes: 15 },
    ],

    materials: [],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // The books below carry over their unit lists from the original app.
  // Spin of Doom question banks and homework have not been built yet —
  // classes on these books currently fall back to the general question
  // bank in lib/questions.js. Build these out the same way as kidsboxng3
  // whenever it's time for that book.
  // ═══════════════════════════════════════════════════════════════════════

  kidsboxng1: {
    slug: 'kidsboxng1',
    label: 'Kids Box NG — Level 1',
    series: 'Kids Box New Generation',
    track: 'pro',
    cefr: 'Pre-A1 (Starters)',
    color: '#f59e0b',
    units: [
      { num: 0,  title: 'Hello!',         emoji: '👋' },
      { num: 1,  title: 'Hello!',         emoji: '🌍' },
      { num: 2,  title: 'My School',      emoji: '🏫' },
      { num: 3,  title: 'Favourite Toys', emoji: '🧸' },
      { num: 4,  title: 'My Family',      emoji: '👨‍👩‍👧' },
      { num: 5,  title: 'Our Pets',       emoji: '🐾' },
      { num: 6,  title: 'My Face',        emoji: '😊' },
      { num: 7,  title: 'Wild Animals',   emoji: '🦁' },
      { num: 8,  title: 'My Clothes',     emoji: '👕' },
      { num: 9,  title: 'Fun Time!',      emoji: '🎉' },
      { num: 10, title: 'At the Funfair', emoji: '🎡' },
      { num: 11, title: 'Our House',      emoji: '🏠' },
      { num: 12, title: 'Party Time!',    emoji: '🎂' },
    ],
    spinQuestions: [],
    homework: [],
    materials: [],
  },

  kidsboxng2: {
    slug: 'kidsboxng2',
    label: 'Kids Box NG — Level 2',
    series: 'Kids Box New Generation',
    track: 'pro',
    cefr: 'Pre-A1 (Starters)',
    color: '#3b82f6',
    units: [
      { num: 1,  title: 'Hello Again!',   emoji: '👋' },
      { num: 2,  title: 'Back to School', emoji: '🎒' },
      { num: 3,  title: 'Play Time!',     emoji: '⚽' },
      { num: 4,  title: 'At Home',        emoji: '🏠' },
      { num: 5,  title: 'Meet My Family', emoji: '👨‍👩‍👧' },
      { num: 6,  title: 'Dinner Time',    emoji: '🍽️' },
      { num: 7,  title: 'At the Farm',    emoji: '🌾' },
      { num: 8,  title: 'My Town',        emoji: '🏙️' },
      { num: 9,  title: 'Our Clothes',    emoji: '👗' },
      { num: 10, title: 'Our Hobbies',    emoji: '🎨' },
      { num: 11, title: 'My Birthday',    emoji: '🎁' },
      { num: 12, title: 'On Holiday!',    emoji: '✈️' },
    ],
    spinQuestions: [],
    homework: [],
    materials: [],
  },

  kidsboxng4: {
    slug: 'kidsboxng4',
    label: 'Kids Box NG — Level 4',
    series: 'Kids Box New Generation',
    track: 'pro',
    cefr: 'A1 (Movers)',
    color: '#8b5cf6',
    units: [
      { num: 0, title: 'Hello There!',        emoji: '👋' },
      { num: 1, title: 'Back to School',      emoji: '🎒' },
      { num: 2, title: 'Good Sports',         emoji: '🏅' },
      { num: 3, title: 'Health Matters',      emoji: '🏥' },
      { num: 4, title: 'After School Club',   emoji: '🎭' },
      { num: 5, title: 'Exploring Our World', emoji: '🌍' },
      { num: 6, title: 'Technology',          emoji: '💻' },
      { num: 7, title: 'At the Zoo',          emoji: '🦒' },
      { num: 8, title: "Let's Party!",        emoji: '🎉' },
    ],
    spinQuestions: [],
    homework: [],
    materials: [],
  },

  thinkstarter: {
    slug: 'thinkstarter',
    label: 'Think — Starter',
    series: 'Cambridge Think',
    track: 'elite',
    cefr: 'A1',
    color: '#ec4899',
    units: [
      { num: 0,  title: 'Welcome',                 emoji: '👋' },
      { num: 1,  title: 'One World',               emoji: '🌍' },
      { num: 2,  title: 'I Feel Happy',            emoji: '😊' },
      { num: 3,  title: 'Me and My Family',        emoji: '👨‍👩‍👧' },
      { num: 4,  title: 'In the City',             emoji: '🏙️' },
      { num: 5,  title: 'In My Free Time',         emoji: '🎮' },
      { num: 6,  title: 'Friends',                 emoji: '🤝' },
      { num: 7,  title: 'Sporting Life',           emoji: '⚽' },
      { num: 8,  title: 'Dance to the Music',      emoji: '🎵' },
      { num: 9,  title: 'Would You Like Dessert?', emoji: '🍰' },
      { num: 10, title: 'High Flyers',             emoji: '✈️' },
      { num: 11, title: 'A World of Animals',      emoji: '🦁' },
      { num: 12, title: 'Getting About',           emoji: '🚌' },
    ],
    spinQuestions: [],
    homework: [],
    materials: [],
  },

  thinkl2: {
    slug: 'thinkl2',
    label: 'Think — Level 2',
    series: 'Cambridge Think',
    track: 'elite',
    cefr: 'B1',
    color: '#e85d26',
    units: [
      { num: 0,  title: 'Welcome',              emoji: '👋' },
      { num: 1,  title: 'Amazing People',       emoji: '🌟' },
      { num: 2,  title: 'The Ways We Learn',    emoji: '📚' },
      { num: 3,  title: "That's Entertainment", emoji: '🎬' },
      { num: 4,  title: 'Social Networking',    emoji: '📱' },
      { num: 5,  title: 'My Life in Music',     emoji: '🎵' },
      { num: 6,  title: 'Making a Difference',  emoji: '💚' },
      { num: 7,  title: 'Future Fun',           emoji: '🚀' },
      { num: 8,  title: 'Science Counts',       emoji: '🔬' },
      { num: 9,  title: "What a Job!",          emoji: '💼' },
      { num: 10, title: 'Keep Healthy',         emoji: '💪' },
      { num: 11, title: 'Making the News',      emoji: '📰' },
      { num: 12, title: 'Playing by the Rules', emoji: '📋' },
    ],
    spinQuestions: [],
    homework: [],
    materials: [],
  },

  thinkl3: {
    slug: 'thinkl3',
    label: 'Think — Level 3',
    series: 'Cambridge Think',
    track: 'elite',
    cefr: 'B1+',
    color: '#06b6d4',
    units: [
      { num: 0,  title: 'Welcome',                     emoji: '👋' },
      { num: 1,  title: 'Life Plans',                  emoji: '🗺️' },
      { num: 2,  title: 'Hard Times',                  emoji: '💪' },
      { num: 3,  title: "What's in a Name?",           emoji: '🏷️' },
      { num: 4,  title: 'Dilemmas',                    emoji: '🤔' },
      { num: 5,  title: 'What a Story!',               emoji: '📖' },
      { num: 6,  title: 'How Do They Do It?',          emoji: '🔧' },
      { num: 7,  title: 'All the Same?',               emoji: '🌐' },
      { num: 8,  title: "It's a Crime",                emoji: '🔍' },
      { num: 9,  title: 'What Happened?',              emoji: '❓' },
      { num: 10, title: 'Money',                       emoji: '💰' },
      { num: 11, title: 'Help!',                       emoji: '🆘' },
      { num: 12, title: 'A First Time for Everything', emoji: '🌟' },
    ],
    spinQuestions: [],
    homework: [],
    materials: [],
  },
}

// ── Legacy class-name → book fallback ────────────────────────────────────────
// Kept only for classes that don't yet have a real `bookSlug` field saved on
// them. New/renamed classes should be assigned a book directly in
// Admin → Book Assignment, which sets `class.bookSlug` and skips this
// entirely.
const CLASS_NAME_FALLBACK = {
  'Elite2_2': 'thinkl2',      'Elite3_S': 'thinkstarter',  'Elite1_3': 'thinkl3',
  'ATB_Elite3_S': 'thinkstarter', 'ATB_Elite1_3': 'thinkl3',
  'Pro1_3': 'kidsboxng3',     'Pro5_4': 'kidsboxng4',      'Pro1_2': 'kidsboxng2',
  'Pro3_S': 'kidsboxng1',     'Pro2_2': 'kidsboxng2',      'Pro3_1': 'kidsboxng1',
  'Pro6_2': 'kidsboxng3',
  'ATB_Pro1_3': 'kidsboxng3', 'ATB_Pro5_4': 'kidsboxng4',
  'HTB_Pro1-2': 'kidsboxng2', 'HTB_Pro2_2': 'kidsboxng2',
  'HTB_Pro4-3': 'kidsboxng4', 'HTB_Pro3_1': 'kidsboxng1',  'HTB_Pro1_2': 'kidsboxng2',
}

// ── Public helpers ────────────────────────────────────────────────────────────

/** Resolve a class (or class name) to a book slug, or null if none assigned. */
export function getBookSlug(cls) {
  if (!cls) return null
  if (cls.bookSlug) return cls.bookSlug
  const className = typeof cls === 'string' ? cls : cls?.name
  if (!className) return null
  if (CLASS_NAME_FALLBACK[className]) return CLASS_NAME_FALLBACK[className]
  return CLASS_NAME_FALLBACK[className.replace(/^(ATB_|HTB_)/, '')] || null
}

/** Resolve a class straight to its full book object, or null. */
export function getBook(cls) {
  const slug = getBookSlug(cls)
  return slug ? BOOKS[slug] || null : null
}

export function getBookLabel(slug) {
  return BOOKS[slug]?.label || slug || '—'
}

export function getBookUnitCount(slug) {
  return BOOKS[slug]?.units?.length || 0
}

/**
 * Pick a Spin of Doom question for a class. Uses the class's assigned book's
 * own question bank when it has one; otherwise falls back to the general
 * level-wide bank in lib/questions.js so Spin of Doom keeps working for any
 * class/book that doesn't have book-specific questions built yet.
 */
export function getSpinQuestion(cls, level) {
  const book = getBook(cls)
  if (book && book.spinQuestions && book.spinQuestions.length > 0) {
    const pool = book.spinQuestions
    return pool[Math.floor(Math.random() * pool.length)]
  }
  return getGeneralQuestion(level)
}

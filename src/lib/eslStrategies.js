// ─────────────────────────────────────────────────────────────────────────────
//  ESL STRATEGY LAB — data
//  42 teaching strategies with a success rate for each.
//
//  How the score is built (see StrategyLab.jsx, "How the success rate is calculated"):
//    e = Evidence      how strongly research supports the technique        (0–100)
//    r = Retention     how likely the learning is to last weeks later      (0–100)
//    g = Engagement    how likely learners stay focused and involved       (0–100)
//    score = 40% evidence + 40% retention + 20% engagement  → success rate
//
// ─────────────────────────────────────────────────────────────────────────────

export const AREAS = [
  { id: 'vocab',   label: 'Vocabulary',          emoji: '📚' },
  { id: 'grammar', label: 'Grammar',             emoji: '🧩' },
  { id: 'pron',    label: 'Pronunciation',       emoji: '🗣️' },
  { id: 'speak',   label: 'Speaking & Listening', emoji: '🎧' },
  { id: 'rw',      label: 'Reading & Writing',   emoji: '✍️' },
  { id: 'motiv',   label: 'Motivation & Classroom', emoji: '🌟' },
]

export const BANDS = [
  { id: 'elite',    label: 'Elite',    range: '75+',   min: 75, max: 100, color: '#16a34a' },
  { id: 'strong',   label: 'Strong',   range: '60–74', min: 60, max: 74.99, color: '#0d9488' },
  { id: 'moderate', label: 'Moderate', range: '30–59', min: 30, max: 59.99, color: '#d97706' },
  { id: 'low',      label: 'Low',      range: 'below 30', min: 0, max: 29.99, color: '#dc2626' },
]

export const bandOf = score => BANDS.find(b => score >= b.min && score <= b.max) || BANDS[3]
export const scoreOf = s => Math.round(0.4 * s.e + 0.4 * s.r + 0.2 * s.g)

// effort: how much preparation it takes · speed: how soon you usually see results
const RAW = [
  // ── Vocabulary ──────────────────────────────────────────────────────────────
  { id: 'v1', area: 'vocab', name: 'Spaced repetition', e: 90, r: 92, g: 55, effort: 'Low', speed: 'Weeks',
    why: 'Reviewing a word just before it fades flattens the forgetting curve. Spaced practice consistently beats massed practice in second-language studies.',
    use: 'Bring Unit 3 words back in Units 4, 5 and 7 as a 5-minute warm-up. Use the “review earlier books” setting in your games every week.' },
  { id: 'v2', area: 'vocab', name: 'Retrieval practice (no-notes quizzes)', e: 90, r: 88, g: 60, effort: 'Low', speed: 'Days',
    why: 'Pulling a word out of memory strengthens it far more than re-reading. Even ungraded quizzes improve recall a week later.',
    use: 'Open the lesson with a 3-minute no-notes quiz on last week’s words, or run Boss Battle on the previous units.' },
  { id: 'v3', area: 'vocab', name: 'Many meaningful encounters (8–12 meetings)', e: 85, r: 82, g: 60, effort: 'Medium', speed: 'Weeks',
    why: 'Most words need around 8–12 meetings in different contexts before they stick. One explanation is rarely enough.',
    use: 'Plan each target word to appear in a story, a game question and a speaking task within the same week.' },
  { id: 'v4', area: 'vocab', name: 'Picture + gesture pairing (TPR)', e: 75, r: 72, g: 88, effort: 'Low', speed: 'Days',
    why: 'Linking a word to an image or a movement gives a second memory route. It works best with young learners and concrete words.',
    use: 'Kids Box classes: act out verbs and flash picture cards before any writing. Let students be the “teacher” who does the gesture.' },
  { id: 'v5', area: 'vocab', name: 'Teaching collocations and chunks', e: 78, r: 78, g: 58, effort: 'Medium', speed: 'Weeks',
    why: 'Learners who store “make a decision” as one unit speak faster and sound more natural than those who store single words.',
    use: 'Think classes: teach “make a mistake / do homework / take a photo” as ready-made phrases, then use them in pair talk.' },
  { id: 'v6', area: 'vocab', name: 'Keyword mnemonics', e: 70, r: 62, g: 75, effort: 'Medium', speed: 'Days',
    why: 'A vivid sound-alike image links form and meaning quickly. Depth of knowledge and long-term retention still need follow-up practice.',
    use: 'Use it only for the tricky words, then re-quiz two days later to lock them in.' },

  // ── Grammar ─────────────────────────────────────────────────────────────────
  { id: 'g1', area: 'grammar', name: 'Explicit explanation + practice', e: 88, r: 78, g: 55, effort: 'Medium', speed: 'Weeks',
    why: 'Large reviews of second-language instruction find that explicit teaching with practice beats leaving grammar to chance, especially for older learners.',
    use: 'Explain the rule in 2 minutes, then move quickly to controlled practice and then free practice.' },
  { id: 'g2', area: 'grammar', name: 'Task-based learning with a focus on form', e: 78, r: 74, g: 82, effort: 'High', speed: 'Weeks',
    why: 'Learners use grammar to finish a real task. The teacher then zooms in on the errors that actually appeared.',
    use: 'Elite: plan a weekend trip in pairs, then spend 5 minutes on the mistakes you heard while circulating.' },
  { id: 'g3', area: 'grammar', name: 'Prompts (elicit self-correction)', e: 75, r: 76, g: 62, effort: 'Low', speed: 'Weeks',
    why: 'Hints such as “Try again?” push learners to repair the error themselves. This tends to beat simply giving the right answer.',
    use: 'Repeat the error with a rising tone, raise an eyebrow, or say “again?” before you give the correct form.' },
  { id: 'g4', area: 'grammar', name: 'Recasts (rephrase it correctly)', e: 70, r: 58, g: 72, effort: 'Low', speed: 'Weeks',
    why: 'Repeating the sentence correctly keeps the conversation flowing, but many learners do not notice that they were corrected.',
    use: 'Recast, then check noticing: “Did you hear what I changed?”' },
  { id: 'g5', area: 'grammar', name: 'Guided discovery (inductive)', e: 68, r: 70, g: 72, effort: 'Medium', speed: 'Weeks',
    why: 'Students spot the pattern in examples and state the rule themselves, which improves understanding and memory.',
    use: 'Write six example sentences on the board and ask “What do you notice?” before you name the rule.' },
  { id: 'g6', area: 'grammar', name: 'Dictogloss', e: 66, r: 68, g: 74, effort: 'Medium', speed: 'Weeks',
    why: 'Students listen to a short text, take notes and rebuild it in groups, noticing the grammar they missed.',
    use: 'Read a five-sentence text twice at natural speed. Groups rebuild it, then compare with the original.' },

  // ── Pronunciation ───────────────────────────────────────────────────────────
  { id: 'p1', area: 'pron', name: 'High-variability phonetic training (minimal pairs)', e: 82, r: 78, g: 60, effort: 'Medium', speed: 'Weeks',
    why: 'Hearing minimal pairs from many different speakers trains perception, and studies show it improves production as well.',
    use: 'Use sheep/ship and think/sink pairs from several voices. Five minutes, twice a week.' },
  { id: 'p2', area: 'pron', name: 'Shadowing', e: 72, r: 68, g: 62, effort: 'Low', speed: 'Weeks',
    why: 'Repeating a speaker almost at the same moment trains rhythm, intonation and listening together.',
    use: 'Play 20-second clips. Students whisper-shadow, then record themselves and compare.' },
  { id: 'p3', area: 'pron', name: 'Rhythm and stress through chants', e: 70, r: 70, g: 84, effort: 'Low', speed: 'Days',
    why: 'Rhythm and stress carry meaning. Chants teach them with high engagement and low anxiety.',
    use: 'Kids Box: clap the word stress. Teens: mark stress in a sentence and say it with the beat.' },
  { id: 'p4', area: 'pron', name: 'Systematic phonics (young learners)', e: 92, r: 88, g: 70, effort: 'Medium', speed: 'Months',
    why: 'Teaching sounds and letters in a clear order is among the best-supported approaches for reading and spelling in young learners.',
    use: 'Kids Box 1–3: 5 minutes of phonics every lesson, building on the sounds already taught.' },

  // ── Speaking & Listening ────────────────────────────────────────────────────
  { id: 's1', area: 'speak', name: 'Structured pair work (roles + goal + time)', e: 78, r: 72, g: 88, effort: 'Low', speed: 'Days',
    why: 'Clear roles and a goal give each student far more speaking practice than teacher-led talk.',
    use: 'Give each pair roles A and B, a time limit and an outcome. Circulate and note errors to review afterwards.' },
  { id: 's2', area: 'speak', name: 'Planning time before speaking', e: 72, r: 62, g: 60, effort: 'Low', speed: 'Days',
    why: 'Even one or two minutes of planning improves fluency and the complexity of what learners say.',
    use: 'Say “Take 90 seconds to think” before every speaking task. Let them jot down keywords, not sentences.' },
  { id: 's3', area: 'speak', name: 'Task repetition (4-3-2 fluency)', e: 74, r: 70, g: 58, effort: 'Low', speed: 'Weeks',
    why: 'Repeating the same task with new partners and less time builds fluency and accuracy without new content.',
    use: 'Students tell the same story to three partners, in 4, then 3, then 2 minutes.' },
  { id: 's4', area: 'speak', name: 'Captioned video with a task', e: 66, r: 62, g: 82, effort: 'Medium', speed: 'Weeks',
    why: 'Short videos with English captions support vocabulary and listening, provided learners have a job to do while watching.',
    use: 'Pause to predict what happens next. Follow with three questions and a short retell.' },

  // ── Reading & Writing ───────────────────────────────────────────────────────
  { id: 'r1', area: 'rw', name: 'Extensive reading (graded readers)', e: 92, r: 90, g: 68, effort: 'Medium', speed: 'Months',
    why: 'Reading lots of easy, enjoyable texts gives repeated word meetings. It is one of the best-supported ways to build vocabulary and fluency.',
    use: 'Ten minutes of graded reading a week. Ask one personal question afterwards. No test.' },
  { id: 'r2', area: 'rw', name: 'Process writing with feedback', e: 72, r: 68, g: 55, effort: 'High', speed: 'Months',
    why: 'Drafting, getting feedback and rewriting improves writing more than one-shot assignments that are only graded.',
    use: 'Elite: draft → peer comments on two things → revise. Mark only one or two focus areas.' },

  // ── Motivation & Classroom ──────────────────────────────────────────────────
  { id: 'm1', area: 'motiv', name: 'Low-anxiety classroom', e: 75, r: 70, g: 80, effort: 'Low', speed: 'Days',
    why: 'Learners who feel safe take more risks and speak more, which means more practice.',
    use: 'Praise attempts, give hints instead of mocking errors, and keep games like Spin of Doom playful.' },
  { id: 'm2', area: 'motiv', name: 'Review games built on retrieval', e: 65, r: 70, g: 95, effort: 'Low', speed: 'Days',
    why: 'Games that make students recall language under friendly pressure combine high engagement with memory-strengthening practice.',
    use: 'Bomb Pass, Tug of War, Boss Battle and Escape Room all work this way. The game is the retrieval.' },
  { id: 'm3', area: 'motiv', name: 'Goal-setting + visible progress', e: 66, r: 62, g: 68, effort: 'Low', speed: 'Months',
    why: 'Visible goals and progress help learners keep going and notice their own growth.',
    use: 'Skill ratings and unit progress give students something to point to each term.' },

  // ── Moderate (30–59) ────────────────────────────────────────────────────────
  { id: 'x1', area: 'vocab', name: 'Vocabulary apps used alone', e: 55, r: 50, g: 70, effort: 'Low', speed: 'Weeks',
    why: 'Fun and well spaced, but without teacher follow-up many learners recognise words yet cannot use them.',
    use: 'Pair every app list with a short speaking task that uses the same words.' },
  { id: 'x2', area: 'speak', name: 'Memorising dialogues word for word', e: 50, r: 48, g: 45, effort: 'Low', speed: 'Days',
    why: 'Gives useful phrases, but learners often cannot adapt them to a new situation.',
    use: 'Memorise, then change two details and perform again.' },
  { id: 'x3', area: 'grammar', name: 'Translation exercises (L1 → English)', e: 55, r: 50, g: 30, effort: 'Low', speed: 'Weeks',
    why: 'Builds awareness of differences between the languages, but little fluency.',
    use: 'Keep it short and use it for contrast, not as the main activity.' },
  { id: 'x4', area: 'rw', name: 'Test-style reading Q&A only', e: 50, r: 45, g: 30, effort: 'Low', speed: 'Weeks',
    why: 'Practises exam skills but rarely builds reading fluency or vocabulary.',
    use: 'Add a prediction question before reading and a personal response after.' },
  { id: 'x5', area: 'rw', name: 'Peer correction without training', e: 55, r: 45, g: 55, effort: 'Low', speed: 'Weeks',
    why: 'Peers often miss errors or “correct” right answers. It works much better with a checklist.',
    use: 'Give a three-point checklist and model how to give kind, specific feedback.' },
  { id: 'x6', area: 'motiv', name: 'Stickers and points as the main motivator', e: 45, r: 35, g: 75, effort: 'Low', speed: 'Days',
    why: 'Rewards work in the short term but can crowd out genuine interest in learning.',
    use: 'Keep stars, but tie them to effort and progress, and celebrate what students can now do.' },
  { id: 'x7', area: 'grammar', name: 'Grammar songs with no follow-up', e: 40, r: 40, g: 85, effort: 'Low', speed: 'Days',
    why: 'Memorable and fun, but students may sing along without understanding the structure.',
    use: 'Follow the song with a 3-minute gap-fill and a personal sentence using the same pattern.' },

  // ── Low (below 30) ──────────────────────────────────────────────────────────
  { id: 'l1', area: 'motiv', name: 'Teaching to “learning styles” (VAK)', e: 5, r: 15, g: 40, effort: 'High', speed: 'Months',
    why: 'Studies have not found that matching teaching to a learner’s “style” improves results. The idea is popular, the evidence is not.',
    instead: 'Teach everyone with pictures, sound and movement together.' },
  { id: 'l2', area: 'vocab', name: 'Copying dictionary definitions', e: 15, r: 20, g: 15, effort: 'Low', speed: 'Months',
    why: 'Copying is passive, and dictionary definitions are often harder than the word itself.',
    instead: 'Students write their own sentence and draw or act the word.' },
  { id: 'l3', area: 'grammar', name: 'Correcting every error on the spot', e: 20, r: 20, g: 8, effort: 'Low', speed: 'Months',
    why: 'Stopping students at every error raises anxiety and kills fluency. Learners cannot process that many corrections.',
    instead: 'Choose one or two target errors per activity and give delayed feedback at the end.' },
  { id: 'l4', area: 'vocab', name: 'Cramming the night before a test', e: 25, r: 10, g: 25, effort: 'Low', speed: 'Days',
    why: 'Massed study gives quick recall that vanishes within days.',
    instead: 'Spread four short reviews across two weeks.' },
  { id: 'l5', area: 'vocab', name: 'Rote word lists without context', e: 35, r: 22, g: 20, effort: 'Low', speed: 'Days',
    why: 'Isolated lists produce recognition but weak use. The items fade quickly without context.',
    instead: 'Teach words in sentences and re-test after a few days.' },
  { id: 'l6', area: 'rw', name: 'Round-robin reading aloud', e: 25, r: 25, g: 20, effort: 'Low', speed: 'Months',
    why: 'Each student reads very little, the others switch off and weaker readers feel embarrassed.',
    instead: 'Pair reading, choral reading with a task, or silent reading followed by discussion.' },
  { id: 'l7', area: 'pron', name: 'Choral drilling with no meaning', e: 30, r: 22, g: 30, effort: 'Low', speed: 'Days',
    why: 'Repetition without meaning or follow-up does not transfer to real speech.',
    instead: 'Drill for 60 seconds, then use the same structure at once in a mini-conversation.' },
  { id: 'l8', area: 'grammar', name: 'Memorising grammar rules without using them', e: 30, r: 28, g: 15, effort: 'Medium', speed: 'Months',
    why: 'Knowing a rule is not the same as using it, and speech does not wait for rule recall.',
    instead: 'Explain in two minutes, then use the rule in a game or a task.' },
  { id: 'l9', area: 'speak', name: 'Passive video with no task', e: 22, r: 20, g: 50, effort: 'Low', speed: 'Months',
    why: 'Without a job to do, learners drift and the video turns into a break.',
    instead: 'Give a pre-task question, two or three listening questions and a short speaking follow-up.' },
  { id: 'l10', area: 'motiv', name: 'Cold-calling and shaming errors', e: 20, r: 15, g: 5, effort: 'Low', speed: 'Days',
    why: 'Fear and embarrassment raise the affective filter, so even good input does not get in.',
    instead: 'Allow “pass”, give thinking time, and let pairs rehearse before anyone speaks to the class.' },
]

export const STRATEGIES = RAW.map(s => ({ ...s, score: scoreOf(s) }))

export const EVIDENCE_BASE = [
  'Norris & Ortega (2000), Effectiveness of L2 Instruction: A Research Synthesis and Quantitative Meta-analysis',
  'Spada & Tomita (2010), Interactions Between Type of Instruction and Type of Language Feature: A Meta-Analysis',
  'The Effects of Spaced Practice on Second Language Learning: A Meta-Analysis (2022)',
  'High-Variability Phonetic Training (HVPT): A Meta-Analysis of L2 Perceptual Training Studies (Studies in Second Language Acquisition)',
  'Does Perceptual High Variability Phonetic Training Improve L2 Speech Production? A Meta-Analysis of the Perception–Production Connection',
  'Roediger & Karpicke (2006), The Power of Testing Memory (Science), also on your Research Flashcards',
]

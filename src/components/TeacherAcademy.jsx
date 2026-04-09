import { useState, useEffect } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// FLASHCARD DATA (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
const CARDS = [
  {
    id: 1,
    technique: 'Comprehensible Input (i+1)',
    author: 'Stephen Krashen',
    research: 'The Input Hypothesis (1977–1985)',
    tag: 'Acquisition',
    summary: 'Language is acquired when learners are exposed to input that is just one level above their current competence — challenging enough to grow, simple enough to understand.',
    detail: 'Krashen argued that we acquire language unconsciously through meaningful exposure, not through explicit grammar study. The "i+1" means your input should be 80–90% known, with 10–20% new. If it\'s too easy, no growth. Too hard, students shut down.',
    example: 'In your Pro class, if students know present simple, your stories and listening tasks should heavily use present simple but sprinkle in present continuous naturally — not as a grammar lesson, just in context.',
    options: [
      { text: 'Input must be perfectly at the student\'s level', correct: false },
      { text: 'Input should be slightly above current competence', correct: true },
      { text: 'Input should be mostly unknown to force effort', correct: false },
      { text: 'Input hypothesis only applies to reading', correct: false },
    ],
    explanation: 'The "i+1" means just one step beyond current ability. Too far above = anxiety and shutdown. Right above = acquisition zone.',
  },
  {
    id: 2,
    technique: 'Retrieval Practice',
    author: 'Henry Roediger & Jeffrey Karpicke',
    research: 'The Power of Testing Memory (Science, 2006)',
    tag: 'Memory',
    summary: 'Testing yourself on material — rather than re-reading it — dramatically improves long-term retention. The act of retrieval itself strengthens memory.',
    detail: 'Roediger and Karpicke showed that students who took practice tests retained 50% more after a week compared to those who re-studied. The effortful act of pulling information from memory consolidates it far more than passive review.',
    example: 'Start every class with a 3-minute no-stakes quiz: "What were the 5 vocabulary words from last Tuesday?" Don\'t let them check notes first. The struggle to remember IS the learning.',
    options: [
      { text: 'Re-reading notes is the most effective study method', correct: false },
      { text: 'Retrieval practice works only for factual knowledge', correct: false },
      { text: 'The act of recalling information strengthens memory more than re-studying', correct: true },
      { text: 'Testing should only happen at the end of a unit', correct: false },
    ],
    explanation: 'Retrieval practice works because the effort of pulling a memory out reinforces the neural pathway. Re-reading gives an illusion of knowing.',
  },
  {
    id: 3,
    technique: 'Spaced Repetition',
    author: 'Hermann Ebbinghaus',
    research: 'Über das Gedächtnis (Memory: A Contribution to Experimental Psychology, 1885)',
    tag: 'Memory',
    summary: 'Memories fade exponentially after learning. Reviewing material at increasing intervals — just before forgetting — produces dramatically better long-term retention.',
    detail: 'Ebbinghaus mapped the "forgetting curve" — we forget ~70% of new information within 24 hours unless we review. But each review resets and flattens the curve. The optimal schedule spaces reviews: 1 day, 3 days, 7 days, 21 days, 60 days.',
    example: 'Vocabulary from Unit 3 should reappear briefly in Unit 4, 5, and 7 — not just drilled and dropped. A 5-minute warm-up game using old vocab once a week is more powerful than 30 minutes of review in one sitting.',
    options: [
      { text: 'Massed practice (cramming) produces the same results as spaced practice', correct: false },
      { text: 'Reviewing material at increasing time intervals improves long-term retention', correct: true },
      { text: 'Spaced repetition only works for vocabulary, not grammar', correct: false },
      { text: 'The forgetting curve shows memory stays stable after one review', correct: false },
    ],
    explanation: 'Each spaced review resets and flattens the forgetting curve. The growing interval is key — it forces retrieval just before the memory fades.',
  },
  {
    id: 4,
    technique: 'The Affective Filter Hypothesis',
    author: 'Stephen Krashen',
    research: 'Principles and Practice in Second Language Acquisition (1982)',
    tag: 'Motivation',
    summary: 'Anxiety, low motivation, and poor self-confidence raise an "affective filter" that blocks language acquisition — even when input is comprehensible.',
    detail: 'Krashen proposed that emotional state directly regulates how much language gets "in." A high-anxiety classroom means input bounces off — students understand but don\'t acquire. Low anxiety, high motivation, and strong self-confidence lower the filter and open the acquisition pathway.',
    example: 'When you use the Spin of Doom, keep the energy playful and never humiliating. If a student looks panicked when called on, the filter is up — reframe it with humor or a hint before they shut down completely.',
    options: [
      { text: 'Anxiety has no proven effect on language acquisition', correct: false },
      { text: 'A high affective filter blocks acquisition even when input is understandable', correct: true },
      { text: 'Pressure and high stakes always improve language performance', correct: false },
      { text: 'The affective filter only affects speaking, not listening', correct: false },
    ],
    explanation: 'The filter is an emotional block. Even perfect input doesn\'t get acquired if the student is anxious, demotivated, or lacks confidence.',
  },
  {
    id: 5,
    technique: 'Zone of Proximal Development (ZPD)',
    author: 'Lev Vygotsky',
    research: 'Mind in Society (1978)',
    tag: 'Scaffolding',
    summary: 'The ZPD is the gap between what a learner can do alone and what they can do with guidance. The most effective teaching targets this zone.',
    detail: 'Vygotsky showed that learners grow fastest when challenged just beyond their independent ability — but supported by a more capable person (teacher, peer, or structured task). This "scaffolding" is gradually removed as the learner gains independence.',
    example: 'In writing tasks, don\'t give a blank page. Give a model text, then a half-completed version, then prompts only, then nothing — across a term. Each stage removes one scaffold. That progression IS the teaching.',
    options: [
      { text: 'Students learn best when working completely independently', correct: false },
      { text: 'The ZPD is where learners are too advanced to need help', correct: false },
      { text: 'The ZPD is the gap between independent ability and guided ability', correct: true },
      { text: 'Scaffolding should never be removed once given', correct: false },
    ],
    explanation: 'The ZPD is the sweet spot between "too easy" and "impossible." Scaffolding bridges the gap and is systematically removed over time.',
  },
  {
    id: 6,
    technique: 'Output Hypothesis',
    author: 'Merrill Swain',
    research: 'Communicative Competence: Some Roles of Comprehensible Output (1985)',
    tag: 'Production',
    summary: 'Producing language (speaking or writing) — not just receiving it — is essential for fluency and accuracy. Output forces learners to notice gaps in their knowledge.',
    detail: 'Swain challenged Krashen by showing that immersion students in Canada received massive comprehensible input but still made systematic grammar errors. The missing piece was pushed output — being required to produce accurate, precise language. Output forces noticing, hypothesis-testing, and metalinguistic reflection.',
    example: 'Don\'t let students answer with one word when they can answer with a sentence. Push for full production: "Tell me more. Say that again as a full sentence." That productive struggle is where accuracy develops.',
    options: [
      { text: 'Comprehensible input alone is sufficient for full language acquisition', correct: false },
      { text: 'Output forces learners to notice gaps and develop accuracy', correct: true },
      { text: 'Speaking practice is less important than listening practice', correct: false },
      { text: 'Output hypothesis applies only to writing, not speaking', correct: false },
    ],
    explanation: 'Swain showed that producing language makes learners notice what they don\'t know — a cognitive process input alone cannot trigger.',
  },
  {
    id: 7,
    technique: 'The Noticing Hypothesis',
    author: 'Richard Schmidt',
    research: 'The Role of Consciousness in Second Language Learning (Applied Linguistics, 1990)',
    tag: 'Awareness',
    summary: 'Learners cannot acquire a language feature unless they consciously notice it in the input. Attention is the gateway to acquisition.',
    detail: 'Schmidt argued — and later supported empirically — that unconscious pickup of language features is minimal. For a form to be acquired, the learner must notice it: see it, hear it, and register it as a linguistic unit. This is why comprehensible input alone (Krashen) is not enough without directed attention.',
    example: 'When you read a story in class, pause and say "Did you notice I said WAS instead of IS there? Why?" That moment of directed noticing is more powerful than 10 grammar exercises on past tense.',
    options: [
      { text: 'Language features are acquired even without conscious attention', correct: false },
      { text: 'Noticing is automatic and doesn\'t require teacher intervention', correct: false },
      { text: 'Learners must consciously notice a feature in input for it to be acquired', correct: true },
      { text: 'The noticing hypothesis only applies to pronunciation', correct: false },
    ],
    explanation: 'Schmidt\'s key insight: attention is the doorway. If a student doesn\'t notice a feature, it passes through without being processed for acquisition.',
  },
  {
    id: 8,
    technique: 'Interleaving',
    author: 'Nate Kornell & Robert Bjork',
    research: 'Learning Concepts and Categories (Psychological Science, 2008)',
    tag: 'Practice Design',
    summary: 'Mixing different skills or topics in practice sessions — rather than blocking one topic at a time — produces superior long-term learning, even though it feels harder.',
    detail: 'Blocked practice (all grammar, then all vocabulary, then all speaking) feels productive but produces shallow learning. Interleaved practice (grammar, then vocab, then speaking, cycling back) forces the brain to discriminate, retrieve, and apply — creating deeper, more flexible knowledge.',
    example: 'Instead of a full lesson on past simple, then a full lesson on past continuous, mix them: activity on past simple, then vocabulary, then a task requiring both tenses together. Students will find it harder — that difficulty is the learning.',
    options: [
      { text: 'Blocked practice produces better long-term results than interleaving', correct: false },
      { text: 'Interleaving feels easier and produces better results', correct: false },
      { text: 'Interleaving feels harder but produces superior long-term retention', correct: true },
      { text: 'Interleaving only works for mathematics, not language learning', correct: false },
    ],
    explanation: 'The "desirable difficulty" of interleaving forces deeper processing. Blocked practice creates an illusion of mastery that fades quickly.',
  },
  {
    id: 9,
    technique: 'Task-Based Language Teaching (TBLT)',
    author: 'Michael Long',
    research: 'A Role for Instruction in Second Language Acquisition (1983)',
    tag: 'Methodology',
    summary: 'Language is best learned by completing meaningful real-world tasks — not by studying language forms in isolation. Form emerges from meaningful use.',
    detail: 'Long argued that when learners focus on completing a genuine communicative task (planning a trip, solving a problem, writing a real email), language acquisition is a by-product of meaning-making. Grammar can be addressed reactively — when errors impede communication — not pre-emptively.',
    example: 'Instead of "today we learn comparative adjectives," say "you have 10 minutes to decide which of these two cities is better for a holiday and tell the class why." Comparatives emerge naturally. You address the form after the task.',
    options: [
      { text: 'TBLT requires presenting grammar rules before any communicative activity', correct: false },
      { text: 'In TBLT, the focus is always on accuracy over meaning', correct: false },
      { text: 'Tasks drive language use; form is addressed as it emerges from meaningful communication', correct: true },
      { text: 'TBLT is only suitable for advanced learners', correct: false },
    ],
    explanation: 'TBLT flips the traditional PPP model. The task comes first; grammar is a tool to complete it, not the goal itself.',
  },
  {
    id: 10,
    technique: 'Deliberate Practice',
    author: 'K. Anders Ericsson',
    research: 'The Role of Deliberate Practice in the Acquisition of Expert Performance (Psychological Review, 1993)',
    tag: 'Skill Building',
    summary: 'Expert performance comes from focused, effortful practice on specific weaknesses — with immediate feedback — not just from accumulated time or general experience.',
    detail: 'Ericsson showed that the difference between experts and novices is not talent but the quality of practice. Deliberate practice targets the edge of current ability, focuses on what\'s hardest, and requires immediate corrective feedback. "Just speaking a lot" is not deliberate practice.',
    example: 'If a student consistently drops the -s in third person singular ("she go"), isolate that pattern for 3 minutes of focused drilling with instant correction — not a full grammar lesson, just targeted reps on that one gap.',
    options: [
      { text: 'Accumulated hours of practice always produce expertise', correct: false },
      { text: 'Deliberate practice focuses on strengths to build confidence', correct: false },
      { text: 'Deliberate practice targets specific weaknesses with immediate feedback', correct: true },
      { text: 'General experience in the classroom is equivalent to deliberate practice', correct: false },
    ],
    explanation: 'Ericsson\'s key finding: not all practice is equal. Targeted, effortful, feedback-rich practice at the edge of ability is what produces real improvement.',
  },
  {
    id: 11,
    technique: 'Corrective Feedback & Recasting',
    author: 'Long, Lyster & Ranta',
    research: 'Corrective Feedback and Learner Uptake (Applied Linguistics, 1997)',
    tag: 'Error Correction',
    summary: 'Recasting — restating a learner\'s error in correct form without explicit correction — is one of the most natural and effective forms of feedback in communicative classrooms.',
    detail: 'Lyster & Ranta identified 6 types of corrective feedback. Recasts (implicit correction) maintain conversational flow: student says "She go to school," teacher responds "Yes, she goes to school — and what time?" Explicit correction is more effective for accuracy-focused tasks; recasts work better during fluency activities.',
    example: 'During a speaking task: student says "Yesterday I go to the market." You respond naturally: "Oh, you went to the market! What did you buy?" — correct the form, keep the conversation alive, don\'t break the flow.',
    options: [
      { text: 'Explicit correction should always be used during fluency activities', correct: false },
      { text: 'Recasting corrects errors implicitly while maintaining conversational flow', correct: true },
      { text: 'Corrective feedback has no effect on long-term accuracy', correct: false },
      { text: 'Ignoring errors is always preferable to correcting them', correct: false },
    ],
    explanation: 'Recasts balance fluency and accuracy. They signal that an error occurred without shutting down communication — students often self-correct in response.',
  },
  {
    id: 12,
    technique: 'Phonological Awareness',
    author: 'Linnea Ehri & various researchers',
    research: 'National Reading Panel Report (2000) + Ehri\'s Phase Theory',
    tag: 'Phonics',
    summary: 'Explicit instruction in the sound structure of language — phonemes, syllables, stress — significantly improves both reading and spoken fluency, especially at early levels.',
    detail: 'Phonological awareness is the ability to hear, identify and manipulate the sounds of a language. In ESL contexts, learners\' L1 phonological systems interfere with English sound production and perception. Explicit sound training — not just exposure — dramatically reduces fossilized pronunciation errors.',
    example: 'Vietnamese learners frequently drop final consonants ("boo" for "book"). Don\'t just correct it — isolate the final /k/ sound, do minimal pair drills (book/boot, back/bat), and celebrate the physical mouth movement. The sound has to be consciously built.',
    options: [
      { text: 'Pronunciation improves automatically through listening exposure alone', correct: false },
      { text: 'Phonological awareness training only helps young children, not adult ESL learners', correct: false },
      { text: 'Explicit sound instruction reduces L1 interference and fossilized errors', correct: true },
      { text: 'Phonics instruction is incompatible with communicative teaching methods', correct: false },
    ],
    explanation: 'Without explicit phonological training, L1 sound systems fossilize. Conscious manipulation of sounds — drills, minimal pairs, mouth awareness — is necessary to rewire auditory pathways.',
  },
  {
    id: 13,
    technique: 'Vocabulary Depth vs. Breadth',
    author: 'Paul Nation',
    research: 'Learning Vocabulary in Another Language (2001)',
    tag: 'Vocabulary',
    summary: 'Vocabulary knowledge has two dimensions: breadth (how many words you know) and depth (how well you know each word). Fluency requires both — especially depth.',
    detail: 'Nation\'s research showed that knowing a word means knowing its pronunciation, spelling, grammatical behavior, collocations, register, and meaning in context — not just a translation. Teaching vocabulary as translation lists builds breadth but almost no depth. Depth comes from encountering words in multiple contexts over time.',
    example: 'Don\'t teach "angry" as "tức giận." Teach it in a sentence, show collocations (angry AT, angry ABOUT), show it in a story, have students use it in their own sentence, then bring it back next week. That\'s depth.',
    options: [
      { text: 'Vocabulary breadth (knowing many words) is sufficient for fluency', correct: false },
      { text: 'Translation lists are the most effective vocabulary teaching method', correct: false },
      { text: 'True vocabulary knowledge includes collocations, register, grammar, and contextual use', correct: true },
      { text: 'Vocabulary depth is only relevant for advanced learners', correct: false },
    ],
    explanation: 'Nation showed that a word is not "known" until it can be used correctly in context. Depth — knowing HOW to use a word — is what translation lists never teach.',
  },
  {
    id: 14,
    technique: 'Growth Mindset',
    author: 'Carol Dweck',
    research: 'Mindset: The New Psychology of Success (2006)',
    tag: 'Motivation',
    summary: 'Students who believe ability is developable (growth mindset) outperform those who believe it is fixed — especially when facing difficulty. Praising effort over intelligence cultivates this mindset.',
    detail: 'Dweck\'s decades of research showed that praising intelligence ("you\'re so smart") makes students avoid challenges that might expose their limits. Praising effort and strategy ("you worked hard on that — what strategy did you use?") makes them embrace challenges as growth opportunities.',
    example: 'When a student gets a hard question right, don\'t say "You\'re brilliant!" Say "You stuck with that — I saw you thinking it through. That\'s exactly how language gets into your brain." Reward the process, not the talent.',
    options: [
      { text: 'Praising intelligence produces more motivated learners than praising effort', correct: false },
      { text: 'Fixed mindset students perform better under pressure', correct: false },
      { text: 'Praising effort and strategy cultivates resilience and growth mindset', correct: true },
      { text: 'Growth mindset research only applies to mathematics, not language learning', correct: false },
    ],
    explanation: 'Dweck showed that what we praise shapes what students value. Intelligence praise creates fragility; effort praise creates resilience and risk-taking.',
  },
  {
    id: 15,
    technique: 'Multimodal Learning',
    author: 'Richard Mayer',
    research: 'Multimedia Learning (2001) — Cognitive Theory of Multimedia Learning',
    tag: 'Instruction Design',
    summary: 'Learning is more effective when information is presented through multiple channels simultaneously — words AND images — than through words alone.',
    detail: 'Mayer\'s research established that the brain has separate channels for verbal and visual processing. When both are engaged simultaneously with related content, deeper understanding and retention result. However, overloading either channel (too much text + complex image) produces the "redundancy effect" and hurts learning.',
    example: 'When teaching vocabulary for "weather," don\'t just say the word and translate it. Show the image, say the word, act it out, then have students draw it. Four channels — auditory, visual, kinesthetic, written — build a richer memory trace than any single one.',
    options: [
      { text: 'Adding images always improves learning regardless of content', correct: false },
      { text: 'Words alone are more effective than words combined with relevant images', correct: false },
      { text: 'Combining verbal and visual channels (when related) deepens retention', correct: true },
      { text: 'Multimodal learning overloads working memory and should be avoided', correct: false },
    ],
    explanation: 'Mayer\'s key condition: the visual and verbal must be related and presented together. Redundant or unrelated visuals hurt. Relevant, synchronized visuals help significantly.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// LESSON BUILDER DATA
// ─────────────────────────────────────────────────────────────────────────────
const ACTIVITY_BANK = {
  warmup: [
    { label: 'Vocab Retrieval Quiz', desc: 'No-notes recall of last session\'s words. 3–5 mins of pure retrieval practice.', mins: 5, icon: '🧠' },
    { label: 'Error Hunt', desc: 'Write 5 sentences on the board — 3 with deliberate errors. Students find & fix.', mins: 5, icon: '🔍' },
    { label: 'Spin of Doom (Recall)', desc: 'Spin to a student, ask them to recall a word/phrase from last class.', mins: 4, icon: '🎡' },
    { label: 'Picture Prompt', desc: 'Show an image. Students produce 3 sentences about it — uses previous vocab.', mins: 5, icon: '🖼️' },
    { label: 'Two Truths, One Lie', desc: 'Students write 3 sentences about the topic — two true, one false. Class guesses.', mins: 6, icon: '🤥' },
    { label: 'Word Association Chain', desc: 'First student says a word; each student adds a connected word. Goes around the room.', mins: 4, icon: '🔗' },
  ],
  input: [
    { label: 'Story Listening (i+1)', desc: 'Tell a comprehensible story slightly above level. Students listen, then retell it.', mins: 15, icon: '📖' },
    { label: 'Authentic Video Clip', desc: 'Watch a 2–3 min clip. Pause, notice language, discuss.', mins: 15, icon: '🎬' },
    { label: 'Teacher Talk + Noticing', desc: 'Teacher narrates a situation using target grammar. Students raise hands when they notice the form.', mins: 12, icon: '👂' },
    { label: 'Read Aloud + Annotation', desc: 'Students read a text, underline unknown words, circle target grammar.', mins: 15, icon: '📝' },
    { label: 'Dialogues in Context', desc: 'Model dialogue demonstrating target language in a realistic situation.', mins: 12, icon: '💬' },
  ],
  practice: [
    { label: 'Controlled Drills', desc: 'Substitution drills targeting one specific error pattern. Fast-paced, immediate correction.', mins: 8, icon: '🎯' },
    { label: 'Information Gap Task', desc: 'Partner A has info Partner B needs — must communicate to complete the task.', mins: 15, icon: '🔄' },
    { label: 'Role Play', desc: 'Students act out a realistic scenario using target language (e.g., at a restaurant, job interview).', mins: 15, icon: '🎭' },
    { label: 'Minimal Pairs Drill', desc: 'Focus on confusable sounds — /p/ vs /b/, /l/ vs /r/ etc. Great for Vietnamese learners.', mins: 8, icon: '👄' },
    { label: 'Sentence Transformation', desc: 'Students convert sentences between tenses/forms. Builds structural flexibility.', mins: 10, icon: '🔃' },
    { label: 'Collocation Matching', desc: 'Match verbs to nouns (make/do, get/take) — builds vocabulary depth per Nation\'s model.', mins: 8, icon: '🧩' },
  ],
  production: [
    { label: 'Communicative Task (TBLT)', desc: 'Open-ended task: plan a trip, debate a topic, solve a problem. Language is the tool.', mins: 20, icon: '🗣️' },
    { label: 'Write & Share', desc: 'Students write 5–8 sentences on a topic, then share with a partner for peer feedback.', mins: 15, icon: '✍️' },
    { label: 'Presentation (1 min each)', desc: 'Each student speaks for 60 seconds on a given prompt. No notes. Push for full sentences.', mins: 20, icon: '🎤' },
    { label: 'Debate / Discussion', desc: 'Give two positions on a topic. Groups argue their side — accuracy secondary to fluency here.', mins: 18, icon: '⚡' },
    { label: 'Dictogloss', desc: 'Teacher reads a short text twice. Students reconstruct it from memory — targets listening + grammar.', mins: 15, icon: '📋' },
  ],
  wrap: [
    { label: 'Exit Ticket', desc: 'Students write 1 thing they learned + 1 thing still unclear before leaving.', mins: 4, icon: '🎫' },
    { label: 'Spaced Review Preview', desc: 'Teacher announces next week\'s retrieval quiz topics — primes students to review.', mins: 3, icon: '📅' },
    { label: 'Star of the Session', desc: 'Award session stars to standout contributors. Reinforce growth mindset praise.', mins: 3, icon: '⭐' },
    { label: 'Self-Assessment', desc: 'Students rate themselves: "Today I could _____ but I still struggle with ___."', mins: 4, icon: '📊' },
    { label: 'Vocab Record', desc: 'Students add today\'s new words to their personal vocab log with example sentences.', mins: 5, icon: '📒' },
  ],
}

const PHASE_META = {
  warmup:    { label: 'Warm-Up',    color: '#2d6be4', emoji: '🔥', desc: 'Retrieval & activation' },
  input:     { label: 'Input',      color: '#7c3aed', emoji: '📥', desc: 'Comprehensible input & noticing' },
  practice:  { label: 'Practice',   color: '#d4900a', emoji: '⚙️',  desc: 'Controlled & guided practice' },
  production:{ label: 'Production', color: '#e85d26', emoji: '🚀', desc: 'Free & communicative use' },
  wrap:      { label: 'Wrap-Up',    color: '#1a9e5c', emoji: '✅', desc: 'Consolidation & review prep' },
}

const LEVELS = ['Pro 1', 'Pro 2', 'Pro 3', 'Pro 4', 'Pro 5', 'Elite 1', 'Elite 2', 'Elite 3']
const DURATIONS = [60, 75, 90, 105, 120]

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const TAG_COLORS = {
  'Acquisition':       { bg: 'rgba(45,107,228,0.12)',  color: 'var(--pro)'     },
  'Memory':            { bg: 'rgba(124,58,237,0.12)',   color: 'var(--elite)'   },
  'Motivation':        { bg: 'rgba(26,158,92,0.12)',    color: 'var(--green)'   },
  'Scaffolding':       { bg: 'rgba(212,144,10,0.12)',   color: 'var(--gold)'    },
  'Production':        { bg: 'rgba(232,93,38,0.12)',    color: 'var(--accent)'  },
  'Awareness':         { bg: 'rgba(45,107,228,0.12)',   color: 'var(--pro)'     },
  'Practice Design':   { bg: 'rgba(124,58,237,0.12)',   color: 'var(--elite)'   },
  'Methodology':       { bg: 'rgba(26,158,92,0.12)',    color: 'var(--green)'   },
  'Skill Building':    { bg: 'rgba(232,93,38,0.12)',    color: 'var(--accent)'  },
  'Error Correction':  { bg: 'rgba(212,144,10,0.12)',   color: 'var(--gold)'    },
  'Phonics':           { bg: 'rgba(45,107,228,0.12)',   color: 'var(--pro)'     },
  'Vocabulary':        { bg: 'rgba(26,158,92,0.12)',    color: 'var(--green)'   },
  'Instruction Design':{ bg: 'rgba(124,58,237,0.12)',   color: 'var(--elite)'   },
}

// ─────────────────────────────────────────────────────────────────────────────
// LESSON BUILDER COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function LessonBuilder() {
  const [className, setClassName] = useState('')
  const [level, setLevel] = useState('Pro 3')
  const [topic, setTopic] = useState('')
  const [targetLang, setTargetLang] = useState('')
  const [duration, setDuration] = useState(90)
  const [plan, setPlan] = useState({ warmup: [], input: [], practice: [], production: [], wrap: [] })
  const [expandedPhase, setExpandedPhase] = useState('warmup')
  const [notes, setNotes] = useState('')
  const [printed, setPrinted] = useState(false)

  const totalMins = Object.values(plan).flat().reduce((s, a) => s + a.mins, 0)
  const remaining = duration - totalMins
  const overBudget = remaining < 0

  function addActivity(phase, act) {
    setPlan(p => ({ ...p, [phase]: [...p[phase], { ...act, id: Date.now() + Math.random() }] }))
  }

  function removeActivity(phase, id) {
    setPlan(p => ({ ...p, [phase]: p[phase].filter(a => a.id !== id) }))
  }

  function adjustTime(phase, id, delta) {
    setPlan(p => ({
      ...p,
      [phase]: p[phase].map(a => a.id === id ? { ...a, mins: Math.max(1, a.mins + delta) } : a)
    }))
  }

  function clearPlan() {
    setPlan({ warmup: [], input: [], practice: [], production: [], wrap: [] })
    setNotes('')
    setPrinted(false)
  }

  const phases = ['warmup', 'input', 'practice', 'production', 'wrap']

  // Print view
  if (printed) {
    const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', fontFamily: 'Georgia, serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase' }}>Lesson Plan — {now}</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{topic || 'Untitled Lesson'}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>{className || 'Class'} · {level} · {duration} mins</div>
            {targetLang && <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4 }}>🎯 Target: {targetLang}</div>}
          </div>
          <button className="btn btn-outline" style={{ fontSize: 11 }} onClick={() => setPrinted(false)}>← Edit</button>
        </div>

        {/* Time bar */}
        <div style={{ display: 'flex', gap: 3, marginBottom: 28, height: 12, borderRadius: 6, overflow: 'hidden' }}>
          {phases.map(ph => {
            const phMins = plan[ph].reduce((s, a) => s + a.mins, 0)
            const pct = (phMins / duration) * 100
            if (pct === 0) return null
            return <div key={ph} style={{ width: `${pct}%`, background: PHASE_META[ph].color, opacity: 0.85 }} title={`${PHASE_META[ph].label}: ${phMins} min`} />
          })}
          {remaining > 0 && <div style={{ flex: 1, background: 'var(--surface2)' }} />}
        </div>

        {phases.map(ph => {
          const acts = plan[ph]
          if (!acts.length) return null
          const meta = PHASE_META[ph]
          const phMins = acts.reduce((s, a) => s + a.mins, 0)
          return (
            <div key={ph} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, paddingBottom: 8, borderBottom: `2px solid ${meta.color}30` }}>
                <span style={{ fontSize: 16 }}>{meta.emoji}</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: meta.color, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>{meta.label}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', marginLeft: 'auto' }}>{phMins} min</span>
              </div>
              {acts.map((act, i) => (
                <div key={act.id} style={{ display: 'flex', gap: 14, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', paddingTop: 2, minWidth: 28 }}>{act.mins}m</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{act.icon} {act.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{act.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )
        })}

        {notes && (
          <div style={{ marginTop: 16, padding: '14px 18px', borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' }}>Teacher Notes</div>
            <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{notes}</div>
          </div>
        )}

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <button className="btn btn-accent" onClick={() => window.print()}>🖨️ Print / Save PDF</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>ESL Lesson Builder</div>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Build Your Lesson Plan</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
          Pick activities for each phase. Every activity is grounded in research from your flashcard deck. Budget your time, then export a clean plan.
        </div>
      </div>

      {/* Setup row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, marginBottom: 24,
        padding: 20, background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)',
      }}>
        <div>
          <label style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Class Name</label>
          <input value={className} onChange={e => setClassName(e.target.value)} placeholder="e.g. ATB_Pro3_S"
            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 12, fontFamily: 'var(--mono)', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Topic</label>
          <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Past tenses in stories"
            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 12, boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Target Language</label>
          <input value={targetLang} onChange={e => setTargetLang(e.target.value)} placeholder="e.g. Past simple + continuous"
            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 12, boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Duration</label>
          <select value={duration} onChange={e => setDuration(Number(e.target.value))}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 12, fontFamily: 'var(--mono)' }}>
            {DURATIONS.map(d => <option key={d} value={d}>{d} min</option>)}
          </select>
        </div>
      </div>

      {/* Time budget bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>Time Budget</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: overBudget ? 'var(--red)' : remaining === 0 ? 'var(--green)' : 'var(--muted)' }}>
            {overBudget ? `⚠️ ${Math.abs(remaining)} min over` : remaining === 0 ? '✓ Perfect fit' : `${remaining} min remaining`}
          </div>
        </div>
        <div style={{ height: 10, background: 'var(--surface2)', borderRadius: 6, overflow: 'hidden', display: 'flex', gap: 2 }}>
          {phases.map(ph => {
            const phMins = plan[ph].reduce((s, a) => s + a.mins, 0)
            const pct = Math.min((phMins / duration) * 100, 100)
            if (pct === 0) return null
            return <div key={ph} style={{ width: `${pct}%`, background: PHASE_META[ph].color, opacity: 0.85, transition: 'width 0.3s ease', borderRadius: 4 }} />
          })}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
          {phases.map(ph => {
            const phMins = plan[ph].reduce((s, a) => s + a.mins, 0)
            return (
              <div key={ph} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: PHASE_META[ph].color }} />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)' }}>{PHASE_META[ph].label} {phMins}m</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Phase builder */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {phases.map(ph => {
          const meta = PHASE_META[ph]
          const acts = plan[ph]
          const phMins = acts.reduce((s, a) => s + a.mins, 0)
          const isOpen = expandedPhase === ph
          return (
            <div key={ph} style={{
              background: 'var(--surface)', border: `1px solid ${isOpen ? meta.color + '50' : 'var(--border)'}`,
              borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)',
              transition: 'border-color 0.2s',
            }}>
              {/* Phase header */}
              <div
                onClick={() => setExpandedPhase(isOpen ? null : ph)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
                  cursor: 'pointer', borderLeft: `4px solid ${meta.color}`,
                }}
              >
                <span style={{ fontSize: 18 }}>{meta.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: meta.color }}>{meta.label}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', marginTop: 2 }}>{meta.desc}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {acts.length > 0 && (
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: meta.color, fontWeight: 700 }}>{phMins}m · {acts.length} act.</span>
                  )}
                  <span style={{ color: 'var(--muted)', fontSize: 12 }}>{isOpen ? '▲' : '▼'}</span>
                </div>
              </div>

              {isOpen && (
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }}>

                  {/* Added activities */}
                  {acts.length > 0 && (
                    <div style={{ marginTop: 16, marginBottom: 16 }}>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Your Plan</div>
                      {acts.map(act => (
                        <div key={act.id} style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                          borderRadius: 10, background: `${meta.color}10`, border: `1px solid ${meta.color}25`,
                          marginBottom: 8,
                        }}>
                          <span style={{ fontSize: 16 }}>{act.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{act.label}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button onClick={() => adjustTime(ph, act.id, -5)}
                              style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, minWidth: 32, textAlign: 'center', color: meta.color }}>{act.mins}m</span>
                            <button onClick={() => adjustTime(ph, act.id, 5)}
                              style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                            <button onClick={() => removeActivity(ph, act.id)}
                              style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'rgba(214,59,59,0.1)', color: 'var(--red)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Activity bank */}
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginTop: acts.length ? 0 : 16, marginBottom: 10 }}>Activity Bank</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {ACTIVITY_BANK[ph].map((act, i) => (
                      <div key={i}
                        onClick={() => addActivity(ph, act)}
                        style={{
                          padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                          background: 'var(--surface2)', border: '1px solid var(--border)',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = `${meta.color}12`; e.currentTarget.style.borderColor = `${meta.color}40` }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                          <span style={{ fontSize: 14 }}>{act.icon}</span>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: meta.color, fontWeight: 700 }}>{act.mins}m</span>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>{act.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>{act.desc}</div>
                        <div style={{ marginTop: 8, fontSize: 10, color: meta.color, fontWeight: 600 }}>+ Add →</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Notes */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Teacher Notes (optional)</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Materials needed, student groupings, things to watch for, anticipated errors..."
          rows={4}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 10,
            border: '1px solid var(--border)', background: 'var(--surface)',
            color: 'var(--text)', fontSize: 13, lineHeight: 1.6,
            resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          className="btn btn-accent"
          style={{ flex: 1, opacity: totalMins === 0 ? 0.4 : 1 }}
          disabled={totalMins === 0}
          onClick={() => setPrinted(true)}
        >
          📄 Preview & Print Plan
        </button>
        <button className="btn btn-outline" onClick={clearPlan}>🗑️ Clear</button>
      </div>

      <style>{`@keyframes fadeSlideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FLASHCARD GAME COMPONENT (unchanged logic, extracted for cleanliness)
// ─────────────────────────────────────────────────────────────────────────────
function FlashcardGame() {
  const [deck, setDeck]           = useState(() => shuffle(CARDS))
  const [index, setIndex]         = useState(0)
  const [flipped, setFlipped]     = useState(false)
  const [selected, setSelected]   = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 })
  const [finished, setFinished]   = useState(false)
  const [currentOptions, setCurrentOptions] = useState([])

  const card = deck[index]

  useEffect(() => {
    if (card) setCurrentOptions(shuffle(card.options))
    setFlipped(false)
    setSelected(null)
    setConfirmed(false)
  }, [index, card?.id])

  function handleFlip() { setFlipped(true) }
  function handleSelect(opt) { if (confirmed) return; setSelected(opt) }
  function handleConfirm() {
    if (!selected || confirmed) return
    setConfirmed(true)
    setSessionScore(s => ({ correct: s.correct + (selected.correct ? 1 : 0), total: s.total + 1 }))
  }
  function handleNext() {
    if (index + 1 >= deck.length) setFinished(true)
    else setIndex(i => i + 1)
  }
  function handleRestart() {
    setDeck(shuffle(CARDS)); setIndex(0)
    setSessionScore({ correct: 0, total: 0 }); setFinished(false)
  }

  const tagStyle = TAG_COLORS[card?.tag] || { bg: 'var(--surface2)', color: 'var(--muted)' }

  if (finished) {
    const pct = Math.round((sessionScore.correct / sessionScore.total) * 100)
    const grade = pct >= 90 ? { emoji: '🧠', label: 'Master Educator', color: 'var(--elite)' }
                : pct >= 70 ? { emoji: '⭐', label: 'Strong Session',  color: 'var(--gold)'  }
                : pct >= 50 ? { emoji: '📈', label: 'Keep Practicing', color: 'var(--pro)'   }
                :             { emoji: '🔁', label: 'Review Needed',   color: 'var(--accent)' }
    return (
      <div style={{ maxWidth: 580, margin: '0 auto', textAlign: 'center', padding: '60px 24px' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>{grade.emoji}</div>
        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{grade.label}</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted)', marginBottom: 32 }}>
          You got <span style={{ color: grade.color, fontWeight: 700 }}>{sessionScore.correct}</span> out of <span style={{ fontWeight: 700 }}>{sessionScore.total}</span> correct — {pct}%
        </div>
        <button className="btn btn-accent" onClick={handleRestart}>🔁 New Session</button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ flex: 1, height: 5, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 3, width: `${((index + 1) / deck.length) * 100}%`, background: 'linear-gradient(90deg, var(--pro), var(--elite))', transition: 'width 0.4s ease' }} />
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{index + 1} / {deck.length}</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--green)', whiteSpace: 'nowrap' }}>✓ {sessionScore.correct}</div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 32, boxShadow: 'var(--shadow)', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: 2, padding: '4px 12px', borderRadius: 20, textTransform: 'uppercase', background: tagStyle.bg, color: tagStyle.color }}>{card.tag}</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 1 }}>{card.author}</span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{card.technique}</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 1, marginBottom: 20 }}>📄 {card.research}</div>
        <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text)', padding: '16px 18px', borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)', marginBottom: flipped ? 20 : 0 }}>{card.summary}</div>

        {flipped && (
          <div style={{ animation: 'fadeSlideIn 0.3s ease' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' }}>The Science</div>
              <div style={{ fontSize: 13, lineHeight: 1.75, color: 'var(--text)' }}>{card.detail}</div>
            </div>
            <div style={{ padding: '14px 18px', borderRadius: 10, background: 'rgba(232,93,38,0.06)', border: '1px solid rgba(232,93,38,0.15)' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--accent)', letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' }}>Your Classroom</div>
              <div style={{ fontSize: 13, lineHeight: 1.75, color: 'var(--text)' }}>{card.example}</div>
            </div>
          </div>
        )}
      </div>

      {!flipped && (
        <button className="btn btn-outline" style={{ width: '100%', marginBottom: 16, padding: '14px 0', fontSize: 13, fontWeight: 700 }} onClick={handleFlip}>
          🔍 Reveal Detail + Classroom Example
        </button>
      )}

      {flipped && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, boxShadow: 'var(--shadow)', marginBottom: 16 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, marginBottom: 16, textTransform: 'uppercase' }}>🎯 Test Your Recall</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {currentOptions.map((opt, i) => {
              let bg = 'var(--surface2)', border = '1px solid var(--border)', color = 'var(--text)'
              if (confirmed) {
                if (opt.correct) { bg = 'rgba(26,158,92,0.1)'; border = '1.5px solid var(--green)'; color = 'var(--green)' }
                else if (opt === selected && !opt.correct) { bg = 'rgba(214,59,59,0.1)'; border = '1.5px solid var(--red)'; color = 'var(--red)' }
                else { bg = 'var(--surface2)'; color = 'var(--muted)' }
              } else if (opt === selected) { bg = 'rgba(45,107,228,0.1)'; border = '1.5px solid var(--pro)'; color = 'var(--pro)' }
              return (
                <div key={i} onClick={() => handleSelect(opt)} style={{ padding: '12px 16px', borderRadius: 10, cursor: confirmed ? 'default' : 'pointer', background: bg, border, color, fontSize: 13, fontWeight: opt === selected || (confirmed && opt.correct) ? 600 : 400, transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, opacity: 0.5, flexShrink: 0 }}>{String.fromCharCode(65 + i)}</span>
                  {opt.text}
                  {confirmed && opt.correct && <span style={{ marginLeft: 'auto' }}>✓</span>}
                  {confirmed && opt === selected && !opt.correct && <span style={{ marginLeft: 'auto' }}>✗</span>}
                </div>
              )
            })}
          </div>
          {confirmed && (
            <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, background: selected?.correct ? 'rgba(26,158,92,0.08)' : 'rgba(214,59,59,0.08)', border: `1px solid ${selected?.correct ? 'rgba(26,158,92,0.2)' : 'rgba(214,59,59,0.2)'}`, fontSize: 12, lineHeight: 1.6, color: 'var(--text)', animation: 'fadeSlideIn 0.25s ease' }}>
              <span style={{ fontWeight: 700, color: selected?.correct ? 'var(--green)' : 'var(--red)' }}>{selected?.correct ? '✓ Correct — ' : '✗ Not quite — '}</span>
              {card.explanation}
            </div>
          )}
          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            {!confirmed ? (
              <button className="btn btn-accent" style={{ flex: 1, opacity: selected ? 1 : 0.4, cursor: selected ? 'pointer' : 'not-allowed' }} onClick={handleConfirm} disabled={!selected}>Check Answer</button>
            ) : (
              <button className="btn btn-accent" style={{ flex: 1 }} onClick={handleNext}>{index + 1 >= deck.length ? '🏁 See Results' : 'Next Card →'}</button>
            )}
          </div>
        </div>
      )}
      <style>{`@keyframes fadeSlideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ERROR TRACKER & CORRECTION CLINIC
// ─────────────────────────────────────────────────────────────────────────────

const ERROR_CATS = {
  grammar:     { label: 'Grammar',       color: '#2d6be4', emoji: '⚙️'  },
  vocabulary:  { label: 'Vocabulary',    color: '#7c3aed', emoji: '📚'  },
  pronunciation:{ label: 'Pronunciation', color: '#d4900a', emoji: '👄'  },
  fluency:     { label: 'Fluency',       color: '#e85d26', emoji: '🗣️'  },
  spelling:    { label: 'Spelling',      color: '#1a9e5c', emoji: '✍️'  },
}

const DRILL_TEMPLATES = {
  grammar: (err) => [
    `Write 5 correct sentences using the same structure as: "${err.correct}"`,
    `Transform these sentences: change the subject each time but keep the same grammar form.`,
    `Find the error and fix it: write 3 variations of "${err.wrong}" correctly.`,
    `Peer check: swap papers and circle any use of this grammar form — correct or incorrect.`,
    `Dictation drill: teacher says the correct form, students write it without looking at notes.`,
  ],
  vocabulary: (err) => [
    `Use "${err.correct}" in 3 original sentences — each in a different context.`,
    `Find 2 collocations for the target word and use each in a sentence.`,
    `Write the word, its part of speech, and one synonym. Then use each in a sentence.`,
    `Peer quiz: one student gives the definition, the other gives the word — no looking.`,
    `Use the word correctly in a short 4-sentence story about your day.`,
  ],
  pronunciation: (err) => [
    `Minimal pair drill: teacher reads 10 pairs, students mark which sound they hear (A or B).`,
    `Record yourself saying "${err.correct}" 5 times — listen back and compare.`,
    `Shadow the teacher: repeat immediately after hearing "${err.correct}" at natural speed.`,
    `Tongue position focus: where is your tongue for this sound? Practice in a mirror.`,
    `Find 5 other words with the same sound as "${err.correct}" and practise as a chain.`,
  ],
  fluency: (err) => [
    `Timed speaking: talk about any topic for 60 seconds without stopping — quantity over accuracy.`,
    `4-3-2 activity: tell your partner about today's topic in 4 minutes, then 3, then 2.`,
    `Chunking practice: break "${err.correct}" into natural chunks and repeat until automatic.`,
    `Communication task: describe a picture to your partner for 1 minute — no preparation.`,
    `Repeat the sentence at increasing speed: slow → normal → fast. Don't lose accuracy.`,
  ],
  spelling: (err) => [
    `Cover-write-check: look at "${err.correct}", cover it, write it, check. Repeat 5 times.`,
    `Find 3 other words with the same spelling pattern as "${err.correct}".`,
    `Dictation: teacher says the word in a sentence, students write the whole sentence.`,
    `Word build: how many smaller words can you find inside "${err.correct}"?`,
    `Mnemonics: invent a memory trick for the tricky part of "${err.correct}".`,
  ],
}

const FEEDBACK_TYPES = [
  { id: 'recast',    label: 'Recast',             desc: 'Repeated correctly without highlighting the error' },
  { id: 'explicit',  label: 'Explicit Correction', desc: 'Directly pointed out the error and gave the correct form' },
  { id: 'elicit',    label: 'Elicitation',         desc: 'Prompted the student to self-correct' },
  { id: 'metalingo', label: 'Metalinguistic',      desc: 'Gave a hint about the type of error without the answer' },
  { id: 'ignored',   label: 'Ignored',             desc: 'Let it pass to maintain fluency' },
]

const STORAGE_KEY = 'esltracker_errors_v1'

function ErrorTracker() {
  const [errors, setErrors]         = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
  })
  const [view, setView]             = useState('log')   // 'log' | 'clinic' | 'stats'
  const [form, setForm]             = useState({ student: '', wrong: '', correct: '', cat: 'grammar', feedback: 'recast', classLabel: '', notes: '' })
  const [drills, setDrills]         = useState(null)
  const [filterCat, setFilterCat]   = useState('all')
  const [filterClass, setFilterClass] = useState('all')
  const [expanded, setExpanded]     = useState(null)
  const [showForm, setShowForm]     = useState(false)
  const [search, setSearch]         = useState('')

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(errors)) } catch {}
  }, [errors])

  function addError() {
    if (!form.wrong.trim() || !form.correct.trim()) return
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      ...form,
      count: 1,
    }
    setErrors(prev => {
      // If same student + same wrong form already exists, increment count
      const existing = prev.findIndex(e => e.student.trim().toLowerCase() === form.student.trim().toLowerCase() && e.wrong.trim().toLowerCase() === form.wrong.trim().toLowerCase())
      if (existing !== -1) {
        const updated = [...prev]
        updated[existing] = { ...updated[existing], count: updated[existing].count + 1, date: entry.date, feedback: form.feedback, notes: form.notes || updated[existing].notes }
        return updated
      }
      return [entry, ...prev]
    })
    setForm(f => ({ ...f, wrong: '', correct: '', notes: '' }))
    setShowForm(false)
  }

  function deleteError(id) {
    setErrors(prev => prev.filter(e => e.id !== id))
  }

  function generateDrills(err) {
    const templates = DRILL_TEMPLATES[err.cat] || DRILL_TEMPLATES.grammar
    const selected = [...templates].sort(() => Math.random() - 0.5).slice(0, 3)
    setDrills({ err, activities: selected })
    setView('clinic')
  }

  // Derived
  const classes = [...new Set(errors.map(e => e.classLabel).filter(Boolean))]
  const filtered = errors.filter(e => {
    if (filterCat !== 'all' && e.cat !== filterCat) return false
    if (filterClass !== 'all' && e.classLabel !== filterClass) return false
    if (search && !e.wrong.toLowerCase().includes(search.toLowerCase()) && !e.student.toLowerCase().includes(search.toLowerCase()) && !e.correct.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Stats
  const catCounts = Object.keys(ERROR_CATS).map(c => ({ cat: c, count: errors.filter(e => e.cat === c).length })).sort((a, b) => b.count - a.count)
  const topErrors = [...errors].sort((a, b) => b.count - a.count).slice(0, 5)
  const studentCounts = {}
  errors.forEach(e => { if (e.student) studentCounts[e.student] = (studentCounts[e.student] || 0) + e.count })
  const topStudents = Object.entries(studentCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const feedbackCounts = {}
  errors.forEach(e => { feedbackCounts[e.feedback] = (feedbackCounts[e.feedback] || 0) + 1 })

  const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 12, boxSizing: 'border-box', fontFamily: 'inherit' }

  // ── CLINIC VIEW ──
  if (view === 'clinic' && drills) {
    const meta = ERROR_CATS[drills.err.cat]
    return (
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <button className="btn btn-outline" style={{ marginBottom: 24, fontSize: 11 }} onClick={() => setView('log')}>← Back to Error Log</button>

        <div style={{ padding: '20px 24px', borderRadius: 'var(--radius)', background: 'var(--surface)', border: `1px solid ${meta.color}40`, boxShadow: 'var(--shadow)', marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Correction Clinic</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{meta.emoji} {meta.label} Error</div>
          {drills.err.student && <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>Student: <strong>{drills.err.student}</strong>{drills.err.classLabel ? ` · ${drills.err.classLabel}` : ''}</div>}
          <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
            <div style={{ flex: 1, padding: '12px 16px', borderRadius: 10, background: 'rgba(214,59,59,0.07)', border: '1px solid rgba(214,59,59,0.15)' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--red)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>❌ Error Said</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>"{drills.err.wrong}"</div>
            </div>
            <div style={{ flex: 1, padding: '12px 16px', borderRadius: 10, background: 'rgba(26,158,92,0.07)', border: '1px solid rgba(26,158,92,0.15)' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--green)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>✓ Correct Form</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>"{drills.err.correct}"</div>
            </div>
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', marginTop: 8 }}>
            Occurred <strong style={{ color: meta.color }}>{drills.err.count}×</strong> · Last: {drills.err.date}
          </div>
        </div>

        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>🎯 Targeted Drill Activities</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
          {drills.activities.map((act, i) => (
            <div key={i} style={{ padding: '18px 20px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${meta.color}20`, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text)' }}>{act}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '16px 20px', borderRadius: 12, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>📖 Research Reminder</div>
          <div style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--text)' }}>
            Ericsson's <strong>Deliberate Practice</strong>: target this specific error with 3–5 minutes of focused, feedback-rich reps — not a full grammar lesson. Lyster & Ranta found that <strong>elicitation</strong> (prompting self-correction) produces higher uptake than recasting alone. If this error has occurred {drills.err.count > 2 ? <strong style={{ color: 'var(--red)' }}>{drills.err.count}+ times, it may be fossilizing</strong> : 'more than once, give it deliberate attention'}. Log feedback type each class to see if your correction strategy is working.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button className="btn btn-accent" onClick={() => { setDrills({ ...drills, activities: [...DRILL_TEMPLATES[drills.err.cat]].sort(() => Math.random() - 0.5).slice(0, 3) }) }}>🔀 New Drills</button>
          <button className="btn btn-outline" onClick={() => setView('log')}>← Back</button>
        </div>
      </div>
    )
  }

  // ── STATS VIEW ──
  if (view === 'stats') {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Error Analytics</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>Class Error Patterns</div>
          </div>
          <button className="btn btn-outline" style={{ fontSize: 11 }} onClick={() => setView('log')}>← Back</button>
        </div>

        {errors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)', fontSize: 13 }}>No errors logged yet. Start logging during class to see patterns emerge.</div>
        ) : (
          <div style={{ display: 'grid', gap: 20 }}>

            {/* Error by category */}
            <div style={{ padding: 24, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>Errors by Category</div>
              {catCounts.filter(c => c.count > 0).map(({ cat, count }) => {
                const meta = ERROR_CATS[cat]
                const pct = Math.round((count / errors.length) * 100)
                return (
                  <div key={cat} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{meta.emoji} {meta.label}</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: meta.color }}>{count} errors · {pct}%</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: meta.color, borderRadius: 4, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Top recurring errors */}
              <div style={{ padding: 24, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>⚠️ Most Recurring</div>
                {topErrors.length === 0 ? <div style={{ fontSize: 12, color: 'var(--muted)' }}>None yet</div> : topErrors.map(e => (
                  <div key={e.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)', marginBottom: 2 }}>"{e.wrong}"</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>→ "{e.correct}"</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: ERROR_CATS[e.cat]?.color }}>{ERROR_CATS[e.cat]?.label}</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: e.count >= 3 ? 'var(--red)' : 'var(--muted)', fontWeight: e.count >= 3 ? 700 : 400 }}>{e.count}× {e.count >= 3 ? '⚠️' : ''}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Students needing attention */}
              <div style={{ padding: 24, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>👤 Most Errors by Student</div>
                {topStudents.length === 0 ? <div style={{ fontSize: 12, color: 'var(--muted)' }}>None yet</div> : topStudents.map(([name, count]) => (
                  <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '8px 12px', borderRadius: 8, background: 'var(--surface2)' }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{name}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: count >= 5 ? 'var(--red)' : 'var(--muted)', fontWeight: count >= 5 ? 700 : 400 }}>{count} total {count >= 5 ? '⚠️' : ''}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback strategy breakdown */}
            <div style={{ padding: 24, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Your Correction Strategy Mix</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>Research tip: Lyster & Ranta found <strong>elicitation</strong> produces highest learner uptake. Over-relying on recasts may feel productive but learners often don't notice the correction.</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {FEEDBACK_TYPES.map(ft => {
                  const count = feedbackCounts[ft.id] || 0
                  const total = errors.length
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0
                  return (
                    <div key={ft.id} style={{ flex: '1 1 140px', padding: '12px 14px', borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)', textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 800, color: count > 0 ? 'var(--accent)' : 'var(--muted)', marginBottom: 4 }}>{pct}%</div>
                      <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 2 }}>{ft.label}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)' }}>{count} times</div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        )}
      </div>
    )
  }

  // ── LOG VIEW (default) ──
  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Error Tracker</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Error Log & Correction Clinic</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, maxWidth: 500 }}>
            Log student errors during or after class. Spot patterns. Hit <strong>Clinic</strong> on any error for targeted drill activities.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" style={{ fontSize: 11 }} onClick={() => setView('stats')}>📊 Analytics</button>
          <button className="btn btn-accent" style={{ fontSize: 11 }} onClick={() => setShowForm(f => !f)}>{showForm ? '✕ Cancel' : '+ Log Error'}</button>
        </div>
      </div>

      {/* Log error form */}
      {showForm && (
        <div style={{ padding: 24, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', marginBottom: 24, animation: 'fadeSlideIn 0.2s ease' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>New Error Entry</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Student Name</label>
              <input value={form.student} onChange={e => setForm(f => ({ ...f, student: e.target.value }))} placeholder="e.g. Minh, Linh..." style={inputStyle} />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Class</label>
              <input value={form.classLabel} onChange={e => setForm(f => ({ ...f, classLabel: e.target.value }))} placeholder="e.g. ATB_Pro3_S" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>❌ What They Said</label>
              <input value={form.wrong} onChange={e => setForm(f => ({ ...f, wrong: e.target.value }))} placeholder='e.g. "She go to school"' style={inputStyle} />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>✓ Correct Form</label>
              <input value={form.correct} onChange={e => setForm(f => ({ ...f, correct: e.target.value }))} placeholder='e.g. "She goes to school"' style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Error Type</label>
              <select value={form.cat} onChange={e => setForm(f => ({ ...f, cat: e.target.value }))} style={{ ...inputStyle, width: 'auto', minWidth: '100%' }}>
                {Object.entries(ERROR_CATS).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Feedback Given</label>
              <select value={form.feedback} onChange={e => setForm(f => ({ ...f, feedback: e.target.value }))} style={{ ...inputStyle, width: 'auto', minWidth: '100%' }}>
                {FEEDBACK_TYPES.map(ft => <option key={ft.id} value={ft.id}>{ft.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Notes (optional)</label>
            <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Context, pattern, next steps..." style={inputStyle} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-accent" onClick={addError} style={{ opacity: form.wrong && form.correct ? 1 : 0.4 }} disabled={!form.wrong || !form.correct}>💾 Save Error</button>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      {errors.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search errors..." style={{ ...inputStyle, width: 180, flex: 'none' }} />
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 12 }}>
            <option value="all">All Types</option>
            {Object.entries(ERROR_CATS).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
          </select>
          {classes.length > 0 && (
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 12 }}>
              <option value="all">All Classes</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', marginLeft: 'auto' }}>{filtered.length} entries</span>
        </div>
      )}

      {/* Error list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>No errors logged yet</div>
          <div style={{ fontSize: 12, lineHeight: 1.7, maxWidth: 380, margin: '0 auto' }}>
            After each class, log the errors you heard. Over time you'll see which mistakes are fossilizing — and the Clinic will give you drills to fix them.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(err => {
            const meta = ERROR_CATS[err.cat] || ERROR_CATS.grammar
            const isOpen = expanded === err.id
            const fossilizing = err.count >= 3
            return (
              <div key={err.id} style={{
                background: 'var(--surface)', border: `1px solid ${fossilizing ? 'rgba(214,59,59,0.3)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)',
                borderLeft: `4px solid ${meta.color}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', cursor: 'pointer' }} onClick={() => setExpanded(isOpen ? null : err.id)}>
                  <span style={{ fontSize: 16 }}>{meta.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--red)' }}>"{err.wrong}"</span>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>→</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>"{err.correct}"</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 3, flexWrap: 'wrap' }}>
                      {err.student && <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)' }}>{err.student}</span>}
                      {err.classLabel && <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)' }}>{err.classLabel}</span>}
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)' }}>{err.date}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {fossilizing && <span style={{ fontSize: 10, color: 'var(--red)', fontWeight: 700 }}>⚠️ {err.count}×</span>}
                    {!fossilizing && err.count > 1 && <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>{err.count}×</span>}
                    <button
                      className="btn btn-accent"
                      style={{ fontSize: 10, padding: '5px 12px' }}
                      onClick={e => { e.stopPropagation(); generateDrills(err) }}
                    >Clinic →</button>
                    <span style={{ color: 'var(--muted)', fontSize: 11 }}>{isOpen ? '▲' : '▼'}</span>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ padding: '0 18px 16px', borderTop: '1px solid var(--border)', animation: 'fadeSlideIn 0.2s ease' }}>
                    <div style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
                      <div style={{ padding: '6px 12px', borderRadius: 8, background: `${meta.color}12`, border: `1px solid ${meta.color}25`, fontSize: 11 }}>
                        {meta.emoji} {meta.label}
                      </div>
                      <div style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', fontSize: 11 }}>
                        Feedback: {FEEDBACK_TYPES.find(f => f.id === err.feedback)?.label || err.feedback}
                      </div>
                      <div style={{ padding: '6px 12px', borderRadius: 8, background: fossilizing ? 'rgba(214,59,59,0.08)' : 'var(--surface2)', border: `1px solid ${fossilizing ? 'rgba(214,59,59,0.2)' : 'var(--border)'}`, fontSize: 11, color: fossilizing ? 'var(--red)' : 'var(--text)', fontWeight: fossilizing ? 700 : 400 }}>
                        {err.count}× logged {fossilizing ? '— possible fossilization ⚠️' : ''}
                      </div>
                    </div>
                    {err.notes && <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, fontStyle: 'italic' }}>"{err.notes}"</div>}
                    <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                      <button className="btn btn-accent" style={{ fontSize: 11 }} onClick={() => generateDrills(err)}>🎯 Open Clinic</button>
                      <button className="btn btn-outline" style={{ fontSize: 11, color: 'var(--red)' }} onClick={() => deleteError(err.id)}>🗑️ Delete</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      <style>{`@keyframes fadeSlideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN TeacherAcademy — tab switcher across three tools
// ─────────────────────────────────────────────────────────────────────────────
export default function TeacherAcademy() {
  const [tool, setTool] = useState('flashcards')

  const TOOLS = [
    { id: 'flashcards', label: '🃏 Research Flashcards', desc: 'Quiz yourself on 15 evidence-based ESL methods' },
    { id: 'builder',    label: '📋 Lesson Builder',      desc: 'Build a timed lesson plan from research-backed activities' },
    { id: 'errors',     label: '🔬 Error Tracker',       desc: 'Log student errors, spot patterns, get targeted drills' },
  ]

  return (
    <div>
      {/* Academy header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Teacher Academy</div>
        <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>Professional Development Hub</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', maxWidth: 580, lineHeight: 1.7 }}>
          Three tools to make you a sharper educator. Study the research, design your lessons, track what your students struggle with.
        </div>
      </div>

      {/* Tool switcher */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 36 }}>
        {TOOLS.map(t => (
          <div
            key={t.id}
            onClick={() => setTool(t.id)}
            style={{
              padding: '18px 22px', borderRadius: 'var(--radius)', cursor: 'pointer',
              background: tool === t.id ? 'var(--accent)' : 'var(--surface)',
              border: `1px solid ${tool === t.id ? 'var(--accent)' : 'var(--border)'}`,
              color: tool === t.id ? '#fff' : 'var(--text)',
              transition: 'all 0.18s', boxShadow: tool === t.id ? '0 4px 16px rgba(232,93,38,0.25)' : 'var(--shadow)',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{t.label}</div>
            <div style={{ fontSize: 11, opacity: 0.75, lineHeight: 1.5 }}>{t.desc}</div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border)', marginBottom: 36 }} />

      {/* Active tool */}
      {tool === 'flashcards' && <FlashcardGame />}
      {tool === 'builder'    && <LessonBuilder />}
      {tool === 'errors'     && <ErrorTracker />}
    </div>
  )
}

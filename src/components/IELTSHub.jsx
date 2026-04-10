import { useState, useEffect, useRef } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UTILITIES
// ─────────────────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const BAND_COLOR = (b) => {
  if (b >= 8)  return '#1a9e5c'
  if (b >= 7)  return '#2d6be4'
  if (b >= 6)  return '#d4900a'
  if (b >= 5)  return '#e85d26'
  return '#d63b3b'
}

const BAND_LABEL = (b) => {
  if (b >= 9)  return 'Expert'
  if (b >= 8)  return 'Very Good'
  if (b >= 7)  return 'Good'
  if (b >= 6)  return 'Competent'
  if (b >= 5)  return 'Modest'
  if (b >= 4)  return 'Limited'
  return 'Extremely Limited'
}

// ─────────────────────────────────────────────────────────────────────────────
// IELTS SPEAKING DATA
// ─────────────────────────────────────────────────────────────────────────────

// The 4 official criteria
const SPEAKING_CRITERIA = [
  {
    id: 'fluency',
    label: 'Fluency & Coherence',
    abbr: 'FC',
    color: '#2d6be4',
    description: 'How smoothly and logically the candidate speaks — pace, hesitation, self-correction, discourse markers, and how ideas connect.',
    bands: {
      9: 'Speaks fluently with only rare, natural-sounding hesitation. Coherence is seamless — ideas flow effortlessly.',
      8: 'Fluent with only occasional, appropriate hesitation. Maintains topic well. Connects ideas clearly.',
      7: 'Speaks at length without noticeable effort. Some hesitation but not disruptive. Uses discourse markers well.',
      6: 'Maintains flow but shows repetition, self-correction, or hesitation at times. Mostly coherent.',
      5: 'Pauses frequently, sometimes due to language difficulty. Overuses simple connectives. Loses coherence at times.',
      4: 'Slow, labored speech with long pauses. Struggles to maintain coherence. Limited conversational exchange.',
      3: 'Very slow and hesitant. Often only produces 1–2 words at a time. Frequent and long pauses.',
    },
  },
  {
    id: 'lexical',
    label: 'Lexical Resource',
    abbr: 'LR',
    color: '#7c3aed',
    description: 'Vocabulary range, accuracy, and flexibility. Can they paraphrase? Do they use topic-specific and sophisticated words naturally?',
    bands: {
      9: 'Fully flexible vocabulary. Uses idiomatic language naturally and precisely. No errors.',
      8: 'Wide range, minor errors acceptable. Uses less common vocabulary skillfully. Good paraphrasing.',
      7: 'Uses vocabulary flexibly and discusses topics at length. Some errors in word choice but meaning is clear.',
      6: 'Adequate vocabulary for unfamiliar topics. Some errors and inappropriate choices but communicates effectively.',
      5: 'Vocabulary sufficient for familiar topics. Errors in word choice. Limited ability to paraphrase.',
      4: 'Vocabulary limited to basic. Repetition and circumlocution frequent. Struggles beyond familiar topics.',
      3: 'Very limited range. Only isolated words or formulaic expressions. Long pauses while searching for words.',
    },
  },
  {
    id: 'grammar',
    label: 'Grammatical Range & Accuracy',
    abbr: 'GRA',
    color: '#d4900a',
    description: 'Range of structures used and how accurately. Complex sentences, tense control, passive, conditionals — and how often errors occur.',
    bands: {
      9: 'Full range of structures. All grammatical forms used accurately and flexibly. No errors.',
      8: 'Wide range of structures. Errors rare and only minor. Flexible and natural.',
      7: 'Good range of complex structures. Some errors but not impeding communication. Frequent accurate forms.',
      6: 'Mix of simple and complex. Errors occur but rarely cause misunderstanding.',
      5: 'Attempts complex structures but with limited control. Uses simple sentences accurately. Errors frequent.',
      4: 'Only basic sentence forms with limited accuracy. Complex structures attempted rarely and usually in error.',
      3: 'Very few sentence forms. Errors cause difficulty for the listener.',
    },
  },
  {
    id: 'pronunciation',
    label: 'Pronunciation',
    abbr: 'PRON',
    color: '#e85d26',
    description: 'Not accent — intelligibility, stress, intonation, rhythm, individual sounds. Can the listener understand without effort?',
    bands: {
      9: 'Effortless to understand. Features of pronunciation used positively to convey meaning. Accent irrelevant.',
      8: 'Consistently clear. Phonological features used effectively. L1 accent has minimal effect.',
      7: 'Generally clear. Flexible enough to be always understood. Some L1 features but no effort required from listener.',
      6: 'Mostly intelligible. Mispronunciations occur but usually self-corrects. L1 accent sometimes requires listener effort.',
      5: 'Intelligible but mispronunciations frequent enough to cause occasional difficulty for the listener.',
      4: 'Limited control of phonological features. L1 accent heavily intrudes. Frequent misunderstanding.',
      3: 'Pronunciation so heavily influenced by L1 that speech is frequently unintelligible.',
    },
  },
]

// Speaking examiner scenarios — you hear a response, you score it
const EXAMINER_SCENARIOS = [
  {
    id: 1,
    part: 'Part 1',
    question: 'Do you prefer spending time indoors or outdoors? Why?',
    response: `"I like... outdoor. Because... fresh air is good. My health is... um... better. I go park sometimes. Weekend I go with family. Very nice. I like it."`,
    correct: { fluency: 4, lexical: 4, grammar: 4, pronunciation: 5 },
    overall: 4.5,
    analysis: {
      fluency: 'Very slow, labored. Long pauses. Only produces short bursts. Cannot maintain conversational flow.',
      lexical: 'Vocabulary extremely basic — "nice," "good," "better." No evidence of range. Cannot paraphrase.',
      grammar: 'Only basic sentence fragments. Missing articles, copula. Errors impede communication.',
      pronunciation: 'Likely intelligible for a patient listener but features of L1 heavily present.',
    },
    trap: 'Students at this level often get bumped up by examiners who are being kind. A Band 5 would require sustained sentences and some vocabulary range. This is a clear 4–4.5.',
  },
  {
    id: 2,
    part: 'Part 1',
    question: 'How do you usually spend your weekends?',
    response: `"Well, it really depends on the weather, to be honest. If it's a sunny day, I tend to go for a jog in the park or maybe meet up with some friends for a coffee. But if the weather isn't great, I'd rather stay home and catch up on some reading or watch a documentary. I've actually been into true crime documentaries lately — I find them absolutely fascinating."`,
    correct: { fluency: 8, lexical: 8, grammar: 7, pronunciation: 7 },
    overall: 7.5,
    analysis: {
      fluency: 'Natural, fluent, no unnatural hesitation. "To be honest," "Well" — good discourse management. Coherent throughout.',
      lexical: 'Good range: "tend to," "catch up on," "absolutely fascinating," "I\'ve been into." Idiomatic and natural.',
      grammar: '"I tend to," "I\'d rather," "I\'ve been into" — good range. Conditionals used correctly. Minor issues prevent 8.',
      pronunciation: 'Assumed clear and intelligible from the fluency and complexity. Natural stress patterns.',
    },
    trap: 'Do not give Band 9 just because this sounds impressive in a classroom context. Band 8 requires near-zero errors and very wide vocabulary. This is a solid 7.5 — strong but real language learner range.',
  },
  {
    id: 3,
    part: 'Part 2',
    question: 'Describe a time when you helped someone. You should say: who you helped, what you did, why you helped them, and how you felt afterwards.',
    response: `"OK so I want to talk about the time I... uh... helped my neighbor. She is old woman. She... cannot carry bag from market. So I... I help her. I carry bag to her house. It was... very heavy. Um. I feel good. Because helping people is good thing. That's all."`,
    correct: { fluency: 4, lexical: 4, grammar: 4, pronunciation: 5 },
    overall: 4,
    analysis: {
      fluency: 'Very short response for Part 2 (should be 1–2 minutes). Multiple unnatural pauses. No discourse markers to extend the talk.',
      lexical: 'Extremely limited: "good," "heavy," "old." No attempt at descriptive or emotive vocabulary.',
      grammar: 'Missing articles ("an old woman"), copula errors. Simple structures only. Past tense used but without any complex forms.',
      pronunciation: 'Likely intelligible but with heavy L1 interference.',
    },
    trap: 'Part 2 requires 1–2 minutes of sustained speech. Stopping at 30 seconds is itself evidence of Band 4 fluency. Do not award Band 5 out of sympathy for content — the task is language, not storytelling.',
  },
  {
    id: 4,
    part: 'Part 2',
    question: 'Describe a book or film that had a significant impact on you.',
    response: `"I'd like to talk about a film called Parasite, directed by Bong Joon-ho. It's a South Korean movie that came out in 2019 and it genuinely changed the way I think about social inequality. What struck me most was how the director managed to blend dark comedy with biting social commentary — it was both entertaining and deeply thought-provoking. I remember watching it with my sister and we spent hours afterwards discussing the symbolism, particularly what the basement represented. I think what made it so impactful for me personally was that it reminded me that ambition without ethics can be destructive. I've actually recommended it to several friends since then, and they all had similarly strong reactions."`,
    correct: { fluency: 8, lexical: 9, grammar: 8, pronunciation: 8 },
    overall: 8,
    analysis: {
      fluency: 'Sustained, natural monologue. Excellent use of "What struck me most," "I think what made it." Fully coherent narrative.',
      lexical: 'Outstanding: "biting social commentary," "thought-provoking," "symbolism," "destructive," "ambition without ethics." Near-native range.',
      grammar: 'Complex structures throughout: relative clauses, past perfect implied, what-clauses. Rare if any errors.',
      pronunciation: 'Assumed excellent given fluency and lexical sophistication.',
    },
    trap: 'This response might tempt a Band 9. But Band 9 requires full flexibility across ALL topics and absolute precision. Reserve 9 for exceptional cases. A brilliant Part 2 response on a favorite topic still lands at 8.',
  },
  {
    id: 5,
    part: 'Part 3',
    question: 'Do you think governments should invest more in public transport? Why or why not?',
    response: `"Yes, I think government should invest in transport. Because many people use it. Traffic is big problem in city. If more bus and train, people not use car. Environment will be better. Also cheaper for poor people. So yes, government should do it."`,
    correct: { fluency: 5, lexical: 5, grammar: 5, pronunciation: 5 },
    overall: 5,
    analysis: {
      fluency: 'Can produce sustained speech but choppy. Overuses simple connectives ("because," "also"). Some logical flow.',
      lexical: 'Sufficient for the topic but basic: "big problem," "better," "cheaper." No sophisticated academic vocabulary.',
      grammar: '"government should" (missing article), "people not use car" (missing aux). Errors frequent but meaning maintained.',
      pronunciation: 'Intelligible but with noticeable L1 features.',
    },
    trap: 'Band 5 is the hardest band to calibrate. The candidate communicates and responds but everything is thin — thin vocabulary, thin grammar, thin development. Many examiners over-score Band 5 responses to Band 6. No extended clauses = not Band 6.',
  },
  {
    id: 6,
    part: 'Part 3',
    question: 'Some people believe that social media has made people less connected in real life. To what extent do you agree?',
    response: `"That's an interesting question and I think it's partly true, though I wouldn't say it's the whole picture. On one hand, there's definitely evidence that excessive screen time can erode face-to-face relationships — people sitting together but staring at their phones, for example. However, I'd argue that social media can also strengthen connections, particularly for people who live far from their families or who struggle with social anxiety. In those cases, platforms like Instagram or WhatsApp actually provide a lifeline. So I suppose my view is that it's not social media itself that's the issue — it's how we choose to use it. The technology is neutral; the behavior is what matters."`,
    correct: { fluency: 9, lexical: 8, grammar: 9, pronunciation: 8 },
    overall: 8.5,
    analysis: {
      fluency: 'Absolutely fluent. Sophisticated discourse: "On one hand," "However," "I\'d argue," "I suppose my view is." Effortless.',
      lexical: '"Erode," "face-to-face," "lifeline," "excessive screen time," "neutral" — very wide range, precisely used.',
      grammar: 'Conditionals, relative clauses, passive implied. Flawless control. Could be Band 9 for grammar.',
      pronunciation: 'Assumed excellent. Band 8–9 territory.',
    },
    trap: 'This is the response that makes examiners give Band 9 overall. Resist — overall band is the average of four criteria. Unless ALL four are 9, overall cannot be 9. Calculate carefully.',
  },
  {
    id: 7,
    part: 'Part 1',
    question: 'Do you enjoy cooking?',
    response: `"Um, cooking? Yeah I... I like cooking. I cook... rice, vegetables. Sometimes noodle. My mother teach me. It's... OK. Not difficult."`,
    correct: { fluency: 4, lexical: 4, grammar: 4, pronunciation: 5 },
    overall: 4,
    analysis: {
      fluency: 'Very short, halting. Barely engages with the question. No extension. Classic Band 4 response — answers but cannot elaborate.',
      lexical: 'Only the most basic food words. No range whatsoever. "OK," "difficult" — minimal.',
      grammar: '"My mother teach me" — tense error. Missing articles throughout. No complex forms.',
      pronunciation: 'Minimal speech makes it hard to assess fully but likely Band 5 at best.',
    },
    trap: 'Part 1 answers should be 3–5 sentences minimum. One-word or two-word answers are not Band 5. The examiner must prompt for more — that prompting itself is evidence of limited fluency.',
  },
  {
    id: 8,
    part: 'Part 3',
    question: 'How has technology changed the way people learn?',
    response: `"Technology has really revolutionized education in ways that would have been unimaginable even twenty years ago. Take online learning, for instance — platforms like Coursera or Khan Academy have democratized access to knowledge, meaning that someone in a rural village in Vietnam can now access the same content as a student at Harvard. That said, I do think there are trade-offs. The ability to focus deeply has arguably declined as students become accustomed to consuming information in short clips rather than through sustained reading. So while the breadth of available knowledge has expanded enormously, the depth of engagement with it may have suffered."`,
    correct: { fluency: 9, lexical: 9, grammar: 8, pronunciation: 8 },
    overall: 8.5,
    analysis: {
      fluency: 'Masterful. Long, coherent turn. "Take... for instance," "That said," "So while" — expert discourse management.',
      lexical: '"Revolutionized," "democratized," "trade-offs," "sustained reading," "breadth," "depth of engagement" — Band 9 vocabulary.',
      grammar: 'Complex structures throughout. Conditional sense in "would have been," passive structures, relative clauses. Very high.',
      pronunciation: 'Assumed very high given the sophistication of other features.',
    },
    trap: 'When a response is this impressive, check: is this real-time production or memorized? Examiners should probe with a follow-up question. If the candidate deflates immediately, revise the score down.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// IELTS SKILLS TEACHING DATA
// ─────────────────────────────────────────────────────────────────────────────

const SKILLS_SCENARIOS = [
  // LISTENING
  {
    id: 'L1',
    skill: 'Listening',
    icon: '🎧',
    color: '#2d6be4',
    topic: 'Teaching Listening — Section 1 (Form Completion)',
    scenario: 'A student keeps missing answers on form-completion tasks because they don\'t predict well before listening. What is the most effective strategy to teach them?',
    choices: [
      { text: 'Tell them to listen as hard as possible and write everything they hear.', score: 1, verdict: 'Counterproductive', explanation: 'Passive listening without prediction means students are always reacting, never ready. They\'ll miss the answers before they can process them.' },
      { text: 'Teach them to read the form carefully before listening, predict word type (number? name? date?), and listen for those specific slots.', score: 5, verdict: '✓ Best approach', explanation: 'Prediction activates schema and focuses attention. Students know they need "a date" in slot 3 — they filter everything else out. This is the core exam skill for form completion.' },
      { text: 'Play the recording twice so they have more chances to catch the answer.', score: 2, verdict: 'False safety net', explanation: 'In the real exam, recordings play once only. Training students on double-play creates dependency that collapses on exam day.' },
      { text: 'Focus on improving general English first — listening skills will come naturally.', score: 1, verdict: 'Ignores exam technique', explanation: 'Even strong English speakers fail IELTS Listening without technique. The exam has specific traps (distractors, spelling requirements) that require explicit training.' },
    ],
    bandDescriptions: {
      9: 'Answers all questions correctly. Catches distractor traps. Spells correctly.',
      8: 'Gets most answers. May miss 1–2 distractor traps. Spelling usually correct.',
      7: 'Gets majority of answers but distractor traps catch them occasionally.',
      6: 'Gets straightforward answers. Misses several, especially in Sections 3–4.',
      5: 'Gets some answers in Sections 1–2. Struggles significantly with Sections 3–4.',
      4: 'Only catches simple, direct information. Misses most answers.',
    },
    teachingTip: 'The single most powerful listening drill: pause the recording 2 seconds BEFORE each answer. Ask students to predict the word type. Then resume. Do this 10 times per session.',
  },
  {
    id: 'L2',
    skill: 'Listening',
    icon: '🎧',
    color: '#2d6be4',
    topic: 'Distractor Training — Multiple Choice',
    scenario: 'Your student got 60% on a multiple-choice listening task. They heard the right keyword but circled the wrong answer. What is happening and how do you fix it?',
    choices: [
      { text: 'They need more vocabulary. The problem is comprehension.', score: 2, verdict: 'Partial', explanation: 'Vocabulary may play a role, but the symptom you describe — hearing the keyword but getting it wrong — is specifically a distractor trap issue, not a comprehension issue.' },
      { text: 'They are keyword-matching instead of meaning-matching. Teach them that the correct answer paraphrases — it doesn\'t repeat — the spoken text.', score: 5, verdict: '✓ Spot on', explanation: 'IELTS multiple-choice deliberately uses the wrong answers to echo keywords from the audio. The right answer paraphrases. Students must process MEANING, not match sounds. This is the core lesson.' },
      { text: 'They should underline keywords in the question before listening.', score: 3, verdict: 'Helpful but incomplete', explanation: 'Underlining keywords is good technique but it doesn\'t solve the distractor problem. Without understanding that wrong answers echo keywords, they\'ll still be fooled.' },
      { text: 'Play the section again and ask them to try harder.', score: 1, verdict: 'Not a strategy', explanation: '"Try harder" is not a teaching intervention. You need to explicitly expose the distractor mechanism so students can recognize and resist it.' },
    ],
    bandDescriptions: {
      9: 'Consistently resists distractors. Processes full meaning, not keywords.',
      8: 'Usually avoids distractor traps. Rare slip under time pressure.',
      7: 'Gets most MC correct. Occasionally caught by well-placed distractors.',
      6: 'Inconsistent. Keyword-matching works on easy items but fails on tricky ones.',
      5: 'Frequently caught by distractors. Gets answers "in the wrong order" often.',
      4: 'Relies purely on keyword matching. High distractor trap rate.',
    },
    teachingTip: 'After any MC listening task, show students the transcript and highlight: (1) where the wrong answers are mentioned in the audio, and (2) how the right answer was paraphrased. Make the trap visible.',
  },
  // READING
  {
    id: 'R1',
    skill: 'Reading',
    icon: '📖',
    color: '#7c3aed',
    topic: 'True / False / Not Given — Most Failed Task Type',
    scenario: 'Your student consistently confuses FALSE and NOT GIVEN. They know the difference in theory but fail it in practice. What is the real problem and fix?',
    choices: [
      { text: 'Make them memorize the definitions again: FALSE = contradicted, NOT GIVEN = not mentioned.', score: 2, verdict: 'Knows it already', explanation: 'The student said they know the theory. Repeating the definition doesn\'t fix the execution problem. You need a different approach.' },
      { text: 'Teach them to locate the relevant sentence in the passage first, then ask: "Does this sentence contradict the statement, or does it just not address it?" Train with micro-texts.', score: 5, verdict: '✓ Best fix', explanation: 'The problem is usually that students find a nearby sentence and assume contradiction when it\'s simply silent on the point. Micro-text drilling — 2-sentence passages with one answer each — makes the distinction visceral rather than theoretical.' },
      { text: 'Tell them NOT GIVEN is always the safest answer when unsure.', score: 1, verdict: 'Wrong heuristic', explanation: 'This produces systematic errors. NOT GIVEN is not a default — it requires genuine absence of information. Teaching a shortcut here actively harms the student.' },
      { text: 'Drill with full IELTS passage practice tests weekly.', score: 3, verdict: 'Useful but unfocused', explanation: 'Full practice tests expose the problem but don\'t isolate it. Students need targeted micro-practice on this specific task type before returning to full passages.' },
    ],
    bandDescriptions: {
      9: 'Near-perfect on T/F/NG. Distinguishes contradiction from silence instantly.',
      8: 'Gets most T/F/NG correct. Rare confusion on very subtle NOT GIVEN.',
      7: 'Good but occasionally flips FALSE and NOT GIVEN on ambiguous items.',
      6: 'Inconsistent. Gets obvious ones right, fails on subtle distinctions.',
      5: 'Frequent FALSE/NOT GIVEN confusion. Often guesses on this task type.',
      4: 'TRUE is answered well. FALSE and NOT GIVEN largely guessed.',
    },
    teachingTip: 'Write 5 micro-texts (2 sentences each) with one statement. Have students answer T/F/NG and explain their reasoning aloud. Hearing them think reveals exactly where the logic breaks.',
  },
  {
    id: 'R2',
    skill: 'Reading',
    icon: '📖',
    color: '#7c3aed',
    topic: 'Reading Speed — Running Out of Time',
    scenario: 'Your Band 6 student understands the texts well but always runs out of time. They read every word of every passage. What do you teach them?',
    choices: [
      { text: 'Tell them to read faster. Speed will come with practice.', score: 1, verdict: 'Not actionable', explanation: '"Read faster" is not a technique. Without changing HOW they read, practice just reinforces slow habits.' },
      { text: 'Teach skimming (read first/last sentence of each paragraph) and scanning (look for specific information using a keyword anchor). Never read the full text first.', score: 5, verdict: '✓ Transformative', explanation: 'IELTS Reading is an open-book exam. The text is always there. Students who skim for structure, then scan for answers, consistently outperform those who read fully. This reframes the entire task.' },
      { text: 'Have them skip the hardest passages entirely and focus on easier ones.', score: 3, verdict: 'Tactical but costly', explanation: 'Strategic skipping has some merit in extremis, but it caps the score. A student who can skim and scan doesn\'t need to skip. Teach the skill before the tactic.' },
      { text: 'Recommend they do 5 full reading tests per week at home to build speed.', score: 2, verdict: 'Volume without technique', explanation: 'Repeating a slow strategy at high volume produces a faster slow strategy. Technique change must come before volume.' },
    ],
    bandDescriptions: {
      9: 'Completes all 40 questions with time to check. Skims and scans expertly.',
      8: 'Finishes on time. May rush last few questions but gets most right.',
      7: 'Completes most questions. Slight time pressure at the end.',
      6: 'Occasionally doesn\'t finish. Last passage rushed.',
      5: 'Frequently doesn\'t finish. Last 5–10 questions incomplete or guessed.',
      4: 'Rarely finishes. Reads linearly. Time is the primary enemy.',
    },
    teachingTip: 'Give a 300-word text and say: "You have 90 seconds. Tell me the topic of each paragraph." No answers — just paragraph topics. Do this daily. It builds skim instinct faster than any other drill.',
  },
  // WRITING
  {
    id: 'W1',
    skill: 'Writing',
    icon: '✍️',
    color: '#d4900a',
    topic: 'Task 2 — Task Response & Argument Quality',
    scenario: 'A student wrote a Band 5 Task 2 essay. They wrote 280 words, stayed on topic, and had no major grammar errors. But the score is low. Why and what do they need?',
    choices: [
      { text: 'The grammar must be wrong. Band 5 essays always have grammar problems.', score: 1, verdict: 'Wrong assumption', explanation: 'IELTS Writing scores across 4 criteria. A student can have decent grammar and still be Band 5 because their argument is thin, their ideas are generic, or their paragraphs don\'t develop.' },
      { text: 'They need more words. Tell them to write 320+ words.', score: 1, verdict: 'Word count is not quality', explanation: 'Word count above the minimum (250 for Task 2) does not improve the score. Examiners are not counting — they are assessing depth, coherence, and language.' },
      { text: 'Their ideas are probably correct but underdeveloped. Teach them the PEEL structure: Point → Explain → Evidence/Example → Link back. Each body paragraph should have all four elements.', score: 5, verdict: '✓ The real fix', explanation: 'Band 5 essays typically have one-sentence "body paragraphs" that state a point and move on. PEEL forces students to develop each idea to 4–6 sentences. This alone can push a student from Band 5 to Band 6–7.' },
      { text: 'The essay needs a better introduction. Focus on the intro first.', score: 2, verdict: 'Wrong priority', explanation: 'Introductions are one sentence of context + one sentence of thesis. They are not where Band scores are made. Body paragraph development is where Task Response and Coherence are demonstrated.' },
    ],
    bandDescriptions: {
      9: 'Fully addresses all parts. Sophisticated, nuanced argument. Excellent position.',
      8: 'Covers all parts well. Well-developed ideas with clear position throughout.',
      7: 'Addresses the task. Some parts more developed than others. Clear position.',
      6: 'Addresses the task but some under-development. Position sometimes unclear.',
      5: 'Addresses the topic but not all parts of the task. Ideas underdeveloped.',
      4: 'Responds to the task but misunderstands significant parts. Very limited development.',
    },
    teachingTip: 'Give a Band 5 model body paragraph (one generic sentence). Ask students to expand it to 6 sentences using PEEL. Then reveal a Band 7 version. The difference becomes obvious.',
  },
  {
    id: 'W2',
    skill: 'Writing',
    icon: '✍️',
    color: '#d4900a',
    topic: 'Task 1 Academic — Describing Trends',
    scenario: 'A student describes every number in a bar chart and writes 200 accurate sentences. Their Task Achievement score is Band 5. Why?',
    choices: [
      { text: 'They need more sentences. Task 1 requires comprehensive data coverage.', score: 1, verdict: 'Opposite of the issue', explanation: 'Task 1 explicitly rewards overview and selection, not exhaustive data listing. More sentences of raw data is exactly the wrong direction.' },
      { text: 'They haven\'t selected and compared. Teach them: overview first (2 biggest trends), then select significant data to support the overview. Never describe every figure.', score: 5, verdict: '✓ Core Task 1 skill', explanation: 'The overview sentence (or paragraph) is the single most important element in Task 1. Examiners are explicitly looking for it. A report without overview cannot exceed Band 5 for Task Achievement, regardless of language quality.' },
      { text: 'Their grammar in trend language is wrong — "increased" vs "an increase."', score: 3, verdict: 'Real issue, wrong priority', explanation: 'Noun/verb confusion in trend language (increase vs. increased) is a common error worth fixing, but it\'s a GRA issue, not a Task Achievement issue. Task Achievement here requires an overview.' },
      { text: 'They need more varied language to describe the data.', score: 2, verdict: 'Helpful but secondary', explanation: 'Lexical range matters for LR score but an overview is the fix for Task Achievement. Vary the language AND add the overview — but overview first.' },
    ],
    bandDescriptions: {
      9: 'Clear overview. Selects key features. All data accurately reported and compared.',
      8: 'Good overview. Well-selected data with comparisons. Minor omissions acceptable.',
      7: 'Overview present. Key features covered. Some data points missing.',
      6: 'Overview may be weak. Covers most data but comparisons sometimes missing.',
      5: 'No overview OR unclear overview. Lists data rather than analysing. All figures described.',
      4: 'Misunderstands the task. Describes wrong chart features or provides no overview.',
    },
    teachingTip: 'Before writing anything, ask students: "What are the two most important things this chart shows?" That answer IS the overview sentence. Drill this question before every Task 1.',
  },
  // SPEAKING (Teaching, not examining)
  {
    id: 'S1',
    skill: 'Speaking',
    icon: '🗣️',
    color: '#1a9e5c',
    topic: 'Teaching Part 2 — Cue Card Development',
    scenario: 'Your student stops after 40 seconds in Part 2. They say they\'ve "said everything." What do you teach them to extend their talk to the required 1–2 minutes?',
    choices: [
      { text: 'Tell them to speak more slowly to fill the time.', score: 1, verdict: 'Wrong solution', explanation: 'Speaking unnaturally slowly to fill time is evident to examiners and harms fluency score. The problem is idea generation, not pace.' },
      { text: 'Teach the WHAT→HOW IT FELT→WHY IT MATTERS→COMPARISON extension technique.', score: 5, verdict: '✓ Best approach', explanation: 'After covering the bullet points, students should describe how the experience felt emotionally, why it was significant, and compare it to something else ("unlike other times when..."). This naturally generates 60+ extra seconds on any topic.' },
      { text: 'Have them memorize a 2-minute script for common Part 2 topics.', score: 2, verdict: 'Risky and detectable', explanation: 'Examiners are trained to detect memorized responses. Unnatural fluency on one topic followed by collapse on a follow-up question raises a flag, and examiners can note suspected memorization.' },
      { text: 'Practice more Part 2 topics so they have more to say on each.', score: 3, verdict: 'Volume without technique', explanation: 'Content knowledge helps, but without an extension strategy, students will run out of things to say on ANY topic. Teach the strategy first, then apply it to many topics.' },
    ],
    bandDescriptions: {
      9: 'Speaks for full 2 minutes with ease. Rich detail and natural extension.',
      8: 'Fills 1.5–2 minutes fluently. Well-organized and detailed.',
      7: 'Speaks for required time. May slow near the end but maintains coherence.',
      6: 'Reaches 1 minute. Some underdevelopment. May need minimal prompting.',
      5: 'Stops at 40–60 seconds. Needs prompting to continue. Ideas run out.',
      4: 'Stops before 40 seconds. Only covers 1–2 bullet points. Cannot extend.',
    },
    teachingTip: 'Give students a blank cue card: "Describe a chair in this room." They must speak for 1 minute. Forces pure extension technique without topic knowledge as a crutch.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// LIVE FEEDBACK PHRASE BANK
// ─────────────────────────────────────────────────────────────────────────────

const FEEDBACK_PHRASES = {
  fluency: {
    label: 'Fluency & Coherence',
    color: '#2d6be4',
    icon: '🌊',
    bands: {
      '8-9': [
        "Your delivery was really natural — I didn't notice any unnatural hesitation throughout.",
        "The way you connected your ideas was very sophisticated. Phrases like 'on the other hand' and 'what's interesting is' showed real discourse control.",
        "You held the floor confidently in Part 2 — that's exactly what examiners want to see.",
        "Your pacing was excellent. You gave yourself time to think without it sounding like a pause.",
      ],
      '6-7': [
        "You spoke at a good pace overall, though there were a couple of moments where you hesitated and repeated yourself — that's what's holding you back from a 7.",
        "Your ideas were clear and logical, but try to use more linking phrases to signal transitions — things like 'Having said that' or 'What I mean by that is.'",
        "You maintained the conversation well. To push to a 7, work on reducing the 'um' and 'uh' — replace them with a short pause or a filler like 'Let me think about that.'",
        "Good coherence. Your Part 2 had a clear beginning and end. Just work on smoother transitions between points.",
      ],
      '4-5': [
        "I noticed you stopped several times and seemed to search for words — this affects your fluency score. Let's work on keeping the speech going even if it's not perfect.",
        "Your answers were quite short. In Part 1, we'd expect 3–5 sentences per answer. Try to add a reason and an example each time.",
        "The pauses were quite long at times. It's okay to use fillers like 'That's a good question' or 'Let me think' — it sounds more natural than silence.",
        "You answered the questions but didn't extend your ideas. Try the technique: answer → reason → example → personal connection.",
      ],
    },
  },
  lexical: {
    label: 'Lexical Resource',
    color: '#7c3aed',
    icon: '📚',
    bands: {
      '8-9': [
        "Your vocabulary was impressive — phrases like '[word they used]' showed a really sophisticated range.",
        "You paraphrased naturally rather than repeating the question's words back. That's exactly what separates Band 7 from Band 8.",
        "I noticed you used some really precise collocations — things like 'deeply ingrained' and 'shed light on.' Keep that up.",
        "Your vocabulary was flexible across topics. You didn't fall back on the same basic words under pressure.",
      ],
      '6-7': [
        "Your vocabulary is good but a little safe. Challenge yourself to use more specific, less common words — instead of 'good,' try 'beneficial,' 'constructive,' or 'advantageous.'",
        "You repeated the word '[repeated word]' four or five times. Try to have 2–3 synonyms ready for your most-used words.",
        "Good range, but watch for collocation errors — you said 'make a travel' when it should be 'go on a trip' or 'travel.' These small errors pull the score down.",
        "To reach Band 7, you need to show you can discuss abstract or unfamiliar topics with the same vocabulary range. Right now, you're strongest on familiar topics.",
      ],
      '4-5': [
        "Right now your vocabulary is limited to the most basic words — words like 'good,' 'nice,' 'bad,' 'big.' We need to build your range significantly.",
        "You struggled to paraphrase when you didn't know a word. Let's practice circumlocution — describing what you mean when you don't have the exact word.",
        "Try to learn vocabulary in chunks, not just single words. Instead of 'environment,' learn 'environmental damage,' 'environmental awareness,' and 'environmentally friendly.'",
        "When you couldn't find the word, you stopped. Instead, describe it: 'It's a thing that you use for...' or 'It's similar to...' — this keeps the conversation going and shows flexibility.",
      ],
    },
  },
  grammar: {
    label: 'Grammatical Range & Accuracy',
    color: '#d4900a',
    icon: '⚙️',
    bands: {
      '8-9': [
        "Your grammar was very accurate throughout — I noted only one or two minor slips, which is completely normal at this level.",
        "You used a wide range of structures naturally — conditionals, passive voice, relative clauses. That variety is exactly what the examiner is looking for.",
        "Your tense control was excellent, even when talking about hypothetical situations and past experiences in the same answer.",
        "The way you used 'Having said that' and past perfect naturally shows real grammatical sophistication.",
      ],
      '6-7': [
        "Your simple sentences are accurate, but you need to attempt more complex structures to reach Band 7. Try using more relative clauses and conditionals.",
        "I noticed you often said '[error]' — the correct form is '[correction].' This type of error happened several times, which affects your GRA score.",
        "You have good control of present tenses but past tenses were less consistent. Let's specifically drill past simple and past perfect this week.",
        "To move from 6 to 7, you need to show complex grammar naturally — not just attempt it and make errors. Focus on structures you can use accurately rather than attempting ones you can't control.",
      ],
      '4-5': [
        "Most of your sentences were very simple. At Band 5, examiners want to see some complex sentences — even if they have errors, attempting them shows range.",
        "Your most frequent error was '[specific error type].' We're going to drill this specifically — it's costing you points every time it happens.",
        "You used the same sentence structure almost every time: subject + verb + object. Let's practice starting sentences differently — with time expressions, with 'What I think is,' with 'It's worth noting that.'",
        "Articles — 'a,' 'an,' 'the' — were frequently missing. This is a very common issue for Vietnamese speakers. Let's make this our grammar focus for the next two weeks.",
      ],
    },
  },
  pronunciation: {
    label: 'Pronunciation',
    color: '#e85d26',
    icon: '👄',
    bands: {
      '8-9': [
        "Your pronunciation was very clear throughout — I had no difficulty understanding you at any point.",
        "Your intonation was natural and varied. You used stress to highlight key information, which made your speech engaging.",
        "Your accent didn't interfere with communication at all — that's what Band 8 pronunciation looks like.",
        "You used falling and rising intonation naturally, which gave your speech a real conversational quality.",
      ],
      '6-7': [
        "Overall you were clear, but I occasionally had to work a little to understand you — specifically with [sound/word]. Let's drill that.",
        "Your sentence stress was generally good, but sometimes you stressed every word equally, which makes speech sound robotic. Work on stressing the most important information word.",
        "The /θ/ sound in words like 'think' and 'three' is consistently coming out as /d/ or /t/. This is a very fixable issue — let's do focused minimal pair drills.",
        "Your individual sounds are mostly clear, but your connected speech needs work. English words run together — 'want to' becomes 'wanna,' 'going to' becomes 'gonna.' Drilling this will make you sound more natural.",
      ],
      '4-5': [
        "I understand you, but I have to concentrate harder than I should. We need to work on your overall clarity — specifically [key sound issue].",
        "Vietnamese speakers often drop final consonants — 'book' becomes 'boo,' 'and' becomes 'an.' This is one of our priority fixes.",
        "Your word stress is inconsistent — sometimes 'photograph' sounds like 'photoGRAPH.' Incorrect stress can completely change how a word sounds to a listener.",
        "Let's focus on the sounds that don't exist in Vietnamese: /θ/, /v/, final consonant clusters like '-sts,' '-kts.' Once these are clear, your score will improve significantly.",
      ],
    },
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// BAND CALCULATOR
// ─────────────────────────────────────────────────────────────────────────────
// (interactive tool to calculate overall speaking band from 4 criteria scores)

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: SPEAKING EXAMINER GAME
// ─────────────────────────────────────────────────────────────────────────────
function SpeakingExaminerGame() {
  const [deck, setDeck]         = useState(() => shuffle(EXAMINER_SCENARIOS))
  const [index, setIndex]       = useState(0)
  const [scores, setScores]     = useState({ fluency: null, lexical: null, grammar: null, pronunciation: null })
  const [submitted, setSubmitted] = useState(false)
  const [sessionResults, setSessionResults] = useState([])
  const [finished, setFinished] = useState(false)
  const [showBandRef, setShowBandRef] = useState(false)
  const [refCriterion, setRefCriterion] = useState('fluency')

  const scenario = deck[index]

  function handleScore(criterion, band) {
    if (submitted) return
    setScores(s => ({ ...s, [criterion]: band }))
  }

  function allScored() {
    return Object.values(scores).every(v => v !== null)
  }

  function handleSubmit() {
    if (!allScored()) return
    setSubmitted(true)
  }

  function handleNext() {
    const result = {
      scenario: scenario.id,
      part: scenario.part,
      userScores: { ...scores },
      correctScores: scenario.correct,
      accuracy: Object.keys(scores).filter(k => Math.abs(scores[k] - scenario.correct[k]) <= 0.5).length,
    }
    setSessionResults(r => [...r, result])

    if (index + 1 >= deck.length) {
      setFinished(true)
    } else {
      setIndex(i => i + 1)
      setScores({ fluency: null, lexical: null, grammar: null, pronunciation: null })
      setSubmitted(false)
    }
  }

  function handleRestart() {
    setDeck(shuffle(EXAMINER_SCENARIOS))
    setIndex(0)
    setScores({ fluency: null, lexical: null, grammar: null, pronunciation: null })
    setSubmitted(false)
    setSessionResults([])
    setFinished(false)
  }

  if (showBandRef) {
    const crit = SPEAKING_CRITERIA.find(c => c.id === refCriterion)
    return (
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>📋 Band Descriptor Reference</div>
          <button className="btn btn-outline" style={{ fontSize: 11 }} onClick={() => setShowBandRef(false)}>← Back to Game</button>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {SPEAKING_CRITERIA.map(c => (
            <button key={c.id} onClick={() => setRefCriterion(c.id)}
              style={{ padding: '7px 16px', borderRadius: 20, border: `1.5px solid ${refCriterion === c.id ? c.color : 'var(--border)'}`, background: refCriterion === c.id ? c.color : 'var(--surface)', color: refCriterion === c.id ? '#fff' : 'var(--text)', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
              {c.abbr}
            </button>
          ))}
        </div>
        <div style={{ padding: 24, background: 'var(--surface)', border: `1px solid ${crit.color}40`, borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', marginBottom: 16 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: crit.color, marginBottom: 6 }}>{crit.label}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>{crit.description}</div>
          {[9,8,7,6,5,4,3].map(band => (
            <div key={band} style={{ display: 'flex', gap: 14, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${BAND_COLOR(band)}20`, color: BAND_COLOR(band), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 900, flexShrink: 0 }}>{band}</div>
              <div style={{ fontSize: 12, lineHeight: 1.65, color: 'var(--text)', paddingTop: 4 }}>{crit.bands[band]}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (finished) {
    const totalCorrect = sessionResults.reduce((s, r) => s + r.accuracy, 0)
    const totalPossible = sessionResults.length * 4
    const pct = Math.round((totalCorrect / totalPossible) * 100)
    const grade = pct >= 85 ? { emoji: '🏆', label: 'IELTS Examiner Level', color: 'var(--green)' }
                : pct >= 70 ? { emoji: '🎓', label: 'Strong Calibration',   color: 'var(--pro)'  }
                : pct >= 50 ? { emoji: '📈', label: 'Good Progress',         color: 'var(--gold)' }
                :             { emoji: '🔁', label: 'Keep Calibrating',      color: 'var(--accent)'}
    return (
      <div style={{ maxWidth: 620, margin: '0 auto', textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>{grade.emoji}</div>
        <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, color: grade.color }}>{grade.label}</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 800, color: grade.color, marginBottom: 8 }}>{totalCorrect} / {totalPossible} criteria within ±0.5</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 36, lineHeight: 1.7, maxWidth: 420, margin: '0 auto 32px' }}>
          Real IELTS examiners are expected to be within 0.5 of the benchmark score on all criteria. {pct >= 70 ? 'You\'re calibrating at examiner level.' : 'Study the band descriptors and try again — calibration takes practice.'}
        </div>
        <button className="btn btn-accent" style={{ fontSize: 13, padding: '13px 32px' }} onClick={handleRestart}>🔀 New Session</button>
      </div>
    )
  }

  const userOverall = allScored() ? Object.values(scores).reduce((s, v) => s + v, 0) / 4 : null
  const correctOverall = scenario.overall

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Examiner Training · {scenario.part}</div>
          <div style={{ fontSize: 17, fontWeight: 800 }}>Score the Response</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>{index + 1}/{deck.length}</div>
          <button className="btn btn-outline" style={{ fontSize: 10 }} onClick={() => setShowBandRef(true)}>📋 Band Ref</button>
        </div>
      </div>

      {/* Question + Response */}
      <div style={{ padding: 22, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Examiner Question</div>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 18, color: 'var(--text)' }}>"{scenario.question}"</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Candidate Response</div>
        <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text)', padding: '14px 18px', background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)', fontStyle: 'italic' }}>{scenario.response}</div>
      </div>

      {/* Scoring grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {SPEAKING_CRITERIA.map(crit => {
          const userScore = scores[crit.id]
          const correctScore = scenario.correct[crit.id]
          const diff = submitted && userScore !== null ? Math.abs(userScore - correctScore) : null

          return (
            <div key={crit.id} style={{ padding: 18, background: 'var(--surface)', border: `1px solid ${submitted ? (diff <= 0.5 ? 'rgba(26,158,92,0.3)' : 'rgba(214,59,59,0.3)') : 'var(--border)'}`, borderRadius: 14, boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: crit.color }}>{crit.abbr}</div>
                {submitted && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>You: <strong style={{ color: BAND_COLOR(userScore) }}>{userScore}</strong></span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>Answer: <strong style={{ color: BAND_COLOR(correctScore) }}>{correctScore}</strong></span>
                    <span style={{ fontSize: 13 }}>{diff <= 0.5 ? '✓' : '✗'}</span>
                  </div>
                )}
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 10 }}>{crit.label}</div>
              {/* Band buttons 3–9 */}
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {[3,4,5,6,7,8,9].map(band => {
                  const isSelected = userScore === band
                  const isCorrect = submitted && band === correctScore
                  const isWrong = submitted && isSelected && !isCorrect
                  return (
                    <button key={band} onClick={() => handleScore(crit.id, band)}
                      style={{
                        width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${isCorrect && submitted ? BAND_COLOR(band) : isSelected ? crit.color : 'var(--border)'}`,
                        background: isCorrect && submitted ? `${BAND_COLOR(band)}20` : isSelected ? `${crit.color}15` : 'var(--surface2)',
                        color: isCorrect && submitted ? BAND_COLOR(band) : isSelected ? crit.color : 'var(--muted)',
                        cursor: submitted ? 'default' : 'pointer', fontFamily: 'var(--mono)',
                        fontSize: 12, fontWeight: isSelected || (isCorrect && submitted) ? 800 : 400,
                        transition: 'all 0.12s',
                      }}>
                      {band}
                    </button>
                  )
                })}
              </div>
              {/* Analysis after submit */}
              {submitted && (
                <div style={{ marginTop: 12, fontSize: 11, color: 'var(--muted)', lineHeight: 1.6, padding: '10px 12px', borderRadius: 8, background: 'var(--surface2)' }}>
                  {scenario.analysis[crit.id]}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Overall + Examiner Trap */}
      {submitted && (
        <div style={{ padding: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', marginBottom: 16, animation: 'fadeSlideIn 0.3s ease' }}>
          <div style={{ display: 'flex', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Your Overall</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: userOverall ? BAND_COLOR(userOverall) : 'var(--muted)' }}>{userOverall?.toFixed(1)}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>{userOverall ? BAND_LABEL(userOverall) : ''}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Benchmark</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: BAND_COLOR(correctOverall) }}>{correctOverall}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>{BAND_LABEL(correctOverall)}</div>
            </div>
          </div>
          <div style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(232,93,38,0.07)', border: '1px solid rgba(232,93,38,0.2)' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--accent)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>⚠️ Examiner Calibration Note</div>
            <div style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--text)' }}>{scenario.trap}</div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        {!submitted ? (
          <button className="btn btn-accent" style={{ flex: 1, opacity: allScored() ? 1 : 0.4, padding: '13px 0', fontSize: 13 }} onClick={handleSubmit} disabled={!allScored()}>
            Submit My Scores →
          </button>
        ) : (
          <button className="btn btn-accent" style={{ flex: 1, padding: '13px 0', fontSize: 13 }} onClick={handleNext}>
            {index + 1 >= deck.length ? '🏁 See Results' : 'Next Response →'}
          </button>
        )}
      </div>
      <style>{`@keyframes fadeSlideIn { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: SKILLS TEACHING GAME
// ─────────────────────────────────────────────────────────────────────────────
function SkillsTeachingGame() {
  const [deck, setDeck]       = useState(() => shuffle(SKILLS_SCENARIOS))
  const [index, setIndex]     = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore]     = useState({ correct: 0, total: 0 })
  const [finished, setFinished] = useState(false)
  const [activeTab, setActiveTab] = useState('game')
  const [expandedBand, setExpandedBand] = useState(null)

  const scenario = deck[index]

  useEffect(() => {
    setSelected(null)
    setRevealed(false)
  }, [index])

  function handleReveal() {
    if (!selected) return
    setRevealed(true)
    setScore(s => ({ correct: s.correct + (selected.score === 5 ? 1 : 0), total: s.total + 1 }))
  }

  function handleNext() {
    if (index + 1 >= deck.length) setFinished(true)
    else setIndex(i => i + 1)
  }

  function handleRestart() {
    setDeck(shuffle(SKILLS_SCENARIOS))
    setIndex(0)
    setSelected(null)
    setRevealed(false)
    setScore({ correct: 0, total: 0 })
    setFinished(false)
  }

  const skillColors = { Listening: '#2d6be4', Reading: '#7c3aed', Writing: '#d4900a', Speaking: '#1a9e5c' }

  if (finished) {
    const pct = Math.round((score.correct / score.total) * 100)
    const grade = pct >= 85 ? { emoji: '🎓', label: 'IELTS Expert Trainer', color: 'var(--green)' }
                : pct >= 65 ? { emoji: '📚', label: 'Strong IELTS Teacher', color: 'var(--pro)'  }
                :             { emoji: '🔁', label: 'Keep Studying',         color: 'var(--gold)' }
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>{grade.emoji}</div>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 8, color: grade.color }}>{grade.label}</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 800, color: grade.color, marginBottom: 28 }}>{score.correct} / {score.total} · {pct}%</div>
        <button className="btn btn-accent" onClick={handleRestart}>🔀 New Session</button>
      </div>
    )
  }

  const skillColor = skillColors[scenario.skill] || '#2d6be4'

  if (activeTab === 'bandref') {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button className="btn btn-outline" style={{ fontSize: 11 }} onClick={() => setActiveTab('game')}>← Back to Game</button>
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>📊 Band Score Reference — All Skills</div>
        {deck.map((sc, i) => (
          <div key={sc.id} style={{ marginBottom: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
            <div onClick={() => setExpandedBand(expandedBand === sc.id ? null : sc.id)}
              style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${skillColors[sc.skill]}` }}>
              <div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: skillColors[sc.skill], fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>{sc.skill}</span>
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{sc.topic}</div>
              </div>
              <span style={{ color: 'var(--muted)', fontSize: 11 }}>{expandedBand === sc.id ? '▲' : '▼'}</span>
            </div>
            {expandedBand === sc.id && (
              <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--border)' }}>
                <div style={{ marginTop: 14, marginBottom: 10, fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase' }}>Band Descriptions</div>
                {Object.entries(sc.bandDescriptions).map(([band, desc]) => (
                  <div key={band} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: `${BAND_COLOR(Number(band))}18`, color: BAND_COLOR(Number(band)), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 900, flexShrink: 0 }}>{band}</div>
                    <div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text)', paddingTop: 4 }}>{desc}</div>
                  </div>
                ))}
                <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 10, background: 'rgba(232,93,38,0.06)', border: '1px solid rgba(232,93,38,0.15)' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--accent)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Teaching Tip</div>
                  <div style={{ fontSize: 12, lineHeight: 1.65, color: 'var(--text)' }}>{sc.teachingTip}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>IELTS Skills Training · {index + 1}/{deck.length}</div>
          <div style={{ fontSize: 17, fontWeight: 800 }}>What's Your Move?</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--green)' }}>✓ {score.correct}/{score.total}</div>
          <button className="btn btn-outline" style={{ fontSize: 10 }} onClick={() => setActiveTab('bandref')}>📊 Band Ref</button>
        </div>
      </div>

      {/* Progress */}
      <div style={{ height: 5, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ height: '100%', width: `${((index + 1) / deck.length) * 100}%`, background: `linear-gradient(90deg, ${skillColor}, var(--elite))`, transition: 'width 0.4s' }} />
      </div>

      {/* Scenario */}
      <div style={{ padding: 24, background: 'var(--surface)', border: `1px solid ${skillColor}30`, borderLeft: `4px solid ${skillColor}`, borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: 2, padding: '4px 12px', borderRadius: 20, textTransform: 'uppercase', background: `${skillColor}15`, color: skillColor }}>{scenario.icon} {scenario.skill}</span>
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>The Challenge</div>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, lineHeight: 1.65 }}>{scenario.topic}</div>
        <div style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text)', padding: '14px 16px', background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)' }}>{scenario.scenario}</div>
      </div>

      {/* Choices */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {scenario.choices.map((choice, i) => {
          const isSelected = selected === choice
          let bg = 'var(--surface2)', border = '1px solid var(--border)', leftBar = 'transparent'
          if (revealed) {
            if (choice.score === 5) { bg = 'rgba(26,158,92,0.08)'; border = '1.5px solid rgba(26,158,92,0.35)'; leftBar = 'var(--green)' }
            else if (choice.score >= 3) { border = '1px solid var(--border)'; leftBar = 'var(--gold)' }
            else { bg = 'rgba(214,59,59,0.05)'; leftBar = isSelected ? 'var(--red)' : 'transparent' }
            if (isSelected) border = `2px solid ${choice.score === 5 ? 'var(--green)' : choice.score >= 3 ? 'var(--gold)' : 'var(--red)'}`
          } else if (isSelected) { bg = `${skillColor}10`; border = `1.5px solid ${skillColor}` }

          return (
            <div key={i} onClick={() => !revealed && setSelected(choice)} style={{ padding: '14px 18px', borderRadius: 12, cursor: revealed ? 'default' : 'pointer', background: bg, border, borderLeft: `4px solid ${leftBar}`, transition: 'all 0.15s' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, opacity: 0.4, paddingTop: 2, flexShrink: 0 }}>{String.fromCharCode(65 + i)}</span>
                <span style={{ fontSize: 13, lineHeight: 1.6, fontWeight: isSelected ? 600 : 400 }}>{choice.text}</span>
                {revealed && <span style={{ marginLeft: 'auto', flexShrink: 0, fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 800, color: choice.score === 5 ? 'var(--green)' : choice.score >= 3 ? 'var(--gold)' : 'var(--red)' }}>{choice.score}/5</span>}
              </div>
              {revealed && (
                <div style={{ marginLeft: 20, marginTop: 8, animation: 'fadeSlideIn 0.2s ease' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, color: choice.score === 5 ? 'var(--green)' : choice.score >= 3 ? 'var(--gold)' : 'var(--red)' }}>{choice.verdict}</div>
                  <div style={{ fontSize: 12, lineHeight: 1.65, color: 'var(--text)' }}>{choice.explanation}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Teaching tip after reveal */}
      {revealed && (
        <div style={{ padding: '16px 20px', borderRadius: 12, background: 'rgba(232,93,38,0.06)', border: '1px solid rgba(232,93,38,0.2)', marginBottom: 16, animation: 'fadeSlideIn 0.3s ease' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--accent)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>💡 Teaching Tip</div>
          <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text)' }}>{scenario.teachingTip}</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        {!revealed ? (
          <button className="btn btn-accent" style={{ flex: 1, opacity: selected ? 1 : 0.4, padding: '13px 0' }} onClick={handleReveal} disabled={!selected}>Reveal Answer →</button>
        ) : (
          <button className="btn btn-accent" style={{ flex: 1, padding: '13px 0' }} onClick={handleNext}>{index + 1 >= deck.length ? '🏁 Results' : 'Next →'}</button>
        )}
      </div>
      <style>{`@keyframes fadeSlideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: LIVE FEEDBACK PHRASE BANK
// ─────────────────────────────────────────────────────────────────────────────
function FeedbackPhraseBank() {
  const [criterion, setCriterion] = useState('fluency')
  const [bandRange, setBandRange] = useState('6-7')
  const [copied, setCopied]       = useState(null)

  const data = FEEDBACK_PHRASES[criterion]
  const phrases = data?.bands[bandRange] || []

  function handleCopy(text, i) {
    navigator.clipboard?.writeText(text).catch(() => {})
    setCopied(i)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Phrase Bank</div>
        <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 6 }}>Live Post-Test Feedback Sentences</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>Say these directly to your student after their speaking test. Select the criterion and the band range. Tap any phrase to copy it.</div>
      </div>

      {/* Criterion selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {Object.entries(FEEDBACK_PHRASES).map(([key, val]) => (
          <button key={key} onClick={() => setCriterion(key)}
            style={{ padding: '8px 16px', borderRadius: 20, border: `1.5px solid ${criterion === key ? val.color : 'var(--border)'}`, background: criterion === key ? val.color : 'var(--surface)', color: criterion === key ? '#fff' : 'var(--text)', cursor: 'pointer', fontSize: 11, fontWeight: 700, transition: 'all 0.15s' }}>
            {val.icon} {val.label}
          </button>
        ))}
      </div>

      {/* Band range selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['8-9', '6-7', '4-5'].map(range => (
          <button key={range} onClick={() => setBandRange(range)}
            style={{ padding: '7px 18px', borderRadius: 20, border: `1.5px solid ${bandRange === range ? BAND_COLOR(Number(range[0])) : 'var(--border)'}`, background: bandRange === range ? `${BAND_COLOR(Number(range[0]))}18` : 'var(--surface)', color: bandRange === range ? BAND_COLOR(Number(range[0])) : 'var(--muted)', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
            Band {range}
          </button>
        ))}
      </div>

      {/* Phrases */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {phrases.map((phrase, i) => (
          <div key={i} onClick={() => handleCopy(phrase, i)} style={{
            padding: '16px 20px', borderRadius: 12, background: 'var(--surface)',
            border: `1px solid ${copied === i ? data.color : 'var(--border)'}`,
            cursor: 'pointer', transition: 'all 0.15s', boxShadow: 'var(--shadow)',
            display: 'flex', gap: 14, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 16, paddingTop: 1, flexShrink: 0 }}>💬</span>
            <div style={{ flex: 1, fontSize: 13, lineHeight: 1.7, color: 'var(--text)', fontStyle: 'italic' }}>"{phrase}"</div>
            <span style={{ fontSize: 11, color: copied === i ? data.color : 'var(--muted)', fontFamily: 'var(--mono)', flexShrink: 0, paddingTop: 2 }}>{copied === i ? '✓ Copied' : 'Copy'}</span>
          </div>
        ))}
      </div>

      {/* Criterion description */}
      <div style={{ marginTop: 24, padding: '16px 20px', borderRadius: 12, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>What Examiners Are Looking For</div>
        <div style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--text)' }}>{FEEDBACK_PHRASES[criterion]?.label && SPEAKING_CRITERIA.find(c => c.id === criterion)?.description}</div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: BAND CALCULATOR
// ─────────────────────────────────────────────────────────────────────────────
function BandCalculator() {
  const [crit, setCrit] = useState({ fluency: 6, lexical: 6, grammar: 6, pronunciation: 6 })
  const [task, setTask]   = useState('speaking')

  const avg = Object.values(crit).reduce((s, v) => s + v, 0) / 4
  // IELTS rounds to nearest 0.5
  const overall = Math.round(avg * 2) / 2

  const writingCrit = { taskAchievement: 6, coherence: 6, lexical: 6, grammar: 6 }
  const [wCrit, setWCrit] = useState({ taskAchievement: 6, coherence: 6, lexical: 6, grammar: 6 })
  const wAvg = Object.values(wCrit).reduce((s, v) => s + v, 0) / 4
  const wOverall = Math.round(wAvg * 2) / 2

  const SPEAKING_CRIT_LABELS = [
    { key: 'fluency', label: 'Fluency & Coherence', color: '#2d6be4' },
    { key: 'lexical', label: 'Lexical Resource', color: '#7c3aed' },
    { key: 'grammar', label: 'Grammatical Range & Accuracy', color: '#d4900a' },
    { key: 'pronunciation', label: 'Pronunciation', color: '#e85d26' },
  ]
  const WRITING_CRIT_LABELS = [
    { key: 'taskAchievement', label: 'Task Achievement / Response', color: '#2d6be4' },
    { key: 'coherence', label: 'Coherence & Cohesion', color: '#7c3aed' },
    { key: 'lexical', label: 'Lexical Resource', color: '#d4900a' },
    { key: 'grammar', label: 'Grammatical Range & Accuracy', color: '#e85d26' },
  ]

  const criteriaList = task === 'speaking' ? SPEAKING_CRIT_LABELS : WRITING_CRIT_LABELS
  const currentCrit = task === 'speaking' ? crit : wCrit
  const setCurrentCrit = task === 'speaking' ? setCrit : setWCrit
  const currentOverall = task === 'speaking' ? overall : wOverall

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Band Calculator</div>
        <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 6 }}>Overall Band Score Tool</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>Set each criterion score to calculate the official IELTS overall band (rounded to nearest 0.5).</div>
      </div>

      {/* Task switch */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {['speaking', 'writing'].map(t => (
          <button key={t} onClick={() => setTask(t)}
            style={{ padding: '8px 20px', borderRadius: 20, border: `1.5px solid ${task === t ? 'var(--accent)' : 'var(--border)'}`, background: task === t ? 'var(--accent)' : 'var(--surface)', color: task === t ? '#fff' : 'var(--text)', cursor: 'pointer', fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>
            {t === 'speaking' ? '🗣️' : '✍️'} {t}
          </button>
        ))}
      </div>

      {/* Sliders */}
      {criteriaList.map(c => (
        <div key={c.key} style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: c.color }}>{c.label}</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 900, color: BAND_COLOR(currentCrit[c.key]) }}>{currentCrit[c.key]}</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[3,4,5,6,7,8,9].map(band => (
              <button key={band} onClick={() => setCurrentCrit(p => ({ ...p, [c.key]: band }))}
                style={{ flex: 1, height: 36, borderRadius: 8, border: `1.5px solid ${currentCrit[c.key] === band ? c.color : 'var(--border)'}`, background: currentCrit[c.key] === band ? `${c.color}20` : 'var(--surface2)', color: currentCrit[c.key] === band ? c.color : 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 12, fontWeight: currentCrit[c.key] === band ? 900 : 400, transition: 'all 0.12s' }}>
                {band}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Result */}
      <div style={{ marginTop: 8, padding: '28px 24px', borderRadius: 16, background: `${BAND_COLOR(currentOverall)}12`, border: `2px solid ${BAND_COLOR(currentOverall)}40`, textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Official Overall Band</div>
        <div style={{ fontSize: 72, fontWeight: 900, color: BAND_COLOR(currentOverall), lineHeight: 1, marginBottom: 8 }}>{currentOverall}</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: BAND_COLOR(currentOverall), marginBottom: 12 }}>{BAND_LABEL(currentOverall)}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
          Raw average: {(Object.values(currentCrit).reduce((s, v) => s + v, 0) / 4).toFixed(2)} → rounded to nearest 0.5
        </div>
      </div>

      {/* What this band means */}
      <div style={{ marginTop: 16, padding: '16px 20px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>What Band {currentOverall} Means</div>
        {[
          { band: 8.5, text: 'Near-native. Eligible for most top universities and professional roles globally.' },
          { band: 7.5, text: 'Very competent. Accepted at most universities. Strong professional language.' },
          { band: 7,   text: 'Good. Standard requirement for many UK/Australian university programs.' },
          { band: 6.5, text: 'Competent. Minimum for some undergraduate programs. Functional professional use.' },
          { band: 6,   text: 'Competent but limited. Passed, but complex language causes difficulty.' },
          { band: 5,   text: 'Modest. Only partial command. Major language gaps remain.' },
          { band: 4,   text: 'Limited. Frequent breakdowns. Communication is effortful.' },
        ].find(b => currentOverall >= b.band) && (
          <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text)' }}>
            {[
              { band: 8.5, text: 'Near-native level. Eligible for most top universities and professional roles globally.' },
              { band: 7.5, text: 'Very competent speaker. Accepted at most universities. Strong professional English.' },
              { band: 7,   text: 'Good command. Standard requirement for many UK/Australian university programs.' },
              { band: 6.5, text: 'Competent. Minimum for some undergraduate programs. Functional professional use.' },
              { band: 6,   text: 'Competent but with limitations. Passed IELTS, but complex topics cause difficulty.' },
              { band: 5,   text: 'Modest command. Only partial understanding. Major language gaps remain.' },
              { band: 4,   text: 'Limited user. Frequent breakdowns in communication. Effortful for both parties.' },
            ].find(b => currentOverall >= b.band)?.text}
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN IELTSHub — internal tab navigation
// ─────────────────────────────────────────────────────────────────────────────
export default function IELTSHub() {
  const [tab, setTab] = useState('examiner')

  const TABS = [
    { id: 'examiner', label: '🎙️ Speaking Examiner', desc: 'Score real responses. Calibrate like an official examiner.' },
    { id: 'skills',   label: '📚 Skills Teaching',   desc: 'Master how to teach Listening, Reading, Writing & Speaking.' },
    { id: 'phrases',  label: '💬 Feedback Phrases',  desc: 'Live sentences to say to students post-test by band.' },
    { id: 'calc',     label: '🔢 Band Calculator',   desc: 'Calculate official overall band from criteria scores.' },
  ]

  return (
    <div>
      {/* Hub header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6 }}>IELTS Hub</div>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>IELTS Examiner & Teaching Trainer</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', maxWidth: 620, lineHeight: 1.7 }}>
          Four tools for complete IELTS mastery. Score student responses like an official examiner, learn how to teach every skill, access live feedback phrases for post-test conversations, and calculate band scores instantly.
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 32 }}>
        {TABS.map(t => (
          <div key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
            background: tab === t.id ? 'var(--accent)' : 'var(--surface)',
            border: `1px solid ${tab === t.id ? 'var(--accent)' : 'var(--border)'}`,
            color: tab === t.id ? '#fff' : 'var(--text)',
            transition: 'all 0.15s', boxShadow: tab === t.id ? '0 4px 14px rgba(232,93,38,0.25)' : 'var(--shadow)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 3 }}>{t.label}</div>
            <div style={{ fontSize: 10, opacity: 0.7, lineHeight: 1.4 }}>{t.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ height: 1, background: 'var(--border)', marginBottom: 32 }} />

      {tab === 'examiner' && <SpeakingExaminerGame />}
      {tab === 'skills'   && <SkillsTeachingGame />}
      {tab === 'phrases'  && <FeedbackPhraseBank />}
      {tab === 'calc'     && <BandCalculator />}
    </div>
  )
}

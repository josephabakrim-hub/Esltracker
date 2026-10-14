// ── Bomb Pass question bank — Kids Box New Generation, Level 4 ───────────────
// Row format:  [question, CORRECT answer, wrong1, wrong2, wrong3, optional tip]
// The correct answer is ALWAYS written first — the game shuffles the options.
// Keyed by unit number (matches `units[].num` in lib/books.js).
//
// Language covered (from the Level 4 Language Summary): relative clauses with
// who / where, adverbs of frequency, comparatives & superlatives, past simple
// (regular + irregular), because / so, ordinals, containers & foods, school,
// sports, health, clubs, geography, technology, animals, parties.
//
// To add a Level 4 question: add a row to the right unit. That's it.

export default {
  0: [ // Hello There!
    ['Which question is correct? "___ do you live?"', 'Where', 'Who', 'What time', 'Why'],
    ['My brother is 14 and I am 10. He is ___ than me.', 'older', 'oldest', 'more old', 'old', 'Short adjective + -er → older.'],
    ['She ___ breakfast at seven o\'clock every day.', 'has', 'have', 'having', 'haves', 'He / she / it → has.'],
    ['Which word is an ordinal number?', 'third', 'three', 'thirty', 'thirteen'],
    ['January is the ___ month of the year.', 'first', 'one', 'oneth', 'firstly'],
    ['"We ___ play football on Sundays." (0% of the time)', 'never', 'always', 'usually', 'often', 'never = 0%'],
    ['Which word means 100% of the time?', 'always', 'never', 'sometimes', 'usually'],
    ['TRUE or FALSE: "Tuesday comes after Monday."', 'True', 'False'],
  ],
  1: [ // Back to School
    ['A teacher is a person ___ works at a school.', 'who', 'where', 'when', 'whose', 'who = for people'],
    ['The library is a place ___ you borrow books.', 'where', 'who', 'when', 'whose', 'where = for places'],
    ['Which subject do you study to learn about numbers?', 'Maths', 'Art', 'Music', 'P.E.'],
    ['What do you use to cut paper?', 'scissors', 'glue', 'a ruler', 'a pencil case'],
    ['I like Science ___ we do fun experiments.', 'because', 'so', 'but', 'or', 'because = the reason'],
    ['Science is my favourite subject, ___ I want to be a scientist.', 'so', 'because', 'but', 'or', 'so = the result'],
    ['A cafeteria is a place ___ students eat lunch.', 'where', 'who', 'what', 'whose'],
    ['We use a ___ to draw straight lines.', 'ruler', 'glue', 'scissors', 'rubber'],
  ],
  2: [ // Good Sports
    ['Usain Bolt runs ___ than me.', 'faster', 'fastest', 'more fast', 'fast'],
    ['Swimming is the ___ sport of all for me.', 'best', 'good', 'better', 'most good', 'good → better → best'],
    ['Basketball is ___ than golf.', 'more exciting', 'excitinger', 'most exciting', 'exciting', 'Long adjective → more + adjective.'],
    ['Which sport do you play with a racket?', 'Tennis', 'Football', 'Swimming', 'Basketball'],
    ['You wear a helmet when you ___.', 'ride a bike', 'swim', 'read', 'sleep'],
    ['Football is the ___ popular sport in the world.', 'most', 'more', 'much', 'mostly'],
    ['"I ___ play tennis on Saturdays." (almost every Saturday)', 'usually', 'never', 'hardly', 'rarely'],
    ['A person ___ plays sport very well is an athlete.', 'who', 'where', 'when', 'whose'],
  ],
  3: [ // Health Matters
    ['I have a headache. I should ___.', 'rest', 'go swimming', 'play loudly', 'eat sweets'],
    ['You should ___ your teeth twice a day.', 'brush', 'wash', 'comb', 'cut'],
    ['My tooth hurts. I need to see a ___.', 'dentist', 'teacher', 'farmer', 'pilot'],
    ['Which food is healthy?', 'An apple', 'Sweets', 'Chips', 'Cake'],
    ['I feel sick, ___ I\'m staying at home.', 'so', 'because', 'but', 'or'],
    ['He stayed in bed ___ he had a temperature.', 'because', 'so', 'but', 'and'],
    ['A doctor is a person ___ helps sick people.', 'who', 'where', 'when', 'whose'],
    ['A hospital is a place ___ sick people get help.', 'where', 'who', 'what', 'whose'],
  ],
  4: [ // After School Club
    ['Yesterday I ___ to the drama club.', 'went', 'go', 'goes', 'gone', 'go → went (irregular)'],
    ['Last week we ___ a song together.', 'sang', 'sung', 'sing', 'singed', 'sing → sang (irregular)'],
    ['She ___ a picture yesterday.', 'painted', 'painting', 'paints', 'paint', 'Regular verb + -ed.'],
    ['What is the past simple of "make"?', 'made', 'maked', 'making', 'makes'],
    ['Which club do you go to if you like acting?', 'Drama club', 'Chess club', 'Cooking club', 'Football club'],
    ['The art club is a place ___ we paint pictures.', 'where', 'who', 'when', 'what'],
    ['Did you ___ the guitar yesterday?', 'play', 'played', 'plays', 'playing', 'After did → base verb.'],
    ['What is the past simple of "play"?', 'played', 'plaied', 'plays', 'playing'],
  ],
  5: [ // Exploring Our World
    ['The Amazon is a very long ___.', 'river', 'mountain', 'desert', 'island'],
    ['Mount Everest is the ___ mountain in the world.', 'highest', 'higher', 'high', 'most high'],
    ['A hot, dry place with sand is a ___.', 'desert', 'forest', 'lake', 'valley'],
    ['Which one is a continent?', 'Africa', 'Paris', 'The Nile', 'The Pacific'],
    ['A place with lots of trees is a ___.', 'forest', 'beach', 'desert', 'city'],
    ['The Nile is ___ than the Thames.', 'longer', 'long', 'longest', 'more long'],
    ['A volcano is a place ___ hot lava comes out.', 'where', 'who', 'when', 'whose'],
    ['Water from the sea is ___.', 'salty', 'sweet', 'sour', 'spicy'],
  ],
  6: [ // Technology
    ['You use a ___ to type on a computer.', 'keyboard', 'speaker', 'charger', 'screen'],
    ['You click with the computer ___.', 'mouse', 'cat', 'speaker', 'printer'],
    ['A programmer is a person ___ writes computer programs.', 'who', 'where', 'when', 'whose'],
    ['What do you use to take photos?', 'a camera', 'a printer', 'a keyboard', 'a speaker'],
    ['My phone has no battery. I need a ___.', 'charger', 'mouse', 'printer', 'screen'],
    ['A plane is ___ than a car.', 'faster', 'fast', 'fastest', 'more fast'],
    ['I use the ___ to search for information.', 'internet', 'oven', 'fridge', 'pencil'],
    ['Please ___ the computer when you finish.', 'turn off', 'turn into', 'turn out', 'take off'],
    ['I can\'t hear the video. Turn the volume ___.', 'up', 'in', 'on', 'at'],
  ],
  7: [ // At the Zoo
    ['Which animal is the tallest?', 'Giraffe', 'Elephant', 'Lion', 'Monkey'],
    ['Which animal has a very long trunk?', 'Elephant', 'Zebra', 'Parrot', 'Crocodile'],
    ['A zoo is a place ___ you can see animals.', 'where', 'who', 'when', 'whose'],
    ['A zookeeper is a person ___ looks after animals.', 'who', 'where', 'when', 'whose'],
    ['The cheetah is the ___ land animal.', 'fastest', 'faster', 'fast', 'most fast'],
    ['Yesterday we ___ lions at the zoo.', 'saw', 'seen', 'see', 'seed', 'see → saw (irregular)'],
    ['The lion is ___ than the monkey.', 'bigger', 'big', 'biggest', 'more big', 'big → bigger (double the g)'],
    ['Which animal lives in water and on land?', 'Frog', 'Lion', 'Parrot', 'Giraffe'],
  ],
  8: [ // Let's Party!
    ['a ___ of milk', 'carton', 'bunch', 'slice', 'pair'],
    ['a ___ of pizza', 'slice', 'bunch', 'carton', 'jar'],
    ['a ___ of bananas', 'bunch', 'slice', 'carton', 'tin'],
    ['a ___ of jam', 'jar', 'bunch', 'slice', 'pair'],
    ['a ___ of beans', 'tin', 'slice', 'bunch', 'pair'],
    ['We blow out the candles on a birthday ___.', 'cake', 'soup', 'salad', 'bread'],
    ['The party is on the ___ of June. (6th)', 'sixth', 'six', 'sixed', 'sixteen'],
    ['It\'s my ___ birthday. I\'m ten years old.', 'tenth', 'ten', 'tens', 'tent'],
    ['Last night we ___ a great party.', 'had', 'have', 'haved', 'has', 'have → had (irregular)'],
    ['We danced all night, ___ we were tired.', 'so', 'because', 'but', 'or'],
  ],
}

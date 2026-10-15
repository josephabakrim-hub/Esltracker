// ── Bomb Pass question bank — Kids Box New Generation, Level 2 ───────────────
// Row format:  [question, CORRECT answer, wrong1, wrong2, wrong3, optional tip]
// The correct answer is ALWAYS written first — the game shuffles the options.
// TRUE/FALSE rows have just two answers: [question, 'True', 'False'] or
// [question, 'False', 'True'] (the first one is the correct one), plus an
// optional tip as a third value.
// Keyed by unit number (matches `units[].num` in lib/books.js).
//
// Language used (checked against Cambridge's official Kid's Box NG 2 Home
// Booklet, which lists each unit's vocabulary and grammar):
//   1 Hello Again!     colours · bag / book / pens / pencils / table / chair · brother / sister · "How old is he?" · under / on / next to · numbers 1-10
//   2 Back to School   whiteboard / bookcase / cupboard / desk / ruler / eraser / teacher · numbers 11-20 · there is / isn't / are / aren't · plurals
//   3 Play Time!       camera / board game / kite / lorry / robot / watch · this / these / that / those · Whose…? · possessive 's
//   4 At Home          clock / lamp / mat / mirror / phone / sofa / bed / shoes · mine / yours / his / hers
//   5 Meet My Family   baby / cousin / dad / mum / grandpa / grandma · present continuous (reading, sleeping, swimming…)
//   6 Dinner Time      bread / chicken / chips / egg / milk / rice / juice / fruit / apple / pear / water · meals · "Can I have…, please?" · "Here you are."
//   7 At the Farm      cow / duck / frog / lizard / sheep / spider / goat / fish / snake / monkey / giraffe · "I love… / So do I / I don't."
//   8 My Town          café / flat / hospital / park / shop / street · next to / in / behind / in front of / between
//
// NOTE: the Cambridge booklet lists only Units 1-8 for this level.

export default {
  1: [ // Hello Again!
    ['Which one is a colour?', 'purple', 'table', 'chair', 'bag'],
    ['"How old is he?" — "He\'s ___."', 'seven', 'Tom', 'red', 'on'],
    ['This is my ___. (a boy in my family, same parents as me)', 'brother', 'sister', 'table', 'pencil'],
    ['This is my ___. (a girl in my family, same parents as me)', 'sister', 'brother', 'chair', 'bag'],
    ['"Who\'s he?" — "He\'s my ___."', 'brother', 'sister', 'pencil', 'chair'],
    ['The book is ___ the table. (on top of it)', 'on', 'under', 'next to', 'between'],
    ['The bag is ___ the chair. (below it)', 'under', 'on', 'next to', 'at'],
    ['You write with a ___.', 'pencil', 'chair', 'bag', 'table'],
    ['You sit on a ___.', 'chair', 'pencil', 'book', 'bag'],
    ['4 + 3 = ___', 'seven', 'six', 'eight', 'ten'],
    ['Which number comes after six?', 'seven', 'five', 'nine', 'three'],
    ['Which spelling is correct?', 'purple', 'purpel', 'perple', 'pruple'],
  ],
  2: [ // Back to School
    ['You write on the ___ in class.', 'whiteboard', 'sofa', 'lamp', 'mirror'],
    ['Books are on the ___.', 'bookcase', 'whiteboard', 'ruler', 'pencil'],
    ['You use a ___ to draw a straight line.', 'ruler', 'eraser', 'bag', 'desk'],
    ['You use an ___ to rub out mistakes.', 'eraser', 'ruler', 'chair', 'bag'],
    ['The ___ teaches the class.', 'teacher', 'desk', 'cupboard', 'ruler'],
    ['"___ a ruler on the desk." (one ruler)', 'There is', 'There are', 'Is there', 'Are there'],
    ['"There ___ two desks."', 'are', 'is', 'am', 'be', 'Two or more → there are'],
    ['"Is there a cupboard?" — "No, there ___."', 'isn\'t', 'aren\'t', 'doesn\'t', 'don\'t'],
    ['One desk, two ___.', 'desks', 'deskes', 'desk', 'deskies', 'Add -s for more than one.'],
    ['13 + 5 = ___', 'eighteen', 'fifteen', 'nineteen', 'twenty'],
    ['Which number is 15?', 'fifteen', 'fifty', 'five', 'fourteen'],
    ['Which number comes after nineteen?', 'twenty', 'twelve', 'eighteen', 'seventeen'],
  ],
  3: [ // Play Time!
    ['You take photos with a ___.', 'camera', 'lorry', 'robot', 'board game'],
    ['You fly a ___ in the wind.', 'kite', 'watch', 'robot', 'lorry'],
    ['A ___ is a big vehicle that carries things.', 'lorry', 'robot', 'watch', 'kite'],
    ['You wear a ___ on your wrist to see the time.', 'watch', 'camera', 'lorry', 'board game'],
    ['You play a ___ with friends at the table.', 'board game', 'lorry', 'robot', 'watch'],
    ['A ___ is a toy that moves like a person.', 'robot', 'kite', 'watch', 'lorry'],
    ['"___ is my kite." (It is near me.)', 'This', 'These', 'Those', 'Whose'],
    ['"___ are my robots." (They are far from me.)', 'Those', 'That', 'This', 'These', 'this/these = near · that/those = far'],
    ['"Whose kite is it?" — "It\'s ___ kite."', 'Simon\'s', 'Simon', 'Simons', 'Simon is', '\'s shows who something belongs to.'],
    ['"Whose are these shoes?" — "___ Pete\'s."', 'They\'re', 'It\'s', 'He\'s', 'We\'re'],
    ['"Whose is this watch?" — "___ Mum\'s."', 'It\'s', 'They\'re', 'These', 'Those'],
  ],
  4: [ // At Home
    ['You sleep in a ___.', 'bed', 'lamp', 'clock', 'mat'],
    ['You look in a ___ to see your face.', 'mirror', 'bed', 'sofa', 'shoes'],
    ['You sit on a ___ in the living room.', 'sofa', 'clock', 'phone', 'lamp'],
    ['A ___ on the wall shows the time.', 'clock', 'mirror', 'mat', 'bed'],
    ['A ___ gives you light.', 'lamp', 'mat', 'sofa', 'shoes'],
    ['You talk to a friend on the ___.', 'phone', 'mat', 'bed', 'mirror'],
    ['You wear ___ on your feet.', 'shoes', 'a lamp', 'a clock', 'a sofa'],
    ['"Whose phone is this?" — "It\'s ___." (It belongs to me.)', 'mine', 'yours', 'his', 'hers'],
    ['It is your book. It is ___. (I\'m talking to you.)', 'yours', 'mine', 'his', 'hers'],
    ['It is Tom\'s bag. It is ___.', 'his', 'hers', 'mine', 'yours'],
    ['It is Mary\'s bag. It is ___.', 'hers', 'his', 'mine', 'yours'],
    ['The sofa is ___ the lamp. (side by side)', 'next to', 'under', 'on', 'in'],
  ],
  5: [ // Meet My Family
    ['Your mum\'s mum is your ___.', 'grandma', 'cousin', 'baby', 'dad'],
    ['Your dad\'s dad is your ___.', 'grandpa', 'cousin', 'baby', 'mum'],
    ['A very young child is a ___.', 'baby', 'dad', 'grandpa', 'mum'],
    ['"What\'s he doing?" — "He\'s ___ a book."', 'reading', 'read', 'reads', 'red', 'Present continuous: is + verb-ing'],
    ['"What\'s she doing?" — "She\'s ___." (eyes closed, in bed)', 'sleeping', 'swimming', 'jumping', 'running'],
    ['"He\'s ___ in the pool."', 'swimming', 'sleeping', 'reading', 'writing'],
    ['"She\'s ___ a kite."', 'flying', 'fly', 'flies', 'flew'],
    ['"They\'re ___ a ball."', 'kicking', 'kick', 'kicks', 'kicked'],
    ['You use a pencil for ___.', 'writing', 'swimming', 'sleeping', 'kicking'],
    ['Which spelling is correct?', 'running', 'runing', 'runnig', 'ruuning', 'run → running (double the n)'],
    ['Which spelling is correct?', 'swimming', 'swiming', 'swimmin', 'swimmimg', 'swim → swimming (double the m)'],
  ],
  6: [ // Dinner Time
    ['A hen lays an ___.', 'egg', 'apple', 'pear', 'chip'],
    ['You drink ___ with your breakfast.', 'milk', 'rice', 'bread', 'chicken'],
    ['An ___ is a fruit. It can be red or green.', 'apple', 'bread', 'rice', 'chip'],
    ['Which one is a fruit?', 'a pear', 'bread', 'rice', 'an egg'],
    ['Which one is a drink?', 'juice', 'chicken', 'rice', 'bread'],
    ['"Can I have some water, ___?"', 'please', 'thanks', 'sorry', 'hello'],
    ['Someone gives you water. They say, "___."', 'Here you are.', 'Can I have it?', 'Which one?', 'I\'m sorry.'],
    ['"Which do you want — an apple or a pear?" Good answer:', 'A pear, please.', 'Yes, I do.', 'At lunch.', 'Under the table.'],
    ['You have ___ in the morning.', 'breakfast', 'dinner', 'lunch', 'chips'],
    ['You have ___ in the evening.', 'dinner', 'breakfast', 'lunch', 'juice'],
    ['"We\'re ___ lunch."', 'having', 'have', 'has', 'had'],
  ],
  7: [ // At the Farm
    ['Which animal gives us milk?', 'cow', 'duck', 'frog', 'spider'],
    ['Which bird swims on a pond?', 'duck', 'cow', 'lizard', 'monkey'],
    ['A spider has ___ legs.', 'eight', 'six', 'ten', 'four'],
    ['Which animal is long and has no legs?', 'snake', 'monkey', 'giraffe', 'sheep'],
    ['Which animal has a very long neck?', 'giraffe', 'sheep', 'duck', 'goat'],
    ['Which animal lives in water?', 'fish', 'cow', 'goat', 'monkey'],
    ['Which animal climbs trees and eats bananas?', 'monkey', 'fish', 'sheep', 'cow'],
    ['"It\'s ___ egg."', 'an', 'a', 'two', 'many', 'Use "an" before a, e, i, o, u sounds.'],
    ['"I love frogs." — "So ___ I."', 'do', 'am', 'have', 'can', '"So do I" = me too!'],
    ['"I love monkeys." — "I don\'t." This means:', 'I don\'t love monkeys.', 'I love monkeys too.', 'I am a monkey.', 'I like monkeys.'],
    ['The spider is ___ the chair. (below it)', 'under', 'on', 'between', 'in front of'],
  ],
  8: [ // My Town
    ['You can have a cake and a drink in a ___.', 'café', 'hospital', 'park', 'street'],
    ['Doctors work in a ___.', 'hospital', 'café', 'park', 'flat'],
    ['You play on the swings in the ___.', 'park', 'hospital', 'shop', 'flat'],
    ['You buy things in a ___.', 'shop', 'hospital', 'park', 'street'],
    ['You live in a ___.', 'flat', 'shop', 'hospital', 'café'],
    ['Cars drive on the ___.', 'street', 'flat', 'sofa', 'park'],
    ['The park is ___ the café. (side by side)', 'next to', 'under', 'between', 'behind'],
    ['The shop is ___ the hospital. (at the back of it)', 'behind', 'in front of', 'next to', 'between'],
    ['The bus is ___ the café. (at the front of it)', 'in front of', 'behind', 'under', 'next to'],
    ['The café is ___ the shop and the park. (one on each side)', 'between', 'under', 'on', 'behind'],
    ['Which spelling is correct?', 'hospital', 'hospitel', 'hospitle', 'hosptial'],
  ],
}

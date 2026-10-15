// ── Bomb Pass question bank — Kids Box New Generation, Level 3 ───────────────
// Row format:  [question, CORRECT answer, wrong1, wrong2, wrong3, optional tip]
// The correct answer is ALWAYS written first — the game shuffles the options.
// TRUE/FALSE rows have just two answers: [question, 'True', 'False'] or
// [question, 'False', 'True'] (the first one is the correct one), plus an
// optional tip as a third value.
// Keyed by unit number (matches `units[].num` in lib/books.js).
//
// Language used (checked against Cambridge's official Kid's Box NG 3 Home
// Booklet, which lists each unit's vocabulary and grammar):
//   0 Hello!            toys · present continuous · next to / under / between / in front of
//   1 Family Matters    family words · beard / moustache · curly / straight / fair hair · possessive 's · like / love / enjoy · want to
//   2 Home Sweet Home   balcony / basement / lift / stairs · upstairs / downstairs · flat / city / town / village · has got / hasn't got
//   3 A Day in the Life daily routine · always / sometimes / never / every day · How often…?
//   4 In the City       city places · must / can · next to / opposite / between / in front of
//   5 Fit and Well      aches & illnesses · must / mustn't · can / can't
//   6 In the Countryside field / forest / grass / lake / leaf / plant / river · picnic · fishing · feelings · Shall I…?
//   7 World of Animals  animals · weak / strong / quick / slow / fat / thin / big / good / bad / naughty · comparatives
//   8 Weather Report    weather words · scarf / coat / sweater · was / wasn't / were / weren't

export default {
  0: [ // Hello!
    ['Which one is a toy?', 'a kite', 'a basement', 'a river', 'a cinema'],
    ['You fly a ___ in the wind.', 'kite', 'doll', 'train', 'camera'],
    ['A bike has two ___.', 'wheels', 'legs', 'wings', 'tails'],
    ['What do you use to take a photo?', 'a camera', 'a lorry', 'a kite', 'a doll'],
    ['"What are you doing?" — "I\'m ___ a picture."', 'taking', 'take', 'takes', 'took', 'Present continuous: be + verb-ing'],
    ['"Is Pete flying a kite?" — "Yes, he ___."', 'is', 'does', 'has', 'are'],
    ['"What\'s Daisy doing?" — "She\'s ___ on the chair."', 'sitting', 'sit', 'sits', 'sat'],
    ['The cat is ___ the table. (It is below the table.)', 'under', 'between', 'next to', 'in front of'],
    ['The ball is ___ the two boys. (One boy on each side.)', 'between', 'under', 'on', 'at'],
    ['Which spelling is correct?', 'helicopter', 'helicoptor', 'helicopte', 'helicapter'],
  ],
  1: [ // Family Matters
    ['Your mother\'s sister is your ___.', 'aunt', 'uncle', 'cousin', 'grandmother'],
    ['Your father\'s brother is your ___.', 'uncle', 'aunt', 'son', 'grandfather'],
    ['Your parents\' parents are your ___.', 'grandparents', 'cousins', 'brothers', 'uncles'],
    ['Your son\'s daughter is your ___.', 'granddaughter', 'daughter', 'sister', 'aunt'],
    ['Your daughter\'s son is your ___.', 'grandson', 'granddaughter', 'uncle', 'father'],
    ['"That\'s Tom___ bike." (It belongs to Tom.)', '\'s', 'is', 's', 'at', '\'s shows that something belongs to someone.'],
    ['A ___ is hair on a man\'s face.', 'beard', 'sweater', 'stairs', 'kite'],
    ['Hair that grows in curls is ___ hair.', 'curly', 'straight', 'flat', 'round'],
    ['"Do you like ___ photos?"', 'taking', 'take', 'took', 'takes', 'like / love / enjoy + verb-ing'],
    ['"Does she enjoy ___ football?"', 'playing', 'to play', 'play', 'plays'],
    ['"Does he want ___ football?"', 'to play', 'playing', 'play', 'plays', 'want + to + verb'],
    ['TRUE or FALSE: Your grandparents are your mother and father.', 'False', 'True', 'Grandparents are your parents\' parents.'],
  ],
  2: [ // Home Sweet Home
    ['The floor of a house under the ground is the ___.', 'basement', 'balcony', 'stairs', 'lift'],
    ['A machine that takes you up and down a building is a ___.', 'lift', 'balcony', 'garden', 'stairs'],
    ['You can stand outside on a flat\'s ___ and enjoy the view.', 'balcony', 'basement', 'lift', 'kitchen'],
    ['You walk up the ___ to reach the next floor.', 'stairs', 'balcony', 'basement', 'garage'],
    ['The opposite of "downstairs" is ___.', 'upstairs', 'basement', 'outside', 'balcony'],
    ['"Has your house got a basement?" — "No, it ___."', 'hasn\'t', 'isn\'t', 'doesn\'t', 'haven\'t', 'Has got → hasn\'t got'],
    ['"My house ___ got three bedrooms."', 'has', 'have', 'is', 'does'],
    ['Which place is the biggest?', 'a city', 'a village', 'a town', 'a house'],
    ['Which place is the smallest?', 'a village', 'a city', 'a town', 'a country'],
    ['30 + 40 = ___', 'seventy', 'sixty', 'eighty', 'fifty'],
  ],
  3: [ // A Day in the Life
    ['Which one do you do first in the morning?', 'wake up', 'go to bed', 'have dinner', 'catch the bus'],
    ['I ___ the bus to school at seven o\'clock.', 'catch', 'eat', 'drink', 'wear'],
    ['I have a ___ and then I get dressed.', 'shower', 'bus', 'lift', 'picnic'],
    ['Which one do you do last in the day?', 'go to bed', 'get up', 'have breakfast', 'wake up'],
    ['You ___ before you go to bed.', 'get undressed', 'get dressed', 'catch the bus', 'wake up'],
    ['After school, he ___ his homework.', 'does', 'do', 'doing', 'dos'],
    ['"I ___ eat sweets." (0% of the time)', 'never', 'always', 'sometimes', 'often', 'never = 0%'],
    ['Which word means "every day"?', 'always', 'never', 'sometimes', 'once'],
    ['Which is a good answer to "How often do you play in the park?"', 'Sometimes.', 'At six o\'clock.', 'In the park.', 'Yes, I do.'],
    ['TRUE or FALSE: "Sometimes" means every single day.', 'False', 'True', '"Always" means every day.'],
  ],
  4: [ // In the City
    ['Where do you go to watch a film?', 'cinema', 'library', 'hospital', 'supermarket'],
    ['Where do you go if you are very sick?', 'hospital', 'cinema', 'library', 'swimming pool'],
    ['Where do you go to borrow books?', 'library', 'cinema', 'hospital', 'supermarket'],
    ['Where do you go to buy food for the week?', 'supermarket', 'hospital', 'cinema', 'library'],
    ['Where can you swim indoors?', 'swimming pool', 'library', 'supermarket', 'cinema'],
    ['Where do you keep your money safe?', 'bank', 'library', 'cinema', 'market'],
    ['Where do you catch a bus?', 'bus station', 'library', 'bank', 'hospital'],
    ['Where can you play sport indoors?', 'sports centre', 'bank', 'library', 'market'],
    ['"___ I play football here?" — "Yes, you can."', 'Can', 'Must', 'Has', 'Do'],
    ['"Must I go to school?" — "Yes, you ___."', 'must', 'can', 'are', 'do'],
    ['The cinema is ___ the library. (They are side by side.)', 'next to', 'opposite', 'between', 'under'],
  ],
  5: [ // Fit and Well
    ['My tooth hurts. I\'ve got a ___.', 'toothache', 'headache', 'temperature', 'rainbow'],
    ['My head hurts. I\'ve got a ___.', 'headache', 'toothache', 'temperature', 'picnic'],
    ['I\'m very hot and ill. I\'ve got a ___.', 'temperature', 'headache', 'toothache', 'balcony'],
    ['My ear hurts. I\'ve got an ___.', 'earache', 'headache', 'toothache', 'backache'],
    ['My tummy hurts. I\'ve got a ___.', 'stomach-ache', 'toothache', 'cough', 'temperature'],
    ['When you have a ___, you make a noise in your throat.', 'cough', 'balcony', 'lift', 'picnic'],
    ['"I\'m ill. I ___ stay in bed."', 'must', 'mustn\'t', 'can\'t', 'isn\'t', 'must = it\'s necessary'],
    ['"We ___ eat in the library."', 'mustn\'t', 'must', 'does', 'are', 'mustn\'t = it\'s not allowed'],
    ['"You ___ listen to music. It\'s OK!"', 'can', 'mustn\'t', 'must', 'isn\'t'],
    ['"She ___ go to school. She\'s ill."', 'can\'t', 'can', 'does', 'is'],
    ['Which one is good for you?', 'eat fruit and vegetables', 'eat sweets all day', 'stay up all night', 'drink no water'],
    ['What do you do when you have a cold?', 'rest', 'run a race', 'climb a tree', 'swim in a river'],
  ],
  6: [ // In the Countryside
    ['A place with lots of trees close together is a ___.', 'forest', 'lake', 'field', 'river'],
    ['A big area of water with land all around it is a ___.', 'lake', 'field', 'forest', 'grass'],
    ['Water that flows to the sea is a ___.', 'river', 'field', 'forest', 'lake'],
    ['Cows and sheep eat grass in a ___.', 'field', 'lake', 'river', 'lift'],
    ['A meal you eat outdoors on the grass is a ___.', 'picnic', 'lift', 'balcony', 'shower'],
    ['A ___ grows in the ground and needs water and sun.', 'plant', 'lift', 'kite', 'bike'],
    ['You catch fish when you go ___.', 'fishing', 'shopping', 'swimming', 'sleeping'],
    ['Two or more leaf = two ___.', 'leaves', 'leafs', 'leafes', 'leaf', 'leaf → leaves'],
    ['"I\'m thirsty. I want some ___."', 'water', 'a sandwich', 'a bed', 'a book'],
    ['"I\'m tired." — "Shall I ___?" (a good offer)', 'close the window', 'run a race', 'swim a mile', 'eat a leaf'],
    ['"___ I open the window?" (an offer)', 'Shall', 'Must', 'Do', 'Are', 'Shall I…? offers to help.'],
    ['"Shall I make breakfast?" — Good answer:', 'Yes, please.', 'Yes, I shall.', 'No, I make.', 'Breakfast is cold.'],
    ['TRUE or FALSE: A forest has lots of trees.', 'True', 'False'],
  ],
  7: [ // World of Animals
    ['Which animal can fly at night?', 'bat', 'whale', 'lion', 'panda'],
    ['Which animal loves eating bamboo?', 'panda', 'kangaroo', 'parrot', 'shark'],
    ['Which bird can copy what people say?', 'parrot', 'panda', 'whale', 'kangaroo'],
    ['Which animal jumps very high and lives in Australia?', 'kangaroo', 'shark', 'jellyfish', 'bat'],
    ['Which one is a sea animal?', 'dolphin', 'lion', 'bear', 'parrot'],
    ['Parrots are ___ than bears.', 'weaker', 'weak', 'weakest', 'more weak', 'weak → weaker'],
    ['A bear is ___ than a parrot.', 'stronger', 'strong', 'strongest', 'more strong'],
    ['A dolphin is ___ than a jellyfish.', 'quicker', 'quick', 'quickest', 'more quick'],
    ['My cat is ___ than my dog.', 'fatter', 'fat', 'fater', 'more fat', 'fat → fatter (double the t)'],
    ['"Sharks are ___ at swimming than elephants."', 'better', 'good', 'best', 'gooder', 'good → better'],
    ['good → better. bad → ___.', 'worse', 'badder', 'worst', 'more bad'],
    ['naughty → ___', 'naughtier', 'naughtyer', 'more naughty', 'naughty', 'naughty → naughtier (y becomes ier)'],
    ['The opposite of "slow" is ___.', 'quick', 'weak', 'thin', 'fat'],
  ],
  8: [ // Weather Report
    ['I can see the sun. It\'s ___.', 'sunny', 'cloudy', 'snowing', 'wet'],
    ['There are lots of clouds. It\'s ___.', 'cloudy', 'sunny', 'dry', 'windy'],
    ['The wind is blowing hard. It\'s ___.', 'windy', 'snowing', 'sunny', 'dry'],
    ['White snow is falling. It\'s ___.', 'snowing', 'raining', 'sunny', 'dry'],
    ['The opposite of "wet" is ___.', 'dry', 'windy', 'cloudy', 'sunny'],
    ['A colourful arc in the sky after rain and sun is a ___.', 'rainbow', 'balcony', 'picnic', 'lake'],
    ['You wear a ___ around your neck when it\'s cold.', 'scarf', 'swim shorts', 'sandals', 'sunglasses'],
    ['You wear a ___ over your sweater when it\'s very cold.', 'coat', 'swim shorts', 'sandals', 'sunglasses'],
    ['"Yesterday I ___ at the park."', 'was', 'were', 'am', 'is', 'Past of "I am" → I was'],
    ['"We ___ at the beach yesterday."', 'were', 'was', 'are', 'be', 'Past of "we are" → we were'],
    ['"Where ___ you on Saturday?"', 'were', 'was', 'are', 'do'],
    ['"Where ___ he on Sunday?"', 'was', 'were', 'is', 'are'],
    ['"It ___ sunny yesterday. It was cloudy."', 'wasn\'t', 'weren\'t', 'isn\'t', 'don\'t'],
    ['TRUE or FALSE: You can see a rainbow when it is raining and sunny at the same time.', 'True', 'False'],
  ],
}

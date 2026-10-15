// ── Bomb Pass question bank — Kids Box New Generation, Level 1 ───────────────
// Row format:  [question, CORRECT answer, wrong1, wrong2, wrong3, optional tip]
// The correct answer is ALWAYS written first — the game shuffles the options.
// TRUE/FALSE rows have just two answers: [question, 'True', 'False'] or
// [question, 'False', 'True'] (the first one is the correct one), plus an
// optional tip as a third value.
// Keyed by unit number (matches `units[].num` in lib/books.js).
//
// Language used (checked against Cambridge's official Kid's Box NG 1 Home
// Booklet and its answer key, which list each unit's vocabulary and grammar):
//    1 Hello!           colours · numbers 1-10 · "What colour is it?" · "How old are you?" · "I'm …"
//    2 My School        book / chair / eraser / pen / pencil / table · "How old is he / she?" · colour mixing
//    3 Favourite Toys   ball / bike / car / computer / doll / train · in / on / under / next to · "Where is it?" · isn't
//    4 My Family        mother / father / sister / brother / grandmother / grandfather · beautiful / ugly / young / old / happy / sad
//    5 Our Pets         bird / cat / dog / fish / horse / mouse · long / short / big / small / clean / dirty · biggest / shortest
//    6 My Face          ears / eyes / hair / mouth / nose / teeth · "Have you got …?" · "I've got …"
//    7 Wild Animals     crocodile / elephant / giraffe / hippo / monkey / snake / tiger · body parts · "They've got / haven't got" · plurals
//    8 My Clothes       jacket / shoes / skirt / socks / trousers / T-shirt · "has got / hasn't got"
//    9 Fun Time!        play tennis / guitar / football / basketball · ride a bike / horse · swim · skate · can / can't
//   10 At the Funfair   helicopter / boat / bus / plane / motorbike · flying / walking / riding
//   11 Our House        living room / dining room / bathroom / kitchen / bedroom · present continuous
//   12 Party Time!      apple / chocolate / cake / banana / ice cream / burgers / fish · like / don't like
//
// NOTE: the app's unit list also has a "Unit 0 – Hello!" that duplicates
// Unit 1. Cambridge starts at Unit 1, so only units 1-12 have questions here.

export default {
  1: [ // Hello!
    ['What colour is the sun?', 'yellow', 'purple', 'pink', 'blue'],
    ['Blue + yellow = ___', 'green', 'purple', 'orange', 'pink'],
    ['"How old are you?" — "I\'m ___."', 'seven', 'blue', 'Tom', 'on'],
    ['"What colour is it?" — "It\'s ___."', 'orange', 'nine', 'Sue', 'on'],
    ['Which number comes after nine?', 'ten', 'eight', 'six', 'seven'],
    ['5 + 3 = ___', 'eight', 'seven', 'nine', 'six'],
    ['10 − 4 = ___', 'six', 'five', 'seven', 'four'],
    ['one, two, three, ___', 'four', 'five', 'six', 'ten'],
    ['Which one is a number?', 'six', 'pink', 'book', 'chair'],
    ['Which spelling is correct?', 'purple', 'purpel', 'perple', 'pruple'],
    ['TRUE or FALSE: Pink is a colour.', 'True', 'False'],
  ],
  2: [ // My School
    ['You sit on a ___.', 'chair', 'book', 'pen', 'eraser'],
    ['You read a ___.', 'book', 'chair', 'table', 'eraser'],
    ['You rub out mistakes with an ___.', 'eraser', 'chair', 'table', 'book'],
    ['You put your books on the ___.', 'table', 'pen', 'eraser', 'pencil'],
    ['You can write with a ___.', 'pen', 'chair', 'table', 'book'],
    ['A ___ is made of wood and you can draw with it.', 'pencil', 'chair', 'eraser', 'table'],
    ['"How old is he?" — "___ six."', 'He\'s', 'She\'s', 'I\'m', 'It\'s'],
    ['"How old is she?" — "She\'s ___."', 'eight', 'Sue', 'red', 'blue'],
    ['"Who\'s she?" — "She\'s ___."', 'Sue', 'six', 'red', 'a book'],
    ['One book, two ___.', 'books', 'bookes', 'book', 'bookies'],
    ['Red + blue = ___', 'purple', 'green', 'orange', 'yellow'],
    ['Yellow + red = ___', 'orange', 'purple', 'green', 'pink'],
  ],
  3: [ // Favourite Toys
    ['You kick a ___.', 'ball', 'doll', 'computer', 'train'],
    ['You ride a ___.', 'bike', 'doll', 'ball', 'computer'],
    ['You play games on a ___.', 'computer', 'doll', 'ball', 'train'],
    ['A ___ is a toy that looks like a small person.', 'doll', 'ball', 'car', 'bike'],
    ['A ___ runs on rails.', 'train', 'doll', 'ball', 'bike'],
    ['A ___ has four wheels and you drive it.', 'car', 'doll', 'ball', 'train'],
    ['"Where is the ball?" — "It\'s ___ the table." (on top of it)', 'on', 'under', 'in', 'next to'],
    ['"It\'s ___ the bag." (inside)', 'in', 'on', 'under', 'next to'],
    ['"The doll is ___ the table." (below it)', 'under', 'on', 'in', 'next to'],
    ['"The car is ___ the bag." (side by side)', 'next to', 'on', 'under', 'in'],
    ['"What\'s this?" — "It\'s a ___."', 'car', 'Sue', 'seven', 'red'],
    ['"The doll ___ on the table." (it is not there)', 'isn\'t', 'aren\'t', 'don\'t', 'not is'],
  ],
  4: [ // My Family
    ['Your mother\'s mother is your ___.', 'grandmother', 'sister', 'father', 'brother'],
    ['Your father\'s father is your ___.', 'grandfather', 'sister', 'mother', 'brother'],
    ['Your mum is your ___.', 'mother', 'father', 'sister', 'brother'],
    ['Your dad is your ___.', 'father', 'mother', 'sister', 'grandmother'],
    ['A girl with the same parents as you is your ___.', 'sister', 'brother', 'father', 'grandfather'],
    ['A boy with the same parents as you is your ___.', 'brother', 'sister', 'mother', 'grandmother'],
    ['The opposite of "old" is ___.', 'young', 'sad', 'ugly', 'happy'],
    ['The opposite of "happy" is ___.', 'sad', 'young', 'old', 'beautiful'],
    ['The opposite of "ugly" is ___.', 'beautiful', 'sad', 'old', 'young'],
    ['"___ is my mother." (one person)', 'This', 'These', 'They', 'Those'],
    ['"She\'s ___." (She is smiling.)', 'happy', 'sad', 'ugly', 'old'],
    ['"He\'s ___." (He is 80 years old.)', 'old', 'young', 'happy', 'sad'],
  ],
  5: [ // Our Pets
    ['Which pet says "meow"?', 'cat', 'dog', 'fish', 'horse'],
    ['Which pet says "woof"?', 'dog', 'cat', 'fish', 'bird'],
    ['Which pet lives in water?', 'fish', 'cat', 'dog', 'horse'],
    ['Which pet can fly?', 'bird', 'cat', 'dog', 'fish'],
    ['You can ride a ___.', 'horse', 'mouse', 'fish', 'bird'],
    ['A ___ is a very small animal that likes cheese.', 'mouse', 'horse', 'dog', 'fish'],
    ['The opposite of "big" is ___.', 'small', 'long', 'short', 'clean'],
    ['The opposite of "long" is ___.', 'short', 'big', 'small', 'clean'],
    ['The opposite of "clean" is ___.', 'dirty', 'short', 'small', 'long'],
    ['One cat, two ___.', 'cats', 'cates', 'cat', 'catties'],
    ['The elephant is big. The mouse is small. The elephant is the ___.', 'biggest', 'bigger', 'big', 'bigest', 'big → biggest (double the g)'],
    ['TRUE or FALSE: A fish can walk on the street.', 'False', 'True'],
  ],
  6: [ // My Face
    ['You see with your ___.', 'eyes', 'ears', 'nose', 'mouth'],
    ['You hear with your ___.', 'ears', 'eyes', 'nose', 'mouth'],
    ['You smell with your ___.', 'nose', 'ears', 'eyes', 'teeth'],
    ['You eat with your ___.', 'mouth', 'ears', 'eyes', 'hair'],
    ['You brush your ___.', 'teeth', 'nose', 'eyes', 'ears'],
    ['How many eyes have you got?', 'two', 'one', 'three', 'six'],
    ['"Have you got green hair?" — "No, I ___."', 'haven\'t', 'have', 'am', 'don\'t'],
    ['"Have you got a nose?" — "Yes, I ___."', 'have', 'haven\'t', 'am', 'do'],
    ['"I\'ve got a ___." (you can smell with it)', 'nose', 'mouth', 'ear', 'eye'],
    ['One tooth, many ___.', 'teeth', 'tooths', 'toothes', 'teeths'],
    ['Which spelling is correct?', 'mouth', 'mouht', 'moth', 'mouf'],
  ],
  7: [ // Wild Animals
    ['Which animal has a very long neck?', 'giraffe', 'elephant', 'monkey', 'snake'],
    ['Which animal is very big and grey and has big ears?', 'elephant', 'snake', 'monkey', 'tiger'],
    ['Which big cat is orange with black stripes?', 'tiger', 'elephant', 'monkey', 'hippo'],
    ['Which animal climbs trees and eats bananas?', 'monkey', 'hippo', 'crocodile', 'snake'],
    ['Which animal has no legs?', 'snake', 'monkey', 'tiger', 'elephant'],
    ['Which animal lives in a river and has big teeth and a long tail?', 'crocodile', 'giraffe', 'monkey', 'elephant'],
    ['Which animal is big, lives in water and has a big mouth?', 'hippo', 'giraffe', 'monkey', 'tiger'],
    ['"They\'ve got four ___."', 'legs', 'leg', 'legss', 'leggs'],
    ['"Snakes ___ got legs."', 'haven\'t', 'have', 'are', 'do'],
    ['"Elephants have got big ___."', 'ears', 'wings', 'wheels', 'shoes'],
    ['One hippo, two ___.', 'hippos', 'hippoes', 'hippo', 'hippies'],
    ['One crocodile, two ___.', 'crocodiles', 'crocodile', 'crocodilles', 'crocodiless'],
    ['You have two hands and two ___.', 'feet', 'foots', 'feets', 'feat'],
  ],
  8: [ // My Clothes
    ['You wear ___ on your feet.', 'shoes', 'a skirt', 'a jacket', 'a T-shirt'],
    ['You wear ___ inside your shoes.', 'socks', 'a skirt', 'a jacket', 'a T-shirt'],
    ['You wear ___ on your legs. They have two legs.', 'trousers', 'a skirt', 'a jacket', 'a T-shirt'],
    ['You wear a ___ on your body. It has short sleeves.', 'T-shirt', 'trousers', 'socks', 'shoes'],
    ['You wear a ___ over your T-shirt when it\'s cold.', 'jacket', 'sock', 'shoe', 'skirt'],
    ['"She\'s ___ a blue skirt."', 'got', 'get', 'gets', 'have', 'She\'s got = She has got'],
    ['"He ___ got white shoes."', 'has', 'have', 'are', 'am'],
    ['"She ___ got socks." (no socks)', 'hasn\'t', 'haven\'t', 'isn\'t', 'don\'t'],
    ['Which spelling is correct?', 'trousers', 'trouzers', 'trowsers', 'trousser'],
    ['Which one is NOT clothes?', 'a table', 'socks', 'a skirt', 'a jacket'],
    ['TRUE or FALSE: You wear socks on your hands.', 'False', 'True'],
  ],
  9: [ // Fun Time!
    ['You hit a ball with a racket when you play ___.', 'tennis', 'football', 'swim', 'skate'],
    ['You can ___ in a swimming pool.', 'swim', 'skate', 'ride', 'play'],
    ['You ___ a bike.', 'ride', 'play', 'swim', 'kick'],
    ['You play the ___ with your fingers. It has strings.', 'guitar', 'football', 'tennis', 'basketball'],
    ['"I can ___ football."', 'play', 'plays', 'playing', 'played', 'can + verb'],
    ['"I can ___ a horse."', 'ride', 'rides', 'riding', 'rode'],
    ['"Can a fish walk?" — "No, it ___."', 'can\'t', 'can', 'isn\'t', 'is'],
    ['"Can you swim?" — "Yes, I ___."', 'can', 'am', 'do', 'have'],
    ['"I ___ play the guitar. I never learned." (not able)', 'can\'t', 'can', 'am', 'do'],
    ['Which sport uses a basket?', 'basketball', 'football', 'tennis', 'swimming'],
    ['You wear special boots with wheels. You can ___.', 'skate', 'swim', 'ride a horse', 'play tennis'],
  ],
  10: [ // At the Funfair
    ['A ___ flies in the sky and has a big propeller on top.', 'helicopter', 'boat', 'bus', 'motorbike'],
    ['A ___ goes on the water.', 'boat', 'bus', 'motorbike', 'plane'],
    ['A ___ carries lots of people on the road.', 'bus', 'boat', 'plane', 'helicopter'],
    ['A ___ has wings and flies from airport to airport.', 'plane', 'bus', 'boat', 'motorbike'],
    ['A ___ has two wheels and an engine.', 'motorbike', 'boat', 'bus', 'plane'],
    ['"The plane is ___."', 'flying', 'fly', 'flies', 'flew', 'is + verb-ing'],
    ['"He is ___ a motorbike."', 'riding', 'ride', 'rides', 'rode'],
    ['"We are ___ to school."', 'walking', 'walk', 'walks', 'walked'],
    ['Which one has wings?', 'a plane', 'a bus', 'a boat', 'a motorbike'],
    ['Which spelling is correct?', 'helicopter', 'helicoptor', 'helicopte', 'helicapter'],
    ['TRUE or FALSE: A boat goes on water.', 'True', 'False'],
  ],
  11: [ // Our House
    ['You sleep in the ___.', 'bedroom', 'kitchen', 'bathroom', 'dining room'],
    ['You cook in the ___.', 'kitchen', 'bedroom', 'bathroom', 'living room'],
    ['You have a bath in the ___.', 'bathroom', 'kitchen', 'bedroom', 'living room'],
    ['You eat dinner at the table in the ___.', 'dining room', 'bedroom', 'bathroom', 'kitchen'],
    ['You watch TV on the sofa in the ___.', 'living room', 'bathroom', 'kitchen', 'bedroom'],
    ['"He\'s ___ to music."', 'listening', 'listen', 'listens', 'listened'],
    ['"She\'s ___ a picture."', 'drawing', 'draw', 'draws', 'drew'],
    ['"What\'s he doing?" — "He\'s ___ in the kitchen."', 'cooking', 'cook', 'cooks', 'cooked'],
    ['Which spelling is correct?', 'bathroom', 'bathrom', 'bathrume', 'batroom'],
    ['TRUE or FALSE: You sleep in the bathroom.', 'False', 'True'],
  ],
  12: [ // Party Time!
    ['Which food is cold and sweet?', 'ice cream', 'burger', 'fish', 'apple'],
    ['A ___ is a long yellow fruit.', 'banana', 'cake', 'chocolate', 'burger'],
    ['You eat a ___ on your birthday. It has candles.', 'cake', 'fish', 'burger', 'apple'],
    ['___ is brown and sweet.', 'Chocolate', 'A burger', 'Fish', 'An apple'],
    ['A ___ has meat inside bread.', 'burger', 'banana', 'cake', 'apple'],
    ['"I ___ chocolate. It\'s my favourite!"', 'like', 'don\'t like', 'likes', 'liking'],
    ['"I ___ like fish." (I don\'t want it.)', 'don\'t', 'doesn\'t', 'isn\'t', 'not'],
    ['"He ___ ice cream." (He loves it.)', 'likes', 'like', 'liking', 'is like', 'He / she / it + likes'],
    ['Which one is a fruit?', 'an apple', 'a cake', 'a burger', 'chocolate'],
    ['Which spelling is correct?', 'chocolate', 'chocolat', 'choclate', 'chokolate'],
    ['TRUE or FALSE: Ice cream is hot.', 'False', 'True'],
  ],
}

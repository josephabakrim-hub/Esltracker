// ── Bomb Pass question bank — Kids Box New Generation, Level 5 ───────────────
// Row format:  [question, CORRECT answer, wrong1, wrong2, wrong3, optional tip]
// The correct answer is ALWAYS written first — the game shuffles the options.
// TRUE/FALSE rows have just two answers: [question, 'True', 'False'] or
// [question, 'False', 'True'] (the first one is the correct one), plus an
// optional tip as a third value.
// Keyed by unit number (matches `units[].num` in lib/books.js).
//
// Language used (checked against Cambridge's official Kid's Box NG 5 Home
// Booklet and its answer key, which list each unit's vocabulary and grammar):
//   1 Time for Television  TV programmes · telling the time · opinions with "I think … because …" · amazing / boring / exciting / funny / interesting
//   2 People at Work       jobs · "going to" (affirmative, negative, questions) · "wanted to be"
//   3 City Life            city places · directions · past simple (turned, drove, walked) · opposite / next to
//   4 Disaster!            earthquake / hurricane / iceberg / island / lightning / storm / tsunami / volcano · past simple & past continuous
//   5 Material Things      brick / card / fur / glass / gold / leather / metal / paper / plastic / rubber / wood / wool · "made of" · "comes from"
//   6 Senses               bowl / flour / fork / knife / plate / spoon / salt and pepper · "smells like" / "feels like"
//   7 Natural World        insect / butterfly / beetle / habitat / endangered species / rubbish / bin / striped · should / shouldn't
//   8 World of Sport       athletics / golf / ice skating / skiing / sledging / snowboarding · seasons · present perfect · Would you like…? · Let's…
//
// NOTE: the book also has an introductory "Welcome to our blog" unit (school
// subjects). It is not in the app's unit list yet, so it is not included here.

export default {
  1: [ // Time for Television
    ['A programme that teaches you real facts about the world is a ___.', 'documentary', 'cartoon', 'comedy', 'quiz show'],
    ['People answer questions and win prizes on a ___.', 'quiz show', 'cartoon', 'documentary', 'weather report'],
    ['A ___ is a funny programme that makes you laugh.', 'comedy', 'news', 'weather', 'documentary'],
    ['You watch the ___ to hear what is happening in the world today.', 'news', 'cartoons', 'quiz shows', 'comedies'],
    ['You watch the ___ to find out if it will rain tomorrow.', 'weather', 'cartoons', 'series', 'action films'],
    ['Films with fights, fast cars and chases are ___ films.', 'action', 'quiz', 'weather', 'news'],
    ['3:15 is "a quarter ___ three".', 'past', 'to', 'half', 'at'],
    ['4:45 is "a quarter ___ five".', 'to', 'past', 'half', 'at'],
    ['6:30 is "half ___ six".', 'past', 'to', 'on', 'in'],
    ['10:40 is "twenty ___ eleven".', 'to', 'past', 'at', 'half'],
    ['"I think cartoons are ___ because they make me laugh."', 'funny', 'boring', 'sad', 'angry'],
    ['"It\'s a documentary about space. It\'s very ___. I learn a lot."', 'interesting', 'boring', 'funny', 'sad'],
    ['"What\'s it about?" — Good answer:', 'It\'s about a boy and a dragon.', 'It\'s at six o\'clock.', 'It\'s on channel five.', 'I\'m watching it.'],
  ],
  2: [ // People at Work
    ['A ___ fixes cars.', 'mechanic', 'pilot', 'dentist', 'artist'],
    ['A ___ flies a plane.', 'pilot', 'mechanic', 'dentist', 'cook'],
    ['A ___ looks after your teeth.', 'dentist', 'doctor', 'pilot', 'actor'],
    ['A ___ writes stories for newspapers and websites.', 'journalist', 'mechanic', 'dentist', 'pilot'],
    ['An ___ plays a character in a film or on TV.', 'actor', 'artist', 'pilot', 'mechanic'],
    ['A ___ makes food in a restaurant.', 'cook', 'pilot', 'dentist', 'journalist'],
    ['A ___ helps people when there is a crime.', 'police officer', 'cook', 'actor', 'artist'],
    ['A ___ makes games for computers and consoles.', 'video game designer', 'mechanic', 'dentist', 'doctor'],
    ['"I\'m going to ___ hard."', 'work', 'working', 'worked', 'works', 'going to + verb'],
    ['"She ___ going to be a doctor."', 'is', 'are', 'am', 'do'],
    ['"I\'m not going to ___ TV today."', 'watch', 'watching', 'watches', 'watched'],
    ['"Are you going to ___ a pilot?"', 'be', 'are', 'being', 'to be'],
    ['"When I was younger, I ___ to be an artist."', 'wanted', 'want', 'wants', 'wanting'],
  ],
  3: [ // City Life
    ['You see old things and art in a ___.', 'museum', 'hotel', 'airport', 'gym'],
    ['You stay the night in a ___ when you are on holiday.', 'hotel', 'museum', 'post office', 'gym'],
    ['You send a letter at the ___.', 'post office', 'museum', 'theatre', 'castle'],
    ['You catch a plane at the ___.', 'airport', 'post office', 'museum', 'park'],
    ['You watch a play in a ___.', 'theatre', 'post office', 'airport', 'bridge'],
    ['A king or queen lived in a ___ long ago.', 'castle', 'taxi', 'gym', 'restaurant'],
    ['A ___ goes over a river.', 'bridge', 'castle', 'hotel', 'taxi'],
    ['You pay a driver to take you in a ___.', 'taxi', 'bridge', 'castle', 'museum'],
    ['You go to the ___ to report a crime.', 'police station', 'museum', 'restaurant', 'theatre'],
    ['"Yesterday I ___ right at the bank."', 'turned', 'turn', 'turns', 'turning', 'Past simple: regular verb + -ed'],
    ['"We ___ straight on for two minutes." (drive)', 'drove', 'drive', 'drived', 'driven', 'drive → drove (irregular)'],
    ['"I ___ across the street." (walk)', 'walked', 'walk', 'walks', 'walking'],
    ['"Where\'s the museum?" — "It\'s ___ the hotel." (on the other side of the street)', 'opposite', 'under', 'on', 'at'],
    ['Turn right or turn ___.', 'left', 'under', 'up', 'top'],
  ],
  4: [ // Disaster!
    ['Hot lava comes out of a ___.', 'volcano', 'iceberg', 'island', 'storm'],
    ['The ground shakes in an ___.', 'earthquake', 'iceberg', 'island', 'hurricane'],
    ['A huge wave from the sea that floods the land is a ___.', 'tsunami', 'volcano', 'island', 'iceberg'],
    ['A very strong storm with fast winds over the sea is a ___.', 'hurricane', 'iceberg', 'island', 'volcano'],
    ['A big piece of ice floating in the sea is an ___.', 'iceberg', 'island', 'volcano', 'earthquake'],
    ['A bright flash in the sky during a storm is ___.', 'lightning', 'an island', 'an iceberg', 'a volcano'],
    ['A piece of land with sea all around it is an ___.', 'island', 'iceberg', 'earthquake', 'tsunami'],
    ['"I ___ reading a book when the storm started."', 'was', 'were', 'am', 'is', 'Past continuous: was / were + verb-ing'],
    ['"They ___ sailing when the storm hit."', 'were', 'was', 'are', 'be'],
    ['"I wasn\'t ___ a book." (read)', 'reading', 'read', 'reads', 'readed'],
    ['"___ you sleeping when it happened?"', 'Were', 'Was', 'Did', 'Are'],
    ['The ship ___ in the sea. (sink)', 'sank', 'sinked', 'sunk', 'sinks', 'sink → sank (irregular)'],
    ['The past simple of "hit" is ___.', 'hit', 'hitted', 'hat', 'hits'],
  ],
  5: [ // Material Things
    ['A window is made of ___.', 'glass', 'wool', 'grass', 'fur'],
    ['A ring can be made of ___.', 'gold', 'wool', 'grass', 'paper'],
    ['A wall can be made of ___.', 'brick', 'wool', 'fur', 'paper'],
    ['A warm jumper can be made of ___.', 'wool', 'glass', 'metal', 'brick'],
    ['A table is often made of ___.', 'wood', 'wool', 'fur', 'rubber'],
    ['Tyres are made of ___.', 'rubber', 'paper', 'glass', 'wool'],
    ['Wool comes from ___.', 'sheep', 'trees', 'rocks', 'cows'],
    ['Paper comes from ___.', 'trees', 'sheep', 'rocks', 'gold'],
    ['Leather comes from ___.', 'animals', 'trees', 'sand', 'metal'],
    ['"Is it made ___ plastic?"', 'of', 'at', 'on', 'in', 'made of + material'],
    ['"Do you use it ___ cut paper?"', 'to', 'for', 'at', 'of'],
    ['Which one is made of metal?', 'a fork', 'a paper bag', 'a woollen scarf', 'a wooden table'],
    ['Which one is NOT a material?', 'a bridge', 'wood', 'glass', 'paper'],
  ],
  6: [ // Senses
    ['You eat soup with a ___.', 'spoon', 'knife', 'plate', 'flour'],
    ['You cut food with a ___.', 'knife', 'spoon', 'bowl', 'plate'],
    ['You put food on a ___.', 'plate', 'knife', 'flour', 'spoon'],
    ['You put soup or cereal in a ___.', 'bowl', 'fork', 'knife', 'flour'],
    ['You use a ___ to pick up pasta.', 'fork', 'plate', 'bowl', 'flour'],
    ['Bread and pizza are made with ___.', 'flour', 'plates', 'forks', 'bowls'],
    ['You use your nose to ___.', 'smell', 'see', 'hear', 'taste'],
    ['You use your ears to ___.', 'hear', 'see', 'smell', 'taste'],
    ['You use your tongue to ___.', 'taste', 'hear', 'see', 'smell'],
    ['You use your eyes to ___.', 'see', 'hear', 'smell', 'taste'],
    ['"It smells ___ cheese."', 'like', 'at', 'in', 'on', 'smells like + noun'],
    ['"Does it ___ like cheese?"', 'smell', 'smells', 'smelled', 'smelling', 'After does → base verb'],
    ['"It doesn\'t ___ like cheese."', 'smell', 'smells', 'smelled', 'smelling'],
    ['The five senses are sight, hearing, smell, taste and ___.', 'touch', 'think', 'speak', 'walk'],
  ],
  7: [ // Natural World
    ['An ___ is a small animal with six legs.', 'insect', 'tree', 'habitat', 'bin'],
    ['A ___ has colourful wings.', 'butterfly', 'bin', 'habitat', 'tree'],
    ['A ___ is a small insect with a hard shell.', 'beetle', 'bin', 'habitat', 'butterfly'],
    ['A ___ is the place where an animal lives in nature.', 'habitat', 'beetle', 'bin', 'clean-up'],
    ['Animals that may disappear forever are ___ species.', 'endangered', 'striped', 'clean', 'happy'],
    ['Put your rubbish in the ___.', 'bin', 'habitat', 'beetle', 'tree'],
    ['A zebra is ___.', 'striped', 'square', 'purple', 'wooden'],
    ['A butterfly has got spotted ___.', 'wings', 'wheels', 'shoes', 'bricks'],
    ['"You ___ drop rubbish on the beach."', 'shouldn\'t', 'should', 'are', 'have', 'shouldn\'t = it\'s not a good idea'],
    ['"We ___ recycle paper."', 'should', 'shouldn\'t', 'is', 'does', 'should = it\'s a good idea'],
    ['"___ I tell my teacher?"', 'Should', 'Do', 'Am', 'Are'],
    ['A group of people cleaning a place together is a ___.', 'clean-up', 'habitat', 'beetle', 'gym'],
    ['TRUE or FALSE: A tree is a plant.', 'True', 'False'],
  ],
  8: [ // World of Sport
    ['You do ___ on snow with two long boards on your feet.', 'skiing', 'golf', 'athletics', 'ice skating'],
    ['You ride on one board down a snowy hill. It\'s ___.', 'snowboarding', 'golf', 'athletics', 'skiing'],
    ['You wear special shoes with blades on ice. It\'s ___.', 'ice skating', 'golf', 'skiing', 'athletics'],
    ['You go down a snowy hill on a sledge. It\'s ___.', 'sledging', 'golf', 'athletics', 'ice skating'],
    ['Running and jumping are part of ___.', 'athletics', 'sledging', 'golf', 'skiing'],
    ['You hit a small ball into a hole in ___.', 'golf', 'skiing', 'sledging', 'athletics'],
    ['The coldest season is ___.', 'winter', 'summer', 'spring', 'autumn'],
    ['Flowers come out in ___.', 'spring', 'winter', 'autumn', 'snow'],
    ['Which season comes after summer?', 'autumn', 'spring', 'winter', 'summer'],
    ['"She\'s ___ basketball." (play)', 'played', 'play', 'plays', 'playing', 'Present perfect: has / have + past participle'],
    ['"He hasn\'t ___ a horse." (ride)', 'ridden', 'rode', 'ride', 'riding'],
    ['"Has she ___ a race?" (run)', 'run', 'ran', 'running', 'runs'],
    ['"___ you like to go skiing?"', 'Would', 'Do', 'Are', 'Have'],
    ['"___ play golf!" (a suggestion)', 'Let\'s', 'Lets', 'Let', 'Letting'],
  ],
}

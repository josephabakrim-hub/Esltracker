// ── QUESTION BANK ──
// Each question: { q: string, a: string, level: 'pro' | 'elite' | 'both', category: string }

export const QUESTIONS = [

  // ════════════════════════════════════════
  //  PRO — Kids Box Vocabulary & Grammar
  // ════════════════════════════════════════

  // Family
  { q: "What do you call your mother's mother?", a: "Grandmother", level: 'pro', category: '👨‍👩‍👧 Family' },
  { q: "What do you call your father's brother?", a: "Uncle", level: 'pro', category: '👨‍👩‍👧 Family' },
  { q: "What do you call your brother's daughter?", a: "Niece", level: 'pro', category: '👨‍👩‍👧 Family' },
  { q: "Name 3 members of a family.", a: "e.g. mother, father, sister, brother, grandma...", level: 'pro', category: '👨‍👩‍👧 Family' },
  { q: "What do you call your parents' parents?", a: "Grandparents", level: 'pro', category: '👨‍👩‍👧 Family' },

  // Body Parts
  { q: "How many fingers do you have on one hand?", a: "5", level: 'pro', category: '🦴 Body' },
  { q: "What part of your body do you use to smell?", a: "Nose", level: 'pro', category: '🦴 Body' },
  { q: "What part of your body do you use to hear?", a: "Ears", level: 'pro', category: '🦴 Body' },
  { q: "What part of your body do you use to see?", a: "Eyes", level: 'pro', category: '🦴 Body' },
  { q: "How many toes do you have on both feet?", a: "10", level: 'pro', category: '🦴 Body' },
  { q: "What is the longest bone in your body?", a: "Femur (leg bone)", level: 'pro', category: '🦴 Body' },
  { q: "What do you call the hair on a man's face?", a: "Beard", level: 'pro', category: '🦴 Body' },

  // Colors
  { q: "What color do you get when you mix red and white?", a: "Pink", level: 'pro', category: '🎨 Colors' },
  { q: "What color is the sky on a sunny day?", a: "Blue", level: 'pro', category: '🎨 Colors' },
  { q: "What color are most leaves in summer?", a: "Green", level: 'pro', category: '🎨 Colors' },
  { q: "What color do you get when you mix red and yellow?", a: "Orange", level: 'pro', category: '🎨 Colors' },
  { q: "What color is a ripe banana?", a: "Yellow", level: 'pro', category: '🎨 Colors' },
  { q: "Name 3 colors of the rainbow.", a: "Red, orange, yellow, green, blue, indigo, violet", level: 'pro', category: '🎨 Colors' },

  // Animals
  { q: "What animal says 'moo'?", a: "Cow", level: 'pro', category: '🐾 Animals' },
  { q: "How many legs does a spider have?", a: "8", level: 'pro', category: '🐾 Animals' },
  { q: "What do you call a baby dog?", a: "Puppy", level: 'pro', category: '🐾 Animals' },
  { q: "What do you call a baby cat?", a: "Kitten", level: 'pro', category: '🐾 Animals' },
  { q: "What animal is the biggest land animal?", a: "Elephant", level: 'pro', category: '🐾 Animals' },
  { q: "What animal can fly but is NOT a bird?", a: "Bat", level: 'pro', category: '🐾 Animals' },
  { q: "What do you call a group of fish?", a: "A school", level: 'pro', category: '🐾 Animals' },
  { q: "What animal sleeps all winter?", a: "Bear (hibernates)", level: 'pro', category: '🐾 Animals' },
  { q: "Name 3 animals that live in the sea.", a: "e.g. shark, whale, fish, dolphin, octopus", level: 'pro', category: '🐾 Animals' },
  { q: "What is the fastest land animal?", a: "Cheetah", level: 'pro', category: '🐾 Animals' },
  { q: "How many legs does an insect have?", a: "6", level: 'pro', category: '🐾 Animals' },
  { q: "What do you call a baby cow?", a: "Calf", level: 'pro', category: '🐾 Animals' },

  // Food & Drink
  { q: "Name 3 fruits.", a: "e.g. apple, banana, mango, orange, grapes", level: 'pro', category: '🍎 Food' },
  { q: "Name 3 vegetables.", a: "e.g. carrot, tomato, potato, onion", level: 'pro', category: '🍎 Food' },
  { q: "What drink comes from cows?", a: "Milk", level: 'pro', category: '🍎 Food' },
  { q: "What do bees make?", a: "Honey", level: 'pro', category: '🍎 Food' },
  { q: "Name a food that is orange in color.", a: "e.g. carrot, orange, pumpkin", level: 'pro', category: '🍎 Food' },
  { q: "What is the main ingredient in bread?", a: "Flour/wheat", level: 'pro', category: '🍎 Food' },
  { q: "What do you call a meal you eat in the morning?", a: "Breakfast", level: 'pro', category: '🍎 Food' },

  // Clothes
  { q: "What do you wear on your feet?", a: "Shoes / socks", level: 'pro', category: '👕 Clothes' },
  { q: "What do you wear when it's raining?", a: "Raincoat / umbrella", level: 'pro', category: '👕 Clothes' },
  { q: "What do you wear to sleep?", a: "Pyjamas", level: 'pro', category: '👕 Clothes' },
  { q: "What do you wear to keep your neck warm?", a: "Scarf", level: 'pro', category: '👕 Clothes' },
  { q: "Name 3 things you wear.", a: "e.g. shirt, trousers, shoes, hat, coat", level: 'pro', category: '👕 Clothes' },

  // Numbers & Maths
  { q: "What is 7 times 8?", a: "56", level: 'pro', category: '🔢 Numbers' },
  { q: "What is 100 divided by 4?", a: "25", level: 'pro', category: '🔢 Numbers' },
  { q: "What is 15 plus 27?", a: "42", level: 'pro', category: '🔢 Numbers' },
  { q: "What is half of 60?", a: "30", level: 'pro', category: '🔢 Numbers' },
  { q: "How many days are in a week?", a: "7", level: 'pro', category: '🔢 Numbers' },
  { q: "How many months are in a year?", a: "12", level: 'pro', category: '🔢 Numbers' },
  { q: "How many seconds are in a minute?", a: "60", level: 'pro', category: '🔢 Numbers' },

  // Classroom & School
  { q: "What do you use to write on a whiteboard?", a: "Marker", level: 'pro', category: '🏫 School' },
  { q: "What do you use to rub out pencil marks?", a: "Eraser / rubber", level: 'pro', category: '🏫 School' },
  { q: "What is the person who teaches you called?", a: "Teacher", level: 'pro', category: '🏫 School' },
  { q: "Name 3 school subjects.", a: "e.g. English, Maths, Science, History, Art", level: 'pro', category: '🏫 School' },

  // Transport
  { q: "Name 3 types of transport.", a: "e.g. car, bus, plane, train, bicycle", level: 'pro', category: '🚗 Transport' },
  { q: "What transport flies in the sky?", a: "Plane / helicopter", level: 'pro', category: '🚗 Transport' },
  { q: "What transport goes under the ground?", a: "Subway / underground / metro", level: 'pro', category: '🚗 Transport' },
  { q: "What do you call the person who flies a plane?", a: "Pilot", level: 'pro', category: '🚗 Transport' },

  // Weather & Seasons
  { q: "Name the 4 seasons.", a: "Spring, summer, autumn/fall, winter", level: 'pro', category: '🌤️ Weather' },
  { q: "What is the weather like when there is thunder and lightning?", a: "Stormy / thunderstorm", level: 'pro', category: '🌤️ Weather' },
  { q: "What season is usually the hottest?", a: "Summer", level: 'pro', category: '🌤️ Weather' },
  { q: "What falls from the sky in winter in cold countries?", a: "Snow", level: 'pro', category: '🌤️ Weather' },

  // Grammar — Present Simple / Can
  { q: "Say a sentence using 'I like...'", a: "e.g. I like football.", level: 'pro', category: '📐 Grammar' },
  { q: "What is the opposite of 'tall'?", a: "Short", level: 'pro', category: '📐 Grammar' },
  { q: "What is the opposite of 'fast'?", a: "Slow", level: 'pro', category: '📐 Grammar' },
  { q: "What is the opposite of 'hot'?", a: "Cold", level: 'pro', category: '📐 Grammar' },
  { q: "What is the opposite of 'happy'?", a: "Sad", level: 'pro', category: '📐 Grammar' },
  { q: "Make a sentence with 'can'.", a: "e.g. I can swim.", level: 'pro', category: '📐 Grammar' },
  { q: "What is the plural of 'child'?", a: "Children", level: 'pro', category: '📐 Grammar' },
  { q: "What is the plural of 'mouse'?", a: "Mice", level: 'pro', category: '📐 Grammar' },
  { q: "What is the past tense of 'go'?", a: "Went", level: 'pro', category: '📐 Grammar' },
  { q: "What is the past tense of 'eat'?", a: "Ate", level: 'pro', category: '📐 Grammar' },
  { q: "What is the past tense of 'run'?", a: "Ran", level: 'pro', category: '📐 Grammar' },
  { q: "What is the past tense of 'see'?", a: "Saw", level: 'pro', category: '📐 Grammar' },
  { q: "Say a sentence using 'there is'.", a: "e.g. There is a cat on the chair.", level: 'pro', category: '📐 Grammar' },
  { q: "Say a sentence using 'there are'.", a: "e.g. There are 5 students in the room.", level: 'pro', category: '📐 Grammar' },
  { q: "What is the comparative of 'big'?", a: "Bigger", level: 'pro', category: '📐 Grammar' },
  { q: "What is the comparative of 'good'?", a: "Better", level: 'pro', category: '📐 Grammar' },

  // Sports & Hobbies
  { q: "How many players are in a football team?", a: "11", level: 'pro', category: '⚽ Sports' },
  { q: "What sport uses a racket and a shuttlecock?", a: "Badminton", level: 'pro', category: '⚽ Sports' },
  { q: "What sport is played in a swimming pool?", a: "Swimming", level: 'pro', category: '⚽ Sports' },
  { q: "In basketball, how many points is a regular basket worth?", a: "2 points", level: 'pro', category: '⚽ Sports' },
  { q: "Name 3 sports you play with a ball.", a: "e.g. football, basketball, tennis, volleyball", level: 'pro', category: '⚽ Sports' },

  // Places
  { q: "Where do you go to borrow books?", a: "Library", level: 'pro', category: '🏙️ Places' },
  { q: "Where do you go when you are sick?", a: "Hospital / doctor", level: 'pro', category: '🏙️ Places' },
  { q: "Where do planes land and take off?", a: "Airport", level: 'pro', category: '🏙️ Places' },
  { q: "Where do you go to buy food and things?", a: "Supermarket / shop", level: 'pro', category: '🏙️ Places' },

  // Jobs
  { q: "What do you call a person who puts out fires?", a: "Firefighter", level: 'pro', category: '💼 Jobs' },
  { q: "What do you call a person who fixes teeth?", a: "Dentist", level: 'pro', category: '💼 Jobs' },
  { q: "What do you call a person who cooks in a restaurant?", a: "Chef / cook", level: 'pro', category: '💼 Jobs' },
  { q: "What do you call a person who writes books?", a: "Author / writer", level: 'pro', category: '💼 Jobs' },
  { q: "What do you call a person who takes photos?", a: "Photographer", level: 'pro', category: '💼 Jobs' },

  // ════════════════════════════════════════
  //  ELITE — Think 1-5 Topics & Grammar
  // ════════════════════════════════════════

  // Present Perfect
  { q: "Make a sentence using 'have you ever...'", a: "e.g. Have you ever visited Paris?", level: 'elite', category: '📐 Grammar' },
  { q: "What is the present perfect of 'eat'?", a: "Have/has eaten", level: 'elite', category: '📐 Grammar' },
  { q: "What is the present perfect of 'write'?", a: "Have/has written", level: 'elite', category: '📐 Grammar' },
  { q: "What is the difference between 'I did' and 'I have done'?", a: "Past simple = finished time, present perfect = connected to now", level: 'elite', category: '📐 Grammar' },
  { q: "Make a sentence with 'already'.", a: "e.g. I have already finished my homework.", level: 'elite', category: '📐 Grammar' },
  { q: "Make a sentence with 'yet'.", a: "e.g. I haven't eaten yet.", level: 'elite', category: '📐 Grammar' },

  // Conditionals
  { q: "Complete: 'If it rains tomorrow, I will...'", a: "e.g. ...stay at home.", level: 'elite', category: '📐 Grammar' },
  { q: "Complete: 'If I had a million dollars, I would...'", a: "e.g. ...travel the world.", level: 'elite', category: '📐 Grammar' },
  { q: "What type of conditional is: 'If I study, I will pass'?", a: "First conditional (real / possible)", level: 'elite', category: '📐 Grammar' },
  { q: "What type of conditional is: 'If I were a bird, I would fly'?", a: "Second conditional (unreal / imaginary)", level: 'elite', category: '📐 Grammar' },

  // Modal Verbs
  { q: "What is the difference between 'must' and 'have to'?", a: "'Must' is personal obligation, 'have to' is external obligation", level: 'elite', category: '📐 Grammar' },
  { q: "Make a sentence using 'should'.", a: "e.g. You should drink more water.", level: 'elite', category: '📐 Grammar' },
  { q: "Make a sentence using 'might'.", a: "e.g. It might rain later.", level: 'elite', category: '📐 Grammar' },
  { q: "What modal verb do we use to ask for permission politely?", a: "May / Could / Can", level: 'elite', category: '📐 Grammar' },

  // Passive Voice
  { q: "Change to passive: 'The teacher corrects the homework.'", a: "The homework is corrected by the teacher.", level: 'elite', category: '📐 Grammar' },
  { q: "Change to passive: 'They built this bridge in 1990.'", a: "This bridge was built in 1990.", level: 'elite', category: '📐 Grammar' },
  { q: "Why do we use the passive voice?", a: "When the action is more important than who did it", level: 'elite', category: '📐 Grammar' },

  // Reported Speech
  { q: "Change to reported speech: 'I am tired,' she said.", a: "She said that she was tired.", level: 'elite', category: '📐 Grammar' },
  { q: "Change to reported speech: 'I will call you,' he said.", a: "He said he would call me.", level: 'elite', category: '📐 Grammar' },

  // Vocabulary — Technology
  { q: "What does 'Wi-Fi' stand for?", a: "Wireless Fidelity", level: 'elite', category: '💻 Technology' },
  { q: "What is a 'browser'?", a: "A program used to access the internet (e.g. Chrome)", level: 'elite', category: '💻 Technology' },
  { q: "What does 'download' mean?", a: "To copy a file from the internet to your device", level: 'elite', category: '💻 Technology' },
  { q: "What is the difference between hardware and software?", a: "Hardware = physical parts, software = programs", level: 'elite', category: '💻 Technology' },
  { q: "Name 3 social media platforms.", a: "e.g. Instagram, TikTok, Facebook, YouTube, Twitter", level: 'elite', category: '💻 Technology' },
  { q: "What does 'AI' stand for?", a: "Artificial Intelligence", level: 'elite', category: '💻 Technology' },

  // Environment
  { q: "Name 3 things you can do to help the environment.", a: "e.g. recycle, save water, use less plastic, plant trees", level: 'elite', category: '🌍 Environment' },
  { q: "What is 'global warming'?", a: "The gradual increase in Earth's temperature", level: 'elite', category: '🌍 Environment' },
  { q: "What does 'recycle' mean?", a: "To convert waste into reusable material", level: 'elite', category: '🌍 Environment' },
  { q: "What gas do plants absorb from the air?", a: "Carbon dioxide (CO2)", level: 'elite', category: '🌍 Environment' },
  { q: "What gas do plants produce?", a: "Oxygen", level: 'elite', category: '🌍 Environment' },
  { q: "What is a 'renewable' energy source?", a: "Energy from natural sources that replenish — sun, wind, water", level: 'elite', category: '🌍 Environment' },

  // Health & Body
  { q: "Name 3 things that are good for your health.", a: "e.g. exercise, eating vegetables, sleeping well, drinking water", level: 'elite', category: '💊 Health' },
  { q: "What is the difference between a virus and a bacteria?", a: "Viruses need a host cell to reproduce; bacteria are living organisms", level: 'elite', category: '💊 Health' },
  { q: "How many hours of sleep should a teenager get?", a: "8-10 hours", level: 'elite', category: '💊 Health' },
  { q: "What vitamin do we get from the sun?", a: "Vitamin D", level: 'elite', category: '💊 Health' },

  // Travel & Culture
  { q: "What is the capital of France?", a: "Paris", level: 'elite', category: '✈️ Travel' },
  { q: "What is the capital of Japan?", a: "Tokyo", level: 'elite', category: '✈️ Travel' },
  { q: "What language do people speak in Brazil?", a: "Portuguese", level: 'elite', category: '✈️ Travel' },
  { q: "Name 3 continents.", a: "e.g. Asia, Europe, Africa, America, Oceania, Antarctica", level: 'elite', category: '✈️ Travel' },
  { q: "What is the longest river in the world?", a: "The Nile", level: 'elite', category: '✈️ Travel' },
  { q: "What is the largest ocean in the world?", a: "Pacific Ocean", level: 'elite', category: '✈️ Travel' },

  // Media & Opinion
  { q: "Give your opinion: Is social media good or bad for teenagers?", a: "Open answer — student must give a reason", level: 'elite', category: '💬 Opinion' },
  { q: "Give your opinion: Should school uniforms be compulsory?", a: "Open answer — student must give a reason", level: 'elite', category: '💬 Opinion' },
  { q: "Give your opinion: Is it better to live in a city or the countryside?", a: "Open answer — student must give a reason", level: 'elite', category: '💬 Opinion' },
  { q: "What is the difference between 'news' and 'fake news'?", a: "News = verified facts, fake news = false or misleading information", level: 'elite', category: '💬 Opinion' },

  // Science
  { q: "What is the chemical formula for water?", a: "H2O", level: 'elite', category: '🔬 Science' },
  { q: "What planet is closest to the Sun?", a: "Mercury", level: 'elite', category: '🔬 Science' },
  { q: "What force keeps us on the ground?", a: "Gravity", level: 'elite', category: '🔬 Science' },
  { q: "How many planets are in our solar system?", a: "8", level: 'elite', category: '🔬 Science' },
  { q: "What is the hardest natural substance on Earth?", a: "Diamond", level: 'elite', category: '🔬 Science' },
  { q: "What is the speed of light?", a: "Approximately 300,000 km per second", level: 'elite', category: '🔬 Science' },

  // Literature & Arts
  { q: "Who wrote 'Romeo and Juliet'?", a: "William Shakespeare", level: 'elite', category: '📚 Literature' },
  { q: "Who wrote 'Harry Potter'?", a: "J.K. Rowling", level: 'elite', category: '📚 Literature' },
  { q: "What is a 'metaphor'? Give an example.", a: "Saying something IS something else, e.g. 'Life is a journey'", level: 'elite', category: '📚 Literature' },
  { q: "What is the difference between a noun and a verb?", a: "Noun = person/place/thing, verb = action or state", level: 'elite', category: '📚 Literature' },

  // ════════════════════════════════════════
  //  GENERAL KNOWLEDGE — Both Levels
  // ════════════════════════════════════════

  // Fun GK — Pro friendly
  { q: "What country is the Eiffel Tower in?", a: "France", level: 'both', category: '🌍 General Knowledge' },
  { q: "How many colors are in a rainbow?", a: "7", level: 'both', category: '🌍 General Knowledge' },
  { q: "What is the biggest planet in our solar system?", a: "Jupiter", level: 'both', category: '🌍 General Knowledge' },
  { q: "What animal is the symbol of Australia?", a: "Kangaroo", level: 'both', category: '🌍 General Knowledge' },
  { q: "In which country was pizza invented?", a: "Italy", level: 'both', category: '🌍 General Knowledge' },
  { q: "What is the capital of the United States?", a: "Washington D.C.", level: 'both', category: '🌍 General Knowledge' },
  { q: "How many sides does a hexagon have?", a: "6", level: 'both', category: '🌍 General Knowledge' },
  { q: "What is the tallest mountain in the world?", a: "Mount Everest", level: 'both', category: '🌍 General Knowledge' },
  { q: "What do you call the study of stars and space?", a: "Astronomy", level: 'both', category: '🌍 General Knowledge' },
  { q: "What is the smallest country in the world?", a: "Vatican City", level: 'both', category: '🌍 General Knowledge' },
  { q: "How many letters are in the English alphabet?", a: "26", level: 'both', category: '🌍 General Knowledge' },
  { q: "What is the most spoken language in the world?", a: "Mandarin Chinese", level: 'both', category: '🌍 General Knowledge' },
  { q: "What is the capital of England?", a: "London", level: 'both', category: '🌍 General Knowledge' },
  { q: "What animal is known as the King of the Jungle?", a: "Lion", level: 'both', category: '🌍 General Knowledge' },
  { q: "How many wheels does a bicycle have?", a: "2", level: 'both', category: '🌍 General Knowledge' },
  { q: "What instrument has black and white keys?", a: "Piano", level: 'both', category: '🌍 General Knowledge' },
  { q: "What sport is Cristiano Ronaldo famous for?", a: "Football (soccer)", level: 'both', category: '🌍 General Knowledge' },
  { q: "What do caterpillars turn into?", a: "Butterflies or moths", level: 'both', category: '🌍 General Knowledge' },
  { q: "What is the capital of Vietnam?", a: "Hanoi", level: 'both', category: '🌍 General Knowledge' },
  { q: "What ocean is between America and Europe?", a: "Atlantic Ocean", level: 'both', category: '🌍 General Knowledge' },
  { q: "What is ice when it melts?", a: "Water", level: 'both', category: '🌍 General Knowledge' },
  { q: "What is 2 to the power of 10?", a: "1024", level: 'both', category: '🌍 General Knowledge' },
  { q: "What country has the most people in the world?", a: "India", level: 'both', category: '🌍 General Knowledge' },
  { q: "What is the name of the famous clock tower in London?", a: "Big Ben", level: 'both', category: '🌍 General Knowledge' },
  { q: "What do you call a scientist who studies dinosaurs?", a: "Palaeontologist", level: 'both', category: '🌍 General Knowledge' },
  { q: "What is the currency of Japan?", a: "Yen", level: 'both', category: '🌍 General Knowledge' },
  { q: "How many hours are in a day?", a: "24", level: 'both', category: '🌍 General Knowledge' },
  { q: "What is the name of the first man to walk on the moon?", a: "Neil Armstrong", level: 'both', category: '🌍 General Knowledge' },
  { q: "What animal produces silk?", a: "Silkworm", level: 'both', category: '🌍 General Knowledge' },
  { q: "Which is heavier — a kilogram of feathers or a kilogram of gold?", a: "They are the same — both 1 kilogram!", level: 'both', category: '🌍 General Knowledge' },
  { q: "What is the name of Mickey Mouse's dog?", a: "Pluto", level: 'both', category: '🌍 General Knowledge' },
  { q: "How many zeros are in one million?", a: "6", level: 'both', category: '🌍 General Knowledge' },
  { q: "What do you call a shape with 3 sides?", a: "Triangle", level: 'both', category: '🌍 General Knowledge' },
  { q: "What is the opposite of 'north'?", a: "South", level: 'both', category: '🌍 General Knowledge' },
  { q: "What is the name of the toy cowboy in Toy Story?", a: "Woody", level: 'both', category: '🌍 General Knowledge' },
  { q: "What colour is an emerald?", a: "Green", level: 'both', category: '🌍 General Knowledge' },
  { q: "In which sport do you use a bow and arrow?", a: "Archery", level: 'both', category: '🌍 General Knowledge' },
  { q: "What is the name of the ship that sank after hitting an iceberg in 1912?", a: "Titanic", level: 'both', category: '🌍 General Knowledge' },
  { q: "What season comes after summer?", a: "Autumn / Fall", level: 'both', category: '🌍 General Knowledge' },
  { q: "What is the name of the fairy in Peter Pan?", a: "Tinker Bell", level: 'both', category: '🌍 General Knowledge' },
]

// Get questions filtered by class level
export function getQuestionsForLevel(level) {
  return QUESTIONS.filter(q => q.level === level || q.level === 'both')
}

// Get a random question for a level
export function getRandomQuestion(level) {
  const pool = getQuestionsForLevel(level)
  return pool[Math.floor(Math.random() * pool.length)]
}

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

// ============================================================================
// MASTER QUESTION BANK
// Questions are formatted with proper property names for AI processing
// ============================================================================

const QUESTION_BANK = [
  // 1. THE LION AND THE JEWEL (Drama - African)
  {
    book_title: "The Lion and the Jewel",
    genre: "Drama",
    category: "African",
    author: "Wole Soyinka",
    questions: [
      { question: "The play is set in the village of...", options: ["Ilujinle", "Ibadan", "Lagos", "Enugu"], correct_answer: "Ilujinle" },
      { question: "Lakunle describes the custom of bride-price as...", options: ["A savage custom", "A necessary tradition", "A romantic gesture", "A religious duty"], correct_answer: "A savage custom" },
      { question: "Who is referred to as the 'Jewel'?", options: ["Sidi", "Sadiku", "The Favourite", "Ailatu"], correct_answer: "Sidi" },
      { question: "Baroka is best described as...", options: ["A cunning traditionalist", "A modern reformer", "A weak old man", "A religious fanatic"], correct_answer: "A cunning traditionalist" },
      { question: "What object brings Sidi fame?", options: ["A magazine", "A mirror", "A crown", "A gold ring"], correct_answer: "A magazine" },
      { question: "How old is Baroka?", options: ["62", "50", "75", "40"], correct_answer: "62" },
      { question: "Who is Sadiku?", options: ["Baroka's head wife", "Sidi's mother", "Lakunle's aunt", "The village priestess"], correct_answer: "Baroka's head wife" },
      { question: "The 'stranger' from Lagos is a...", options: ["Photographer", "Teacher", "Soldier", "Doctor"], correct_answer: "Photographer" },
      { question: "What lie does Baroka tell Sadiku to trick Sidi?", options: ["He is impotent", "He is dying", "He is rich", "He is traveling"], correct_answer: "He is impotent" },
      { question: "Lakunle refuses to carry Sidi's pail because...", options: ["It is beneath his dignity as a man of learning", "He has a back injury", "Baroka forbade it", "It is heavy"], correct_answer: "It is beneath his dignity as a man of learning" },
      { question: "What does Lakunle propose to use instead of palm wine?", options: ["Tea with milk and sugar", "Water", "Soda", "Whisky"], correct_answer: "Tea with milk and sugar" },
      { question: "The 'Dance of the Lost Traveller' mimics...", options: ["A car breaking down", "A wedding ceremony", "A funeral", "A war"], correct_answer: "A car breaking down" },
      { question: "What does Baroka promise Sidi if she marries him?", options: ["Her face on a stamp", "A trip to London", "A new school", "Gold jewelry"], correct_answer: "Her face on a stamp" },
      { question: "Who represents the conflict of Western culture in the play?", options: ["Lakunle", "Baroka", "Sadiku", "The Wrestler"], correct_answer: "Lakunle" },
      { question: "What does Sidi pray for at the beginning?", options: ["Fame", "A husband", "Children", "Money"], correct_answer: "Fame" },
      { question: "Why does Baroka stop the railway line?", options: ["To preserve tradition and his power", "It was too expensive", "The gods forbade it", "Lakunle protested"], correct_answer: "To preserve tradition and his power" },
      { question: "What name does Sidi call Lakunle when mocking him?", options: ["A book-nourished shrimp", "A lion", "A king", "A warrior"], correct_answer: "A book-nourished shrimp" },
      { question: "Sadiku celebrates Baroka's impotence because...", options: ["It marks a victory for women", "She hates him", "She wants to marry Lakunle", "She wants to be Bale"], correct_answer: "It marks a victory for women" },
      { question: "Who is Baroka's father?", options: ["Okiki", "Sango", "Oduduwa", "Ogun"], correct_answer: "Okiki" },
      { question: "The play acts as a satire against...", options: ["Superficial modernity", "Traditional values", "Marriage", "Farming"], correct_answer: "Superficial modernity" },
      { question: "What does Lakunle wear that is described as ridiculous?", options: ["An old-fashioned English suit", "A traditional Agbada", "A military uniform", "A loincloth"], correct_answer: "An old-fashioned English suit" },
      { question: "Baroka's wrestling match is meant to show...", options: ["His physical vitality", "His weakness", "His anger", "His boredom"], correct_answer: "His physical vitality" },
      { question: "What literary device is the title 'The Lion and the Jewel'?", options: ["Metaphor", "Simile", "Irony", "Personification"], correct_answer: "Metaphor" },
      { question: "Why does Sidi go to Baroka's house?", options: ["To mock him", "To marry him", "To steal from him", "To cook for him"], correct_answer: "To mock him" },
      { question: "At the end of the play, Sidi decides to...", options: ["Marry Baroka", "Marry Lakunle", "Remain single", "Go to Lagos"], correct_answer: "Marry Baroka" },
      { question: "Lakunle's language is characterized by...", options: ["Bombastic vocabulary", "Proverbs", "Silence", "Slang"], correct_answer: "Bombastic vocabulary" },
      { question: "What does the 'Fox' symbolize?", options: ["Cunning", "Speed", "Weakness", "Beauty"], correct_answer: "Cunning" },
      { question: "Who is the 'Favourite'?", options: ["Baroka's current favorite wife", "Sidi", "Sadiku", "Lakunle"], correct_answer: "Baroka's current favorite wife" },
      { question: "The final scene shows Lakunle...", options: ["Dancing with a young girl", "Crying", "Leaving the village", "Fighting Baroka"], correct_answer: "Dancing with a young girl" },
      { question: "What does Baroka hate about modern life?", options: ["Sameness", "Speed", "Money", "Noise"], correct_answer: "Sameness" },
      { question: "The 'stamp machine' is a symbol of...", options: ["Technological adaptation", "Destruction", "Wealth", "War"], correct_answer: "Technological adaptation" },
      { question: "Who says 'Old wine thrives best in a new bottle'?", options: ["Baroka", "Lakunle", "Sidi", "Sadiku"], correct_answer: "Baroka" },
      { question: "What prevents Lakunle from paying the bride price?", options: ["His principles", "Poverty", "Baroka", "Sidi's father"], correct_answer: "His principles" },
      { question: "Sidi compares her fame to...", options: ["The sun", "A river", "A mountain", "A tree"], correct_answer: "The sun" },
      { question: "What does Lakunle threaten to do if he has to pay bride price?", options: ["Die a bachelor", "Run away", "Steal the money", "Marry Sadiku"], correct_answer: "Die a bachelor" },
      { question: "The wrestlers represent...", options: ["Traditional strength", "War", "Modern sports", "Slavery"], correct_answer: "Traditional strength" },
      { question: "Who invites Lakunle to the wedding feast?", options: ["Sidi", "Baroka", "Sadiku", "Nobody"], correct_answer: "Sidi" },
      { question: "The genre of the play is...", options: ["Comedy", "Tragedy", "Melodrama", "Farce"], correct_answer: "Comedy" },
      { question: "What does Lakunle object to regarding Sidi's appearance?", options: ["Her exposed shoulders", "Her hair", "Her height", "Her shoes"], correct_answer: "Her exposed shoulders" },
      { question: "How does Baroka win Sidi?", options: ["Through wit and psychology", "By force", "With money", "With magic"], correct_answer: "Through wit and psychology" },
      { question: "What is the climax of the play?", options: ["The seduction scene", "The dance", "Lakunle's proposal", "Sadiku's dance"], correct_answer: "The seduction scene" },
      { question: "What does the magazine description of Baroka say?", options: ["He is the village chief", "He is a villain", "He is old", "He is a god"], correct_answer: "He is the village chief" },
      { question: "Who helps dress Sidi for the wedding?", options: ["Sadiku", "Lakunle", "The Favourite", "Her mother"], correct_answer: "Sadiku" },
      { question: "What is the significance of the mummers?", options: ["They reenact events", "They are ghosts", "They are soldiers", "They are farmers"], correct_answer: "They reenact events" },
      { question: "What is the relationship between Baroka and Sadiku?", options: ["Husband and Head Wife", "Father and Daughter", "Brother and Sister", "Master and Slave"], correct_answer: "Husband and Head Wife" },
      { question: "Why does Lakunle kiss Sidi?", options: ["To teach her civilized romance", "Because he is drunk", "To mock her", "To say goodbye"], correct_answer: "To teach her civilized romance" },
      { question: "What does Sidi offer Lakunle at the end?", options: ["A chance to eat at the feast", "Marriage", "Money", "The magazine"], correct_answer: "A chance to eat at the feast" },
      { question: "The primary theme is...", options: ["Tradition vs Modernity", "War vs Peace", "Love vs Hate", "Life vs Death"], correct_answer: "Tradition vs Modernity" },
      { question: "Who is the playwright?", options: ["Wole Soyinka", "Chinua Achebe", "J.P. Clark", "Ola Rotimi"], correct_answer: "Wole Soyinka" },
      { question: "What does Lakunle carry?", options: ["A concise encyclopedia", "A gun", "A hoe", "A yam"], correct_answer: "A concise encyclopedia" }
    ]
  },

  // 2. SECOND CLASS CITIZEN (Prose - African)
  {
    book_title: "Second Class Citizen",
    genre: "Prose",
    category: "African",
    author: "Buchi Emecheta",
    questions: [
      { question: "The protagonist's full name is...", options: ["Adah Ofili", "Buchi Emecheta", "Titi Obi", "Nnu Ego"], correct_answer: "Adah Ofili" },
      { question: "Adah's childhood dream was to...", options: ["Go to the United Kingdom", "Become a lawyer", "Marry a rich man", "Own a school"], correct_answer: "Go to the United Kingdom" },
      { question: "What is the 'Presence' Adah feels?", options: ["Her father's spirit", "God", "A ghost", "Her fear"], correct_answer: "Her father's spirit" },
      { question: "Why was Adah born 'at the wrong time'?", options: ["Her parents wanted a boy", "It was during the war", "It was a famine", "She was sick"], correct_answer: "Her parents wanted a boy" },
      { question: "Who is Lawyer Nweze?", options: ["The first man in Ibuza to go to England", "Adah's husband", "Her teacher", "A politician"], correct_answer: "The first man in Ibuza to go to England" },
      { question: "How did Adah get the money for the Common Entrance exam?", options: ["She stole 2 shillings", "She worked on a farm", "Her mother gave it", "Francis paid"], correct_answer: "She stole 2 shillings" },
      { question: "Adah marries Francis primarily because...", options: ["It enables her to study", "She loves him deeply", "He is rich", "Her parents forced her"], correct_answer: "It enables her to study" },
      { question: "Where does Adah work in Nigeria?", options: ["American Consulate Library", "British Embassy", "A Bank", "A School"], correct_answer: "American Consulate Library" },
      { question: "Why does Francis go to England first?", options: ["His family insists", "Adah pays for him", "He got a scholarship", "He ran away"], correct_answer: "Adah pays for him" },
      { question: "The title 'Second Class Citizen' refers to...", options: ["Her status in England", "Her flight ticket", "Her school grade", "Her village rank"], correct_answer: "Her status in England" },
      { question: "On arrival in Liverpool, Adah is disappointed by...", options: ["The gray, cloudy weather", "Francis's appearance", "The food", "The airport"], correct_answer: "The gray, cloudy weather" },
      { question: "Their first residence in London is at...", options: ["Ashdown Street", "Willesden", "Camden", "Chelsea"], correct_answer: "Ashdown Street" },
      { question: "Adah's first child is named...", options: ["Titi", "Vicky", "Bubu", "Dada"], correct_answer: "Titi" },
      { question: "Who is Trudy?", options: ["The child-minder", "Adah's boss", "Francis's girlfriend", "A neighbor"], correct_answer: "The child-minder" },
      { question: "Why does Adah dislike Trudy?", options: ["She neglects the children", "She is racist", "She steals", "She is rude"], correct_answer: "She neglects the children" },
      { question: "What illness does Vicky contract?", options: ["Meningitis", "Malaria", "Flu", "Measles"], correct_answer: "Meningitis" },
      { question: "Who is Mr. Noble?", options: ["A Nigerian landlord", "Adah's boss", "A doctor", "A pastor"], correct_answer: "A Nigerian landlord" },
      { question: "Mr. Noble is mocked by the community because...", options: ["He failed to become a lawyer", "He is poor", "He is a criminal", "He is white"], correct_answer: "He failed to become a lawyer" },
      { question: "What does 'Pa' refer to?", options: ["Mr. Noble", "Francis", "Adah's father", "The British"], correct_answer: "Mr. Noble" },
      { question: "Francis believes a woman's duty is to...", options: ["Bear children and serve", "Work and earn", "Be educated", "Travel"], correct_answer: "Bear children and serve" },
      { question: "What creates the major conflict between Adah and Francis?", options: ["Francis's laziness and abuse", "Money", "Religion", "Politics"], correct_answer: "Francis's laziness and abuse" },
      { question: "Adah works in London at...", options: ["North Finchley Library", "A factory", "A hospital", "A restaurant"], correct_answer: "North Finchley Library" },
      { question: "What birth control method does Adah try?", options: ["The Cap", "Pills", "Abstinence", "Surgery"], correct_answer: "The Cap" },
      { question: "How does Francis react to the birth control?", options: ["He beats her", "He agrees", "He doesn't care", "He laughs"], correct_answer: "He beats her" },
      { question: "Adah writes a novel titled...", options: ["The Bride Price", "London Dreams", "My Life", "Freedom"], correct_answer: "The Bride Price" },
      { question: "What does Francis do to Adah's manuscript?", options: ["He burns it", "He publishes it", "He hides it", "He edits it"], correct_answer: "He burns it" },
      { question: "Francis repeatedly fails his exams in...", options: ["Accountancy", "Law", "Medicine", "Engineering"], correct_answer: "Accountancy" },
      { question: "Why are they evicted from Ashdown Street?", options: ["The landlord wanted white tenants", "They didn't pay rent", "They were too loud", "Fire"], correct_answer: "The landlord wanted white tenants" },
      { question: "Where does Adah eventually find a flat?", options: ["The Ditch (Council housing)", "Kensington", "Manchester", "Liverpool"], correct_answer: "The Ditch (Council housing)" },
      { question: "What gift does Adah give Francis for Christmas?", options: ["A nightshirt", "A watch", "Money", "A book"], correct_answer: "A nightshirt" },
      { question: "Who is Bill?", options: ["Adah's colleague", "Francis's friend", "The landlord", "A doctor"], correct_answer: "Adah's colleague" },
      { question: "What language does Adah speak?", options: ["Igbo", "Yoruba", "Hausa", "Efik"], correct_answer: "Igbo" },
      { question: "Francis calls Adah's writing...", options: ["Rubbish", "Masterpiece", "Okay", "Profitable"], correct_answer: "Rubbish" },
      { question: "Why does Adah not tell her colleagues about her children initially?", options: ["Fear of losing her job/foster care stigma", "She forgot", "Francis told her not to", "She hates them"], correct_answer: "Fear of losing her job/foster care stigma" },
      { question: "The 'Recycled' shirt incident involves...", options: ["Adah making clothes for the kids", "Francis stealing a shirt", "Adah buying second hand", "A gift"], correct_answer: "Adah making clothes for the kids" },
      { question: "What does Francis threaten Adah with at the end?", options: ["A knife", "A gun", "Juju", "Deportation"], correct_answer: "A knife" },
      { question: "In court, Francis claims...", options: ["They were never married", "He loves her", "She is crazy", "He is rich"], correct_answer: "They were never married" },
      { question: "Adah's final realization is that...", options: ["Her children are her priority", "She needs a man", "She hates England", "She must return home"], correct_answer: "Her children are her priority" },
      { question: "Who helps Adah during her fourth labor?", options: ["Nobody/She goes alone", "Francis", "Trudy", "Her mother"], correct_answer: "Nobody/She goes alone" },
      { question: "What is the name of Adah's brother?", options: ["Boy", "Obi", "Chike", "Eze"], correct_answer: "Boy" },
      { question: "Francis burns the manuscript because...", options: ["He is jealous/control", "It was bad", "It was an accident", "It was cold"], correct_answer: "He is jealous/control" },
      { question: "The novel explores themes of...", options: ["Patriarchy and Immigration", "War", "Farming", "Sports"], correct_answer: "Patriarchy and Immigration" },
      { question: "Who are the Babalolas?", options: ["Neighbors", "Cousins", "Doctors", "Teachers"], correct_answer: "Neighbors" },
      { question: "Adah compares herself to...", options: ["The biblical Lazarus", "A queen", "A bird", "A lion"], correct_answer: "The biblical Lazarus" },
      { question: "What does Adah buy Francis that he mocks?", options: ["A cap", "Shoes", "A tie", "A belt"], correct_answer: "A cap" },
      { question: "How many children does Adah have by the end?", options: ["Five", "Three", "Six", "Two"], correct_answer: "Five" },
      { question: "What does Adah refuse to do in the hospital?", options: ["Sterilization", "Eat", "Sleep", "Leave"], correct_answer: "Sterilization" },
      { question: "What is the symbol of Adah's liberation?", options: ["Her paycheck/Independent flat", "Her passport", "A car", "A ring"], correct_answer: "Her paycheck/Independent flat" },
      { question: "The novel is largely...", options: ["Autobiographical", "Fiction", "Fantasy", "Sci-Fi"], correct_answer: "Autobiographical" },
      { question: "Adah is often described as...", options: ["Resilient", "Weak", "Lazy", "Cruel"], correct_answer: "Resilient" }
    ]
  },

  // 3. UNEXPECTED JOY AT DAWN (Prose - African)
  {
    book_title: "Unexpected Joy at Dawn",
    genre: "Prose",
    category: "African",
    author: "Alex Agyei-Agyiri",
    questions: [
      { question: "The novel is set against the backdrop of...", options: ["The 1983 Alien Compliance Order", "Independence", "Civil War", "Apartheid"], correct_answer: "The 1983 Alien Compliance Order" },
      { question: "The male protagonist is...", options: ["Nii Tackie", "Aaron", "Joe", "Ibuk"], correct_answer: "Nii Tackie" },
      { question: "The female protagonist is...", options: ["Mama Orojo", "Massa", "Marshak", "Ibuk"], correct_answer: "Mama Orojo" },
      { question: "Nii Tackie lives in...", options: ["Accra, Ghana", "Lagos, Nigeria", "Togo", "Benin"], correct_answer: "Accra, Ghana" },
      { question: "Mama Orojo lives in...", options: ["Lagos, Nigeria", "Accra", "London", "Kano"], correct_answer: "Lagos, Nigeria" },
      { question: "Nii Tackie is of... decent.", options: ["Nigerian", "Ghanaian", "Togolese", "British"], correct_answer: "Nigerian" },
      { question: "Nii works as...", options: ["An Assistant Bank Manager", "A teacher", "A miner", "A driver"], correct_answer: "An Assistant Bank Manager" },
      { question: "Mama Orojo is looking for...", options: ["Her lost brother", "Her husband", "Gold", "Her father"], correct_answer: "Her lost brother" },
      { question: "What business does Mama Orojo do?", options: ["Construction/Textiles", "Farming", "Teaching", "Banking"], correct_answer: "Construction/Textiles" },
      { question: "Who is Massa?", options: ["Nii's sick girlfriend", "Mama Orojo's sister", "A doctor", "A trader"], correct_answer: "Nii's sick girlfriend" },
      { question: "What is the 'Ant Hill'?", options: ["A brick project", "A mountain", "A club", "A farm"], correct_answer: "A brick project" },
      { question: "Who is Joe?", options: ["An illegal gold dealer", "A policeman", "Nii's brother", "A pastor"], correct_answer: "An illegal gold dealer" },
      { question: "The phrase 'Visa Sahur' implies...", options: ["A mystical/struggle-filled migration", "A legal document", "A plane ticket", "A festival"], correct_answer: "A mystical/struggle-filled migration" },
      { question: "What happens to Massa?", options: ["She dies", "She recovers", "She marries Nii", "She travels"], correct_answer: "She dies" },
      { question: "Why does Mama Orojo go to Ghana?", options: ["To find Nii", "To buy gold", "Tourism", "To flee Nigeria"], correct_answer: "To find Nii" },
      { question: "Nii travels to Nigeria to...", options: ["Trace his roots/Find family", "Get rich", "Escape police", "Study"], correct_answer: "Trace his roots/Find family" },
      { question: "Who is Aaron Tsuru?", options: ["Project Manager/Nii's friend", "A doctor", "A soldier", "A thief"], correct_answer: "Project Manager/Nii's friend" },
      { question: "What identifies Nii as Nigerian?", options: ["Tribal marks", "His name", "His ID", "His language"], correct_answer: "Tribal marks" },
      { question: "Who is Ibuk?", options: ["Mama Orojo's friend/tenant", "Nii's boss", "A nurse", "A driver"], correct_answer: "Mama Orojo's friend/tenant" },
      { question: "Marshak is...", options: ["A prostitute Nii meets", "His sister", "His wife", "A teacher"], correct_answer: "A prostitute Nii meets" },
      { question: "How does Nii enter Nigeria?", options: ["Illegally via bush paths", "By plane", "By bus legally", "By boat"], correct_answer: "Illegally via bush paths" },
      { question: "What tragic duty does Nii perform on the journey?", options: ["Burying a corpse", "Fighting soldiers", "Driving", "Cooking"], correct_answer: "Burying a corpse" },
      { question: "What church does Mama Orojo attend?", options: ["Amen Kristi", "Catholic", "Anglican", "Pentecostal"], correct_answer: "Amen Kristi" },
      { question: "The 'unexpected joy' is...", options: ["The reunion of siblings", "Finding gold", "Winning lottery", "Leaving Africa"], correct_answer: "The reunion of siblings" },
      { question: "Who chases Mama Orojo in Ghana?", options: ["Joe", "Police", "Robbers", "Soldiers"], correct_answer: "Joe" },
      { question: "What happens to Marshak?", options: ["She dies", "She marries Nii", "She travels", "She becomes rich"], correct_answer: "She dies" },
      { question: "The novel criticizes...", options: ["Xenophobia and borders", "Education", "Religion", "Technology"], correct_answer: "Xenophobia and borders" },
      { question: "What saves Nii from the mob in Lagos?", options: ["Speaking Yoruba/Hausa", "Running", "Police", "Money"], correct_answer: "Speaking Yoruba/Hausa" },
      { question: "Who proposes to Mama Orojo?", options: ["Joe", "Aaron", "Nii", "Tom"], correct_answer: "Joe" },
      { question: "Does Mama Orojo accept Joe?", options: ["Yes", "No", "Maybe", "Later"], correct_answer: "Yes" },
      { question: "What is the Beyon?", options: ["A spiritual leader", "A place", "A book", "A song"], correct_answer: "A spiritual leader" },
      { question: "Where do the siblings meet?", options: ["In a burning house", "At the border", "In a church", "In a bank"], correct_answer: "In a burning house" },
      { question: "Nii works in Lagos as a...", options: ["Laborer", "Banker", "Teacher", "Driver"], correct_answer: "Laborer" },
      { question: "What connects Ghana and Nigeria?", options: ["Migration history", "War", "A river", "A bridge"], correct_answer: "Migration history" },
      { question: "What does the gold ring signify?", options: ["Identity/Love", "Wealth", "Power", "Magic"], correct_answer: "Identity/Love" },
      { question: "Tally O is...", options: ["An armed robber", "A friend", "A priest", "A soldier"], correct_answer: "An armed robber" },
      { question: "The novel spans how many years of separation?", options: ["15", "5", "20", "10"], correct_answer: "15" },
      { question: "What happens to the Ant Hill project?", options: ["It fails", "It succeeds", "It burns", "It is sold"], correct_answer: "It fails" },
      { question: "Who helps Nii bury the corpse?", options: ["Aaron", "Joe", "Marshak", "Nobody"], correct_answer: "Aaron" },
      { question: "What is the theme?", options: ["Pan-Africanism vs Xenophobia", "Feminism", "Corruption", "Sport"], correct_answer: "Pan-Africanism vs Xenophobia" },
      { question: "Nii's full name is...", options: ["Moses Nii Tackie", "John Nii", "Kwame Nii", "Obi Nii"], correct_answer: "Moses Nii Tackie" },
      { question: "The ending is...", options: ["Hopeful", "Tragic", "Ambiguous", "Sad"], correct_answer: "Hopeful" },
      { question: "Mama Orojo lives in...", options: ["Ijase", "Ikeja", "Victoria Island", "Surulere"], correct_answer: "Ijase" },
      { question: "The deadline given to aliens was...", options: ["Two weeks", "One month", "One year", "Two days"], correct_answer: "Two weeks" },
      { question: "Who dies in the hotel room?", options: ["Marshak", "Massa", "Ibuk", "Joe"], correct_answer: "Marshak" },
      { question: "The 'Dawn' in the title symbolizes...", options: ["New beginnings", "Morning", "Waking up", "The sun"], correct_answer: "New beginnings" },
      { question: "Nii is often described as...", options: ["Alienated", "Happy", "Rich", "Powerful"], correct_answer: "Alienated" },
      { question: "What happens at the border?", options: ["Chaos/Bribery", "Peace", "Order", "Nothing"], correct_answer: "Chaos/Bribery" },
      { question: "The 1983 order affected...", options: ["Ghanaians in Nigeria", "Nigerians in Ghana", "Togolese", "Americans"], correct_answer: "Ghanaians in Nigeria" },
      { question: "The book advocates for...", options: ["African Unity", "War", "Separation", "Colonialism"], correct_answer: "African Unity" }
    ]
  },

  // 4. LOOK BACK IN ANGER (Drama - Non-African)
  {
    book_title: "Look Back in Anger",
    genre: "Drama",
    category: "Non-African",
    author: "John Osborne",
    questions: [
      { question: "The protagonist is...", options: ["Jimmy Porter", "Cliff Lewis", "Alison", "Helena"], correct_answer: "Jimmy Porter" },
      { question: "Jimmy plays the...", options: ["Trumpet", "Guitar", "Piano", "Drums"], correct_answer: "Trumpet" },
      { question: "The play is set in...", options: ["The Midlands", "London", "Paris", "New York"], correct_answer: "The Midlands" },
      { question: "Jimmy belongs to the... class.", options: ["Working", "Upper", "Middle", "Aristocrat"], correct_answer: "Working" },
      { question: "Alison's father is...", options: ["Colonel Redfern", "A Priest", "A Banker", "A Politician"], correct_answer: "Colonel Redfern" },
      { question: "Jimmy runs a... stall.", options: ["Sweet", "Fruit", "Vegetable", "Book"], correct_answer: "Sweet" },
      { question: "Who is Cliff Lewis?", options: ["Jimmy's friend/lodger", "Alison's brother", "The landlord", "A rival"], correct_answer: "Jimmy's friend/lodger" },
      { question: "The 'Game' Jimmy and Alison play involves...", options: ["Bears and Squirrels", "Cats and Dogs", "Lions and Lambs", "Kings and Queens"], correct_answer: "Bears and Squirrels" },
      { question: "Jimmy hates Sundays because...", options: ["They are boring/bourgeois", "He works", "He goes to church", " shops close"], correct_answer: "They are boring/bourgeois" },
      { question: "Alison keeps a secret that...", options: ["She is pregnant", "She is leaving", "She is sick", "She cheated"], correct_answer: "She is pregnant" },
      { question: "Who is Helena Charles?", options: ["Alison's actress friend", "Jimmy's sister", "The maid", "A neighbor"], correct_answer: "Alison's actress friend" },
      { question: "Jimmy describes Alison's family as...", options: ["Pusillanimous and sycophantic", "Brave", "Kind", "Poor"], correct_answer: "Pusillanimous and sycophantic" },
      { question: "Who calls Alison's father to pick her up?", options: ["Helena", "Cliff", "Jimmy", "Mrs. Drury"], correct_answer: "Helena" },
      { question: "What happens to Alison's baby?", options: ["She miscarries", "It is born", "She adopts", "It dies at birth"], correct_answer: "She miscarries" },
      { question: "Jimmy's anger is directed at...", options: ["The British Establishment/Apathy", "War", "Money", "Food"], correct_answer: "The British Establishment/Apathy" },
      { question: "Who funded the sweet stall?", options: ["Hugh's mother", "Alison's dad", "Jimmy", "Cliff"], correct_answer: "Hugh's mother" },
      { question: "The ironing board symbolizes...", options: ["Domestic drudgery", "Wealth", "Love", "Peace"], correct_answer: "Domestic drudgery" },
      { question: "Colonel Redfern served in...", options: ["India", "Africa", "France", "China"], correct_answer: "India" },
      { question: "Jimmy claims there are no...", options: ["Good, brave causes left", "Jobs", "Women", "Friends"], correct_answer: "Good, brave causes left" },
      { question: "Who is Madeline?", options: ["Jimmy's first love", "His mother", "Alison's sister", "A neighbor"], correct_answer: "Jimmy's first love" },
      { question: "Helena falls in love with...", options: ["Jimmy", "Cliff", "The Colonel", "Hugh"], correct_answer: "Jimmy" },
      { question: "Why does Helena leave?", options: ["Alison returns", "She hates Jimmy", "She got a job", "Cliff asks her"], correct_answer: "Alison returns" },
      { question: "What defines the 'Angry Young Men'?", options: ["Disillusionment", "Happiness", "Wealth", "Patriotism"], correct_answer: "Disillusionment" },
      { question: "Jimmy watched his father...", options: ["Die for months", "Win a war", "Leave", "Work"], correct_answer: "Die for months" },
      { question: "What does Jimmy compare Alison to?", options: ["A python", "A mouse", "A bird", "A fish"], correct_answer: "A python" },
      { question: "Cliff decides to...", options: ["Leave", "Marry Helena", "Fight Jimmy", "Buy the stall"], correct_answer: "Leave" },
      { question: "The play takes place in a...", options: ["One-room attic flat", "Mansion", "Basement", "Hotel"], correct_answer: "One-room attic flat" },
      { question: "How does Jimmy treat Cliff?", options: ["Affectionately rough", "Hateful", "Cold", "Polite"], correct_answer: "Affectionately rough" },
      { question: "The church bells represent...", options: ["Middle-class morality/Annoyance", "Peace", "God", "Time"], correct_answer: "Middle-class morality/Annoyance" },
      { question: "Who acts as peacemaker?", options: ["Cliff", "Helena", "Alison", "Jimmy"], correct_answer: "Cliff" },
      { question: "Jimmy wants Alison to have a...", options: ["Great suffering/Child death", "Happy life", "New car", "Job"], correct_answer: "Great suffering/Child death" },
      { question: "What era is the play?", options: ["Post-WWII/1950s", "Victorian", "Modern", "1920s"], correct_answer: "Post-WWII/1950s" },
      { question: "Who is 'Lady Pusillanimous'?", options: ["Alison", "Helena", "The Queen", "Mrs. Drury"], correct_answer: "Alison" },
      { question: "Jimmy's mother is described as...", options: ["Pious and indifferent", "Loving", "Rich", "Dead"], correct_answer: "Pious and indifferent" },
      { question: "What does Helena do when Alison leaves?", options: ["Moves in with Jimmy", "Leaves too", "Calls police", "Cries"], correct_answer: "Moves in with Jimmy" },
      { question: "Does Alison tell Jimmy she is pregnant before leaving?", options: ["No", "Yes", "Through Cliff", "Through Helena"], correct_answer: "No" },
      { question: "Jimmy's language is...", options: ["Vituperative/Articulate", "Simple", "Silent", "Confused"], correct_answer: "Vituperative/Articulate" },
      { question: "Who is Nigel?", options: ["Alison's brother", "Jimmy's friend", "The landlord", "A politician"], correct_answer: "Alison's brother" },
      { question: "The ending suggests...", options: ["A fragile reconciliation in fantasy", "Divorce", "Death", "Murder"], correct_answer: "A fragile reconciliation in fantasy" },
      { question: "Jimmy refers to Alison as...", options: ["The Squirrel", "The Bear", "The Rat", "The Cat"], correct_answer: "The Squirrel" },
      { question: "Jimmy refers to himself as...", options: ["The Bear", "The Squirrel", "The Lion", "The Dog"], correct_answer: "The Bear" },
      { question: "Alison describes Jimmy as a...", options: ["Knight in shining armor (ironic)", "Monster", "Saint", "Child"], correct_answer: "Knight in shining armor (ironic)" },
      { question: "Who helps Alison pack?", options: ["Helena", "Cliff", "Jimmy", "Her dad"], correct_answer: "Helena" },
      { question: "What does Jimmy read constantly?", options: ["Newspapers", "Bible", "Comics", "Novels"], correct_answer: "Newspapers" },
      { question: "The tone is...", options: ["Realistic/Gritty", "Romantic", "Fantasy", "Joyful"], correct_answer: "Realistic/Gritty" },
      { question: "Why did Jimmy marry Alison?", options: ["Revenge against her class", "Money", "Status", "Pity"], correct_answer: "Revenge against her class" },
      { question: "The play revolutionized...", options: ["British Theatre", "Cinema", "Music", "Art"], correct_answer: "British Theatre" },
      { question: "Where does Alison go?", options: ["Her parents' home", "Paris", "America", "London"], correct_answer: "Her parents' home" },
      { question: "What does Cliff buy?", options: ["Cigarettes/Sweet stall", "A car", "A house", "Clothes"], correct_answer: "Cigarettes/Sweet stall" },
      { question: "The central theme is...", options: ["Class conflict/Alienation", "War", "Nature", "Religion"], correct_answer: "Class conflict/Alienation" }
    ]
  },

  // 5. WUTHERING HEIGHTS (Prose - Non-African)
  {
    book_title: "Wuthering Heights",
    genre: "Prose",
    category: "Non-African",
    author: "Emily Brontë",
    questions: [
      { question: "The male protagonist is...", options: ["Heathcliff", "Edgar", "Lockwood", "Hindley"], correct_answer: "Heathcliff" },
      { question: "The female protagonist is...", options: ["Catherine Earnshaw", "Isabella", "Cathy", "Nelly"], correct_answer: "Catherine Earnshaw" },
      { question: "The Earnshaw estate is called...", options: ["Wuthering Heights", "Thrushcross Grange", "Downton", "Gimmerton"], correct_answer: "Wuthering Heights" },
      { question: "The Linton estate is called...", options: ["Thrushcross Grange", "Wuthering Heights", "London", "The Manor"], correct_answer: "Thrushcross Grange" },
      { question: "Heathcliff was found in...", options: ["Liverpool", "London", "Leeds", "Manchester"], correct_answer: "Liverpool" },
      { question: "Who found Heathcliff?", options: ["Mr. Earnshaw", "Hindley", "Edgar", "Joseph"], correct_answer: "Mr. Earnshaw" },
      { question: "The primary narrator is...", options: ["Nelly Dean", "Catherine", "Heathcliff", "Isabella"], correct_answer: "Nelly Dean" },
      { question: "The tenant narrator is...", options: ["Lockwood", "Edgar", "Hareton", "Zillah"], correct_answer: "Lockwood" },
      { question: "Hindley hates Heathcliff because...", options: ["His father favored Heathcliff", "He is ugly", "He stole money", "He is weak"], correct_answer: "His father favored Heathcliff" },
      { question: "Catherine marries...", options: ["Edgar Linton", "Heathcliff", "Hindley", "Lockwood"], correct_answer: "Edgar Linton" },
      { question: "Why does Catherine marry Edgar?", options: ["Social status", "Deep love", "Money only", "Fear"], correct_answer: "Social status" },
      { question: "Who says 'I am Heathcliff'?", options: ["Catherine", "Isabella", "Cathy", "Nelly"], correct_answer: "Catherine" },
      { question: "Heathcliff marries...", options: ["Isabella Linton", "Catherine", "Frances", "Zillah"], correct_answer: "Isabella Linton" },
      { question: "Why does Heathcliff marry Isabella?", options: ["Revenge on Edgar", "Love", "Money", "Pity"], correct_answer: "Revenge on Edgar" },
      { question: "Hareton is the son of...", options: ["Hindley", "Heathcliff", "Edgar", "Nelly"], correct_answer: "Hindley" },
      { question: "Linton is the son of...", options: ["Heathcliff and Isabella", "Edgar and Catherine", "Hindley", "Nelly"], correct_answer: "Heathcliff and Isabella" },
      { question: "Young Cathy is the daughter of...", options: ["Edgar and Catherine", "Heathcliff", "Hindley", "Nelly"], correct_answer: "Edgar and Catherine" },
      { question: "How does Catherine die?", options: ["Childbirth/Brain fever", "Murder", "Suicide", "Old age"], correct_answer: "Childbirth/Brain fever" },
      { question: "Heathcliff seeks to...", options: ["Destroy both families", "Make peace", "Get rich", "Leave"], correct_answer: "Destroy both families" },
      { question: "Who forces Cathy to marry Linton?", options: ["Heathcliff", "Edgar", "Nelly", "Joseph"], correct_answer: "Heathcliff" },
      { question: "Joseph is...", options: ["A religious servant", "A doctor", "A lawyer", "A tenant"], correct_answer: "A religious servant" },
      { question: "The weather symbolizes...", options: ["Turbulent emotions", "Peace", "Growth", "Death"], correct_answer: "Turbulent emotions" },
      { question: "Lockwood sees a...", options: ["Ghost at the window", "Fire", "Dog", "Cat"], correct_answer: "Ghost at the window" },
      { question: "Heathcliff dies of...", options: ["Starvation/Madness", "Old age", "Murder", "Accident"], correct_answer: "Starvation/Madness" },
      { question: "Heathcliff is buried...", options: ["Next to Catherine", "In London", "At the Grange", "In Liverpool"], correct_answer: "Next to Catherine" },
      { question: "Who teaches Hareton to read?", options: ["Young Cathy", "Heathcliff", "Nelly", "Joseph"], correct_answer: "Young Cathy" },
      { question: "Wuthering Heights ends with...", options: ["Hareton and Cathy together", "Tragedy", "Fire", "War"], correct_answer: "Hareton and Cathy together" },
      { question: "What does 'Wuthering' mean?", options: ["Windy/Turbulent", "Warm", "High", "Low"], correct_answer: "Windy/Turbulent" },
      { question: "Frances is...", options: ["Hindley's wife", "Heathcliff's wife", "Edgar's wife", "A servant"], correct_answer: "Hindley's wife" },
      { question: "How long is Heathcliff gone?", options: ["3 years", "1 year", "10 years", "5 years"], correct_answer: "3 years" },
      { question: "What happens to Isabella's dog?", options: ["Heathcliff hangs it", "It runs away", "It bites", "It dies"], correct_answer: "Heathcliff hangs it" },
      { question: "Zillah is...", options: ["A servant", "A guest", "A relative", "A doctor"], correct_answer: "A servant" },
      { question: "Heathcliff and Catherine are...", options: ["Soulmates", "Enemies", "Strangers", "Cousins"], correct_answer: "Soulmates" },
      { question: "Why does Lockwood leave?", options: ["He is spooked", "He is broke", "He marries", "He is sick"], correct_answer: "He is spooked" },
      { question: "The novel is...", options: ["Gothic", "Comedy", "History", "Sci-Fi"], correct_answer: "Gothic" },
      { question: "The window represents...", options: ["Barrier between life/death", "View", "Glass", "Air"], correct_answer: "Barrier between life/death" },
      { question: "Hindley dies of...", options: ["Alcoholism", "Old age", "Murder", "Accident"], correct_answer: "Alcoholism" },
      { question: "Nelly Dean is the...", options: ["Housekeeper", "Owner", "Guest", "Lady"], correct_answer: "Housekeeper" },
      { question: "Who dies first?", options: ["Mr. Earnshaw", "Catherine", "Heathcliff", "Edgar"], correct_answer: "Mr. Earnshaw" },
      { question: "Heathcliff is haunted by...", options: ["Catherine's ghost", "Police", "Debts", "Hindley"], correct_answer: "Catherine's ghost" },
      { question: "The novel was published in...", options: ["1847", "1900", "1800", "1950"], correct_answer: "1847" },
      { question: "Does Heathcliff find peace?", options: ["Yes, in death", "No", "Maybe", "Unknown"], correct_answer: "Yes, in death" },
      { question: "The moors symbolize...", options: ["Wildness/Freedom", "City", "Order", "School"], correct_answer: "Wildness/Freedom" },
      { question: "Who inherits the properties?", options: ["Hareton and Cathy", "Heathcliff", "Lockwood", "Joseph"], correct_answer: "Hareton and Cathy" },
      { question: "The conflict is between...", options: ["Nature and Culture", "Rich and Poor", "War and Peace", "Man and God"], correct_answer: "Nature and Culture" },
      { question: "Heathcliff is an...", options: ["Anti-hero", "Hero", "Villain only", "Angel"], correct_answer: "Anti-hero" },
      { question: "The source of conflict is...", options: ["Class/Status", "War", "Religion", "Famine"], correct_answer: "Class/Status" },
      { question: "The ending implies...", options: ["Restoration/Peace", "Chaos", "Sadness", "Death"], correct_answer: "Restoration/Peace" },
      { question: "Isabella dies in...", options: ["London", "The Heights", "The Grange", "Paris"], correct_answer: "London" },
      { question: "Linton Heathcliff is...", options: ["Sickly and peevish", "Strong", "Kind", "Brave"], correct_answer: "Sickly and peevish" }
    ]
  },

  // 6. BLACK WOMAN (Senghor)
  {
    book_title: "Black Woman",
    genre: "Poetry",
    category: "African",
    author: "Leopold Sedar Senghor",
    questions: [
      { question: "The central theme is...", options: ["African beauty/Negritude", "War", "Slavery", "Famine"], correct_answer: "African beauty/Negritude" },
      { question: "The poem addresses...", options: ["African Woman", "Europe", "Men", "Nature"], correct_answer: "African Woman" },
      { question: "The dominant color is...", options: ["Black", "White", "Red", "Blue"], correct_answer: "Black" },
      { question: "Senghor founded...", options: ["Negritude", "Modernism", "Realism", "Surrealism"], correct_answer: "Negritude" },
      { question: "The phrase 'Naked woman, black woman' is...", options: ["Repetition", "Irony", "Simile", "Pun"], correct_answer: "Repetition" },
      { question: "The woman is compared to...", options: ["The Promised Land", "A car", "A house", "A star"], correct_answer: "The Promised Land" },
      { question: "The tone is...", options: ["Reverent", "Angry", "Sad", "Fearful"], correct_answer: "Reverent" },
      { question: "'Oil that no breath ruffles' refers to...", options: ["Skin texture", "Cooking oil", "Water", "Fuel"], correct_answer: "Skin texture" },
      { question: "The poem celebrates...", options: ["Natural beauty", "Money", "Clothes", "Make-up"], correct_answer: "Natural beauty" },
      { question: "The instrument mentioned is...", options: ["Tom-tom", "Guitar", "Piano", "Flute"], correct_answer: "Tom-tom" },
      { question: "'Savannah stretching' symbolizes...", options: ["Vastness of Africa", "A farm", "A desert", "A city"], correct_answer: "Vastness of Africa" },
      { question: "The poet wants to fix her beauty before...", options: ["She dies/fades", "She leaves", "She sleeps", "She cries"], correct_answer: "She dies/fades" },
      { question: "The poem is an...", options: ["Ode", "Elegy", "Satire", "Epic"], correct_answer: "Ode" },
      { question: "What replaces the 'flash of spirit'?", options: ["Beauty of flesh", "Money", "War", "Light"], correct_answer: "Beauty of flesh" },
      { question: "The poet is from...", options: ["Senegal", "Nigeria", "Ghana", "Kenya"], correct_answer: "Senegal" },
      { question: "'Gazelle limbs' suggests...", options: ["Grace", "Weakness", "Speed", "Hunger"], correct_answer: "Grace" },
      { question: "The 'sun' represents...", options: ["Life force", "Heat", "Pain", "Fire"], correct_answer: "Life force" },
      { question: "The poet feels...", options: ["Love", "Hate", "Envy", "Pity"], correct_answer: "Love" },
      { question: "The poem implicitly criticizes...", options: ["Colonialism", "Women", "Men", "Art"], correct_answer: "Colonialism" },
      { question: "Her beauty ends in...", options: ["Eternity in Art", "Death", "Dust", "Silence"], correct_answer: "Eternity in Art" }
    ]
  },
  // 7. THE LEADER AND THE LED (Osundare)
  {
    book_title: "The Leader and the Led",
    genre: "Poetry",
    category: "African",
    author: "Niyi Osundare",
    questions: [
      { question: "The poem uses a metaphor of...", options: ["Animals", "Plants", "Cars", "Planets"], correct_answer: "Animals" },
      { question: "The first claimant is the...", options: ["Lion", "Elephant", "Giraffe", "Zebra"], correct_answer: "Lion" },
      { question: "The Lion is rejected for its...", options: ["Paws/Lethality", "Size", "Roar", "Speed"], correct_answer: "Paws/Lethality" },
      { question: "The Elephant is rejected for its...", options: ["Destructiveness", "Size", "Color", "Trunk"], correct_answer: "Destructiveness" },
      { question: "The Giraffe is rejected because...", options: ["Eyes too far from ground", "Too tall", "Too fast", "Too weak"], correct_answer: "Eyes too far from ground" },
      { question: "The Zebra is rejected for...", options: ["Duplicity (Stripes)", "Speed", "Color", "Size"], correct_answer: "Duplicity (Stripes)" },
      { question: "The Rhino creates a...", options: ["Riot", "Party", "Meeting", "Silence"], correct_answer: "Riot" },
      { question: "The poem addresses...", options: ["Leadership crisis", "Zoos", "Farming", "Hunting"], correct_answer: "Leadership crisis" },
      { question: "The solution is...", options: ["Hybrid/Balanced leadership", "No leader", "Foreign leader", "War"], correct_answer: "Hybrid/Balanced leadership" },
      { question: "A leader should be...", options: ["A lamb and a lion", "A snake", "A rock", "A tree"], correct_answer: "A lamb and a lion" },
      { question: "The central device is...", options: ["Allegory", "Irony", "Sonnet", "Haiku"], correct_answer: "Allegory" },
      { question: "The setting is a...", options: ["Forest", "City", "School", "Church"], correct_answer: "Forest" },
      { question: "The tone is...", options: ["Didactic", "Romantic", "Sad", "Funny"], correct_answer: "Didactic" },
      { question: "The 'Led' are...", options: ["Citizens/Followers", "Animals", "Trees", "Hunters"], correct_answer: "Citizens/Followers" },
      { question: "The Warthog is rejected for...", options: ["Ugliness", "Beauty", "Peace", "Speed"], correct_answer: "Ugliness" },
      { question: "Leaders need...", options: ["Balance", "Power", "Money", "Guns"], correct_answer: "Balance" },
      { question: "Osundare is from...", options: ["Nigeria", "Ghana", "Kenya", "Togo"], correct_answer: "Nigeria" },
      { question: "The Forest represents...", options: ["Society/Nation", "Nature", "Park", "World"], correct_answer: "Society/Nation" },
      { question: "The structure is mostly...", options: ["Free verse", "Sonnet", "Haiku", "Limerick"], correct_answer: "Free verse" },
      { question: "The ending calls for...", options: ["Peace", "War", "Separation", "Silence"], correct_answer: "Peace" }
    ]
  },
  // 8. THE GRIEVED LANDS (Neto)
  {
    book_title: "The Grieved Lands",
    genre: "Poetry",
    category: "African",
    author: "Agostinho Neto",
    questions: [
      { question: "Subject of the poem is...", options: ["Colonial oppression", "Love", "Nature", "Music"], correct_answer: "Colonial oppression" },
      { question: "'Grieved Lands' refers to...", options: ["Africa", "Europe", "Asia", "America"], correct_answer: "Africa" },
      { question: "Historical context is...", options: ["Slavery/Imperialism", "WWII", "Independence", "Famine"], correct_answer: "Slavery/Imperialism" },
      { question: "The 'tear' represents...", options: ["Suffering", "Joy", "Rain", "River"], correct_answer: "Suffering" },
      { question: "Neto was president of...", options: ["Angola", "Nigeria", "Ghana", "Kenya"], correct_answer: "Angola" },
      { question: "Tone is...", options: ["Melancholic but hopeful", "Happy", "Angry", "Indifferent"], correct_answer: "Melancholic but hopeful" },
      { question: "'Ancient flowers' symbolize...", options: ["Resilience", "Crops", "Weeds", "Death"], correct_answer: "Resilience" },
      { question: "Cause of grief is...", options: ["Western exploitation", "Drought", "Disease", "War"], correct_answer: "Western exploitation" },
      { question: "The poem emphasizes...", options: ["Endurance", "Surrender", "Flight", "Silence"], correct_answer: "Endurance" },
      { question: "What binds people?", options: ["Shared suffering", "Money", "Language", "Religion"], correct_answer: "Shared suffering" },
      { question: "'Imperishable particles' are...", options: ["African spirit", "Dust", "Sand", "Gold"], correct_answer: "African spirit" },
      { question: "The poem uses...", options: ["Imagery", "Humor", "Dialogue", "Rhyme"], correct_answer: "Imagery" },
      { question: "'Honest blood'...", options: ["Manures the earth", "Wastes", "Sells", "Dries"], correct_answer: "Manures the earth" },
      { question: "The 'dream' is...", options: ["Liberation", "Sleep", "Wealth", "Travel"], correct_answer: "Liberation" },
      { question: "'Shackles' refer to...", options: ["Slavery", "Fashion", "Sports", "Work"], correct_answer: "Slavery" },
      { question: "Poet's nationality is...", options: ["Angolan", "Nigerian", "Ghanaian", "Kenyan"], correct_answer: "Angolan" },
      { question: "The 'sound' is...", options: ["Sorrowful", "Loud", "Quiet", "Happy"], correct_answer: "Sorrowful" },
      { question: "Does it end in despair?", options: ["No, hope", "Yes", "Maybe", "Unknown"], correct_answer: "No, hope" },
      { question: "'Bubbling in the dream' is...", options: ["Life", "Water", "Soup", "Blood"], correct_answer: "Life" },
      { question: "Land is personified as...", options: ["Suffering body", "King", "Machine", "God"], correct_answer: "Suffering body" }
    ]
  },
  // 9. THE SONG OF THE WOMEN OF MY LAND (Sesay)
  {
    book_title: "The Song of the Women of my Land",
    genre: "Poetry",
    category: "African",
    author: "Oumar Farouk Sesay",
    questions: [
      { question: "Subjects are...", options: ["Women", "Soldiers", "Children", "Leaders"], correct_answer: "Women" },
      { question: "The song is about...", options: ["Toil/Resilience", "Love", "War", "Party"], correct_answer: "Toil/Resilience" },
      { question: "What destroys the song?", options: ["Time/Modernity", "Rain", "Fire", "Wind"], correct_answer: "Time/Modernity" },
      { question: "Women are described as...", options: ["Strong", "Weak", "Lazy", "Rich"], correct_answer: "Strong" },
      { question: "Imagery relates to...", options: ["Farming", "Office", "Driving", "Swimming"], correct_answer: "Farming" },
      { question: "Lyrics are...", options: ["Dying", "Loud", "New", "Written"], correct_answer: "Dying" },
      { question: "Replaced by...", options: ["Dirges", "Pop", "Silence", "Laughter"], correct_answer: "Dirges" },
      { question: "Tone is...", options: ["Nostalgic", "Happy", "Excited", "Angry"], correct_answer: "Nostalgic" },
      { question: "Tool mentioned is...", options: ["Pestle", "Computer", "Pen", "Gun"], correct_answer: "Pestle" },
      { question: "Poem preserves...", options: ["Culture", "Food", "Money", "Land"], correct_answer: "Culture" },
      { question: "Poet is from...", options: ["Sierra Leone", "Nigeria", "Ghana", "Togo"], correct_answer: "Sierra Leone" },
      { question: "Women plough the...", options: ["Soil", "Sea", "Sky", "Road"], correct_answer: "Soil" },
      { question: "Land is in...", options: ["Dereliction", "Development", "Flooding", "Nothing"], correct_answer: "Dereliction" },
      { question: "Song is metaphor for...", options: ["Heritage", "Noise", "Money", "Power"], correct_answer: "Heritage" },
      { question: "View of past is...", options: ["Reverent", "Hateful", "Fearful", "Indifferent"], correct_answer: "Reverent" },
      { question: "Stripping lyrics is by...", options: ["Time", "Man", "Animals", "Water"], correct_answer: "Time" },
      { question: "Contrasts...", options: ["Past glory vs Present", "Rich vs Poor", "Men vs Women", "Day vs Night"], correct_answer: "Past glory vs Present" },
      { question: "Tune is...", options: ["Lost", "Found", "Sold", "Bought"], correct_answer: "Lost" },
      { question: "Souls are...", options: ["In soil", "In sky", "In water", "Gone"], correct_answer: "In soil" },
      { question: "Theme is...", options: ["Loss of culture", "Victory", "Marriage", "Education"], correct_answer: "Loss of culture" }
    ]
  },
  // 10. RAIDER OF THE TREASURE TROVE (Worornu)
  {
    book_title: "Raider of the Treasure Trove",
    genre: "Poetry",
    category: "African",
    author: "Lade Worornu",
    questions: [
      { question: "Treasure Trove is...", options: ["Life", "Gold", "Chest", "House"], correct_answer: "Life" },
      { question: "Raider is...", options: ["Death/Rage", "Pirate", "Thief", "Soldier"], correct_answer: "Death/Rage" },
      { question: "Advice is...", options: ["Value life", "Get rich", "Run", "Fight"], correct_answer: "Value life" },
      { question: "Metaphor is...", options: ["Sailing/Flying", "Driving", "Running", "Swimming"], correct_answer: "Sailing/Flying" },
      { question: "Destroys treasure...", options: ["Rage", "Water", "Fire", "Wind"], correct_answer: "Rage" },
      { question: "'Breaching the bar' means...", options: ["Death", "Drinking", "Breaking", "Opening"], correct_answer: "Death" },
      { question: "Tone is...", options: ["Philosophical", "Happy", "Sad", "Angry"], correct_answer: "Philosophical" },
      { question: "Rage compared to...", options: ["Storm", "Friend", "Flower", "Bird"], correct_answer: "Storm" },
      { question: "Destination is...", options: ["Unknown", "Home", "School", "Work"], correct_answer: "Unknown" },
      { question: "Life compared to...", options: ["Journey", "Game", "War", "Market"], correct_answer: "Journey" },
      { question: "Guide vessel with...", options: ["Love/Reason", "Anger", "Greed", "Fear"], correct_answer: "Love/Reason" },
      { question: "Warns against...", options: ["Destructive emotion", "Sailing", "Flying", "Sleeping"], correct_answer: "Destructive emotion" },
      { question: "Sails are...", options: ["Human will", "Cloth", "Paper", "Wings"], correct_answer: "Human will" },
      { question: "Emphasizes...", options: ["Balance", "Chaos", "Speed", "Wealth"], correct_answer: "Balance" },
      { question: "Poet is...", options: ["Ghanaian", "Nigerian", "Kenyan", "British"], correct_answer: "Ghanaian" },
      { question: "Treasure located...", options: ["In soul", "Underground", "In sea", "In bank"], correct_answer: "In soul" },
      { question: "Crash means...", options: ["Waste of life", "Swim", "Walk", "Laugh"], correct_answer: "Waste of life" },
      { question: "Structure...", options: ["Stanzas", "Free verse", "Haiku", "Limerick"], correct_answer: "Stanzas" },
      { question: "Theme...", options: ["Fragility of life", "Money", "Politics", "Nature"], correct_answer: "Fragility of life" },
      { question: "Trove is...", options: ["Collection", "Hole", "Tree", "Rock"], correct_answer: "Collection" }
    ]
  },
  // 11. A GOVERNMENT DRIVER ON HIS RETIREMENT (Chibuike)
  {
    book_title: "A Government Driver on his Retirement",
    genre: "Poetry",
    category: "African",
    author: "Onu Chibuike",
    questions: [
      { question: "Celebrating...", options: ["Retirement", "Birthday", "New car", "Holiday"], correct_answer: "Retirement" },
      { question: "Served for...", options: ["35 years", "30 years", "10 years", "50 years"], correct_answer: "35 years" },
      { question: "Reward is...", options: ["Freedom", "Car", "House", "Money"], correct_answer: "Freedom" },
      { question: "Ending...", options: ["Dies in crash", "Goes home", "Sleeps", "Dances"], correct_answer: "Dies in crash" },
      { question: "Irony is...", options: ["Survives job, dies celebrating", "Rich", "Hates driving", "No car"], correct_answer: "Survives job, dies celebrating" },
      { question: "Faithful servant is...", options: ["Car", "Driver", "Boss", "Road"], correct_answer: "Car" },
      { question: "Crash cause...", options: ["Alcohol", "Bad road", "Brakes", "Rain"], correct_answer: "Alcohol" },
      { question: "Booze is...", options: ["Alcohol", "Food", "Sleep", "Music"], correct_answer: "Alcohol" },
      { question: "Driver felt...", options: ["Liberated", "Sad", "Angry", "Tired"], correct_answer: "Liberated" },
      { question: "Tone shifts...", options: ["Joy to Tragedy", "Sad to Happy", "Angry to Calm", "Fear to Hope"], correct_answer: "Joy to Tragedy" },
      { question: "Criticizes...", options: ["Reckless celebration", "Government", "Cars", "Retirement"], correct_answer: "Reckless celebration" },
      { question: "Symbol of service...", options: ["Steering wheel", "Pen", "Gun", "Hoe"], correct_answer: "Steering wheel" },
      { question: "Poet is...", options: ["Nigerian", "Ghanaian", "Kenyan", "British"], correct_answer: "Nigerian" },
      { question: "Driver is...", options: ["Civil servant", "Soldier", "Doctor", "Teacher"], correct_answer: "Civil servant" },
      { question: "Poem type...", options: ["Narrative", "Sonnet", "Haiku", "Limerick"], correct_answer: "Narrative" },
      { question: "Survived...", options: ["Rigors of driving", "War", "Sickness", "Poverty"], correct_answer: "Rigors of driving" },
      { question: "Undue elation...", options: ["Too much happy", "Sadness", "Fear", "Anger"], correct_answer: "Too much happy" },
      { question: "Destination...", options: ["Grave", "Home", "Bar", "Office"], correct_answer: "Grave" },
      { question: "Theme...", options: ["Irony of life", "Corruption", "Love", "Nature"], correct_answer: "Irony of life" },
      { question: "Faithful servant device...", options: ["Personification", "Simile", "Metaphor", "Irony"], correct_answer: "Personification" }
    ]
  },
  // 12. THE GOOD-MORROW (Donne)
  {
    book_title: "The Good-Morrow",
    genre: "Poetry",
    category: "Non-African",
    author: "John Donne",
    questions: [
      { question: "Type...", options: ["Metaphysical", "Romantic", "Modern", "Victorian"], correct_answer: "Metaphysical" },
      { question: "Theme...", options: ["Spiritual Love", "War", "Nature", "God"], correct_answer: "Spiritual Love" },
      { question: "Good-Morrow means...", options: ["Good Morning", "Goodbye", "Good Night", "Good Luck"], correct_answer: "Good Morning" },
      { question: "Before love...", options: ["Childish sleep", "Work", "Fight", "Travel"], correct_answer: "Childish sleep" },
      { question: "Compared to...", options: ["Seven Sleepers", "Prison", "School", "Grave"], correct_answer: "Seven Sleepers" },
      { question: "Little room is...", options: ["Everywhere", "Prison", "House", "Box"], correct_answer: "Everywhere" },
      { question: "Device 'hemispheres'...", options: ["Conceit", "Simile", "Irony", "Pun"], correct_answer: "Conceit" },
      { question: "Discoverers...", options: ["Let them go", "Follow", "Stop", "Join"], correct_answer: "Let them go" },
      { question: "Love makes them...", options: ["One world", "Rich", "Famous", "Immortal"], correct_answer: "One world" },
      { question: "Equal love...", options: ["Cannot die", "Sleeps", "Eats", "Fights"], correct_answer: "Cannot die" },
      { question: "Tone...", options: ["Intellectual", "Sad", "Angry", "Fearful"], correct_answer: "Intellectual" },
      { question: "Century...", options: ["17th", "19th", "20th", "15th"], correct_answer: "17th" },
      { question: "Sucked on...", options: ["Country pleasures", "Milk", "Farm", "Eat"], correct_answer: "Country pleasures" },
      { question: "Reflection...", options: ["In eyes", "Mirror", "Water", "Glass"], correct_answer: "In eyes" },
      { question: "Maps...", options: ["World", "Treasure", "Star", "City"], correct_answer: "World" },
      { question: "Celebrates...", options: ["Awakening", "Morning", "Travel", "History"], correct_answer: "Awakening" },
      { question: "Microcosm...", options: ["Lovers' world", "Room", "Atom", "Map"], correct_answer: "Lovers' world" },
      { question: "Rhyme?", options: ["Yes", "No", "Some", "AABB"], correct_answer: "Yes" },
      { question: "Theme...", options: ["Unity", "Separate", "Death", "Time"], correct_answer: "Unity" },
      { question: "Weaned...", options: ["Grown", "Fed", "Sleep", "Cry"], correct_answer: "Grown" }
    ]
  },
  // 13. CAGED BIRD (Angelou)
  {
    book_title: "Caged Bird",
    genre: "Poetry",
    category: "Non-African",
    author: "Maya Angelou",
    questions: [
      { question: "Contrast...", options: ["Free vs Caged", "Night vs Day", "Sun vs Rain", "Man vs Woman"], correct_answer: "Free vs Caged" },
      { question: "Caged bird...", options: ["Sings", "Flies", "Sleeps", "Eats"], correct_answer: "Sings" },
      { question: "Free bird...", options: ["Leaps", "Sits", "Cries", "Dies"], correct_answer: "Leaps" },
      { question: "Sings of...", options: ["Freedom", "Love", "Food", "Water"], correct_answer: "Freedom" },
      { question: "Why sing?", options: ["Fear/Longing", "Happy", "Hungry", "Tired"], correct_answer: "Fear/Longing" },
      { question: "Clipped...", options: ["Wings/Feet", "Beak", "Eyes", "Tail"], correct_answer: "Wings/Feet" },
      { question: "Bars of rage...", options: ["Oppression", "Cage", "Prison", "School"], correct_answer: "Oppression" },
      { question: "Free claims...", options: ["Sky", "Cage", "Tree", "Ground"], correct_answer: "Sky" },
      { question: "Allegory for...", options: ["Civil Rights", "Nature", "Pets", "Music"], correct_answer: "Civil Rights" },
      { question: "Tone...", options: ["Desperate", "Happy", "Quiet", "Dead"], correct_answer: "Desperate" },
      { question: "Grave of dreams...", options: ["Cage stand", "Cemetery", "Bed", "Hole"], correct_answer: "Cage stand" },
      { question: "Heard...", options: ["Distant hill", "Cage", "House", "Nowhere"], correct_answer: "Distant hill" },
      { question: "Angelou is...", options: ["American", "British", "Nigerian", "Kenyan"], correct_answer: "American" },
      { question: "Emphasizes...", options: ["Longing", "Watching", "Singing", "Flying"], correct_answer: "Longing" },
      { question: "Shadow shout...", options: ["Caged bird", "Free bird", "Ghost", "Wind"], correct_answer: "Caged bird" },
      { question: "Free thinks of...", options: ["Breeze", "Cage", "Worm", "Sleep"], correct_answer: "Breeze" },
      { question: "Theme...", options: ["Injustice", "Nature", "Pets", "Weather"], correct_answer: "Injustice" },
      { question: "Give up?", options: ["No, sings", "Yes", "Maybe", "Dies"], correct_answer: "No, sings" },
      { question: "Orange sun...", options: ["Free bird", "Caged bird", "Owner", "Nobody"], correct_answer: "Free bird" },
      { question: "Device...", options: ["Imagery", "Irony", "Simile", "Pun"], correct_answer: "Imagery" }
    ]
  },
  // 14. THE JOURNEY OF THE MAGI (Eliot)
  {
    book_title: "The Journey of the Magi",
    genre: "Poetry",
    category: "Non-African",
    author: "T.S. Eliot",
    questions: [
      { question: "Speakers...", options: ["Magi", "Jesus", "Joseph", "Shepherds"], correct_answer: "Magi" },
      { question: "Journey for...", options: ["Baby Jesus", "Gold", "War", "Death"], correct_answer: "Baby Jesus" },
      { question: "Journey was...", options: ["Cold/Hard", "Easy", "Warm", "Short"], correct_answer: "Cold/Hard" },
      { question: "Camels...", options: ["Sore", "Water", "Food", "Riders"], correct_answer: "Sore" },
      { question: "Summer palaces...", options: ["Past luxury", "Heaven", "Destination", "Hotel"], correct_answer: "Past luxury" },
      { question: "Voices said...", options: ["Folly", "Go back", "Hurry", "Sing"], correct_answer: "Folly" },
      { question: "Foreshadows...", options: ["Crucifixion", "Flood", "Exodus", "Creation"], correct_answer: "Crucifixion" },
      { question: "White horse...", options: ["Christ", "Death", "War", "Peace"], correct_answer: "Christ" },
      { question: "Found place?", options: ["Yes", "No", "Maybe", "Lost"], correct_answer: "Yes" },
      { question: "Birth or...", options: ["Death", "Wedding", "Party", "Funeral"], correct_answer: "Death" },
      { question: "Birth hard like...", options: ["Death", "Stone", "Ice", "Iron"], correct_answer: "Death" },
      { question: "Return...", options: ["Alienated", "Celebrate", "Kings", "Die"], correct_answer: "Alienated" },
      { question: "Old dispensation...", options: ["Paganism", "Law", "King", "Camels"], correct_answer: "Paganism" },
      { question: "Tone...", options: ["Reflective", "Joyful", "Angry", "Excited"], correct_answer: "Reflective" },
      { question: "Eliot is...", options: ["Modernist", "Romantic", "Victorian", "Medieval"], correct_answer: "Modernist" },
      { question: "Silken girls...", options: ["Temptation", "Angels", "Daughters", "Wives"], correct_answer: "Temptation" },
      { question: "Season...", options: ["Winter", "Summer", "Spring", "Autumn"], correct_answer: "Winter" },
      { question: "Theme...", options: ["Rebirth", "Travel", "Animals", "Weather"], correct_answer: "Rebirth" },
      { question: "Clutching gods...", options: ["Old beliefs", "Stealing", "Praying", "Fighting"], correct_answer: "Old beliefs" },
      { question: "Glad of...", options: ["Death", "Journey", "Birth", "Gift"], correct_answer: "Death" }
    ]
  },
  // 15. BAT (Lawrence)
  {
    book_title: "Bat",
    genre: "Poetry",
    category: "Non-African",
    author: "David H. Lawrence",
    questions: [
      { question: "Place...", options: ["Florence", "London", "Nigeria", "America"], correct_answer: "Florence" },
      { question: "Time...", options: ["Twilight", "Morning", "Noon", "Midnight"], correct_answer: "Twilight" },
      { question: "Initial desc...", options: ["Swallows", "Eagles", "Butterflies", "Ghosts"], correct_answer: "Swallows" },
      { question: "Emotion...", options: ["Revulsion", "Love", "Admiration", "Fear"], correct_answer: "Revulsion" },
      { question: "Wings like...", options: ["Mice", "Rats", "Birds", "Angels"], correct_answer: "Mice" },
      { question: "Pipistrello...", options: ["Bat", "Bird", "Fly", "Night"], correct_answer: "Bat" },
      { question: "Face like...", options: ["Human", "Dog", "Cat", "Demon"], correct_answer: "Human" },
      { question: "Structure...", options: ["Ponte Vecchio", "Tower", "Bridge", "Taj"], correct_answer: "Ponte Vecchio" },
      { question: "Contrasts with...", options: ["Swallows", "Eagles", "Owls", "Sparrows"], correct_answer: "Swallows" },
      { question: "Tone shifts...", options: ["Peace to Disgust", "Angry to Happy", "Sad to Joy", "Fear to Love"], correct_answer: "Peace to Disgust" },
      { question: "Hang...", options: ["Upside down", "Up", "Side", "Ground"], correct_answer: "Upside down" },
      { question: "Wings...", options: ["Umbrellas", "Paper", "Cloth", "Leaves"], correct_answer: "Umbrellas" },
      { question: "Lawrence is...", options: ["British", "American", "Italian", "French"], correct_answer: "British" },
      { question: "Explores...", options: ["Dark nature", "City", "Art", "History"], correct_answer: "Dark nature" },
      { question: "River...", options: ["Arno", "Thames", "Nile", "Niger"], correct_answer: "Arno" },
      { question: "Fly...", options: ["Madly", "Straight", "Slow", "High"], correct_answer: "Madly" },
      { question: "Prefers...", options: ["Birds", "Bats", "Rats", "Insects"], correct_answer: "Birds" },
      { question: "Theme...", options: ["Perception", "Urban", "Pollution", "Time"], correct_answer: "Perception" },
      { question: "China...", options: ["Happiness", "Death", "Fear", "Gold"], correct_answer: "Happiness" },
      { question: "Style...", options: ["Free verse", "Rhyme", "Sonnet", "Haiku"], correct_answer: "Free verse" }
    ]
  }

];

// ============================================================================
// IMPORT LOGIC (DO NOT MODIFY BELOW THIS LINE)
// ============================================================================

async function importAllQuestions() {
  console.log('📚 Starting Literature Practice Questions Import...');
  console.log(`Total Books/Poems to process: ${QUESTION_BANK.length}\n`);
  
  let successCount = 0;
  let errorCount = 0;
  let totalQuestions = 0;

  for (const bookData of QUESTION_BANK) {
    if (!bookData.book_title || !bookData.questions || !Array.isArray(bookData.questions)) {
      console.error(`❌ Skipping invalid entry: ${bookData.book_title || 'Unknown'}`);
      errorCount++;
      continue;
    }

    console.log(`Processing: ${bookData.book_title}...`);
    
    try {
      const { data, error } = await supabase
        .from('question_sources')
        .insert({
          subject: 'Literature in English',
          topic: `${bookData.genre}: ${bookData.book_title}`,
          content: JSON.stringify(bookData.questions),
          source_type: 'practice_questions',
          is_active: true,
          metadata: {
            imported_at: new Date().toISOString(),
            category: bookData.category,
            author: bookData.author,
            genre: bookData.genre,
            question_count: bookData.questions.length,
            exam_type: 'UTME',
            source: 'JAMB Prescribed Text Questions'
          }
        })
        .select();

      if (error) throw error;
      
      console.log(`   ✅ Imported ${bookData.questions.length} questions`);
      successCount++;
      totalQuestions += bookData.questions.length;

    } catch (err) {
      console.error(`   ❌ Failed: ${bookData.book_title} - ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\n=========================================`);
  console.log(`📊 IMPORT SUMMARY`);
  console.log(`=========================================`);
  console.log(`   ✅ Books/Poems:    ${successCount}`);
  console.log(`   ❓ Total Questions: ${totalQuestions}`);
  console.log(`   ❌ Errors:          ${errorCount}`);
  console.log(`=========================================\n`);
}

importAllQuestions().catch(console.error);

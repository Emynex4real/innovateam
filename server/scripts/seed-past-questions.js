/**
 * Seed script: Populates past_questions table with sample JAMB questions
 * Run: node server/scripts/seed-past-questions.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const supabase = require("../supabaseClient");

const sampleQuestions = [
  // ═══ MATHEMATICS ═══
  {
    exam_body: "jamb",
    exam_year: 2024,
    subject: "Mathematics",
    topic: "Algebra",
    question_text: "If 2x + 3 = 11, find the value of x.",
    options: ["2", "3", "4", "5"],
    correct_answer: "C",
    explanation: "2x + 3 = 11 → 2x = 8 → x = 4",
    difficulty: "easy",
  },
  {
    exam_body: "jamb",
    exam_year: 2024,
    subject: "Mathematics",
    topic: "Algebra",
    question_text: "Solve the quadratic equation: x² - 5x + 6 = 0",
    options: ["x = 2, 3", "x = -2, -3", "x = 1, 6", "x = -1, -6"],
    correct_answer: "A",
    explanation: "x² - 5x + 6 = (x - 2)(x - 3) = 0 → x = 2 or x = 3",
    difficulty: "medium",
  },
  {
    exam_body: "jamb",
    exam_year: 2023,
    subject: "Mathematics",
    topic: "Trigonometry",
    question_text: "If sin θ = 3/5, find cos θ.",
    options: ["4/5", "3/4", "5/3", "5/4"],
    correct_answer: "A",
    explanation:
      "Using sin²θ + cos²θ = 1: cos²θ = 1 - 9/25 = 16/25, cos θ = 4/5",
    difficulty: "medium",
  },
  {
    exam_body: "jamb",
    exam_year: 2023,
    subject: "Mathematics",
    topic: "Statistics",
    question_text: "Find the mean of the numbers: 3, 5, 7, 9, 11.",
    options: ["5", "6", "7", "8"],
    correct_answer: "C",
    explanation: "Mean = (3+5+7+9+11)/5 = 35/5 = 7",
    difficulty: "easy",
  },
  {
    exam_body: "jamb",
    exam_year: 2022,
    subject: "Mathematics",
    topic: "Geometry",
    question_text:
      "A circle has a radius of 7 cm. Find its area. (Take π = 22/7)",
    options: ["154 cm²", "44 cm²", "148 cm²", "176 cm²"],
    correct_answer: "A",
    explanation: "Area = πr² = 22/7 × 7² = 22/7 × 49 = 154 cm²",
    difficulty: "easy",
  },
  {
    exam_body: "jamb",
    exam_year: 2024,
    subject: "Mathematics",
    topic: "Number Bases",
    question_text: "Convert 1101₂ to base 10.",
    options: ["11", "12", "13", "14"],
    correct_answer: "C",
    explanation: "1×2³ + 1×2² + 0×2¹ + 1×2⁰ = 8 + 4 + 0 + 1 = 13",
    difficulty: "medium",
  },
  {
    exam_body: "jamb",
    exam_year: 2023,
    subject: "Mathematics",
    topic: "Sets",
    question_text:
      "In a class of 40 students, 25 offer Mathematics and 20 offer Physics. If 5 students offer neither, how many offer both?",
    options: ["10", "15", "5", "20"],
    correct_answer: "A",
    explanation:
      "n(M∪P) = 40-5 = 35. n(M∪P) = n(M)+n(P)-n(M∩P) → 35 = 25+20-n(M∩P) → n(M∩P) = 10",
    difficulty: "medium",
  },
  {
    exam_body: "jamb",
    exam_year: 2022,
    subject: "Mathematics",
    topic: "Indices",
    question_text: "Simplify: 2³ × 2⁴",
    options: ["2⁷", "2¹²", "4⁷", "4¹²"],
    correct_answer: "A",
    explanation: "2³ × 2⁴ = 2^(3+4) = 2⁷ = 128",
    difficulty: "easy",
  },

  // ═══ ENGLISH ═══
  {
    exam_body: "jamb",
    exam_year: 2024,
    subject: "English",
    topic: "Comprehension",
    question_text:
      "Choose the word that is nearest in meaning to the underlined word: The politician made an ELOQUENT speech.",
    options: ["Fluent", "Brief", "Boring", "Loud"],
    correct_answer: "A",
    explanation: "Eloquent means fluent, persuasive, and articulate in speech.",
    difficulty: "medium",
  },
  {
    exam_body: "jamb",
    exam_year: 2024,
    subject: "English",
    topic: "Grammar",
    question_text:
      "Choose the correct option: Neither the teacher nor the students ____ present.",
    options: ["was", "were", "is", "has been"],
    correct_answer: "B",
    explanation:
      "With 'neither...nor', the verb agrees with the nearer subject (students → were).",
    difficulty: "medium",
  },
  {
    exam_body: "jamb",
    exam_year: 2023,
    subject: "English",
    topic: "Vocabulary",
    question_text: "Choose the word opposite in meaning to BENEVOLENT.",
    options: ["Kind", "Malevolent", "Generous", "Charitable"],
    correct_answer: "B",
    explanation:
      "Benevolent (well-meaning, kind) is the opposite of malevolent (having ill will).",
    difficulty: "easy",
  },
  {
    exam_body: "jamb",
    exam_year: 2022,
    subject: "English",
    topic: "Oral English",
    question_text:
      "Which of the following words has the stress on the second syllable?",
    options: ["TAbel", "beLOW", "CARpet", "MOnkey"],
    correct_answer: "B",
    explanation: "'Below' is stressed on the second syllable: be-LOW.",
    difficulty: "medium",
  },

  // ═══ PHYSICS ═══
  {
    exam_body: "jamb",
    exam_year: 2024,
    subject: "Physics",
    topic: "Mechanics",
    question_text:
      "A body of mass 5 kg is acted upon by a force of 20 N. Calculate the acceleration.",
    options: ["2 m/s²", "4 m/s²", "10 m/s²", "100 m/s²"],
    correct_answer: "B",
    explanation: "F = ma → a = F/m = 20/5 = 4 m/s²",
    difficulty: "easy",
  },
  {
    exam_body: "jamb",
    exam_year: 2024,
    subject: "Physics",
    topic: "Waves",
    question_text:
      "A wave has a frequency of 500 Hz and a wavelength of 0.6 m. Calculate its velocity.",
    options: ["300 m/s", "500 m/s", "833 m/s", "200 m/s"],
    correct_answer: "A",
    explanation: "v = fλ = 500 × 0.6 = 300 m/s",
    difficulty: "medium",
  },
  {
    exam_body: "jamb",
    exam_year: 2023,
    subject: "Physics",
    topic: "Electricity",
    question_text:
      "Calculate the resistance of a conductor if a current of 2A flows through it when a p.d. of 12V is applied.",
    options: ["6 Ω", "24 Ω", "14 Ω", "10 Ω"],
    correct_answer: "A",
    explanation: "V = IR → R = V/I = 12/2 = 6 Ω",
    difficulty: "easy",
  },
  {
    exam_body: "jamb",
    exam_year: 2022,
    subject: "Physics",
    topic: "Heat",
    question_text: "Which of the following is NOT a method of heat transfer?",
    options: ["Conduction", "Convection", "Radiation", "Evaporation"],
    correct_answer: "D",
    explanation:
      "The three methods of heat transfer are conduction, convection, and radiation. Evaporation is a phase change, not a heat transfer method.",
    difficulty: "easy",
  },

  // ═══ CHEMISTRY ═══
  {
    exam_body: "jamb",
    exam_year: 2024,
    subject: "Chemistry",
    topic: "Atomic Structure",
    question_text:
      "An element has atomic number 11 and mass number 23. How many neutrons does it have?",
    options: ["11", "12", "23", "34"],
    correct_answer: "B",
    explanation: "Neutrons = Mass number - Atomic number = 23 - 11 = 12",
    difficulty: "easy",
  },
  {
    exam_body: "jamb",
    exam_year: 2024,
    subject: "Chemistry",
    topic: "Chemical Bonding",
    question_text: "Which type of bond is formed between sodium and chlorine?",
    options: ["Covalent bond", "Ionic bond", "Metallic bond", "Hydrogen bond"],
    correct_answer: "B",
    explanation:
      "Sodium (metal) transfers an electron to chlorine (non-metal), forming an ionic bond (NaCl).",
    difficulty: "easy",
  },
  {
    exam_body: "jamb",
    exam_year: 2023,
    subject: "Chemistry",
    topic: "Gas Laws",
    question_text:
      "A gas occupies 500 cm³ at 27°C. What volume will it occupy at 127°C if the pressure remains constant?",
    options: ["666.7 cm³", "750 cm³", "250 cm³", "1000 cm³"],
    correct_answer: "A",
    explanation:
      "V₁/T₁ = V₂/T₂ → 500/300 = V₂/400 → V₂ = 666.7 cm³ (convert °C to K: +273)",
    difficulty: "hard",
  },
  {
    exam_body: "jamb",
    exam_year: 2022,
    subject: "Chemistry",
    topic: "Periodic Table",
    question_text:
      "Elements in the same group of the periodic table have the same number of:",
    options: ["Protons", "Neutrons", "Valence electrons", "Total electrons"],
    correct_answer: "C",
    explanation:
      "Elements in the same group (column) have the same number of valence (outer shell) electrons.",
    difficulty: "easy",
  },

  // ═══ BIOLOGY ═══
  {
    exam_body: "jamb",
    exam_year: 2024,
    subject: "Biology",
    topic: "Cell Biology",
    question_text: "Which organelle is known as the 'powerhouse of the cell'?",
    options: ["Nucleus", "Ribosome", "Mitochondrion", "Endoplasmic reticulum"],
    correct_answer: "C",
    explanation:
      "The mitochondrion generates most of the cell's ATP (energy), hence called the powerhouse.",
    difficulty: "easy",
  },
  {
    exam_body: "jamb",
    exam_year: 2024,
    subject: "Biology",
    topic: "Genetics",
    question_text:
      "If a man with blood group A (genotype AO) marries a woman with blood group B (genotype BO), what blood groups are possible in their children?",
    options: ["A, B, AB, O", "A, B only", "AB only", "A, O only"],
    correct_answer: "A",
    explanation:
      "AO × BO → AB, AO, BO, OO → blood groups A, B, AB, O are all possible.",
    difficulty: "hard",
  },
  {
    exam_body: "jamb",
    exam_year: 2023,
    subject: "Biology",
    topic: "Ecology",
    question_text: "Which of the following is a biotic factor in an ecosystem?",
    options: ["Rainfall", "Temperature", "Predation", "Humidity"],
    correct_answer: "C",
    explanation:
      "Predation is a biotic (living) factor. Rainfall, temperature, and humidity are abiotic factors.",
    difficulty: "easy",
  },
  {
    exam_body: "jamb",
    exam_year: 2022,
    subject: "Biology",
    topic: "Digestive System",
    question_text: "Bile is produced by the:",
    options: ["Pancreas", "Gallbladder", "Liver", "Stomach"],
    correct_answer: "C",
    explanation: "Bile is produced by the liver and stored in the gallbladder.",
    difficulty: "easy",
  },

  // ═══ WAEC SAMPLES ═══
  {
    exam_body: "waec",
    exam_year: 2024,
    subject: "Mathematics",
    topic: "Logarithms",
    question_text: "Evaluate log₁₀ 1000.",
    options: ["2", "3", "4", "10"],
    correct_answer: "B",
    explanation: "log₁₀ 1000 = log₁₀ 10³ = 3",
    difficulty: "easy",
  },
  {
    exam_body: "waec",
    exam_year: 2023,
    subject: "Physics",
    topic: "Optics",
    question_text: "The image formed by a plane mirror is:",
    options: [
      "Real and inverted",
      "Virtual and erect",
      "Real and erect",
      "Virtual and inverted",
    ],
    correct_answer: "B",
    explanation:
      "A plane mirror always produces a virtual, erect, laterally inverted image of the same size.",
    difficulty: "easy",
  },
  {
    exam_body: "waec",
    exam_year: 2024,
    subject: "Chemistry",
    topic: "Acids and Bases",
    question_text: "What is the pH of a neutral solution?",
    options: ["0", "1", "7", "14"],
    correct_answer: "C",
    explanation: "A neutral solution has a pH of 7. Acidic < 7, Basic > 7.",
    difficulty: "easy",
  },
  {
    exam_body: "waec",
    exam_year: 2023,
    subject: "Biology",
    topic: "Photosynthesis",
    question_text: "Which gas is released during photosynthesis?",
    options: ["Carbon dioxide", "Nitrogen", "Oxygen", "Hydrogen"],
    correct_answer: "C",
    explanation:
      "During photosynthesis, plants absorb CO₂ and release O₂: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂",
    difficulty: "easy",
  },
];

async function seed() {
  console.log(`\n🌱 Seeding ${sampleQuestions.length} past questions...\n`);

  const { data, error } = await supabase
    .from("past_questions")
    .insert(sampleQuestions)
    .select();

  if (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }

  console.log(`✅ Successfully seeded ${data.length} past questions!`);

  // Print summary
  const summary = {};
  data.forEach((q) => {
    const key = `${q.exam_body.toUpperCase()} ${q.subject}`;
    summary[key] = (summary[key] || 0) + 1;
  });
  console.log("\n📊 Summary:");
  Object.entries(summary)
    .sort()
    .forEach(([key, count]) => {
      console.log(`   ${key}: ${count} questions`);
    });

  process.exit(0);
}

seed();

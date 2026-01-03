require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

// FULLY DETAILED USE OF ENGLISH SYLLABUS CONTENT
// Sourced verbatim from JAMB Use of English Syllabus
const USE_OF_ENGLISH_SYLLABUS = {
  subject: 'Use of English',
  topics: [
    {
      name: 'General Objectives',
      content: `1. GENERAL OBJECTIVES
The aim of the Unified Tertiary Matriculation Examination (UTME) syllabus in Use of English is to guide candidates in their preparation for the Board’s examination. It is designed to evaluate the candidates’ ability to:
(i) communicate effectively in both written and spoken English; and
(ii) use English Language for learning at the tertiary level.

2. The syllabus consists of three sections:
SECTION A: Comprehension and Summary
SECTION B: Lexis and Structure
SECTION C: Oral Forms`
    },
    {
      name: 'SECTION A: Comprehension and Summary',
      content: `TOPICS/CONTENTS/NOTES:
(a) description
(b) narration
(c) exposition
(d) argumentation/persuasion
(i) Each of the three passages to be set (one will be a cloze test) should reflect various disciplines and be about 200 words long.
(ii) Questions on the passages will test the following:
(a) Comprehension of the whole or part of each passage.
(b) Comprehension of words, phrases, clauses, sentences, figures of speech and idioms as used in the passages.
(c) Coherence and logical reasoning (deductions, inferences, etc).
(d) Approved Reading Text (The Life Changer by Khadija Abubakar Jalli).
(e) Synthesis of ideas from the passages. 
NOTE: Synthesis of ideas means the art of combining distinct or separate pieces of information to form a complete whole as summary.

OBJECTIVES:
Candidates should be able to:
i. identify main points/topic sentences in passages;
ii. determine implied meanings;
iii. identify the grammatical functions of words, phrases, clauses and figurative /idiomatic expressions; and
iv. deduce or infer the writers’ intentions including mood, attitude to the subject matter and opinion.`
    },
    {
      name: 'SECTION B: Lexis and Structure',
      content: `TOPICS/CONTENTS/NOTES:
(a) synonyms
(b) antonyms
(c) clause and sentence patterns 
(d) word classes and their functions 

[Image of parts of speech diagram]

(e) mood, tense, aspect, number, agreement/concord, degree (positive, comparative and superlative) and question tags
(f) mechanics
(g) ordinary usage, figurative usage and idiomatic usage.
NOTE: Idioms to be tested are those that are formal and expressed in Standard British English. (SBE).

OBJECTIVES:
Candidates should be able to:
i. identify words and expressions in their ordinary, figurative and idiomatic contexts;
ii. determine similar and opposite meanings of words;
iii. differentiate between correct and incorrect spellings;
iv. identify various grammatical patterns in use; and
v. interpret information conveyed in sentences.`
    },
    {
      name: 'SECTION C: Oral Forms',
      content: `TOPICS/CONTENTS/NOTES:
(a) Vowels (monothongs, diphthongs and triphthongs) 
(b) Consonants (including clusters) 
(c) Rhymes (including homophones)
(d) Word stress (monosyllabic and polysyllabic)
(e) Emphatic stress (in connected speech)
NOTE: Emphatic stress involves the placement of stress on words in an utterance for the purpose of emphasis.

OBJECTIVES:
Candidates should be able to:
i. make distinctions among vowel types;
ii. differentiate among consonant types; and
iii. identify correct pronunciation of individual words and articulation of connected speech.`
    },
    {
      name: 'Structure of the Examination',
      content: `D. THE STRUCTURE OF THE EXAMINATION
SECTION A: Comprehension and Summary
(a) 1 comprehension passage - 5 questions
(b) 1 cloze passage - 10 questions
(c) 1 reading text - 10 questions
SECTION B: Lexis and Structure
(a) Sentence interpretation - 5 questions
(b) Antonyms - 5 questions
(c) Synonyms - 5questions
(d) Basic Grammar - 10 questions
SECTION C: Oral Forms
a) Vowels - 2 questions
b) Consonants - 2 questions
c) Rhymes - 2 questions
d) Word Stress - 2 questions
e) Emphatic Stress - 2 questions
Total: 60 questions `
    },
    {
      name: 'Recommended Texts',
      content: `RECOMMENDED TEXTS:
1. Adedimeji, M. A (2021) Doses of Grammar. Patigi. Ahman Pategi University Press.
2. Attah, M. O. (2013). Practice in Spoken English for Intermediate and Advanced Learners. Maiduguri: University of Maiduguri Press.
3. Bamgbose, A. (2002). English Lexis and Structure for Senior Secondary Schools and Colleges (Revised Edition). Ibadan: Heinemann.
4. Banjo, A., Adeniran A., Akano, A. and Onoga, U. (2004) New Oxford Secondary English Course Book six for Senior Secondary Schools. Ibadan: University Press Plc.
5. Caesar, O. J. (2003). Essential Oral English for Schools and Colleges. Lagos: Tonad Publishers Limited.
6. Jones, D. (2011). Cambridge English Pronouncing Dictionary. Cambridge: Cambridge University Press.
7. Egbe, D. I (1996). Mastering English Usage and Communication Skills. Lagos: Tisons.
8. Elugbe, B. (2000). Oral English for Schools and Colleges. Ibadan: Heinemann.
9. Grant, N. J. H., Nnamonu, S. and Jowitt, D. (1998) Senior English Project 3. (New Edition) Harlow: Longman.
10. Idowu., O. O., Sogbesan, T. S., Adofo, A. K., Burgess, D. F. and Burgess, L. J. (1998) Round-up English: A Complete Guide, Lagos: Longman.
11. Idris, U. (2001). Oral English at Your Fingertips for Schools and Colleges. Lagos: M. Youngbrain Publishers.
12. Igiligi, E. C. and Ogenyi, S. O. (2010) Grammar and Composition in the G.S.M. Age. Enugu: Joe Hills Production Services.
13. Jauro, L. B. (2013). Oral English for Schools and Colleges: A Teaching and Learning Approach. Yola: Paraclete Publishers.
14. Nnamonu, S. and Jowitt, D. (1989) Common Errors in English. Lagos: Longman.
15. Obinna, M. F. (2001) University Matriculation Use of English. (Fourth Edition). Port Harcourt: Sunray Books Limited.
16. Ogunsanwo, O., Duruaku, A. B.C., Ezechukwu, J. and Nwachukwu, U. I. (2005) Countdown English Language (Revised Edition). Ibadan: Evans Brothers.
17. Olatoye, S. (2006) The Silent Teacher. Ado-Ekiti: Segun and Sons Enterprises.
18. Oluikpe, B. O. A., Nnaemeka, B. A., Obah, T. Y., Otagburuagu, E. J., Onuigbo, S. and Ogbonna, E. A. (1998) Intensive English for Senior Secondary School 3. Onitsha: Africana. First Publishers.
19. Tomori, S. H. O. (2000) Objective Tests for School Certificate English: Practice in Lexis, Structure and Idiom (Reprinted Edition). Ibadan: Heinemann.
20. Ukwuegbu, C., Okoro, O., Idris, A. U., Okebukola, F. O. and Owokade, C. O. (2002) Catch-up English for SSCE/UME. Ibadan: Heinemann.`
    }
  ]
};

async function importUseOfEnglish() {
  console.log('📖 Starting Full JAMB Use of English syllabus import...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const topic of USE_OF_ENGLISH_SYLLABUS.topics) {
    try {
      const { data, error } = await supabase
        .from('question_sources')
        .insert({
          subject: USE_OF_ENGLISH_SYLLABUS.subject,
          topic: topic.name,
          content: topic.content,
          source_type: 'jamb_syllabus',
          is_active: true,
          metadata: {
            imported_at: new Date().toISOString(),
            source: 'JAMB Official Syllabus',
            exam_type: 'UTME',
            version: 'Full Verbatim Syllabus with Recommended Texts'
          }
        })
        .select();
      
      if (error) throw error;
      
      console.log(`✅ Imported: ${topic.name}`);
      successCount++;
    } catch (err) {
      console.error(`❌ Failed: ${topic.name} - ${err.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Use of English Import Summary:`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total: ${USE_OF_ENGLISH_SYLLABUS.topics.length}`);
}

importUseOfEnglish().catch(console.error);
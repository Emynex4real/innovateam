require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

// FULLY DETAILED LITERATURE IN ENGLISH SYLLABUS CONTENT
// Sourced verbatim from JAMB Literature in English Syllabus
const LITERATURE_SYLLABUS = {
  subject: 'Literature in English',
  topics: [
    {
      name: 'General Objectives',
      content: `GENERAL OBJECTIVES:
The aim of the Unified Tertiary Matriculation Examination (UTME) syllabus in Literature in English is to prepare the candidates for the Board’s examination. It is designed to test their achievement of the course objectives, which are to:
1. stimulate and sustain their interest in Literature in English;
2. create an awareness of the general principles of Literature and functions of language;
3. appreciate literary works of all genres and across all cultures;
4. apply the knowledge of Literature in English to the analysis of social, political and economic events in the society.`
    },
    {
      name: 'Drama',
      content: `TOPICS/CONTENTS/NOTES:
1. DRAMA
a. Types:
i. Tragedy
ii. Comedy
iii. Tragicomedy
iv. Melodrama
v. Farce
vi. Opera etc. 
b. Dramatic Techniques
i. Characterisation
ii. Dialogue
iii. Flashback
iv. Mime
v. Costume
vi. Music/Dance
vii. Décor/scenery
viii. Acts/Scenes
ix. Soliloquy/aside
x. Figures of Speech etc. 
c. Interpretation of the Prescribed Texts
i. Theme
ii. Plot
iii. Socio-political context
iv. Setting

OBJECTIVES:
Candidates should be able to:
i. identify the various types of drama;
ii. analyse the contents of the various types of drama;
iii. compare and contrast the features of different dramatic types;
iv. demonstrate adequate knowledge of dramatic techniques used in each prescribed text;
v. differentiate between styles of selected playwrights;
vi. determine the theme of any prescribed text;
vii. identify the plot of the play;
viii. apply the lessons of the play to everyday living;
ix. identify the spatial and temporal setting of the play.`
    },
    {
      name: 'Prose',
      content: `TOPICS/CONTENTS/NOTES:
2. PROSE
a. Types:
i. Fiction
- Novel
- Novella/Novelette
- Short story
ii. Non-fiction
- Biography
- Autobiography
- Memoir
iii. Faction: combination of fact and fiction
b. Narrative Techniques/Devices:
i. Point of view
- Omniscient/Third Person
- First Person 
ii. Characterisation
- Round, flat, foil, hero, antihero, etc.
iii. Language
c. Textual Analysis
i. Theme
ii. Plot 

[Image of Freytag's pyramid plot structure]

iii. Setting (Temporal/Spatial)
iv. Socio-political context

OBJECTIVES:
Candidates should be able to:
i. differentiate between types of prose;
ii. identify the category that each prescribed text belongs to;
iii. analyse the components of each type of prose;
iv. identify the narrative techniques used in each of the prescribed texts;
v. determine an author’s narrative style;
vi. distinguish between one type of character from another;
vii. determine the thematic preoccupation of the author of the prescribed text;
viii. indicate the plot of the novel;
ix. identify the temporal and spatial setting of the novel;
x. relate the prescribed text to real life situations.`
    },
    {
      name: 'Poetry',
      content: `TOPICS/CONTENTS/NOTES:
3. POETRY
a. Types:
i. Sonnet
ii. Ode
iii. Lyrics
iv. Elegy
v. Ballad
vi. Panegyric
vii. Epic
viii. Blank Verse, etc.
b. Poetic devices
i. Structure
ii. Imagery
iii. Sound (Rhyme/Rhythm, repetition, pun, onomatopoeia, etc.) 
iv. Diction
v. Persona
c. Appreciation
i. Thematic preoccupation
ii. Socio-political relevance
iii. Style.

OBJECTIVES:
Candidates should be able to:
i. identify different types of poetry;
ii. compare and contrast the features of different poetic types:
iii. determine the devices used by various poets;
iv. show how poetic devices are used for aesthetic effect in each poem;
v. deduce the poet’s preoccupation from the poem;
vi. appraise poetry as an art with moral values;
vii. apply the lessons from the poem to real life situations.`
    },
    {
      name: 'General Literary Principles',
      content: `TOPICS/CONTENTS/NOTES:
4. GENERAL LITERARY PRINCIPLES
a. Literary terms: foreshadowing, suspense, theatre, monologue, dialogue, soliloquy, symbolism, protagonist, antagonist, figures of speech, satire, stream of consciousness, etc., in addition to those listed above under the different genres. 
b. Literary principles
i. Direct imitation in play;
ii. Versification in drama and poetry;
iii. Narration of people’s experiences
iv. Achievement of aesthetic value, etc.
c. Relationship between literary terms and principles.

OBJECTIVES:
Candidates should be able to:
i. identify literary terms in drama, prose and poetry;
ii. identify the general principles of Literature;
iii. differentiate between literary terms and principles;
iv. use literary terms appropriately.`
    },
    {
      name: 'Literary Appreciation',
      content: `TOPICS/CONTENTS/NOTES:
5. LITERARY APPRECIATION
Unseen passages/extracts from Drama, Prose and Poetry.

OBJECTIVES:
Candidates should be able to:
i. determine literary devices used in a given passage/extract;
ii. provide a meaningful interpretation of the given passage/extract;
iii. relate the extract to true life experiences.`
    },
    {
      name: 'Prescribed Texts: Drama',
      content: `A LIST OF SELECTED AFRICAN AND NON-AFRICAN PLAYS, NOVELS AND POEMS

Drama:
African:
1. The Lion and the Jewel: Wole Soyinka
Non African:
1. Look Back in Anger: John Osborne`
    },
    {
      name: 'Prescribed Texts: Prose',
      content: `A LIST OF SELECTED AFRICAN AND NON-AFRICAN PLAYS, NOVELS AND POEMS

Prose:
African:
i. Second Class Citizen: Buchi Emecheta
ii. Unexpected Joy at Dawn: Alex Agyei-Agyiri
Non African:
i. Wuthering Heights: Emily Bronte`
    },
    {
      name: 'Prescribed Texts: Poetry',
      content: `A LIST OF SELECTED AFRICAN AND NON-AFRICAN PLAYS, NOVELS AND POEMS

Poetry:
African:
i. Black Woman: Leopold Sedar Senghor
ii. The Leader and the Led: Niyi Osundare
iii. The Grieved Lands: Agostinho Neto
iv. The Song of the Women of my Land: Oumar Farouk Sesay
v. Raider of the Treasure Trove: Lade Worornu
vi. A Government Driver on his Retirement: Onu Chibuike

Non African:
i. The Good -Morrow: John Donne
ii. Caged Bird: Maya Angelou
iii. The Journey of the Magi: T.S Elliot
iv. Bat: David H. Lawrence.`
    },
    {
      name: 'Recommended Texts',
      content: `RECOMMENDED TEXTS:
1. ANTHOLOGIES
Gbemisola, A. (2005) Naked Soles, Ibadan: Kraft
Hayward, J. (ed.) (1968) The Penguin Book of English Verse, London Penguin
Johnson, R. et al (eds.) (1996) New Poetry from Africa, Ibadan: UP Plc
Kermode, F. et al (1964) Oxford Anthology of English Literature, Vol. II, London: OUP
Nwoga D. (ed.) (1967) West African Verse, London: Longman
Parker, E.W. (ed.) (1980) A Pageant of Longer Poems London: Longman
Senanu, K. E. and Vincent, T. (eds.) (1993) A Selection of African Poetry, Lagos: Longman
Soyinka, W. (ed.) (1987) Poems of Black Africa, Ibadan: Heinemann

2. CRITICAL TEXTS
Abrams, M. H. (1981) A Glossary of Literary Terms, (4th Edition) New York, Holt Rinehalt and Winston
Emeaba, O. E. (1982) A Dictionary of Literature, Aba: Inteks Press
Murphy, M. J. (1972) Understanding Unseen, An Introduction to English Poetry and English Novel for Overseas Students, George Allen and Unwin Ltd.`
    }
  ]
};

async function importLiterature() {
  console.log('📚 Starting Full JAMB Literature in English syllabus import...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const topic of LITERATURE_SYLLABUS.topics) {
    try {
      const { data, error } = await supabase
        .from('question_sources')
        .insert({
          subject: LITERATURE_SYLLABUS.subject,
          topic: topic.name,
          content: topic.content,
          source_type: 'jamb_syllabus',
          is_active: true,
          metadata: {
            imported_at: new Date().toISOString(),
            source: 'JAMB Official Syllabus',
            exam_type: 'UTME',
            version: 'Full Verbatim Syllabus with Prescribed Texts'
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
  
  console.log(`\n📊 Literature Import Summary:`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total: ${LITERATURE_SYLLABUS.topics.length}`);
}

importLiterature().catch(console.error);
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

// FULLY DETAILED HISTORY SYLLABUS CONTENT
// Sourced verbatim from JAMB History Syllabus
const HISTORY_SYLLABUS = {
  subject: 'History',
  topics: [
    {
      name: 'General Objectives',
      content: `GENERAL OBJECTIVES:
The aim of the Unified Tertiary Matriculation Examination (UTME) syllabus in History is to prepare the candidates for the Board’s examinations. It is designed to test their achievement of the course objectives, which are to:
1. impart knowledge of Nigerian history from earliest times to the present;
2. identify the similarities and relationships among the peoples of Nigeria as they relate to the issues of national unity and integration;
3. appreciate Nigerian history as the basis to understand West African and African history;
4. apply history to understand Nigerian and Africa’s relationship with the wider world;
5. analyse issues of modernization and development;
6. relate the past to the present and plan for the future.`
    },
    {
      name: 'Section A: The Nigeria Area Up To 1800',
      content: `TOPICS/CONTENTS/NOTES:
1. Land and Peoples of the Nigeria Area:
a. Geographical zones and the people. 
b. The people’s relationship with the environment
c. Relations and integration among the peoples of different zones.
2. Early Centres of Civilization:
a. Nok, Daima, Ife, Benin, Igbo Ukwu and Iwo Eleru 
b. Monuments and shelter systems: (Kuyambana, Durbi-ta-Kusheyi, city walls and palaces)
3. Origin and formation of States in the Nigeria Area
a. Central Sudan –Kanuri and Hausa, states.
b. Niger-Benue Valley – Nupe, Jukun, Igala, Idoma, Tiv and Ebira
c. Eastern Forest Belt – Igbo and Ibibio
d. Western Forest Belt – Yoruba and Edo
e. Coastal and Niger–Delta - Efik, Ijo, Itsekiri and Urhobo
i. Factors influencing their origin and migration
ii. Social and political organizations
iii. Inter-State relations, religion war and peace.

OBJECTIVES:
Candidates should be able to:
i. identify the geographical zones and the people within them;
ii. establish the relationship between the people and the environment
iii. Comprehend the relationships among the various peoples of the Nigeria area.
iv. examine the significance of various centres;
v. establish the historical significance of the various monuments such as caves and rocky formations;
vi. relate the different groups of people occupying the various zones to their traditions of origin;
vii. determine the inter-state relations;
viii. account for their social and political organizations.`
    },
    {
      name: 'Section A: Economic Activities and External Influences (Up to 1800)',
      content: `TOPICS/CONTENTS/NOTES:
4. Economic Activities and Growth of States:
a. Agriculture – hunting, farming, fishing, animal husbandry and horticulture.
b. Industries – pottery, salt-making, iron-smelting, blacksmithing, leather-working, wood-carving, cloth-making, dyeing and food processing.
c. Trade and trade routes:- local, regional, long distance, including trans-Sahara trade. 
d. Expansion of states.
5. External Influences:
a. North Africans/Arabs
i. introduction, spread and impact of Islam;
ii. trans-Saharan trade.
b. Europeans:
i. early European trade with the coastal states.
ii. the trans-Atlantic slave trade (origin, organization and impact) 

OBJECTIVES:
Candidates should be able to:
i. identify the various economic activities of the people;
ii. differentiate the economic activities and specialties of the people;
iii. relate trade and other economic activities to the growth of the states.
iv. assess the impact of the contact with North Africa on the people and states South of the Sahara.
v. examine the impact of early European contact with the coastal people;
vi. trace the origin, organization and impact of the trans-Atlantic slave trade.`
    },
    {
      name: 'Section B: The Sokoto Caliphate and Kanem-Borno (1800-1900)',
      content: `TOPICS/CONTENTS/NOTES:
1. The Sokoto Caliphate
The Sokoto Jihad – (causes, courses and consequence)
a. The causes and the process of the jihad
b. The establishment and administration of the caliphate and relations with neighbours 
c. The achievements and impact of the caliphate.
d. The collapse of the caliphate.
2. Kanem-Borno
a. The collapse of the Saifawa dynasty
b. Borno under the Shehus
c. Borno under Rabeh

OBJECTIVES:
Candidates should be able to:
i. examine the causes, and the processes of the Jihad;
ii. determine the factors that led to the rise of the caliphate;
iii. examine the administrative set-up of the caliphate and its relations with its neighbours;
iv. examine the impact of the caliphate;
v. trace the internal and external factors that led to the collapse of the caliphate.
vi. determine the factors that led to the collapse of the Saifawa dynasty;
vii. examine Borno under the administration of the Shehus;
viii. assess the role of Rabeh in Borno’s history.`
    },
    {
      name: 'Section B: Yorubaland, Benin, and Others (1800-1900)',
      content: `TOPICS/CONTENTS/NOTES:
3. Yorubaland:
a. The fall of the Old Oyo Empire 
b. The Yoruba wars and their impact
c. The peace treaty of 1886 and its aftermath
4. Benin
a. Internal political development
b. Relations with neighbours
c. Relations with the Europeans
5. Nupe
a. Internal political development
b. Relations with neighbours.
6. Igbo
a. Internal political development
b. Relations with neigbhours.
7. Efik
a. Internal political development
b. Relations with neigbhours.

OBJECTIVES:
Candidates should be able to:
i. examine the causes of the fall of the Old Oyo;
ii. examine the causes and effects of the Yoruba wars:
iii. assess the impact of the 1886 peace treaty.
iv. examine the internal political development of Benin, Nupe, Igbo, and Efik;
v. examine their relations with neighbours and Europeans.`
    },
    {
      name: 'Section B: European Penetration and British Conquest',
      content: `TOPICS/CONTENTS/NOTES:
8. European Penetration and Impact:
a. European exploration of the interior. 
b. The suppression of the trans-Atlantic slave trade.
c. The development of commodity trade and rise of consular authority.
d. Christian missionary activities.
e. The activities of the trading companies.
f. Impact of European activities on the coast and the hinterland.
9. British Conquest of the Nigeria Area:
a. Motives for the conquest
b. Methods of the conquest and its result.
c. Resistance to and aftermath of the conquest.

OBJECTIVES:
Candidates should be able to:
i. examine the motive for the exploration of the interior.
ii. give reasons for the suppression of the trans-Atlantic slave trade;
iii. trace the development of commodity trade;
iv. examine missionary and European activities in the area;
v. assess the activities of the European trading companies
vi. account for the rise of consular authority.
vii. determine the reasons for the conquest and the methods used;
viii. examine the various resistance to the conquest
ix. evaluate the results and the aftermath of the conquest.`
    },
    {
      name: 'Section C: Colonial Rule and Amalgamation (1900-1960)',
      content: `TOPICS/CONTENTS/NOTES:
1. The Establishment of Colonial Rule up to 1914:
a. Administration of the protectorates
2. The Amalgamation of 1914:
a. Reasons
b. Effects 
3. Colonial Administration After the Amalgamation:
a. Central Administration:- Legislative and Executive Councils
b. Indirect Rule – reasons, working and effects
c. Local administrative institutions, Native Authorities, Native Courts and Native Treasuries.
d. Resistance to colonial rule – Ekumeku Movement in Asaba hinterland 1898 – 1911, the Satiru uprising 1906, Egba and the Anti-tax Agitation 1918, and the Aba Women Movement in 1929.

OBJECTIVES:
Candidates should be able to:
i. examine the administrative set-up of the protectorates;
ii. examine the reasons for the 1914 Amalgamation and its effects.
iii. relate the composition of the central administrative set-up to its consequences;
iv. identify the reasons for the introduction and workings of the indirect rule system;
v. assess the effects of indirect rule;
vi. examine the local administrative units.
vii. account for the anti-colonial movements and their significance.`
    },
    {
      name: 'Section C: Economy and Social Development (Colonial Era)',
      content: `TOPICS/CONTENTS/NOTES:
4. The Colonial Economy:
a. currency, taxation and forced labour
b. Infrastructure (transportation, post and telecommunication) 
c. Agriculture
d. Mining
e. Industry
f. Commerce
g. Banking.
5. Social Development under Colonial Rule:
a. Western education
b. Urbanization/social integration
c. Improvement unions
d. Health institutions

OBJECTIVES:
Candidates should be able to:
i. examine the nature of the economy as it affects taxation. currency, infrastructures, agriculture, mining, industry, commerce and banking.
ii. identify the areas of social development under colonial rule;
iii. examine the impact of urbanization on the people;
iv. examine the level of social integration among the people.`
    },
    {
      name: 'Section C: Nationalism and Independence',
      content: `TOPICS/CONTENTS/NOTES:
6. Nationalism, Constitutional Developments and Independence:
a. The rise of nationalist movements;
b. The 1922 Clifford Constitution and the rise of Nigeria’s first political party.
c. World War II and the agitation for independence
d. The Richards Constitution of 1946
e. The Macpherson Constitution of 1951.
f. Party politics – regionalism, federalism and minorities agitations.
g. Lyttleton Constitution of 1954.
h. constitutional conferences in Lagos in 1957 and London in 1958
i. The general elections of 1959 and independence in 1960.

OBJECTIVES:
Candidates should be able to:
i. trace the emergence of the nationalist movement;
ii. assess the roles of the different constitutions in constitutional development;
iii. examine the effect of World War II in the agitation for independence and the constitutional developments;
iv trace the development of party politics and its impact on regionalism and minority question;
v. examine the impact of the constitutional conferences.
vi. determine the factors that aided the attainment of independence.`
    },
    {
      name: 'Section D: Nigeria Since Independence (First Republic & Civil War)',
      content: `TOPICS/CONTENTS/NOTES:
1. The politics of the First Republic and Military intervention
a. Struggle for the control of the centre;
b. Issue of revenue allocation
c. Minority question
d. The 1962/63 census controversies
e. The Action Group crisis and the General Elections of 1964/65.
f. The coup d’etat of January 1966 and the Ironsi Regime.
2. The Civil War: Cause and effects
a. Causes
b. Course 

[Image of Nigerian Civil War map]

c. Effects

OBJECTIVES:
Candidates should be able to:
i. give reasons behind the struggle for the control of the centre;
ii. account for the controversies in revenue allocation;
iii. account for the controversies generated by the minority question and the creation of states;
iv. account for the controversies generated by the 1962/63 census;
v. examine the problems created by the Action Group crisis and the General Elections of 1964/65;
vi. assess the significance of military intervention and the Ironsi Regime.
vii. examine the remote and immediate causes of the war;
viii. examine the course;
ix. assess the effects of the war.`
    },
    {
      name: 'Section D: Nigeria Since Independence (Regimes & International Role)',
      content: `TOPICS/CONTENTS/NOTES:
3. The Gowon Regime.
4. Murtala/Obasanjo Regime
5. The Second Republic
6. The Buhari Regime
7. The Babangida Regime
8. The Interim National Government (ING)
9. The Abacha Regime
10. Nigeria in International Organizations;
a. Economic Community of West African States (ECOWAS),
b. African Union (AU)
c. Commonwealth of Nations
d. Organization of Petroleum Exporting Countries (OPEC)
e. United Nations Organization
f. The role of Nigeria in Conflict Resolution.

OBJECTIVES:
Candidates should be able to:
i. assess the challenges and achievements of the various regimes (Gowon, Murtala/Obasanjo, Second Republic, Buhari, Babangida, ING, Abacha, Abdulsalami);
ii. examine the role of Nigeria in ECOWAS, AU, Commonwealth, OPEC, and UN;
iii. examine the role of Nigeria in conflict resolutions in the Congo, Chad, Liberia, Sierra Leone, Guinea and the Sudan.`
    },
    {
      name: 'Part II: West and North Africa (1800-Present)',
      content: `TOPICS/CONTENTS/NOTES:
SECTION A: WEST AND NORTH AFRICA
1. Islamic Reform Movements and State Building in West Africa:
a. Relationship between Sokoto and other Jihads.
b. The Jihads of Seku Ahmadu and Al-Hajj Umar
c. The activities of Samori Toure
2. Sierra Leone, Liberia and Christian Missionary Activities in West Africa
a. The foundation of Sierra Leone and Liberia and the spread of Christianity
b. The activities and impact of Christian missionaries.
3. Egypt under Mohammed Ali and Khedive Ismail:
a. The rise of Mohammad Ali and his reforms
b. Mohammad Ali’s relations with the Europeans
c. Ismail’s fiscal policies
d. The British occupation of Egypt
4. The Mahdi and Mahdiyya Movement in the Sudan
a. Causes
b. Course
c. Consequences

OBJECTIVES:
Candidates should be able to:
i. establish the relationship between the Sokoto Jihad and other Jihads in West Africa:
ii. compare the achievements of the Jihads of Seku Ahmadu and Al-Hajj Umar.
iii. examine the activities of Samori Toure of the Madinka Empire.
iv. determine the factors that led to the founding of Sierra Leone and Liberia;
v. examine the importance of Sierra Leone and Liberia in the spread and impact of Christianity in West Africa.
vi. assess the impact of Christian missionary activities in West Africa.
vii. determine the factors that aided Mohammad Ali’s rise to power and his reforms;
viii. establish the relationship between Mohammad Ali’s Empire and the Europeans;
ix. account for the fiscal policies of Ismail;
x. examine the reasons for the British occupation of Egypt.
xi. examine the causes, the course and consequences of the Mahdiyya Movement in the Sudan.`
    },
    {
      name: 'Part II: Eastern and Southern Africa',
      content: `TOPICS/CONTENTS/NOTES:
SECTION B: EASTERN AND SOUTHERN AFRICA
1. The Omani Empire
a. The rise of the Omani Empire
b. The empire’s commercial and political relations with the coast and the hinterland.
c. The Empire’s relations with the Europeans
2. Ethiopia in the 19th century
a. The rise of Theodore II and his attempt at the unification of Ethiopia
b. Menelik II and Ethiopian independence.
3. The Mfecane:
a. The rise of the Zulu Nation 
b. Causes, Course and consequences of the Mfecane
4. The Great Trek
a. The frontier wars
b. British intervention in the Boer African relations
c. The Great Trek and its consequences. 

OBJECTIVES:
Candidates should be able to:
i. determine the factors that led to the rise of the Omani Empire;
ii. assess the establishment of commercial and political relations between the Omani Empire, the coast and the hinterland.
iii. examine the relationship that existed between the Omani Empire and the Europeans.
iv. examine the factors that led to the rise of Theodore II as the Emperor of Ethiopia;
v. analyse the strategies that were adopted to achieve Ethiopian unification.
vi. assess the role of Menelik II in the maintenance of Ethiopian independence
vii. trace events in Nguniland before the Mfecane;
viii. determine the factors that led to the rapid rise of Shaka.
ix. examine the causes, course and consequences of the Mfecane.
x. determine the factors that led to the frontier wars;
xi. account for British intervention in the Boer-African relations;
xii. describe the nature of the Great Trek;
xiii. examine its consequences.`
    },
    {
      name: 'Part II: Imperialism and Colonialism in Africa',
      content: `TOPICS/CONTENTS/NOTES:
SECTION C: IMPERIALISM, COLONIALISM AND PROBLEMS OF NATION-BUILDING IN AFRICA
1. The New Imperialism and European Occupation of Africa
a. The New Imperialism in Africa
b. European scramble for Africa 
c. The Berlin Conference
d. The occupation and resistance by Africans.
2. Patterns of Colonial Rule in Africa:
a. The British
b. The French
c. The Portuguese
d. The Belgians
3. The Politics of Decolonization
a. Colonial policies and African discontent
b. The impact of the two world wars
c. Nationalist activities and the emergence of political parties and associations
d. Strategies for attaining independence

OBJECTIVES:
Candidates should be able to:
i. assess the causes of the New Imperialism
ii. examine the causes of the scramble;
iii. account for the significance of the Berlin Conference;
iv. examine African resistance to the occupation.
v. examine and compare the patterns of colonial rule by the various European powers.
vi. examine the policies employed by the colonial masters and the magnitude of African discontent;
vii. assess the impact of the First and Second World Wars on African nationalism;
viii. determine the strategies used in the attainment of independence.`
    },
    {
      name: 'Part II: Apartheid and Nation-Building',
      content: `TOPICS/CONTENTS/NOTES:
4. Apartheid in South Africa
a. The origin of apartheid
b. Rise of Afrikaner nationalism
c. Enactment of apartheid laws 
d. Internal reaction and the suppression of African nationalist movements
e. External reaction to apartheid, the Frontline States, the Commonwealth of Nations, OAU and the UN.
f. The dismantling of apartheid
g. Post-apartheid development
5. Problems of Nation-building in Africa
a. Political and economic challenges and constraints
b. Physical and environmental challenges
c. Ethnic and religious pluralism
d. Military intervention and political instability.
e. Neo-colonialism and under -development.
f. Boundary disputes and threat to African unity
g. Civil wars and the refugee problem.

OBJECTIVES:
Candidates should be able to:
i. trace the origin of apartheid in South Africa;
ii. give reasons for the rise of Afrikaner nationalism;
iii. evaluate apartheid laws;
iv. relate the internal reactions to apartheid to the African struggle for majority rule;
v. relate the contributions of African states and international organizations to the fight against apartheid;
vi. identify the steps taken towards the dismantling of apartheid in South Africa
vii. assess the post-apartheid development in South Africa.
viii. examine the political and economic problems faced by African countries in nation-building;
ix. assess the effects of natural disasters on Africa
x. determine the role of ethnic and religious problems in Africa;
xi. examine the role of the military in African politics;
xii. examine the role of neo-colonialism in Africa;
xiii. assess the problems of boundary disputes;
xiv. establish the relationship between civil wars and refugee problems in Africa`
    },
    {
      name: 'Recommended Texts',
      content: `RECOMMENDED TEXTS:
1. Abba, A (2006) The Politics of Mallam Aminu Kano, Kaduna Vanguard and Publishers.
2. Ayandele, A. E. et al (1986) The Making of Modern Africa, The Twentieth Century Vol 2., Longman.
3. Ajayi and Crowther (1971) History of West Africa Vol. I, London, Longman.
4. Ajayi and Crowther (1974) History of West Africa Vol. II, London, Longman
5. Akinloye, S. A. (1976) Emergent African States: Topics in Twentieth Century African History, Longman.
6. Akinyemi, A. B., Agbi, S. O. and Otunbanjo, A. O. (eds) (1989) Nigeria since Independence: The First 25 years. (International Relations) Vol x, Heinemann. Ibadan.
7. Anene J. C. and Brown, G (1966) African in the 19th and 20th centuries, Ibadan: University Press.
8. Anene J. C. (1966) Southern Nigeria in Transition, 1885 – 1906, Cambridge: University Press.
9. Boahen, A (1969) The Revolutionary years: Africa since 1800 Longman publishers.
10. Crowther, M. West Africa: An introduction to its History, Longman, 1977.
11. Dike, K. O. (1956) Trade and Politics in the Niger Delta, London: Oxford University Press.
12. Falola, T. et al (1989) History of Nigeria Vol. I, Lagos: Longman.
13. Ikime, O. (ed) (1980) Ground work of Nigerian History, Ibadan: Heinemann.
14. Oliver, T. and Afmore, A. (1996) Africa since 1880 (Fourth Edition) New York: Cambridge University Press.
15. Omolewa, M. (1986) Certificate History of Nigeria, Lagos: Longman.
16. Onwubiko, K. (1983) School Certificate History of West Africa, Onitsha: African – First Publishers.`
    }
  ]
};

async function importHistory() {
  console.log('📜 Starting Full JAMB History syllabus import...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const topic of HISTORY_SYLLABUS.topics) {
    try {
      const { data, error } = await supabase
        .from('question_sources')
        .insert({
          subject: HISTORY_SYLLABUS.subject,
          topic: topic.name,
          content: topic.content,
          source_type: 'jamb_syllabus',
          is_active: true,
          metadata: {
            imported_at: new Date().toISOString(),
            source: 'JAMB Official Syllabus',
            exam_type: 'UTME',
            version: 'Full Verbatim Syllabus with Maps and Images'
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
  
  console.log(`\n📊 History Import Summary:`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total: ${HISTORY_SYLLABUS.topics.length}`);
}

importHistory().catch(console.error);
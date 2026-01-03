require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

// FULLY DETAILED GOVERNMENT SYLLABUS CONTENT
// Sourced verbatim from JAMB Government Syllabus
const GOVERNMENT_SYLLABUS = {
  subject: 'Government',
  topics: [
    {
      name: 'General Objectives',
      content: `GENERAL OBJECTIVES:
The aim of the Unified Tertiary Matriculation Examination (UTME) syllabus in Government is to prepare the candidates for the Board’s examination. It is designed to test their knowledge in Government, with a view to determining their suitability for placement in institutions of higher learning in Nigeria.
These objectives are to:
i. appreciate the meaning of Government;
ii. analyse the framework and specify the institutions of Government;
iii. appreciate the basic principles of democratic governance and their application in Nigeria;
iv. explain the concept of citizenship and define the duties and obligations of a citizen;
v. appreciate the process of political development in Nigeria;
vi. evaluate the political development and problems of governance in Nigeria;
vii. understand the determinants and dynamics of foreign policy as they relate to Nigeria;
viii. assess the role of Nigeria as a member of the international community and the workings of international organizations.`
    },
    {
      name: 'Part 1: Basic Concepts in Government',
      content: `TOPICS/CONTENTS/NOTES:
1. Basic Concepts in Government
a. Power, Authority, Legitimacy, Sovereignty; 
b. Society, State, Nation, Nation-State;
c. Political Processes; Political Socialization, Political Participation, Political Culture.

OBJECTIVES:
Candidates should be able to:
i. identify the fundamental concepts in governance;
ii. analyse various political processes;`
    },
    {
      name: 'Part 1: Forms of Government',
      content: `TOPICS/CONTENTS/NOTES:
2. Forms of Government:
Monarchy, Aristocracy, Oligarchy, Autocracy, Republicanism, Democracy- definitions, features, merits and demerits. 

[Image of types of government chart]


OBJECTIVES:
Candidates should be able to:
i. distinguish between different forms of government.`
    },
    {
      name: 'Part 1: Arms of Government',
      content: `TOPICS/CONTENTS/NOTES:
3. Arms of Government:
a. The Legislature – types, structure, functions, powers;
b. The Executive – types, functions, powers;
c. The Judiciary – functions, powers, components.
d. Their relationships 

[Image of separation of powers and checks and balances diagram]


OBJECTIVES:
Candidates should be able to:
i. identify the duties and obligations of the various arms of government and their agencies;
ii. relate each arm to its functions;
iii. appreciate how these arms interrelates.`
    },
    {
      name: 'Part 1: Structures and Systems of Governance',
      content: `TOPICS/CONTENTS/NOTES:
4. Structures of Governance:
a. Unitary – features, reasons for adoption, merits and demerits
b. Federal – features, reasons for adoption, merits and demerits
c. Confederal - features, reasons for adoption, merits and demerits.
5. Systems of Governance:
Presidential, Parliamentary and Monarchical. 

OBJECTIVES:
Candidates should be able to:
i. compare the various political structures of governance.
ii. distinguish between the different systems of governance.`
    },
    {
      name: 'Part 1: Political Ideologies',
      content: `TOPICS/CONTENTS/NOTES:
6. Political Ideologies:
Communalism, Feudalism, Capitalism, Socialism, Communism, Totalitarianism, Fascism, Nazism. 

[Image of political spectrum chart]


OBJECTIVES:
Candidates should be able to:
i. differentiate between the major political ideologies;
ii. contrast their modes of production,`
    },
    {
      name: 'Part 1: Constitution and Democratic Principles',
      content: `TOPICS/CONTENTS/NOTES:
7. Constitution:
Meaning, Sources, Functions, Types - Written, Unwritten, Rigid and Flexible.
8. Principles of Democratic Government:
Ethics and Accountability in Public Office, Separation of Power, Checks and Balances, Individual and Collective Responsibility, Constitutionalism, Rule of Law, Representative Government.

OBJECTIVES:
Candidates should be able to:
i. Define and identify sources and functions of constitutions;
ii. compare the nature of constitutions.
iii. identify the principles of democratic government;
iv. determine the application of these principles;`
    },
    {
      name: 'Part 1: Processes of Legislation',
      content: `TOPICS/CONTENTS/NOTES:
9. Processes of Legislation:
Legislative Enactments – Acts, Edicts, Bye-laws, Delegated Legislation, Decrees. 

OBJECTIVES:
Candidates should be able to:
i. analyse the processes involved in the making of laws.`
    },
    {
      name: 'Part 1: Citizenship',
      content: `TOPICS/CONTENTS/NOTES:
10. Citizenship:
a. Meaning, types;
b. Citizenship rights;
c. Dual citizenship, renunciation, deprivation;
d. Duties and obligations of citizens;
e. Duties and obligations of the state.

OBJECTIVES:
Candidates should be able to:
i. differentiate between the various methods of acquiring citizenship;
ii. specify the rights and responsibilities of a citizen;
iii. assess the obligations of the state.`
    },
    {
      name: 'Part 1: The Electoral Process',
      content: `TOPICS/CONTENTS/NOTES:
11. The Electoral Process:
a. Suffrage – evolution, types;
b. Election – types, ingredients of free and fair election;
c. Electoral System - types, advantages and disadvantages of each; 
d. Electoral Commission – functions, problems.

OBJECTIVES:
Candidates should be able to:
i. distinguish the different types of franchise
ii. identify and explain the types of electoral systems
iii. analyse the various electoral processes.`
    },
    {
      name: 'Part 1: Political Parties, Pressure Groups and Public Opinion',
      content: `TOPICS/CONTENTS/NOTES:
12. Political Parties and Party Systems:
a. Political parties – Definition, organization, functions.
b. Party Systems – Definition, organization, functions.
13. Pressure Groups:
a. Definition, types, functions and modes of operation.
b. Differences between Pressure Groups and Political Parties.
14. Public Opinion:
a. Meaning, formation and measurement.
b. Functions and limitations.

OBJECTIVES:
Candidates should be able to:
i. assess the role of political parties;
ii. distinguish between types of party systems.
iii. evaluate the functions and the modus operandi of pressure groups;
iv. distinguish between pressure groups and political parties.
v. compare methods of assessing public opinion;
vi. assess the functions of public opinion;
vii. analyse the limitations of public opinion.`
    },
    {
      name: 'Part 1: The Civil Service',
      content: `TOPICS/CONTENTS/NOTES:
15. The Civil Service:
Definition, characteristics, functions, structure, control and problems. 

OBJECTIVES:
Candidates should be able to:
i. analyse the significance of civil service in governance.`
    },
    {
      name: 'Part 2: Pre-colonial Polities',
      content: `TOPICS/CONTENTS/NOTES:
1. Pre – colonial Polities:
Pre-jihad Hausa, Emirate, Tiv, Igbo, Yoruba
a. Their structural organization; 
b. The functions of their various political institutions.

OBJECTIVES:
Candidates should be able to:
i. appreciate the effectiveness of the pre-colonial political systems;
ii. compare pre-colonial systems of governance.`
    },
    {
      name: 'Part 2: Imperialist Penetration',
      content: `TOPICS/CONTENTS/NOTES:
2. Imperialist Penetration:
a. The British process of acquisition – trade, missionary activities, company rule, crown colony, protectorate;
b. The British colonial administrative policy – direct and indirect rule;
c. The French colonial administrative policy – assimilation and association;
d. Impact of British colonial rule- economic, political, socio-cultural;
e. Comparison of British and French colonial administration.

OBJECTIVES:
Candidates should be able to:
i. trace the processes of imperialist penetration;
ii. assess the impact of British and French policies;
iii. distinguish between British and French colonial practices.`
    },
    {
      name: 'Part 2: Process of Decolonization',
      content: `TOPICS/CONTENTS/NOTES:
3. Process of Decolonization:
a. Nationalism – Meaning, Types;
b. Nationalist Movements – emergence, goals, strategies;
c. Nationalist Leaders – Herbert Macaulay, Nnamdi Azikiwe, Obafemi Awolowo, Ahmadu Bello, Ladipo Solanke, Aminu Kano, J. S. Tarka, Tafawa Balewa and others; 
d. Emergence of nationalist parties;
e. Influence of external factors.

OBJECTIVES:
Candidates should be able to:
i. evaluate the process of decolonization;
ii. assess the roles of nationalist leaders and parties;
iii. assess the impact of external forces and ideas (Pan-Africanism, Back–to–Africa Movements, Second World War etc).`
    },
    {
      name: 'Part 2: Constitutional Development in Nigeria',
      content: `TOPICS/CONTENTS/NOTES:
4. Constitutional Development in Nigeria:
a. Hugh Clifford Constitution (1922)
b. Arthur Richards Constitution (1946)
c. John Macpherson Constitution (1951)
d. Oliver Lyttleton Constitution (1954)
e. Independence Constitution (1960)
Their features, merits and demerits. 

OBJECTIVES:
Candidates should be able to:
i. compare the various constitutional developments.`
    },
    {
      name: 'Part 2: Post-Independence Constitutions and Institutions',
      content: `TOPICS/CONTENTS/NOTES:
5. Post – Independence Constitutions:
1963, 1979, 1989 and 1999– characteristics and shortcomings.
6. Institutions of Government in the Post – Independence Nigeria:
a. The Legislative – structures, functions and workings.
b. The Executive – structure, functions and workings.
c. The Judiciary – structure, functions and workings.
7. Public Commissions Established by the 1979 and Subsequent Constitutions:
The Civil Service Commission, the Public Complaints Commission, Electoral Commissions, National Boundary Commission and others – objectives functions and problems.

OBJECTIVES:
Candidates should be able to:
i. assess the workings of the various constitutions.
ii. evaluate the operations of the arms of government and their agencies, e.g the civil service, armed forces, police, courts and others.
iii. evaluate the operations of public commissions;
iv. assess the problems of the Public Commissions and their constraints.`
    },
    {
      name: 'Part 2: Political Parties in Post-Independence Nigeria',
      content: `TOPICS/CONTENTS/NOTES:
8. Political Parties and Party Politics in Post-Independence Nigeria:
a. First Republic
b. Second Republic
c. Third Republic
d. Fourth Republic
- Evolution, membership spread, structure, etc.

OBJECTIVES:
Candidates should be able to:
i. contrast political processes in the republics;
ii. evaluate the ideologies, structure and composition of the political parties.`
    },
    {
      name: 'Part 2: Nigerian Federalism',
      content: `TOPICS/CONTENTS/NOTES:
9. The Structure and Workings of Nigerian Federalism:
a. Rationale for a Federal System;
b. Tiers of government and their relationship;
c. Creation of States – 1963, 1967, 1976, 1987, 1991, 1996; 
d. Problems of Nigerian Federalism – census, revenue allocation, conflicts etc. solutions e.g. the Federal character, etc.

OBJECTIVES:
Candidates should be able to:
i. examine the workings of Nigerian federalism;
ii. identify its problems;
iii. evaluate the corrective measures to be adopted.`
    },
    {
      name: 'Part 2: Public Corporations and Local Government',
      content: `TOPICS/CONTENTS/NOTES:
10. Public Corporations and Parastatals:
a. Definition, types, purpose and functions;
b. Finance, control and problems;
c. Deregulation, privatization, and commercialization – objectives, features, merits and demerits;
d. Comparison between public corporations and parastatals.
11. Local Government:
a. Local government administration prior to 1976;
b. Features of local government reforms (1976, 1989) – structure, functions, finance and inter-governmental relations;
c. Traditional rulers and local governments;
d. Problems of local government administration in Nigeria.

OBJECTIVES:
Candidates should be able to:
i. examine the operations of public corporations and parastatals;
ii. identify the processes involved in privatization and commercialization;
iii. assess the economic importance of privatization and commercialization.
iv. trace the evolution and structure of local government;
v. identify the major problems faced by local governments.`
    },
    {
      name: 'Part 2: The Military in Nigerian Politics',
      content: `TOPICS/CONTENTS/NOTES:
12. The Military in Nigerian Politics
a. Factors that led to military intervention;
b. Structure of military regimes;
c. Impact of military rule – political, e.g. creation of states, introduction of unitary system (Unification Decree NO. 34) etc. economic, e.g. SAP, etc.
d. Processes of military disengagement.

OBJECTIVES:
Candidates should be able to:
i. evaluate the reasons given for military intervention;
ii. assess the achievements of military rule;
iii. determine the conditions that necessitated withdrawal from governance.`
    },
    {
      name: 'Part 3: Foreign Policy and Nigeria',
      content: `TOPICS/CONTENTS/NOTES:
1. Foreign Policy:
- Definition, purpose, determining factors; formulation and implementation.
2. Nigeria’s Foreign Policy:
a. Relations with major powers;
b. Relations with developing countries, e.g. the Technical Aid Corps (TAC), etc.
c. Nigeria’s Non-Alignment Policy.
3. Nigeria’s Relations with African Countries:
a. Africa as the “centre piece” of Nigeria’s foreign policy – guiding principles, implementation and implications;
b. NEPAD – origin, objectives and implications.
4. Nigeria in International Organizations
a. The United Nations;
b. The Commonwealth;
c. The Organization of African Unity;
d. The African Union;
e. The Economic Community of West African States (ECOWAS);
f. The Organization of Petroleum Exporting Countries (OPEC).

OBJECTIVES:
Candidates should be able to:
i. Define foreign policy, identify and explain its determinants
ii. identify the major objectives of Nigeria’s foreign policy.
iii. analyse Nigeria’s non-aligned posture.
iv. evaluate the role of Nigeria in continental affairs;
v. assess the role of NEPAD in developing Africa.
vi. analyse the dynamics of Nigeria’s involvement in international organizations;
vii. assess their contribution to the development of Nigeria.`
    },
    {
      name: 'Part 4: International Organizations',
      content: `TOPICS/CONTENTS/NOTES:
1. International Organizations:
a. ECOWAS; 
b. OAU, AU; 
c. Commonwealth;
d. OPEC;
e. UNO; 
f. African Petroleum Producers Association;
- Origin, objectives, structure, functions, achievements, problems and prospects of these organizations.

OBJECTIVES:
Candidates should be able to:
i. evaluate the operations of these international organizations;
ii. assess the role of these organizations in world affairs;
iii. appreciate the challenges of these organizations and how they can be overcome.`
    },
    {
      name: 'Recommended Texts',
      content: `RECOMMENDED TEXTS:
1. Adigwe, F (1985) Essentials of Government for West Africa, Ibadan: University Press Plc.
2. Anifowose, R and Enemuo, F. C. (eds)(1999) Elements of Politics, Lagos; Malthouse Press Limited.
3. Appadorai, A. (1978) The Substance of Politics, London: Oxford University Press.
4. Ball, A. R. (1983) Modern Politics and Government, London: Macmillan.
5. Ofoegbu, R. (1977) Government for the Certificate Year, London: George Allen and Unwin.
6. Olawale, J. B (1987) New Topics on Ordinary Level Government, Ilesha: Jola Publishing.
7. Oyediran, O. Nwosu, H., Takaya, B., Anifowoshe, R., Femi, B., Godwill, O. and Adigun, A. (1990) Government for Senior Secondary Schools, Books 1, 2 and 3, Ibadan: Longman.
8. Oyeneye, I., Onyenwenu, M. and Olusunde, B. E. (2000) Round-Up Government for Senior Secondary School Certificate Examination: A Complete Guide, Ibadan: Longman.
9. Oyovbaire, S., Ogunna, A. E. C., Amucheazi, E. C., Coker, H. O. and Oshuntuyi, O. (2001) Countdown to Senior Secondary Certificate Examination: Government, Ibadan: Evans.`
    }
  ]
};

async function importGovernment() {
  console.log('🏛️ Starting Full JAMB Government syllabus import...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const topic of GOVERNMENT_SYLLABUS.topics) {
    try {
      const { data, error } = await supabase
        .from('question_sources')
        .insert({
          subject: GOVERNMENT_SYLLABUS.subject,
          topic: topic.name,
          content: topic.content,
          source_type: 'jamb_syllabus',
          is_active: true,
          metadata: {
            imported_at: new Date().toISOString(),
            source: 'JAMB Official Syllabus',
            exam_type: 'UTME',
            version: 'Full Verbatim Syllabus with Image Tags'
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
  
  console.log(`\n📊 Government Import Summary:`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total: ${GOVERNMENT_SYLLABUS.topics.length}`);
}

importGovernment().catch(console.error);
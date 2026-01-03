require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

// FULLY DETAILED GEOGRAPHY SYLLABUS CONTENT
// Sourced verbatim from JAMB Geography Syllabus
const GEOGRAPHY_SYLLABUS = {
  subject: 'Geography',
  topics: [
    {
      name: 'General Objectives',
      content: `GENERAL OBJECTIVES:
The aim of the Unified Tertiary Matriculation Examination (UTME) syllabus in Geography is to prepare the candidates for the Board’s examination. It is designed to test their achievement of the course objectives, which are to:
1. handle and interpret topographical maps, photographs, statistical data and diagrams and basic field survey;
2. demonstrate knowledge of man’s physical and human environment and how man lives and earns a living on earth surface with special reference to Nigeria and Africa;
3. show understanding of the interrelationship between man and his environment;
4. apply geographical concepts, skills and principles to solving problems;
5. understand field work techniques and the study of a local area in the field.`
    },
    {
      name: 'Practical Geography: Maps and Surveying',
      content: `TOPICS/CONTENTS/NOTES:
I. PRACTICAL GEOGRAPHY
A. Maps
B. Scale and measurement of distances, areas reduction and enlargement, directions, bearings and gradients with reference to topographical maps. 
C. Map reading and interpretation; drawing of cross profiles, recognition of intervisibility, recognition and description of physical and human features and relationship as depicted on topographical maps. 
D. Interpretation of statistical data; maps and diagrams 
E. Elementary Surveying; chain and prismatic, open and close traverse, procedure, problems, advantages and disadvantages. 

OBJECTIVES:
Candidates should be able to:
Ai. define and identify different types and uses of maps
Bi. apply the different types of scale to distances and area measurement;
ii. understand conversion of scales
iii. apply the knowledge of scale to gradients, map reduction and enlargement;
iv. apply the knowledge of directions and bearings to geographical features.
Ci. illustrate the relief of an area through profile drawing;
ii. interpret physical and human features from topographical maps.
Di. Compute quantitative information from statistical data, diagrams and maps,
ii. interpret statistical data, diagrams and maps.
Ei. analyse the principle and procedure of each technique;
ii. compare the advantages and disadvantages of the two techniques.`
    },
    {
      name: 'Practical Geography: GIS',
      content: `TOPICS/CONTENTS/NOTES:
F. Geographic Information System (GIS): components, techniques, data sources, applications 

OBJECTIVES:
Candidates should be able to:
Fi. understand GIS and its uses.
ii. understand the basic concepts and components;
iii. express locations through the use of latitudes, longitudes, zipcodes etc;
iv. understand land surveying, remote sensing, map digitizing, map scanning as sources of data;
v. explain areas of use: Defense, Agriculture, Rural Development etc;
vi. identify problems with GIS in Nigeria.`
    },
    {
      name: 'Physical Geography: Earth as a Planet',
      content: `TOPICS/CONTENTS/NOTES:
II. PHYSICAL GEOGRAPHY
A. The earth as a planet
i. The earth in the solar system, rotation and revolution; 

[Image of solar system and earth orbit]

ii. The shape and size of the earth
iii. Latitudes and distances, longitudes and time; 

[Image of latitude and longitude grid]


OBJECTIVES:
Candidates should be able to:
Ai. identify the relative positions of the planets in the solar system;
ii. understand the effects of the rotation and revolution of the earth;
iii. provide proof for the shape and size of the earth;
iv. differentiate between latitudes and longitudes;
v. relate lines of latitude to calculation of distance;
vi. relate lines of longitude to calculation of time;`
    },
    {
      name: 'Physical Geography: The Earth Crust and Landforms',
      content: `TOPICS/CONTENTS/NOTES:
B. The Earth Crust
i. The structure of the earth (internal and external) Relationships among the four spheres. 

[Image of internal structure of the earth]

ii. Rocks: Types, characteristics, modes of formation and uses 

[Image of rock cycle diagram]

iii. Earth’s movement: Tectonic forces
iv. Major Landforms: Mountains, Plateau, Plains, Coastal landforms, karst topography and desert landforms 

[Image of karst topography features]


OBJECTIVES:
Candidates should be able to:
Bi. compare the internal and external components of the earth;
ii. understand the existing relationship among atmosphere, biosphere and hydrosphere in terms of energy balance and water cycle;
iii. differentiate between major types of rocks and their characteristics;
iv. analyse the processes of rock formation and the resultant features;
v. indicate the uses of rocks;
vi. differentiate between tensional and compressional forces and the resultant landforms;
vii. identify and describe the major landforms;`
    },
    {
      name: 'Physical Geography: Volcanism and Earthquakes',
      content: `TOPICS/CONTENTS/NOTES:
C. Volcanism and Earthquakes
i. Landforms associated with volcanic activities 

[Image of volcanic landforms cross-section]

ii. Landforms of Igneous Rocks
iii. Origin and types of Volcanoes
iv. Some volcanic eruptions and earthquakes.

OBJECTIVES:
Candidates should be able to:
Ci. explain the processes of volcanic eruptions and earthquakes;
ii. describe the different landforms associated with both volcanic eruptions and earthquakes;
iii. give examples of major volcanic eruptions and earthquakes in the world.`
    },
    {
      name: 'Physical Geography: Denudation Processes',
      content: `TOPICS/CONTENTS/NOTES:
D. Denudation processes in the tropics
i. Weathering
ii. Erosion
iii. Mass movement
iv. Deposition 

OBJECTIVES:
Candidates should be able to:
Di. identify the agents of denudation (water, wind and waves);
ii. identify the landforms associated with each process and agent.`
    },
    {
      name: 'Physical Geography: Water Bodies',
      content: `TOPICS/CONTENTS/NOTES:
E. Water Bodies
i. Oceans and seas (world distribution, salinity and uses)
ii. Ocean currents: types, distribution, causes and effects; 

[Image of world ocean currents map]

iii. Lakes: types, distribution and uses.
iv. Rivers: Action of running water.

OBJECTIVES:
Candidates should be able to:
Ei. locate oceans and seas on the globe;
ii. examine the characteristics and uses of oceans and seas;
iii. classify the types of ocean currents;
iv. account for the distribution of ocean currents;
v. evaluate the causes and effects of ocean currents;
vi. identify the types and location of lakes;
vii. indicate the characteristics and uses of lakes;
viii. identify the landforms of the different stages of a river course.`
    },
    {
      name: 'Physical Geography: Weather and Climate',
      content: `TOPICS/CONTENTS/NOTES:
F. Weather and Climate
i. Concept of weather and climate
ii. Elements of weather and climate
iii. Factors controlling weather and climate (pressure, air mass, altitude, continentality and winds)
iv. Classification of climate (Greek and Koppen). 

[Image of Koppen climate classification map]

v. Major climate types (Koppen), their characteristics and distribution.
vi. Measuring and recording weather parameters and instruments used. 
vii. The basic science of climate change.

OBJECTIVES:
Candidates should be able to:
Fi. differentiate between weather and climate;
ii. identify the elements of weather and climate;
iii. identify the factors controlling weather and climate;
iv. compare Koppen’s and Greek’s classifications;
v. identify the major types of climate according to Koppen;
vii. relate the weather instruments to their uses;
viii. define climate change;
ix. understand the causes of climate change;
x. understand the effects and remedies of climate change.`
    },
    {
      name: 'Physical Geography: Vegetation',
      content: `TOPICS/CONTENTS/NOTES:
G. Vegetation
i. Factors controlling growth of plants
ii. The concept of vegetation e.g. plant communities and succession
iii. Major types of vegetation, their characteristics and distribution 
iv. Impact of human activities on vegetation.

OBJECTIVES:
Candidates should be able to:
Gi. trace the factors controlling the growth of plants;
ii. analyse the process of vegetation development;
iii. identify the types, their characteristics and distribution;
iv. assess the impact of human activities on vegetation;
v. identify the importance of vegetation.`
    },
    {
      name: 'Physical Geography: Soil',
      content: `TOPICS/CONTENTS/NOTES:
H. Soil
i. Definition and properties
ii. Factors and processes of formation
iii. Soil profiles 

[Image of soil profile layers]

iv. Major tropical types, their characteristics, distribution and uses;
v. Impact of human activities on soils.

OBJECTIVES:
Candidates should be able to:
Hi. classify soils and their properties;
ii. identify the factors of formation;
iii. differentiate between the different types of soil horizons and their characteristics;
iv. compare the major tropical soil types and uses of soils;
v. account for the distribution and uses of soils;
vi. assess the impact of human activities on soils.`
    },
    {
      name: 'Physical Geography: Environmental Resources',
      content: `TOPICS/CONTENTS/NOTES:
I. Environmental Resources;
i. Types of resources (atmospheric, land, soil, vegetation and minerals)
ii. The concept of renewable and non-renewable resources;

OBJECTIVES:
Candidates should be able to:
Ii. interpret the concept of environmental resources;
ii. relate environmental resources to their uses;
iii. differentiate between the concepts of renewable and non-renewable resources.`
    },
    {
      name: 'Physical Geography: Environmental Interaction',
      content: `TOPICS/CONTENTS/NOTES:
J. Environmental interaction:
i. Land ecosystem 

[Image of ecosystem energy flow]

ii. Environmental balance and human interaction
iii. Effects of human activities on land ecosystem

OBJECTIVES:
Candidates should be able to:
Ji. identify the components of land ecosystem;
ii. establish the interrelationship within the ecosystem;
iii. interpret the concept of environmental balance;
iv. analyse the effects of human activities on land ecosystem.`
    },
    {
      name: 'Physical Geography: Environmental Hazards',
      content: `TOPICS/CONTENTS/NOTES:
K. Environmental hazards:
i. Natural hazards (droughts, earthquakes, volcanic eruptions, flooding)
ii. Man-induced (soil erosion, deforestation, pollution, flooding and desertification) 

OBJECTIVES:
Candidates should be able to:
Ki. identify the natural hazards and their causes;
ii. relate the human-induced hazards to their causes;
iii. locate the major areas where environmental hazards are common and their effects;
iv. recommend possible methods of prevention and control.`
    },
    {
      name: 'Physical Geography: Environmental Conservation',
      content: `TOPICS/CONTENTS/NOTES:
L. Environmental Conservation:

OBJECTIVES:
Candidates should be able to:
Li. explain with examples environmental conservation;
ii. identify the resources for conservation;
iii. discuss the different methods of environmental conservation;
iv. explain the need/importance of environmental conservation.`
    },
    {
      name: 'Human Geography: Population',
      content: `TOPICS/CONTENTS/NOTES:
III. HUMAN GEOGRAPHY
A. Population
i. World population with particular reference to the Amazon Basin, N.E. U.S.A., India, Japan and the West Coast of Southern Africa. 

[Image of world population density map]

ii. Characteristics – birth and death rates, ages/sex structure.
iii. Factors and patterns of population distribution;
iv. Factors and problems of population growth.

OBJECTIVES:
Candidates should be able to:
Ai. define different concepts of population;
ii. identify the characteristics of population (growth rates and structure);
iii. determine the factors and the patterns of population distribution;
iv. identify the factors and problems of population growth;
v. relate the types of migration to their causes and effects;
vi. account for the ways population constitute a resource.`
    },
    {
      name: 'Human Geography: Settlement',
      content: `TOPICS/CONTENTS/NOTES:
B. Settlement with particular reference to Western Europe, the USA, Middle East and West Africa:
i. Types and patterns: rural and urban, dispersed, nucleated and linear; 
ii. Rural settlement: classification, factors of growth and functions;
iii. Urban settlement – classification, factors of growth and functions.
iv. Problems of urban centres
v. Interrelationship between rural and urban settlements.

OBJECTIVES:
Candidates should be able to:
Bi. differentiate between types of settlements; (rural and urban);
ii. classify the patterns and functions of rural settlements;
iii. classify the patterns and functions of urban settlements;
iv. identify the factors of settlement location
v. identify the problems of urban centres;
vi. establish the interrelationship between rural and urban settlements.`
    },
    {
      name: 'Human Geography: Economic Activities',
      content: `TOPICS/CONTENTS/NOTES:
C. Selected economic activities
i. Types of economic activities: primary, secondary, tertiary and quartnary;
ii. Agriculture: types, system, factors and problems
iii. Manufacturing industries, types, locational factors, distribution and socio-economic importance and problems of industrialization in tropical Africa.
iv. Transportation and Communication types, roles in economic development and communication in tropical Africa.
v. World trade:-factors and pattern of world trade, major commodities (origin, routes and destinations).
vi. Tourism: definition, importance, location, problems and solutions.

OBJECTIVES:
Candidates should be able to:
Ci. identify the types of economic activities;
ii. differentiate between the types of economic activities;
iii. assess the importance and problems of agriculture as an economic activity;
iv. compare the types of manufacturing industries;
v. identify the factors of industrial location;
vi. examine the socio-economic importance of manufacturing industries;
vii. give reasons for the problems of industrialization in tropical Africa;
viii differentiate between the modes of transportation and communication;
ix. assess the economic importance of transportation;
x. give reasons for the problems of transportation in tropical Africa;
xi. relate the factors to the pattern of world trade;
xii. classify the major commodities of trade in terms of their origins, routes and destination;
xiii. analyse tourism as an economic activity;
xiv. identify the problems of tourism and their solutions.`
    },
    {
      name: 'Regional Geography: Nigeria (Physical)',
      content: `TOPICS/CONTENTS/NOTES:
IV. REGIONAL GEOGRAPHY
A. Broad outline of Nigeria
i. Location, position, size, political division (states) and peoples; 
ii. Physical setting: geology, relief, landform, climate and drainage, vegetation and soils; 
iii. Population: size, distribution, migration, (types, problems and effects);
iv. Natural resources: types (minerals, soils, water, vegetation, etc.) distribution, uses and conservation. 

OBJECTIVES:
Candidates should be able to:
Ai. describe the location, size and political divisions of Nigeria;
ii. identify the boundaries and neighbours of Nigeria;
iii. identify the ethnic groups and their distributions;
iv. relate the components of physical settings to their effects on human activities;
v. account for the pattern of population distribution;
vi. examine the types of migration, their problems and effects;
vii. identify the types of natural resources and their distribution;
viii. indicate the uses and conservation of natural resources.`
    },
    {
      name: 'Regional Geography: Nigeria (Economic and Human)',
      content: `TOPICS/CONTENTS/NOTES:
B. Economic and Human Geography:
i. Agricultural Systems: the major crops produced, problems of agricultural development in Nigeria. 
ii. Manufacturing Industries: factors of location, types of products, marketing and problems associated with manufacturing;
iii. Transportation and Communication: modes of transportation and communication and their relative advantages and disadvantages;
iv. Trade: Regional and International Trade, advantages and disadvantages;
v. Tourism: definition, importance, problems and solutions.

OBJECTIVES:
Candidates should be able to:
Bi. compare the farming systems practised in Nigeria;
ii. identify the crops produced and the problems encountered;
iii. identify the types and location of the major manufacturing industries;
iv. determine the factors of industrial location and the problems associated with the industries;
v. establish the relationship between transport and communication;
vi. relate the modes of transportation and communication to their relative advantages and disadvantages;
vii. classify the major commodities of regional and international trade;
viii. identify the importance of tourism and tourist centres;
ix. account for the problems of tourism and their solutions.`
    },
    {
      name: 'Regional Geography: ECOWAS',
      content: `TOPICS/CONTENTS/NOTES:
C. ECOWAS
i. Meaning and objectives
ii. Member states 
iii. Advantages and disadvantages
iv. Problems and solutions.

OBJECTIVES:
Candidates should be able to:
Ci. State the meaning, purpose and objectives;
ii. identify and locate the member countries;
iii. understand the purpose/mandate of the organization;
iv. evaluate the prospects and problems of the organization.`
    },
    {
      name: 'Recommended Texts',
      content: `RECOMMENDED TEXTS:
1. Adeleke, B.O. Areola .O. 2002 and Leong, G.C. Certificate Physical and Human Geography for Senior Secondary School (West African Edition), Ibadan: Oxford.
2. Balogun, O.Y. (2009) Senior Secondary Atlas, Nigeria: Longman, Nigeria.
3. Bradshaw, M. et al (2004) Contemporary World Regional Geography, New York: McGraw Hill.
4. Bunet, R.B and Okunrotifa, P.O.(1999) General Geography in Diagrams for West Africa, China: Longman.
5. Collins New Secondary Atlas, Macmillan.
6. Emiela, S.A. (2014) Senior Secondary Geography (New Syllabus Edition), Geographical Bureau Nig. Ltd.
7. Fellman, D. et al (2005) Introduction to Geography (Seventh Edition) New York: McGraw Hill.
8. Getis, A. et al (2004) Introduction to Geography (Ninth Edition) New York: McGraw Hill.
9. Iloeje, N. P(1999) A New Geography of West Africa, Hong Kong: Longman.
10. Iloeje, N.P(1982) A New Geography of Nigeria (New Education), Hong Kong: London.
11. Iwena, O.A. (2018) Essential Geography for Senior Secondary Schools. Ibafo, Nigeria: Tonad Publishers Limited.
12. Nimako, D.A. (2000) Map Reading of West Africa, Essex: Longman.
13. Okunrotifa, P.O. and Michael S. (2000) A Regional Geography of Africa (New Edition), Essex: London.
14. Udo, R.K(1970) Geographical Regions of Nigeria, London: Longman.
15. Waugh, D. (1995) Geography an Integrated Approach (Second Edition), China: Nelson.
16. Wisdomline Pass at Once JAMB.
17. Adegoke, M.A (2013), A Comprehensive Text on Physical, Human and Regional Geography.`
    }
  ]
};

async function importGeography() {
  console.log('🌍 Starting Full JAMB Geography syllabus import...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const topic of GEOGRAPHY_SYLLABUS.topics) {
    try {
      const { data, error } = await supabase
        .from('question_sources')
        .insert({
          subject: GEOGRAPHY_SYLLABUS.subject,
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
  
  console.log(`\n📊 Geography Import Summary:`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total: ${GEOGRAPHY_SYLLABUS.topics.length}`);
}

importGeography().catch(console.error);
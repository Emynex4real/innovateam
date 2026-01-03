require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

// FULLY DETAILED BIOLOGY SYLLABUS CONTENT
// Sourced verbatim from JAMB Biology Syllabus
const BIOLOGY_SYLLABUS = {
  subject: 'Biology',
  topics: [
    {
      name: 'Variety of Organisms: Living Organisms',
      content: `TOPICS / CONTENTS / NOTES:
1. Living organisms:
a. Characteristics
b. Cell structure and functions of cell components 
c. Level of organization:
i. Cell e.g. euglena and paramecium
ii. Tissue e.g. epithelial tissues and hydra
iii. Organ e.g. onion bulb
iv. Systems e.g. reproductive, digestive and excretory
v. Organisms e.g. Chlamydomonas

OBJECTIVES:
Candidates should be able to:
i. differentiate between the characteristics of living and non-living things.
ii. identify the structures of plant and animal cells.
iii. analyse the functions of the components of plant and animal cells.
iv. compare and contrast the structure of plant and animal cells.
v. trace the levels of organization among organisms in their logical sequence in relation to the five levels of organization of living organisms.`
    },
    {
      name: 'Variety of Organisms: Evolution',
      content: `TOPICS / CONTENTS / NOTES:
2. Evolution among the following:
a. Monera (prokaryotes), e.g. bacteria and blue green algae.
b. Protista (protozoans and protophyta), e.g. Amoeba, Euglena and Paramecium. 

[Image of Amoeba and Paramecium structure]

c. Fungi, e.g. mushroom and Rhizopus.
d. Plantae (plants)
i. Thallophyta (e.g. Spirogyra).
ii. Bryophyta (mosses and liverworts) e.g. Brachmenium and Merchantia.
iii. Pteridophyta (ferns) e.g. Dryopteris. 

[Image of life cycle of a fern]

iv. Spermatophyta (Gymnospermae and Angiospermae)
- Gymnosperms e.g. Cycads and conifers.
- Angiosperms (monocots, e.g. maize; dicots, e.g. water leaf)
e. Animalia (animals)
i. Invertebrates
- coelenterate e.g. Hydra
- Platyhelminthes flatworms e.g. Taenia
- Nematoda (roundworms)
- Annelida e.g. earthworm
- Arthropoda e.g. mosquito, cockroach, housefly, bee, butterfly
- Mollusca e.g. snails
ii. Multicellular animals (vertebrates)
- Pisces (cartilaginous and bony fish)
- Amphibia e.g. toads and frogs
- Reptilia e.g. lizards, snakes and turtles
- Aves (birds)
- Mammalia (mammals)

OBJECTIVES:
Candidates should be able to:
i. analyse external features and characteristics of the listed organisms.
ii. apply the knowledge from (i) above to demonstrate increase in structural complexity.
iii. trace the stages in the life histories of the listed organisms.
iv. apply the knowledge of the life histories to demonstrate gradual transition from life in water to life on land.
v. trace the evolution of the listed plants.
vi. trace the advancement of the invertebrate animals.
vii. determine the economic importance of the insects studied.
viii. assess their values to the environment.
ix. trace the advancement of multi-cellular animals.
x. determine their economic importance.`
    },
    {
      name: 'Variety of Organisms: Adaptations',
      content: `TOPICS / CONTENTS / NOTES:
3. Structural/functional and behavioural adaptations of organisms:
a. adaptive colouration and its functions
b. Behavioural adaptations in social animals
c. Structural adaptations in organisms 

OBJECTIVES:
Candidates should be able to:
i. describe how the various structures, functions and behaviour adapt these organisms to their environment, and way of life.
ii. Categorize countershading in fish, toads, snakes and warning colouration in mushrooms.
iii. Differentiate various castes in social insects like termites and their functions in their colony hive.
iv. Account for basking in lizards, territorial behaviour of other animals under unfavourable conditions (hibernation and aestivation).
v. account for adaptation in organisms with respect to the following:
- Obtaining food (beaks and legs of birds, mouthparts of insects, especially mosquito, butterfly and moth.)
- Protection and defence (stick insects, praying mantis and toad).
- Securing mates (redhead male and female Agama lizards, display of feathers by birds).
- Regulating body temperature (skin, feathers and hairs)
- Conserving water (spines in plants and scales in mammals).`
    },
    {
      name: 'Form and Functions: Internal Structure',
      content: `TOPICS / CONTENTS / NOTES:
1. Internal structure of plants and animals
a. Internal structure of a flowering plant
i. Root
ii. Stem
iii. Leaf


[Image of cross section of monocot and dicot stem]

b. Internal structure of a mammal

OBJECTIVES:
Candidates should be able to:
i. identify the transverse sections of these organs.
ii. relate the structure of these organs to their functions.
iii. identify supporting tissues in plants (collenchyma, sclerenchyma, xylem and phloem fibres)
iv. describe the distribution of supporting tissues in roots, stem and leaf
v. examine the arrangement of the mammalian internal organs.
vi. describe the appearance and position of the digestive, reproductive and excretory organs.`
    },
    {
      name: 'Form and Functions: Nutrition',
      content: `TOPICS / CONTENTS / NOTES:
2. Nutrition
a. Modes of nutrition
i. Autotrophic
ii. Heterotrophic
b. Types of Nutrition
c. Plant nutrition
i. Photosynthesis
ii. Chemosynthesis
iii. Mineral requirements (macro and micro-nutrients)
d. Animal nutrition
i. Classes of food substances; carbohydrates, proteins, fats and oils, vitamins, mineral salts and water
ii. Food tests (e.g. starch, reducing sugar, protein, oil, fat etc.)
iii. The mammalian tooth (structures, types and functions) 

[Image of mammalian tooth structure]

iv. Mammalian alimentary canal 

[Image of human digestive system]

v. Nutrition process (ingestion, digestion, absorption, and assimilation of digested food).

OBJECTIVES:
Candidates should be able to:
i. compare autotrophic and heterotrophic modes of nutrition.
ii. provide examples from both flowering and non- flowering plants.
iii. compare the photosynthetic and chemosynthetic modes of nutrition;
iv. differentiate the following examples of heterotrophic feeding:
- holozoic (sheep and man)
- Parasitic (roundworm, tapeworm and Loranthus)
- saprophytic (Rhizopus and mushroom)
- carnivorous plants (sundew and bladderwort)
- determine their nutritional value.
v. differentiate the light and dark reactions, of photosynthesis.
vi. determine the necessity of light, carbon (IV) oxide and chlorophyll in photosynthesis.
vii. detect the presence of starch in a leaf as an evidence of photosynthesis.
viii. identify macro-and micro-elements required by plants.
ix. recognise the deficiency symptoms of nitrogen, phosphorous and potassium.
x. indicate the sources of the various classes of food;
xi. determine the nutritional value of food
xii. relate the importance and deficiency (e.g. scurvy, rickets, kwashiorkor etc.) of each class of food;
xiii. determine the importance of a balanced diet.
xiv. detect the presence of a food type from the result of a given experiment.
xv. describe the structure of a typical mammalian tooth
xvi. differentiate the types of mammalian tooth and relate their structures to their functions.
xvii. compare the dental formulae of man, sheep and dog.
xviii. relate the structure of the various components of the alimentary canal and its accessory organs (liver, pancreas and gall bladder) to their functions.
xix. identify the general characteristics of digestive enzymes
xx. associate enzymes with digestion of carbohydrates, proteins and fats and
xxi. determine the end products of these classes of food.`
    },
    {
      name: 'Form and Functions: Transport',
      content: `TOPICS / CONTENTS / NOTES:
3. Transport
a. Need for transportation
b. Materials for transportation (Excretory products, gases, manufactured food, digested food, nutrient, water and hormones)
c. Channels for transportation
i. Mammalian circulatory system (heart, arteries, vein and capillaries) 

[Image of human circulatory system]

ii Plant vascular system (phloem and xylem)
d. Media and processes of mechanism for transportation.

OBJECTIVES:
Candidates should be able to:
i. determine the relationship between increase in size and complexity; and the need for the development of a transport system in plants and animals.
ii. determine the sources of materials and the forms in which they are transported.
iii. describe the general circulatory system
iv. compare specific functions of the hepatic portal vein, the pulmonary vein and artery, aorta, the renal artery and vein.
v. identify the organs of the plant vascular system.
vi. understand the specific functions of the phloem and xylem.
vii. identify media of transportation (e.g. cytoplasm, cell sap, body fluid, blood and lymph)
viii. state the composition and functions of blood and lymph
ix. describe diffusion, osmosis, plasmolysis and turgidity as mechanisms of transportation in organisms.
x. compare the various mechanisms of open circulatory systems in animal, transpiration pull, root pressure and active transport as mechanisms of transportation in plants.`
    },
    {
      name: 'Form and Functions: Respiration',
      content: `TOPICS / CONTENTS / NOTES:
4. Respiration
a. Respiratory organs and surfaces 

[Image of fish gills structure]

b. The mechanism of gaseous exchange in:
i. Plants
ii. Animals
c. Aerobic respiration
d. Anaerobic respiration

OBJECTIVES:
Candidates should be able to:
i. explain the significance of respiration;
ii. describe a simplified outline of the chemical processes involved in glycolysis and krebs cycle with reference to ATP production
iii deduce gaseous exchange and products, exchange and production of heat energy during respiration from experimental set up.
iv. describe the following respiratory organs and surfaces with organisms in which they occur; body surface, gill, trachea, lungs, stomata and lenticel.
v. describe the mechanism for the opening and closing of the stomata
vi. determine respiratory mechanisms in plants and animals.
vii. examine the role of oxygen in the liberation of energy for the activities of the living organisms
viii. explain the effect of insufficient supply of oxygen to the muscles.
ix. use yeast cells and sugar solution to demonstrate the process of fermentation.
x. state the economic importance of yeasts.`
    },
    {
      name: 'Form and Functions: Excretion',
      content: `TOPICS / CONTENTS / NOTES:
5. Excretion
a. Types of excretory structures: contractile vacuole, flame cell, nephridium, Malpighian tubule, kidney, stoma and lenticel. 

[Image of human kidney nephron structure]

b. Excretory mechanisms:
i. Kidneys
ii. lungs
iii. skin
c. Excretory products of plants

OBJECTIVES:
Candidates should be able to:
i. define the meaning and state the significance of excretion
ii. relate the characteristics of each structure with functions.
iii. relate the structure of the kidneys to the excretory and osmo-regulatory functions.
iv. identify the functions and excretory products of the lungs and the skin.
v. deduce the economic importance of the excretory products of plants e.g. carbon (IV) oxide, oxygen, tannins, resins, gums, mucilage, alkaloids etc.`
    },
    {
      name: 'Form and Functions: Support and Movement',
      content: `TOPICS / CONTENTS / NOTES:
6. Support and movement
a. Tropic, tactic, nastic and sleep movements in plants
b. supporting tissues in animals
c. Types and functions of the skeleton 

[Image of human skeleton system]

i. Exoskeleton
ii. Endoskeleton
iii. Functions of the skeleton in animals

OBJECTIVES:
Candidates should be able to:
i. determine the need for support and movement in organisms
ii. identify supporting tissues in plants (collenchyma, sclerenchyma, xylem and phloem fibres)
iii. describe the distribution of supporting tissues in root, stem and leaf.
iv. relate the response of plants to the stimuli of light, water, gravity and touch
v. identify the regions of growth in roots and shoots and the roles of auxins in tropism.
vi. relate the location of chitin, cartilage and bone to their supporting function.
vii. relate the structure and the general layout of the mammalian skeleton to their supportive, locomotive and respiratory function.
viii. differentiate types of joints using appropriate examples.
ix. apply the protective, supportive, locomotive and respiratory functions of the skeleton to the well being of the animal.`
    },
    {
      name: 'Form and Functions: Reproduction',
      content: `TOPICS / CONTENTS / NOTES:
7. Reproduction
a. Asexual reproduction
i. Fission (e.g. Paramecium)
ii. Budding (e.g. yeast)
iii. Natural vegetative propagation
iv. Artificial vegetative propagation
b. Sexual reproduction in flowering plants
i. Floral parts and their functions 

[Image of longitudinal section of a flower]

ii. Pollination and fertilization
iii. products of sexual reproduction
c. Reproduction in mammals
i. Structures and functions of the male and female reproductive organs
ii. Fertilization and development. (Fusion of gametes)

OBJECTIVES:
Candidates should be able to:
i. differentiate between asexual and sexual reproduction
ii. apply natural vegetative propagation in crop production and multiplication.
iii. apply grafting, budding and layering in agricultural practices.
iv. relate parts of flower to their functions and reproductive process.
v. state the advantages of cross pollination.
vi. deduce the different types of placentation that develop into simple, aggregate, multiple and succulent fruits.
vii. differentiate between male and female reproductive organs.
viii. relate their structure and function to the production of offspring.
ix. describe the fusion of gametes as a process of fertilization.
x. relate the effects of the mother’s health, nutrition and indiscriminate use of drugs on the developmental stages of the embryo up to birth.
xi. explain the modern methods of regulating reproduction on e.g. invitro fertilization and birth control`
    },
    {
      name: 'Form and Functions: Growth',
      content: `TOPICS / CONTENTS / NOTES:
8. Growth
a. Meaning of growth
b. Germination of seeds and condition necessary for germination of seeds.

OBJECTIVES:
Candidates should be able to:
i. apply the knowledge of the conditions necessary for germination on plant growth.
ii. differentiate between epigeal and hypogeal germination.`
    },
    {
      name: 'Form and Functions: Co-ordination and Control',
      content: `TOPICS / CONTENTS / NOTES:
9. Co-ordination and control
a. Nervous coordination:
i. the components, structure and functions of the central nervous system
ii. The components and functions of the peripheral nervous system
iii. Mechanism of transmission of impulses 

[Image of neuron structure]

iv. Reflex action
b. The sense organs
i. Skin (tactile)
ii. Nose (olfactory)
iii. Tongue (taste)
iv. Eye (sight) 

[Image of human eye structure]

v. Ear (auditory)
c. Hormonal control
i. animal hormonal system (Pituitary, thyroid, parathyroid, adrenal gland, pancreas, gonads)
ii. Plant hormones (phytohormones)
d. Homeostasis
i. Body temperature regulation
ii. Salt and water regulation

OBJECTIVES:
Candidates should be able to:
i. apply the knowledge of the structure and function of the central nervous system in the coordination of body functions in organisms.
ii. illustrate reflex actions such as blinking of the eyes, knee jerk etc.
iii. differentiate between reflex and voluntary actions as well as conditioned reflexes such as salivation, riding a bicycle and swimming.
iv. relate the listed sense organs with their functions.
v. apply the knowledge of the structure and functions of these sense organs in detecting and correcting their defects.
vi. state the location of the listed endocrine glands in animals.
vii. relate the hormone produced by each of these glands to their functions.
viii. examine the effects of various phytohormones (e.g. auxins, gibberellin, cytokinin, and ethylene) on growth, tropism, flowering, fruit ripening and leaf abscission.
ix. relate the function of hormones in homeostasis.`
    },
    {
      name: 'Ecology: Distribution and Symbiosis',
      content: `TOPICS / CONTENTS / NOTES:
1. Factors affecting the distribution of Organisms
i. Abiotic
ii. Biotic
2. Symbiotic interactions of plants and animals
(a) Energy flow in the ecosystem: food chains, food webs and trophic levels. 

[Image of food web ecosystem]

(b) Nutrient cycling in nature.
i. carbon cycle
ii. water cycle
iii. Nitrogen cycle 

[Image of nitrogen cycle diagram]


OBJECTIVES:
Candidates should be able to:
i. relate the effects of temperature; rainfall, relative humidity, wind speed and direction, altitude, salinity, turbidity, pH and edaphic (soil) conditions on the distribution of organisms.
ii. use appropriate equipment (secchi disc, thermometer, rain gauge) to measure abiotic factors.
iii. describe how the activities of plants/animals (particularly human) affect the distribution of organisms.
iv. determine appropriate examples of symbiosis, parasitism, saprophytism, commensalism, mutualism, amensalism, competition, predation and cooperation among organisms.
v. explain the distribution of organisms with food chains and food webs in particular habitats.
vi. define chains and webs
vii. describe the carbon cycle and its significance including the balance of atmospheric oxygen and carbon (IV) oxide and global warming.
viii. assess the effects of water cycle on other nutrient cycles.
ix. relate the roles of bacteria and leguminous plants in the cycling of nitrogen.`
    },
    {
      name: 'Ecology: Habitats and Biomes',
      content: `TOPICS / CONTENTS / NOTES:
3. Natural Habitats
(a) Aquatic (e.g. ponds, streams, lakes, seashores and mangrove swamps)
(b) Terrestrial/arboreal (e.g. tree-tops, abandoned farmland or a dry grassy (savanna) field, and burrow or hole.
4. Local (Nigerian) Biomes
a. Tropical rainforest
b. Guinea savanna (southern and northern)
c. Sudan Savanna
d. Desert
e. Highlands of montane forests and grasslands of the Obudu -, Jos -, Mambilla - Plateaus.

OBJECTIVES:
Candidates should be able to:
i. associate plants and animals with each of these habitats.
ii. relate adaptive features to the habitats in which organisms live.
iii. locate biomes in regions
iv. apply the knowledge of the features of the listed local biomes in determining the characteristics of different regions of Nigeria.`
    },
    {
      name: 'Ecology: Populations and Soil',
      content: `TOPICS / CONTENTS / NOTES:
5. The Ecology of Populations
(a) Population density and overcrowding.
(b) Adaptation for survival
i. Factors that bring about competition
ii. Intra and inter-specific competition
iii. Relationship between competition and succession.
(c) Factors affecting population sizes:
i. Biotic (food, pest, disease, predation, competition and reproductive ability).
ii. Abiotic (temperature, space, light, rainfall, topography, pressure, pH) etc.
(d) Ecological succession
i. primary succession
ii. secondary succession
6. SOIL
a. Characteristics of different types of soil (sandy, loamy, clayey)
i. soil structure
ii. porosity, capillarity and humus content 

[Image of soil profile layers]

b. Components of the soil
i. inorganic
ii. organic
iii. soil organisms
iv. soil air
v. soil water
c. Soil fertility
i. loss of soil fertility
ii. renewal and maintenance of soil fertility

OBJECTIVES:
Candidates should be able to:
i. determine the reasons for rapid changes in human population and the consequences of overcrowding.
ii. compute/calculate density as the number of organisms per unit area.
iii. Relate increase in population, diseases, shortage of food and space with intra- and inter-specific competition.
iv. Determine niche differentiation as a means of reducing intra-specific completion.
v. Relate competition to succession.
vi. deduce the effect of these factors on the size of population.
vii. determine the interactions between biotic and abiotic factors, (e.g. drought or scarcity of water which leads to food shortage and lack of space which causes increase in disease rates).
viii. trace the sequence in succession to the climax stage of stability in plant population.
ix. identify physical properties of different soil types based on simple measurement of particle size, porosity or water retention ability.
x. determine the amounts of air, water, humus and capillarity in different soil types experimentally.
xi. relate soil characteristics, types and components to the healthy growth of plants
xii. relate such factors as loss of inorganic matter, compaction, leaching, erosion of the top soil and repeated cropping with one variety.
xiii. apply the knowledge of the practice of contour ridging, terracing, mulching, poly-cropping, strip-cropping, use of organic and inorganic fertilizers, crop rotation, shifting cultivation, etc. to enhance soil conservation.`
    },
    {
      name: 'Ecology: Humans and Environment',
      content: `TOPICS / CONTENTS / NOTES:
7. Humans and Environment
(a) Diseases:
(i) Common and endemic diseases
ii. Easily transmissible diseases and disease syndrome such as:
- poliomyelitis
- cholera
- tuberculosis
- sexually transmitted disease/syndrome (gonorrhea, syphilis, AIDS, etc.)
b. Pollution and its control
(i) Sources, types, effects and methods of control.
(ii) Sanitation and sewage
c. Conservation of Natural Resources
d. Game reserves and National parks

OBJECTIVES:
Candidates should be able to:
i. identify ecological conditions that favour the spread of common endemic and potentially epidemic diseases e.g. malaria, meningitis, drancunculiasis, schistosomiasis, onchocerciasis, typhoid fever and cholera.
ii. relate the biology of the vector or agent of each disease with its spread and control
iii. use the knowledge of the causative organisms, mode of transmission and symptoms of the listed diseases to their prevention - treatment - control
iv. apply the principles of inoculation and vaccination on disease prevention.
v. categorize pollution into air, water and soil
vi. relate the effects of common pollutants to human health and environmental degradation.
vii. determine the methods by which each pollutant may be controlled.
viii. explain the importance of sanitation with emphasis on solid waste, sewage disposal, community health and personal hygiene.
ix. assess the roles and functions of international and national health agencies e.g. World Health Organization (WHO), United Nations International Children Emergency Fund (UNICEF), International Red Cross Society (IRCS) and the ministries of health and environment.
x. apply the various methods of conservation of both the renewable and non-renewable natural resources for the protection of our environment for present and future generations.
xi. outline the benefits of conserving natural resources, prevention of desertification.
xii. identify the bodies responsible for the conservation of resources at the national and international levels e.g. Nigerian Conservation Foundation (NCF), Federal Ministry of Environment, Nigeria National Parks, World Wildlife Foundation (WWF), International Union for Conservation of Nature (IUCN), United Nations Environmental Programme (UNEP) and their activities.
xiii identify and state the location and importance of game reserves and National parks in Nigeria`
    },
    {
      name: 'Heredity and Variations',
      content: `TOPICS / CONTENTS / NOTES:
(I) Variation In Population
a. Morphological variations in the physical appearance of individuals.
(i) size (height and weight)
(ii) Colour (skin, eye, hair, coat of animals, scales and feathers).
(iii) Fingerprints
b. Physiological variation
(i) Ability to roll tongue
(ii) Ability to taste phenylthiocarbamide (PTC)
(iii) Blood groups
c. Application of discontinuous variation in crime detection, blood transfusion and determination of paternity.
2. Heredity
a) Inheritance of characters in organisms
(i) Heritable characters
(ii) Non-heritable characters
b) Chromosomes – the basis of heredity
(i) Structure 

[Image of DNA double helix structure]

(ii) Process of transmission of hereditary characters from parents to offsprings.
c) Probability in genetics and sex determination.
d) Application of the principles of heredity in:
i) Agriculture
(ii) Medicine
e) Sex – linked characters e.g. baldness, haemophilia, colour blindness, etc.

OBJECTIVES:
Candidates should be able to:
i. differentiate between continuous and discontinuous variations with examples.
ii. relate the role of environmental conditions, habitat and the genetic constitution to variation.
iii. measure heights and weights of pupils of the same age group
iv. plot graphs of frequency distribution of the heights and weights.
v. observe and record various colour patterns in some plants and animals.
vi. apply classification of fingerprints in identity detection.
vii. identify some specific examples of physiological variation among human population.
viii. categorize people according to their physiological variation.
ix. apply the knowledge of blood groups in blood transfusion and determination of paternity.
x. use discontinuous variation in crime detection.
xi. determine heritable and non-heritable characters with examples.
xii. illustrate simple structure of DNA
xiii. illustrate segregation of genes at meiosis and recombination of genes at fertilization to account for the process of transmission of characters from parents to offsprings.
xiv. deduce that segregation of genes occurs during gamete formation and that recombination of genes at fertilization is random in nature.
xv. analyze data on cross-breeding experiments.
xvi. apply the principles of heredity in the production of new varieties of crops and livestock through cross-breeding.
xvii. deduce advantages and disadvantages of out- breeding and in-breeding.
xviii. analyze elementarily the contentious issues of genetically modified organisms (GMO) and gene therapy and biosafety.
xix. apply the knowledge of heredity in marriage counselling with particular reference to blood grouping, sickle-cell anaemia and the Rhesus factors.
xx. describe the significance of using recombinant DNA materials in the production of important medical products such as insulin, interferon and enzymes.
xxi. identify characters that are sex linked.`
    },
    {
      name: 'Evolution: Theories and Evidence',
      content: `TOPICS / CONTENTS / NOTES:
1. Theories of evolution
a) Lamarck’s theory
b) Darwin’s theory
c) organic theory
2. Evidence of evolution

OBJECTIVES:
Candidates should be able to:
i. relate organic evolution as the sum total of all adaptive changes that have taken place over a long period of time resulting in the diversity of forms, structures and functions among organisms.
ii. explain the contributions of Lamarck and Darwin to the theory of evolution.
iii. state the evidences in support of organic evolution
iv. mention the evidences for evolution such as fossil records, comparative anatomy, physiology and embryology.
v. trace evolutionary trends in plants and animals.
vi. state the evidence of modern evolutionary theories such as genetic studies and the role of mutation.`
    }
  ]
};

async function importBiology() {
  console.log('🧬 Starting Full JAMB Biology syllabus import...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const topic of BIOLOGY_SYLLABUS.topics) {
    try {
      const { data, error } = await supabase
        .from('question_sources')
        .insert({
          subject: BIOLOGY_SYLLABUS.subject,
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
  
  console.log(`\n📊 Biology Import Summary:`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total: ${BIOLOGY_SYLLABUS.topics.length}`);
}

importBiology().catch(console.error);
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

// FULLY DETAILED SYLLABUS CONTENT
// Sourced verbatim from JAMB Chemistry Syllabus
const CHEMISTRY_SYLLABUS = {
  subject: 'Chemistry',
  topics: [
    {
      name: 'Separation of Mixtures and Purification',
      content: `TOPICS/NOTES:
(a) Pure and impure substances
(b) Boiling and melting points
(c) Elements, compounds and mixtures
(d) Chemical and physical changes
(e) Separation processes: Evaporation, simple and fractional distillation, sublimation, filtration, crystallization, paper and column chromatography, simple and fractional crystallization, magnetization, decantation.

OBJECTIVES:
Candidates should be able to:
(i) distinguish between pure and impure substances;
(ii) use boiling and melting points as criteria for purity of chemical substances;
(iii) distinguish between elements, compounds and mixture;
(iv) differentiate between chemical and physical changes;
(v) identify the properties of the components of a mixture;
(vi) specify the principle involved in each separation method; and
(vii) apply the basic principle of separation processes in everyday life.`
    },
    {
      name: 'Chemical Combination',
      content: `TOPICS/NOTES:
Laws of definite, multiple and reciprocal proportions, law of conservation of matter, Gay Lussac’s law of combining volumes, Avogadro’s law; chemical symbols, formulae, equations and their uses, relative atomic mass based on 12C=12, the mole concept and Avogadro’s number and stoichiometry of reactions.

OBJECTIVES:
Candidates should be able to:
(i) perform simple calculations involving formulae, equations/chemical composition and the mole concept;
(ii) deduce the chemical laws from given expressions/statements/data;
(iii) interpret graphical representations related to these laws; and
(iv) deduce the stoichiometry of chemical reactions.`
    },
    {
      name: 'Kinetic Theory of Matter and Gas Laws',
      content: `TOPICS/NOTES:
(a) Phenomena to support the kinetic theory of matter using (i) melting, (ii) vapourization, (iii) boiling, (iv) freezing, (v) condensation in terms of molecular motion and Brownian movement.
(b) (i) The laws of Boyle, Charles, Graham and Dalton (law of partial pressure); combined gas law, molar volume and atomicity of gases.
(ii) The ideal gas equation (PV = nRT).
(iii) The relationship between vapour density of gases and the relative molecular mass.

OBJECTIVES:
Candidates should be able to:
(i) apply the theory to distinguish between solids, liquids and gases;
(ii) deduce reasons for change of state;
(iii) draw inferences based on molecular motion;
(iv) deduce gas laws from given expressions/statements;
(v) interpret graphical representations related to these laws; and
(vi) perform simple calculations based on these laws, equations and relationships.`
    },
    {
      name: 'Atomic Structure and Bonding',
      content: `TOPICS/NOTES:
(a) (i)The concept of atoms, molecules and ions, the works of Dalton, Millikan, Rutherford, Moseley, Thompson and Bohr.
(ii) Atomic structure, electron configuration, atomic number, mass number and isotopes; specific examples should be drawn from elements of atomic number 1 to 20.
(iii) Shapes of s and p orbitals.
(b) The periodic table and periodicity of elements, presentation of the periodic table with a view to recognizing families of elements e.g. alkali metals, halogens, the noble gases and transition metals. The variation of the following properties: ionization energy, ionic radii, electron affinity and electronegativity.
(c) Chemical bonding. Electrovalency and covalency, the electron configuration of elements and their tendency to attain the noble gas structure. Hydrogen bonding and metallic bonding as special types of electrovalency and covalency respectively; coordinate bond as a type of covalent bond as illustrated by complexes like [Fe(CN)6]3-, [Fe(CN)6]4-, [Cu(NH3)4]2+and [Ag(NH3)2]+; van der Waals’ forces should be mentioned as a special type of bonding forces.
(d) Shapes of simple molecules: linear ((H2, O2, Cl2, HCl and CO2), non-linear (H2O), tetrahedral; (CH4) and pyramidal (NH3).
(e) Nuclear Chemistry: (i) Radioactivity – Types and properties of radiations (ii) Nuclear reactions. Simple equations, uses and applications of natural and artificial radioactivity.

OBJECTIVES:
Candidates should be able to:
(i) distinguish between atoms, molecules and ions;
(ii) identify the contributions of these scientists to the development of the atomic structure;
(iii) deduce the number of protons, neutrons and electrons from atomic and mass numbers of an atom;
(iv) apply the rules guiding the arrangement of electrons in an atom;
(v) identify common elements exhibiting isotopy;
(vi) relate isotopy to mass number;
(vii) perform simple calculations relating to isotopy;
(viii) differentiate between the shapes of the orbitals;
(ix) determine the number of electrons in s and p atomic orbitals;
(x) relate atomic number to the position of an element on the periodic table;
(xi) relate properties of groups of elements on the periodic table;
(xii) identify reasons for variation in properties across the period and down the groups;
(xiii) differentiate between the different types of bonding;
(xiv) deduce bond types based on electron configurations;
(xv) relate the nature of bonding to properties of compounds;
(xvi) differentiate between the various shapes of molecules;
(xvii) distinguish between ordinary chemical reaction and nuclear reaction;
(xviii) differentiate between natural and artificial radioactivity;
(xix) compare the properties of the different types of nuclear radiations;
(xx) compute simple calculations on the half-life of a radioactive material;
(xxi) balance simple nuclear equation; and
(xxii) identify the various applications of radioactivity.`
    },
    {
      name: 'Air',
      content: `TOPICS/NOTES:
(a) The natural gaseous constituents and their proportion in the air. – nitrogen, oxygen, water vapour, carbon (IV) oxide and the noble gases (argon and neon).
(b) Air as a mixture and some uses of the noble gas.

OBJECTIVES:
Candidates should be able to:
(i) deduce reason (s) for the existence of air as a mixture;
(ii) identify the principle involved in the separation of air components;
(iii) deduce reasons for the variation in the composition of air in the environment; and
(iv) specify the uses of some of the constituents of air.`
    },
    {
      name: 'Water',
      content: `TOPICS/NOTES:
(a) Water as a product of the combustion of hydrogen and its composition by volume.
(b) Water as a solvent, atmospheric gases dissolved in water and their biological significance.
(c) Hard and soft water: Temporary and permanent hardness and methods of softening hard water.
(d) Treatment of water for town supply.
(e) Water of crystallization, efflorescence, deliquescence and hygroscopy. Examples of the substances exhibiting these properties and their uses.

OBJECTIVES:
Candidates should be able to:
(i) identify the various uses of water;
(ii) identify the effects of dissolved atmospheric gases in water;
(iii) distinguish between the properties of hard and soft water;
(iv) determine the causes of hardness;
(v) identify methods of removal of hardness;
(vi) describe the processes involved in the treatment of water for town supply;
(vii) distinguish between these phenomena; and
(viii) identify the various compounds that exhibit these phenomena.`
    },
    {
      name: 'Solubility',
      content: `TOPICS/NOTES:
(a) Unsaturated, saturated and supersaturated solutions. Solubility curves and simple deductions from them, (solubility defined in terms of mole per dm3) and simple calculations.
(b) Solvents for fats, oil and paints and the use of such solvents for the removal of stains.
(c) True and False solutions (Suspensions and colloids): Properties and examples. Harmattan haze and water paints as examples of suspensions and fog, milk, aerosol spray, emulsion paints and rubber solution as examples of colloids.

OBJECTIVES:
Candidates should be able to:
(i) distinguish between the different types of solutions;
(ii) interpret solubility curves;
(iii) calculate the amount of solute that can dissolve in a given amount of solvent at a given temperature;
(iv) deduce that solubility is temperature-dependent;
(v) relate nature of solvents to their uses;
(vi) differentiate among true solutions, suspensions and colloids;
(vii) compare the properties of a ‘true’ solution and a ‘false’ solution; and
(viii) provide typical examples of suspensions and colloids.`
    },
    {
      name: 'Environmental Pollution',
      content: `TOPICS/NOTES:
(a) Sources and effects of pollutants.
(b) Air pollution: Examples of air pollutants such as H2S, CO, SO2, oxides of nitrogen, chlorofluorocarbons and dust.
(c) Water pollution: Sewage and oil pollution should be known.
(d) Soil pollution: Oil spillage, biodegradable and non-biodegradable pollutants.

OBJECTIVES:
Candidates should be able to:
(i) identify the different types of pollution and pollutants;
(ii) specify different sources of pollutants;
(iii) classify pollutants as biodegradable and non-biodegradable;
(iv) specify the effects of pollution on the environment; and
(v) identify measures for control of environmental pollution.`
    },
    {
      name: 'Acids, Bases and Salts',
      content: `TOPICS/NOTES:
(a) General characteristics, properties and uses of acids, bases and salts. Acids/base indicators, basicity of acids; normal, acidic, basic and double salts. An acid defined as a substance whose aqueous solution furnishes H3O+ions or as a proton donor. Ethanoic, citric and tartaric acids as examples of naturally occurring organic acids, alums as examples of double salts, preparation of salts by neutralization, precipitation and action of acids on metals. Oxides and trioxocarbonate (IV) salts
(b) Qualitative comparison of the conductance of molar solutions of strong and weak acids and bases, relationship between conductance and amount of ions present.
(c) pH and pOH scale; Simple calculations
(d) Acid/base titrations.
(e) Hydrolysis of salts: Simple examples such as NH4Cl, AlCl3, Na2CO3 and CH3COONa

OBJECTIVES:
Candidates should be able to:
(i) distinguish between the properties of acids and bases;
(ii) identify the different types of acids and bases;
(iii) determine the basicity of acids;
(iv) differentiate between acidity and alkalinity using acid/base indicators;
(v) identify the various methods of preparation of salts;
(vi) classify different types of salts;
(vii) relate degree of dissociation to strength of acids and bases;
(viii) relate degree of dissociation to conductance;
(ix) perform simple calculations on pH and pOH;
(x) identify the appropriate acid-base indicator;
(xi) interpret graphical representation of titration curves;
(xii) perform simple calculations based on the mole concept;
(xiii) balance equations for the hydrolysis of salts; and
(xiv) deduce the properties (acidic, basic, neutral) of the resultant solution.`
    },
    {
      name: 'Oxidation and Reduction (Redox)',
      content: `TOPICS/NOTES:
(a) Oxidation in terms of the addition of oxygen or removal of hydrogen.
(b) Reduction as removal of oxygen or addition of hydrogen.
(c) Oxidation and reduction in terms of electron transfer.
(d) Use of oxidation numbers. Oxidation and reduction treated as change in oxidation number and use of oxidation numbers in balancing simple equations.
(e) IUPAC nomenclature of inorganic compounds using oxidation number.
(f) Tests for oxidizing and reducing agents.

OBJECTIVES:
Candidates should be able to:
(i) identify the various forms of expressing oxidation and reduction;
(ii) classify chemical reactions in terms of oxidation or reduction;
(iii) balance redox reaction equations;
(iv) deduce the oxidation number of chemical species;
(v) compute the number of electron transfer in redox reactions;
(vi) identify the name of redox species in a reaction
(vii) distinguish between oxidizing and reducing agents in redox reactions;
(viii) apply oxidation number in naming inorganic compounds; and
(ix) relate reagents to their oxidizing and reducing abilities.`
    },
    {
      name: 'Electrolysis',
      content: `TOPICS/NOTES:
(a) Electrolytes and non-electrolytes. Faraday’s laws of electrolysis.
(b) (i) Electrolysis of dilute H2SO4, aqueous CuSO4, CuC12 solution, dilute and concentrated NaC1 solutions and fused NaC1 (ii) Factors affecting discharge of ions at the electrodes.
(c) Uses of electrolysis: Purification of metals e.g. copper and production of elements and compounds (Al, Na, O2, Cl2 and NaOH).
(d) Electrochemical cells: Electrochemical series (K, Ca,Na, Mg, Al, Zn, Fe, Sn, Pb, H, Cu, Hg, Ag, Au,) half-cell reactions and electrode potentials. (Simple calculations only).
(e) Corrosion as an electrolytic process, cathodic protection of metals, painting, electroplating and coating with grease or oil as ways of preventing iron from corrosion.

OBJECTIVES:
Candidates should be able to:
(i) distinguish between electrolytes and nonelectrolytes;
(ii) perform calculations based on faraday as mole of electrons;
(iii) identify suitable electrodes for different electrolytes;
(iv) specify the chemical reactions at the electrodes;
(v) determine the products at the electrodes;
(vi) identify the factors that affect the products of electrolysis;
(vii) specify the different areas of application of electrolysis;
(viii) identify the various electrochemical cells;
(ix) calculate electrode potentials using halfcell reaction equations;
(x) determine the different areas of application of electrolytic processes; and
(xi) identify methods used in protecting metals.`
    },
    {
      name: 'Energy Changes',
      content: `TOPICS/NOTES:
(a) Energy changes(ΔH) accompanying physical and chemical changes: dissolution of substances in/or reaction with water e.g. Na, NaOH, K, NH4Cl. Endothermic (+ΔH) and exothermic (-ΔH) reactions.
(b) Entropy as an order-disorder phenomenon: simple illustrations like mixing of gases and dissolution of salts.
(c) Spontaneity of reactions: ΔGѳ = 0 as a criterion for equilibrium, ΔG greater or less than zero as a criterion for non-spontaneity or spontaneity respectively.

OBJECTIVES:
Candidates should be able to:
(i) determine the types of heat changes (ΔH) in physical and chemical processes;
(ii) interpret graphical representations of heat changes;
(iii) relate the physical state of a substance to the degree of orderliness;
(iv) determine the conditions for spontaneity of a reaction;
(v) relate ΔH0, ΔS0 and ΔG0 as the driving forces for chemical reactions; and
(vi) solve simple problems based on the relationships ΔGѳ = ΔH0 - TΔS0`
    },
    {
      name: 'Rates of Chemical Reaction',
      content: `TOPICS/NOTES:
(a) Elementary treatment of the following factors which can change the rate of a chemical reaction:
(i) Temperature e.g. the reaction between HCl and Na2S2O3 or Mg and HCl
(ii) Concentration/pressure e.g. the reaction between HCl and Na2S2O3, HCl and marble and the iodine clock reaction, for gaseous systems, pressure may be used as concentration term.
(iii) Surface area e.g. the reaction between marble and HCl with marble in (i) powdered form (ii) lumps of the same mass.
(iv) Catalyst e.g. the decomposition of H2O2 or KClO3 in the presence or absence of MnO2
(b) Reaction rate curves.
(c) Activation energy: Qualitative treatment of Arrhenius’ law and the collision theory, effect of light on some reactions. e.g. halogenation of alkanes

OBJECTIVES:
Candidates should be able to:
(i) identify the factors that affect the rates of a chemical reaction;
(ii) determine the effects of temperature on the rate of reactions;
(iii) examine the effect of concentration/pressure on the rate of a chemical reaction;
(iv) describe how the rate of a chemical reaction is affected by surface area;
(v) determine the types of catalysts suitable for different reactions and their effects;
(vi) determine ways of moderating these effects in chemical reactions;
(vii) interpret reaction rate curves;
(viii) solve simple problems on the rate of reactions;
(ix) relate the rate of reaction to the kinetic theory of matter.
(x) examine the significance of activation energy to chemical reactions; and
(xi) deduce the value of activation energy (Ea) from reaction rate curves.`
    },
    {
      name: 'Chemical Equilibria',
      content: `TOPICS/NOTES:
Reversible reactions and factors governing the equilibrium position. Dynamic equilibrium. Le Chatelier’s principle and equilibrium constant. Simple examples to include action of steam on iron and N2O4 <-> 2NO2.
No calculation will be required.

OBJECTIVES:
Candidates should be able to:
(i) identify the factors that affect the position of equilibrium of a chemical reaction;
(ii) predict the effects of each factor on the position of equilibrium; and
(iii) determine the effects of these factors on equilibrium constant.`
    },
    {
      name: 'Non-metals and Their Compounds',
      content: `TOPICS/NOTES:
(a) Hydrogen: commercial production from water gas and cracking of petroleum fractions, laboratory preparation, properties, uses and test for hydrogen.
(b) Halogens: Chlorine as a representative element of the halogen. Laboratory preparation, industrial preparation by electrolysis, properties and uses, e.g. water sterilization, bleaching, manufacture of HCl, plastics and insecticides. Hydrogen chloride and Hydrochloric acid: Preparation and properties. Chlorides and test for chlorides.
(c) Oxygen and Sulphur
(i) Oxygen: Laboratory preparation, properties and uses. Commercial production from liquid air. Oxides: Acidic, basic, amphoteric and neutral, trioxygen (ozone) as an allotrope and the importance of ozone in the atmosphere.
(ii) Sulphur: Uses and allotropes: preparation of allotropes is not expected. Preparation, properties and uses of sulphur (IV) oxide, the reaction of SO2 with alkalis. Trioxosulphate (IV) acid and its salts, the effect of acids on salts of trioxosulphate (IV), Tetraoxosulphate (VI) acid: Commercial preparation (contact process only), properties as a dilute acid, an oxidizing and a dehydrating agents and uses. Test for SO4 2-. Hydrogen sulphide: Preparation and properties as a weak acid, reducing and precipitating agents. Test for S2-
(d) Nitrogen:
(i) Laboratory preparation
(ii) Production from liquid air
(iii) Ammonia: Laboratory and industrial preparations (Haber Process only), properties and uses, ammonium salts and their uses, oxidation of ammonia to nitrogen (IV) oxide and trioxonitrate (V) acid. Test for NH4+
(iv) Trioxonitrate (V) acid: Laboratory preparation from ammonia; properties and uses. Trioxonitrate (V) saltaction of heat and uses. Test for NO3-
(v) Oxides of nitrogen: Properties. The nitrogen cycle.
(e) Carbon:
(i) Allotropes: Uses and properties
(ii) Carbon (IV) oxide: Laboratory preparation, properties and uses. Action of heat on trioxocarbonate (IV) salts and test for CO3 2-
(iii) Carbon (II) oxide: Laboratory preparation, properties including its effect on blood; sources of carbon (II) oxide to include charcoal, fire and exhaust fumes.
(iv) Coal: Different types, products obtained from destructive distillation of wood and coal.
(v) Coke: Gasification and uses. Manufacture of synthesis gas and uses.

OBJECTIVES:
Candidates should be able to:
(i) predict reagents for the laboratory and industrial preparation of these gases and their compounds;
(ii) identify the properties of the gases and their compounds;
(iii) compare the properties of these gases and their compounds;
(iv) specify the uses of each gas and its compounds;
(v) determine the specific test for each gas and its compounds;
(vi) determine specific tests for Cl-, SO4 2-, SO3 2-, S2-,NH4+, NO3-, CO3 2-, HCO3-
(vii) predict the reagents for preparation, properties and uses of HCl(g) and HCl(aq);
(viii) identify the allotropes of oxygen;
(ix) determine the significance of ozone to our environment;
(x) classify the oxides of oxygen and their properties;
(xi) identify the allotropes of sulphur and their uses;
(xii) predict the reagents for preparation, properties and uses of SO2and H2S;
(xiii) specify the preparations of H2SO4 and H2SO3, their properties and uses;
(xiv) specify the laboratory and industrial preparation of NH3;
(xv) identify the properties and uses of NH3;
(xvi) identify reagents for the laboratory preparation of HNO3, its properties and uses;
(xvii) specify the properties of N2O, NO, NO2 gases.
(xviii) examine the relevance of nitrogen cycle to the environment;
(xix) identify allotropes of carbon;
(xx) predict reagents for the laboratory preparation of CO2;
(xxi) specify the properties of CO2 and its uses;
(xxii) determine the reagents for the laboratory preparation of CO;
(xxiii) predict the effects of CO on human;
(xxiv) identify the different forms of coal;
(xxv) determine their uses;
(xxvi) specify the products of the destructive distillation of wood and coal; and
(xxvii) specify the uses of coke and synthesis gas.`
    },
    {
      name: 'Metals and their compounds',
      content: `TOPICS/NOTES:
(a) General properties of metals
(b) Alkali metals e.g. sodium
(i) Sodium hydroxide:- Production by electrolysis of brine, its action on aluminium, zinc and lead ions. Uses including precipitation of metallic hydroxides.
(ii) Sodium trioxocarbonate (IV) and sodium hydrogen trioxocarbonate (IV): Production by Solvay process, properties and uses, e.g. Na2CO3 in the manufacture of glass.
(iii) Sodium chloride: its occurrence in sea water and uses, the economic importance of sea water and the recovery of sodium chloride.
(c) Alkaline-earth metals, e.g. calcium; calcium oxide, calcium hydroxide and calcium trioxocarbonate (IV); Properties and uses. Preparation of calcium oxide from sea shells, the chemical composition of cement and the setting of mortar. Test for Ca2+.
(d) Aluminium: Purification of bauxite, electrolytic extraction, properties and uses of aluminium and its compounds. Test for A13+
(e) Tin: Extraction from its ores. Properties and uses.
(f) Metals of the first transition series. Characteristic properties: (i) electron configuration (ii) oxidation states (iii) complex ion formation (iv) formation of coloured ions (v) catalysis
(g) Iron: Extraction from sulphide and oxide ores, properties and uses, different forms of iron and their properties and advantages of steel over iron. Test for Fe2+ and Fe3+
(h) Copper: Extraction from sulphide and oxide ores, properties and uses of copper. Preparation and uses of copper ( II ) Tetraoxosulphate (VI). Test for Cu2+
(i) Alloy: Steel, stainless steel, brass, bronze, type-metal, duralumin, soft solder, permallory and alnico (constituents and uses only).

OBJECTIVES:
Candidates should be able to:
(i) specify the general properties of metals;
(ii) determine the method of extraction suitable for each metal;
(iii) relate the methods of extraction to the properties for the metals;
(iv) compare the chemical reactivities of the metals;
(v) specify the uses of the metals;
(vi) determine specific test for metallic ions;
(vii) determine the process for the production of the compounds of these metals;
(viii) compare the chemical reactivities of the compounds;
(ix) specify the uses of these compounds;
(x) specify the chemical composition of cement.
(xi) describe the method of purification of bauxite;
(xii) specify the ores of tin;
(xiii) relate the method of extraction to its properties;
(xiv) specify the uses of tin;
(xv) identify the general properties of the first transition metals;
(xvi) deduce reasons for the specific properties of the transition metals;
(xvii) determine the IUPAC names of simple transition metal complexes;
(xviii) determine the suitable method of extraction of iron;
(xix) specify the properties and uses of iron;
(xx) identify the different forms of iron, their compositions, properties and uses;
(xxi) identify the appropriate method of extraction of copper from its compounds;
(xxii) relate the properties of copper and its compound to their uses;
(xxiii) specify the method for the preparation of CuSO4;
(xxiv) specify the constituents and uses of the various alloys mentioned; and
(xxv) compare the properties and uses of alloys to pure metals.`
    },
    {
      name: 'Organic Compounds',
      content: `TOPICS/NOTES:
An introduction to the tetravalency of carbon, the general formula, IUPAC nomenclature and the determination of empirical formula of each class of the organic compounds mentioned below.
(a) Aliphatic hydrocarbons
(i) Alkanes: Homologous series in relation to physical properties, substitution reaction and a few examples and uses of halogenated products. Isomerism: structural only (examples on isomerism should not go beyond six carbon atoms). Petroleum: composition, fractional distillation and major products; cracking and reforming, Petrochemicals – starting materials of organic syntheses, quality of petrol and meaning of octane number.
(ii) Alkenes: Isomerism: structural and geometric isomerism, additional and polymerization reactions, polythene and synthetic rubber as examples of products of polymerization and its use in vulcanization.
(iii) Alkynes: Ethyne – production from action of water on carbides, simple reactions and properties of ethyne.
(b) Aromatic hydrocarbons e.g. benzene - structure, properties and uses.
(c) Alkanols: Primary, secondary, tertiary – production of ethanol by fermentation and from petroleum by-products. Local examples of fermentation and distillation, e.g. gin from palm wine and other local sources and glycerol as a polyhydric alkanol. Reactions of OH group – oxidation as a distinguishing test among primary, secondary and tertiary alkanols (Lucas test).
(d) Alkanals and alkanones. Chemical test to distinguish between alkanals and alkanones.
(e) Alkanoic acids. Chemical reactions; neutralization and esterification, ethanedioic (oxalic) acid as an example of a dicarboxylic acid and benzene carboxylic acid as an example of an aromatic acid.
(f) Alkanoates: Formation from alkanoic acids and alkanols – fats and oils as alkanoates. Saponification: Production of soap and margarine from alkanoates and distinction between detergents and soaps.
(g) Amines (Alkanamines) Primary, Secondary, and tertiary
(h) Carbohydrates: Classification – mono-, di- and polysaccharides; composition, chemical tests for simple sugars and reaction with concentrated tetraoxosulphate (VI) acid. Hydrolysis of complex sugars e.g. cellulose from cotton and starch from cassava, the uses of sugar and starch in the production of alcoholic beverages, pharmaceuticals and textiles.
(i) Proteins: Primary structures, hydrolysis and tests (Ninhydrin, Biuret, Millon’s and xanthoproteic). Enzymes and their functions.
(j) Polymers: Natural and synthetic rubber; addition and condensation polymerization. Methods of preparation, examples and uses. Thermoplastic and thermosetting plastics.

OBJECTIVES:
Candidates should be able to:
(i) derive the name of organic compounds from their general formulae;
(ii) relate the name of a compound to its structure;
(iii) relate the tetravalency of carbon to its ability to form chains of compound (catenation);
(iv) classify compounds according to their functional groups;
(v) derive empirical formula and molecular formula, from given data;
(vi) relate structure/functional groups to specific properties;
(vii) derive various isomeric forms from a given formula;
(viii) distinguish between the different types of isomerism;
(ix) classify the various types of hydrocarbons;
(x) distinguish each class of hydrocarbons by their properties;
(xi) specify the uses of various hydrocarbons;
(xii) identify crude oil as a complex mixture of hydrocarbons;
(xiii) relate the fractions of hydrocarbons to their properties and uses;
(xiv) relate transformation processes to quality improvement of the fractions;
(xv) distinguish between various polymerization processes;
(xvi) specify the process involved in vulcanization;
(xvii) specify chemical test for terminal alkynes;
(xviii) distinguish between aliphatic and aromatic hydrocarbons;
(xix) relate the properties of benzene to its structure;
(xx) compare the various classes of alkanols;
(xxi) determine the processes involved in ethanol production;
(xxii) examine the importance of ethanol as an alternative energy provider;
(xxiii) distinguish the various classes of alkanols;
(xxiv) differentiate between alkanals and alkanones;
(xxv) compare the various types of alkanoic acids;
(xxvi) identify natural sources of alkanoates;
(xxvii) specify the methods for the production of soap, detergent and margarine;
(xxviii) distinguish between detergent and soap;
(xxix) compare the various classes of alkanamine;
(xxx) identify the natural sources of carbohydrates;
(xxxi) compare the various classes of carbohydrates;
(xxxii) infer the products of hydrolysis and dehydration of carbohydrates;
(xxxiii) determine the uses of carbohydrates;
(xxxiv) specify the tests for simple sugars;
(xxxv) identify the basic structure of proteins;
(xxxvi) specify the methods and products of hydrolysis;
(xxxvii) specify the various tests for proteins;
(xxxviii) distinguish between natural and synthetic polymers;
(xxxix) differentiate between addition and condensation polymerization processes;
(xl) classify natural and commercial polymers and their uses; and
(xli) distinguish between thermoplastics and thermosetting plastics.`
    },
    {
      name: 'Chemistry and Industry',
      content: `TOPICS/NOTES:
Chemical industries: Types, raw materials and relevance; Biotechnology.

OBJECTIVES:
Candidates should be able to:
(i) classify chemical industries in terms of products;
(ii) identify raw materials for each industry;
(iii) distinguish between fine and heavy chemicals;
(iv) enumerate the relevance of each of these industries; and
(v) relate industrial processes to biotechnology.`
    }
  ]
};

async function importChemistry() {
  console.log('🧪 Starting Full JAMB Chemistry syllabus import...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const topic of CHEMISTRY_SYLLABUS.topics) {
    try {
      const { data, error } = await supabase
        .from('question_sources')
        .insert({
          subject: CHEMISTRY_SYLLABUS.subject,
          topic: topic.name,
          content: topic.content,
          source_type: 'jamb_syllabus',
          is_active: true,
          metadata: {
            imported_at: new Date().toISOString(),
            source: 'JAMB Official Syllabus',
            exam_type: 'UTME',
            version: 'Full Verbatim Syllabus'
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
  
  console.log(`\n📊 Chemistry Import Summary:`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total: ${CHEMISTRY_SYLLABUS.topics.length}`);
}

importChemistry().catch(console.error);
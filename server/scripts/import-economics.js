require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

// FULLY DETAILED ECONOMICS SYLLABUS CONTENT
// Sourced verbatim from JAMB Economics Syllabus
const ECONOMICS_SYLLABUS = {
  subject: 'Economics',
  topics: [
    {
      name: 'General Objectives',
      content: `GENERAL OBJECTIVES:
The aim of the Unified Tertiary Matriculation Examination (UTME) syllabus in Economics is to prepare the candidates for the Board’s examination. It is designed to test their achievement of the course objectives, which are to:
1. demonstrate sufficient knowledge and understanding of the basic concepts, tools and their general applications to economic analysis;
2. identify and explain the basic structures, operations and roles of the various economic units and institutions (national and international);
3. describe major economic activities – production, distribution and consumption;
4. identify and appraise the basic and current economic problems of society;
5. develop the competence to proffer solutions to economic problems identified.`
    },
    {
      name: 'Economics as a science',
      content: `TOPICS/CONTENTS/NOTES:
1. Economics as a science
a. Basic Concepts: wants, scarcity, choice, scale of preference, opportunity cost, rationality, production, distribution, consumption. 

[Image of opportunity cost production possibility curve]

b.(i) Economic problems of: what, how and for whom to produce and efficiency of resource use.
b.(ii) Application of PPF to solution of economic problems.

OBJECTIVES:
Candidates should be able to:
(i) compare various concepts in economics and their applications;
(ii) interpret graphs/schedules in relation to the concepts;
(iii) identify economic problems;
(iv) proffer solutions to economic problems`
    },
    {
      name: 'Economic Systems',
      content: `TOPICS/CONTENTS/NOTES:
2. Economic Systems
a. Types and characteristics of free enterprise, centrally planned and mixed economies
b. Solutions to economic problems under different systems
c. Contemporary issues in economic systems (economic reforms e.g deregulation, banking sector consolidation, cash policy reform).

OBJECTIVES:
Candidates should be able to:
(i) compare the various economic systems;
(ii) apply the knowledge of economic systems to contemporary issues in Nigeria
(iii) proffer solutions to economic problems in different economic systems.`
    },
    {
      name: 'Methods and Tools of Economic Analysis',
      content: `TOPICS/CONTENTS/NOTES:
3. Methods and Tools of Economic Analysis
a. Scientific Approach:
i. inductive and deductive methods
ii. positive and normative reasoning
b. Basic Tools 
i. tables, charts and graphs
ii. measures of central tendency: mean, median and mode, and their applications.
iii. measures of dispersion; variance, standard deviation, range and their applications;
iv. merits and demerits of the tools.

OBJECTIVES:
Candidates should be able to:
(i) distinguish between the various forms of reasoning;
(ii) apply these forms of reasoning to real life situations;
(iii) use the tools to interpret economic data;
(iv) analyse economic data using the tools;
(v) understand the merits and demerits of the tools.`
    },
    {
      name: 'The Theory of Demand',
      content: `TOPICS/CONTENTS/NOTES:
4. The Theory of Demand
a. i. meaning and determinants of demand
ii. demand schedules and curves 
iii. the distinction between change in quantity demanded and change in demand.
b. Types of demand: Composite, derived, competitive and joint demand:
c. Types, nature and determinants of elasticity and their measurement - price, income and cross elasticity of demand:
d. Importance of elasticity of demand to consumers, producers and government.

OBJECTIVES:
Candidates should be able to:
(i) identify the factors determining demand;
(ii) interpret demand curves from demand schedules;
(iii) differentiate between change in quantity demanded and change in demand;
(iv) compare the various types of demand and their interrelationships;
(v) relate the determinants to the nature of elasticity;
(vi) compute elasticities;
(vii) interpret elasticity coefficients in relation to real life situations.`
    },
    {
      name: 'The Theory of Consumer Behaviour',
      content: `TOPICS/CONTENTS/NOTES:
5. The Theory of Consumer Behaviour
a. Basic Concepts:
i. utility (cardinal, ordinal, total average and marginal utilities)
ii. indifference curve and budget line. 

[Image of indifference curve and budget line]

b. Diminishing marginal utility and the law of demand.
c. Consumer equilibrium using the indifference curve and marginal analyses.
d. Effects of shift in the budget line and the indifference curve.
e. Consumer surplus and its applications.

OBJECTIVES:
Candidates should be able to:
(i) explain the various utility concepts;
(ii) apply the law of demand using the marginal utility analysis;
(iii) use indifference curve and marginal analyses to determine consumer equilibrium;
(iv) relate the income and substitution effects;
(v) apply consumer surplus to real life situations.`
    },
    {
      name: 'The Theory of Supply',
      content: `TOPICS/CONTENTS/NOTES:
6. The Theory of Supply
a. i. Meaning and determinants of supply
ii. Supply schedules and supply curves
iii. the distinction between change in quantity supplied and change in supply
b. Types of Supply: Joint/complementary, competitive and composite
c. Elasticity of Supply: determinants, measurements, nature and applications

OBJECTIVES:
Candidates should be able to:
(i) identify the factors determining supply;
(ii) interpret supply curves from supply schedules;
(iii) differentiate between change in quantity supplied and change in supply;
(iv) compare the various types of supply and their interrelationships;
(v) relate the determinants to the nature of elasticity;
(vi) compute elasticity coefficients;
(vii) interpret the coefficients in relation to real life situations.`
    },
    {
      name: 'The Theory of Price Determination',
      content: `TOPICS/CONTENTS/NOTES:
7. The Theory of Price Determination
a. The concepts of market and price
b. Functions of the price system
c. i. Equilibrium price and quantity in product and factor markets 

[Image of market equilibrium diagram]

iii. Price legislation and its effects
d. The effects of changes in supply and demand on equilibrium price and quantity.

OBJECTIVES:
Candidates should be able to:
(i) explain the concepts of market and price;
(ii) examine the functions of the price system;
(iii) evaluate the effects of government interference with the price system;
(iv) differentiate between minimum and maximum price legislation;
(v) interpret the effects of changes in supply and demand on equilibrium price and quantity.`
    },
    {
      name: 'The Theory of Production',
      content: `TOPICS/CONTENTS/NOTES:
8. The Theory of Production
a. Meaning and types of production
b. Concepts of production and their interrelationships (TP, AP, MP and the law of variable proportion).
c. Division of labour and specialization
d. Scale of Production: Internal and external economies of scale and their implications.
e. Production functions and returns to scale
f. Producers’ equilibrium isoquant-isocost and marginal analyses. 
g. Factors affecting productivity.

OBJECTIVES:
Candidates should be able to:
(i) relate TP, AP and MP with the law of variable proportion;
(ii) compare internal and external economies of scale in production and their effects;
(iii) identify the types of production functions
(iv) compare the different types of returns to the scale and their implications;
(v) determine the firm’s equilibrium position using the isoquant-isocost and marginal analyses.
(vi) identify the factors affecting productivity.`
    },
    {
      name: 'Theory of Costs and Revenue',
      content: `TOPICS/CONTENTS/NOTES:
9. Theory of Costs and Revenue
a. The concepts of cost: Fixed, Variable, Total Average and Marginal 
b. The concepts of revenue: Total, Average and Marginal revenue;
c. Accountants’ and Economists’ notions of cost
d. Short-run and long-run costs
e. The marginal cost and the supply curve of firm.

OBJECTIVES:
Candidates should be able to:
(i) explain the various cost concepts
(ii) differentiate between accountants’ and economists’ notions of costs
(iii) interpret the short-run and long-run costs curves
(iv) establish the relationship between marginal cost and supply curve.
(v) explain the various revenue concepts.`
    },
    {
      name: 'Market Structures',
      content: `TOPICS/CONTENTS/NOTES:
10. Market Structures
a. Perfectly competitive market:
i. Assumptions and characteristics;
ii. Short-run and long-run equilibrium of a perfect competitor;
b. Imperfect Market:
i. Pure monopoly, discriminatory monopoly and monopolistic competition.
ii. Short-run and long-run equilibrium positions. 

[Image of monopoly equilibrium diagram]

c. Break-even/shut-down analysis in the various markets.

OBJECTIVES:
Candidates should be able to:
(i) analyse the assumptions and characteristics of a perfectly competitive market;
(ii) differentiate between short-run and long-run equilibrium of a perfectly competitive firm;
(iii) analyse the assumptions and characteristics of imperfect markets;
(iv) differentiate between the short-run and long-run equilibria of imperfectly competitive firms;
(v) establish the conditions for the break- even/shut down of firms.`
    },
    {
      name: 'National Income',
      content: `TOPICS/CONTENTS/NOTES:
11. National Income
a. The Concepts of GNP, GDP, NI, NNP
b. National Income measurements and their problems
c. Uses and limitations of national income estimates
d. The circular flow of income (two and three-sector models) 
e. The concepts of consumption, investment and savings
f. The multiplier and it effects
g. Elementary theory of income determination and equilibrium national income.

OBJECTIVES:
Candidates should be able to:
(i) identify the major concepts in national income;
(ii) compare the different ways of measuring national income;
(iii) examine their problems;
(iv) determine the uses and limitations of national income estimates;
(v) interpret the circular flow of income using the two and three-sector models;
(vi) calculate the various multipliers;
(vii) evaluate their effects on equilibrium national income;
(viii) explain the concepts of consumption, investment and savings.`
    },
    {
      name: 'Money and Inflation',
      content: `TOPICS/CONTENTS/NOTES:
12. Money and Inflation
a. Types, characteristics and functions of money
b. Demand for money and the supply of money
c. Quantity Theory of money (Fisher equation)
d. The value of money and the price level
e. Inflation: Types, measurements, effects and control
f. Deflation: Measurements, effects and control.

OBJECTIVES:
Candidates should be able to:
(i) explain between the types, characteristics and functions of money;
(ii) identify the factors affecting the demand for and the supply of money;
(iii) examine the relationship between the value of money and the price level;
(iv) identify the components in the quantity theory of money;
(v) examine the causes and effects of inflation;
(vi) calculate the consumer price index;
(vii) interpret the consumer price index;
(viii) examine ways of controlling inflation.
(ix) examine the causes, measurement, effects and control of deflation.`
    },
    {
      name: 'Financial Institutions',
      content: `TOPICS/CONTENTS/NOTES:
13. Financial Institutions
a. Types and functions of financial institutions (traditional, central bank, mortgage banks, merchant banks, insurance companies, building societies);
b. The role of financial institutions in economic development;
c. Money and capital markets
d. Financial sector regulations
e. Deposit money banks and the creation of money 
f. Monetary policy and its instruments
g. Challenges facing financial institutions in Nigeria.

OBJECTIVES:
Candidates should be able to:
(i) identify the types and functions of financial institutions;
(ii) explain the roles of financial institutions in economic development;
(iii) distinguish between the money and capital markets;
(iv) identify the various financial sector regulators and their functions;
(v) explain the money creation process and its challenges;
(vi) examine the various monetary policy instruments and their effects;
(vii) appraise the challenges facing the financial institutions in Nigeria.`
    },
    {
      name: 'Public Finance',
      content: `TOPICS/CONTENTS/NOTES:
14. Public Finance
a. Meaning and objectives
b. Fiscal policy and its instruments
c. Sources of government revenue (taxes royalties, rents, grants and aids)
d. Principles of taxation
e. Tax incidence and its effects
f. The effects of public expenditure
g. Government budget and public debts
h. Revenue allocation and resource control in Nigeria.

OBJECTIVES:
Candidates should be able to:
(i) identify the objectives of public finance;
(ii) explain fiscal policy and its instruments;
(iii) compare the various sources of government revenue;
(iv) analyse the principles of taxation;
(v) analyse the incidence of taxation and its effects;
(vi) examine the effects of public expenditure on the economy;
(vii) examine the types and effects of budgets;
(viii) highlight the criteria for revenue allocation in Nigeria and their impact.`
    },
    {
      name: 'Economic Growth and Development',
      content: `TOPICS/CONTENTS/NOTES:
15. Economic Growth and Development
a. Meaning and scope
b. Indicators of growth and development
c. Factors affecting growth and development
d. Problems of development in Nigeria
e. Development planning in Nigeria.

OBJECTIVES:
Candidates should be able to:
(i) distinguish between economic growth and development;
(ii) highlight the indicators of growth and development;
(iii) identify the factors affecting growth and development;
(iv) examine the problems of development in Nigeria;
(v) examine the role of planning in development;`
    },
    {
      name: 'Agriculture in Nigeria',
      content: `TOPICS/CONTENTS/NOTES:
16. Agriculture in Nigeria
a. Types and features;
b. The role of agriculture in economic development;
c. Problems of agriculture;
d. Agricultural policies and their effects;
e. Instability in agricultural incomes (causes, effects and solutions).

OBJECTIVES:
Candidates should be able to:
(i) identify the types and features of agriculture;
(ii) examine the characteristics and problems of agriculture;
(iii) assess the role of agriculture in economic development;
(iv) appraise agricultural policies in Nigeria;
(v) evaluate the causes and effects of instability in agricultural incomes.`
    },
    {
      name: 'Industry and Industrialization',
      content: `TOPICS/CONTENTS/NOTES:
17. Industry and Industrialization
a. Concepts and effects of location and localization of industry in Nigeria;
b. Strategies and Industrialization in Nigeria;
c. Industrialization and economic development in Nigeria;
d. Funding and management of business organization;
e. Factors determining the size of firms.

OBJECTIVES:
Candidates should be able to:
(i) differentiate between location and localization of industry;
(ii) identify the factors influencing the location and localization of industry;
(iii) examine the problems of industrialization;
(iv) appraise some industrialization strategies;
(v) examine the role of industry in economic development.`
    },
    {
      name: 'Natural Resources and the Nigerian Economy',
      content: `TOPICS/CONTENTS/NOTES:
18. Natural Resources and the Nigerian Economy
a. Development of major natural resources (petroleum, gold, diamond, timber etc); 
b. Contributions of the oil and the non-oil sectors to the Nigerian economy;
c. Linkage effects;
d. Upstream/downstream of the oil sector;
e. The role of NNPC and OPEC in the oil sector;
f. Challenges facing natural resources exploitation.

OBJECTIVES:
Candidates should be able to:
(i) trace the development of the major natural resources in Nigeria;
(ii) understand the contribution of the oil and the non-oil sectors to the Nigerian economy;
(iii) establish the linkages between the natural resources and other sectors;
(iv) analyse the environmental effects of exploitation activities in Nigeria;
(v) distinguish between the upstream and downstream activities in the oil sector;
(vi) examine the roles of NNPC and OPEC in the oil sector;
(vii) suggest ways of controlling the effects of natural resources exploitation.`
    },
    {
      name: 'Business Organizations',
      content: `TOPICS/CONTENTS/NOTES:
19. Business Organizations
a. Private enterprises (e.g. sole-proprietorship, partnership, limited liability companies and cooperative societies)
b. Problems of private enterprises;
c. Public enterprises and their problems;
d. Funding and management of business organizations;
e. Factors determining the size of firms;
f. Privatization and Commercialization as solutions to the problems of public enterprises.

OBJECTIVES:
Candidates should be able to:
(i) compare the types and basic features of private business organization;
(ii) appreciate the financing and management problems of business organizations;
(iii) identify the features of public enterprises;
(iv) identify the factors determining the size of firms;
(v) differentiate between privatization and commercialization;
(vi) compare the advantages and disadvantages of privatization and commercialization;`
    },
    {
      name: 'Population',
      content: `TOPICS/CONTENTS/NOTES:
20. Population
a. Meaning and theories; 
b. Census: importance and problems.
c. Size and growth: over-population, under- population and optimum population.
d. Structure and distribution;
e. Population policy and economic development.

OBJECTIVES:
Candidates should be able to:
(i) analyse some population theories:
(ii) examine the relevance of the theories to Nigeria;
(iii) examine the uses and limitations of census data;
(iv) identify determinants of the size, composition and growth of population;
(v) analyse the structure and distribution of population;
(vi) appraise government population policy in Nigeria.`
    },
    {
      name: 'International Trade',
      content: `TOPICS/CONTENTS/NOTES:
21. International Trade
a. Meaning and basis for international trade (absolute and comparative costs etc.)
b. Balance of trade and balance of payments: problems and corrective measures;
c. Composition and direction of Nigeria’s foreign trade;
d. Exchange rate: meaning, types and determination.

OBJECTIVES:
Candidates should be able to:
(i) examine the basis for international trade.
(ii) differentiate between absolute and comparative advantages;
(iii) distinguish between balance of trade and balance of payments and their corrective measures;
(iv) highlight the problems of balance of payments and their corrective measures;
(v) examine the composition and direction of Nigeria’s foreign trade;
(vi) identify the types of exchange rates;
(vii) examine how exchange rates are determined.`
    },
    {
      name: 'International Economic Organizations',
      content: `TOPICS/CONTENTS/NOTES:
22. International Economic Organizations
Roles and relevance of international organizations e.g. ECOWAS, AU, EU, ECA, IMF, EEC, OECD, World Bank, IBRD, WTO, ADB and UNCTAD etc. to Nigeria.

OBJECTIVES:
Candidates should be able to:
(i) identify the various economic organizations and their functions;
(vii) evaluate their relevance to the Nigerian economy.`
    },
    {
      name: 'Factors of Production and their Theories',
      content: `TOPICS/CONTENTS/NOTES:
23. Factors of Production and their Theories
a. Types, features and rewards;
b. Determination of wages, interest and profits;
c. Theories: marginal productivity theory of wages and liquidity preference theory;
d. Factor mobility and efficiency;
e. Unemployment and its solutions

OBJECTIVES:
Candidates should be able to:
(i) identify the types; features and rewards of factors of productions;
(ii) analyse the determination of wages, interest and profits;
(iii) interpret the marginal productivity of liquidity preference theories;
(iv) examine factors mobility and efficiency;
(v) examine the types and causes of unemployment in Nigeria;
(vi) suggest solutions to unemployment in Nigeria.`
    },
    {
      name: 'Recommended Texts',
      content: `RECOMMENDED TEXTS:
1. Aderinto, A.A et al (1996) Economics: Exam Focus, Ibadan: University Press Plc.
2. Black, J. (1997) Oxford Dictionary of Economics. Oxford: Oxford University Press
3. Eyiyere, D.O. (1980) Economics Made Easy, Benin City, Quality Publishers Ltd.
4. Fajana, F. et al (1999) Countdown to SSCE/JME Economics Ibadan: Evans
5. Falodun, A.B. et al (1997) Round-up Economics, Lagos: Longman
6. Kountsoyiannis, A. (1979) Modern Microeconomics, London: Macmillan
7. Lipsey, R.G. (1997) An Introduction to Positive Economics, Oxford: Oxford University Press.
8. Samuelson, P and Nordhaus, W. (1989) Economics, Singapore: McGraw-Hill
9. Udu E and Agu G.A. (2005) New System Economics: a Senior Secondary Course, Ibadan: Africana FIRST Publishers Ltd.
10. Wannacott and Wannacott (1979) Economics, New York: McGraw-Hill.
11. Brownson-oton Richard (2010) What is Micro-Economics? Niky Printing and Publishing coy.
12. Brownson-oton Richard (2010) What is Macro-Economics? Niky Printing and Publishing coy.`
    }
  ]
};

async function importEconomics() {
  console.log('📈 Starting Full JAMB Economics syllabus import...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const topic of ECONOMICS_SYLLABUS.topics) {
    try {
      const { data, error } = await supabase
        .from('question_sources')
        .insert({
          subject: ECONOMICS_SYLLABUS.subject,
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
  
  console.log(`\n📊 Economics Import Summary:`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total: ${ECONOMICS_SYLLABUS.topics.length}`);
}

importEconomics().catch(console.error);
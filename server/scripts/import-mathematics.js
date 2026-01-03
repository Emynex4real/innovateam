require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

// FULLY DETAILED MATHEMATICS SYLLABUS CONTENT
// Sourced verbatim from JAMB Mathematics Syllabus
const MATH_SYLLABUS = {
  subject: 'Mathematics',
  topics: [
    {
      name: 'General Objectives',
      content: `GENERAL OBJECTIVES:
The aim of the Unified Tertiary Matriculation Examination (UTME) syllabus in Mathematics is to prepare the candidates for the Board’s examination. It is designed to test the achievement of the course objectives which are to:
(1) acquire computational and manipulative skills;
(2) develop precise, logical and formal reasoning skills;
(3) develop deductive skills in interpretation of graphs, diagrams and data;
(4) apply mathematical concepts to resolve issues in daily living.

This syllabus is divided into five sections:
I. Number and Numeration
II. Algebra
III. Geometry/Trigonometry
IV. Calculus
V. Statistics`
    },
    {
      name: 'I. Number and Numeration: Number Bases',
      content: `TOPICS/CONTENTS/NOTES:
1. Number bases:
(a) operations in different number bases from 2 to 10;
(b) conversion from one base to another including fractional parts.

OBJECTIVES:
Candidates should be able to:
i. perform four basic operations (x, +, -, ÷);
ii. convert one base to another;
iii. perform operations in modulo arithmetic.`
    },
    {
      name: 'I. Number and Numeration: Fractions, Decimals, Percentages',
      content: `TOPICS/CONTENTS/NOTES:
2. Fractions, Decimals, Approximations and Percentages:
(a) fractions and decimals;
(b) significant figures;
(c) decimal places;
(d) percentage errors;
(e) simple interest;
(f) profit and loss percent;
(g) ratio, proportion and rate;
(h) shares and valued added tax (VAT).

OBJECTIVES:
Candidates should be able to:
i. perform basic operations (x, +, -, ÷) on fractions and decimals;
ii. express to specified number of significant figures and decimal places;
iii. calculate simple interest, profit and loss per cent; ratio proportion, rate and percentage error;
iv. solve problems involving share and VAT.`
    },
    {
      name: 'I. Number and Numeration: Indices, Logarithms and Surds',
      content: `TOPICS/CONTENTS/NOTES:
3. Indices, Logarithms and Surds:
(a) laws of indices;
(b) equations involving indices;
(c) standard form;
(d) laws of logarithm;
(e) logarithm of any positive number to a given base;
(f) change of bases in logarithm and application;
(g) relationship between indices and logarithm;
(h) Surds.

OBJECTIVES:
Candidates should be able to:
i. apply the laws of indices in calculation;
ii. establish the relationship between indices and logarithms in solving problems;
iii. solve equations involving indices;
iv. solve problems in different bases in logarithms;
v. simplify and rationalize surds;
vi. perform basic operations on surds.`
    },
    {
      name: 'I. Number and Numeration: Sets',
      content: `TOPICS/CONTENTS/NOTES:
4. Sets:
(a) types of sets
(b) algebra of sets
(c) Venn diagrams and their applications. 

[Image of Venn diagram operations]


OBJECTIVES:
Candidates should be able to:
i. identify types of sets, i.e. empty, universal, complements, subsets, finite, infinite and disjoint sets;
ii. solve problems involving cardinality of sets;
iii. solve set problems using symbols;
iv. use Venn diagrams to solve problems involving not more than 3 sets.`
    },
    {
      name: 'II. Algebra: Polynomials',
      content: `TOPICS/CONTENTS/NOTES:
1. Polynomials:
(a) change of subject of formula;
(b) multiplication and division of polynomials;
(c) factorization of polynomials of degree not exceeding 3;
(d) roots of polynomials not exceeding degree 3;
(e) factor and remainder theorems;
(f) simultaneous equations including one linear one quadratic;
(g) graphs of polynomials of degree not greater than 3. 

[Image of cubic polynomial graph]


OBJECTIVES:
Candidates should be able to:
i. find the subject of the formula of a given equation;
ii. apply factor and remainder theorem to factorize a given expression;
iii. multiply, divide polynomials of degree not more than 3 and determine values of defined and undefined expression;
iv. factorize by regrouping difference of two squares, perfect squares and cubic expressions; etc.
v. solve simultaneous equations – one linear, one quadratic;
vi. interpret graphs of polynomials including applications to maximum and minimum values.`
    },
    {
      name: 'II. Algebra: Variation',
      content: `TOPICS/CONTENTS/NOTES:
2. Variation:
(a) direct;
(b) inverse;
(c) joint;
(d) partial;
(e) percentage increase and decrease.

OBJECTIVES:
Candidates should be able to:
i. solve problems involving direct, inverse, joint and partial variations;
ii. solve problems on percentage increase and decrease in variation.`
    },
    {
      name: 'II. Algebra: Inequalities',
      content: `TOPICS/CONTENTS/NOTES:
3. Inequalities:
(a) analytical and graphical solutions of linear inequalities; 
(b) quadratic inequalities with integral roots only.

OBJECTIVES:
Candidates should be able to:
i. solve problems on linear and quadratic inequalities;
ii. interpret graphs of inequalities.`
    },
    {
      name: 'II. Algebra: Progression',
      content: `TOPICS/CONTENTS/NOTES:
4. Progression:
(a) nth term of a progression
(b) sum of A. P. and G. P.

OBJECTIVES:
Candidates should be able to:
i. determine the nth term of a progression;
ii. compute the sum of A. P. and G.P;
iii. sum to infinity of a given G.P.`
    },
    {
      name: 'II. Algebra: Binary Operations',
      content: `TOPICS/CONTENTS/NOTES:
5. Binary Operations:
(a) properties of closure, commutativity, associativity and distributivity;
(b) identity and inverse elements (simple cases only).

OBJECTIVES:
Candidates should be able to:
i. solve problems involving closure, commutativity, associativity and distributivity;
ii. solve problems involving identity and inverse elements.`
    },
    {
      name: 'II. Algebra: Matrices and Determinants',
      content: `TOPICS/CONTENTS/NOTES:
6. Matrices and Determinants:
(a) algebra of matrices not exceeding 3 x 3;
(b) determinants of matrices not exceeding 3 x 3;
(c) inverses of 2 x 2 matrices; [excluding quadratic and higher degree equations].

OBJECTIVES:
Candidates should be able to:
i. perform basic operations (x, +, -, ÷) on matrices;
ii. calculate determinants;
iii. compute inverses of 2 x 2 matrices.`
    },
    {
      name: 'III. Geometry/Trigonometry: Euclidean Geometry',
      content: `TOPICS/CONTENTS/NOTES:
1. Euclidean Geometry:
(a) Properties of angles and lines
(b) Polygons: triangles, quadrilaterals and general polygons;
(c) Circles: angle properties, cyclic quadrilaterals and intersecting chords; 
(d) construction.

OBJECTIVES:
Candidates should be able to:
i. identify various types of lines and angles;
ii. solve problems involving polygons;
iii. calculate angles using circle theorems;
iv. identify construction procedures of special angles, e.g. 30º, 45º, 60º, 75º, 90º etc.`
    },
    {
      name: 'III. Geometry/Trigonometry: Mensuration',
      content: `TOPICS/CONTENTS/NOTES:
2. Mensuration:
(a) lengths and areas of plane geometrical figures;
(b) lengths of arcs and chords of a circle;
(c) Perimeters and areas of sectors and segments of circles;
(d) surface areas and volumes of simple solids and composite figures; 
(e) the earth as a sphere: longitudes and latitudes. 

OBJECTIVES:
Candidates should be able to:
i. calculate the perimeters and areas of triangles, quadrilaterals, circles and composite figures;
ii. find the length of an arc, a chord, perimeters and areas of sectors and segments of circles;
iii. calculate total surface areas and volumes of cuboids, cylinders. cones, pyramids, prisms, spheres and composite figures;
iv. determine the distance between two points on the earth’s surface.`
    },
    {
      name: 'III. Geometry/Trigonometry: Loci',
      content: `TOPICS/CONTENTS/NOTES:
3. Loci:
locus in 2 dimensions based on geometric principles relating to lines and curves.

OBJECTIVES:
Candidates should be able to:
identify and interpret loci relating to parallel lines, perpendicular bisectors, angle bisectors and circles.`
    },
    {
      name: 'III. Geometry/Trigonometry: Coordinate Geometry',
      content: `TOPICS/CONTENTS/NOTES:
4. Coordinate Geometry:
(a) midpoint and gradient of a line segment;
(b) distance between two points;
(c) parallel and perpendicular lines;
(d) equations of straight lines.

OBJECTIVES:
Candidates should be able to:
i. determine the midpoint and gradient of a line segment;
ii. find the distance between two points;
iii. identify conditions for parallelism and perpendicularity;
iv. find the equation of a line in the two-point form, point-slope form, slope intercept form and the general form.`
    },
    {
      name: 'III. Geometry/Trigonometry: Trigonometry',
      content: `TOPICS/CONTENTS/NOTES:
5. Trigonometry:
(a) trigonometrical ratios of angles;
(b) angles of elevation and depression; 

[Image of angle of elevation and depression diagram]

(c) bearings;
(d) areas and solutions of triangle;
(e) graphs of sine and cosine; 

[Image of sine and cosine graphs]

(f) sine and cosine formulae.

OBJECTIVES:
Candidates should be able to:
i. calculate the sine, cosine and tangent of angles between - 360º ≤ Ɵ ≤ 360º;
ii. apply these special angles, e.g. 30º, 45º, 60º, 75º, 90º, 105, 135º to solve simple problems in trigonometry;
iii. solve problems involving angles of elevation and depression;
iv. solve problems involving bearings;
v. apply trigonometric formulae to find areas of triangles;
vi. solve problems involving sine and cosine graphs.`
    },
    {
      name: 'IV. Calculus: Differentiation',
      content: `TOPICS/CONTENTS/NOTES:
1. Differentiation:
(a) limit of a function
(b) differentiation of explicit algebraic and simple trigonometrical functions – sine, cosine and tangent.
2. Application of differentiation:
(a) rate of change;
(b) maxima and minima. 

OBJECTIVES:
Candidates should be able to:
i. find the limit of a function
ii. differentiate explicit algebraic and simple trigonometrical functions.
iii. solve problems involving applications of rate of change, maxima and minima.`
    },
    {
      name: 'IV. Calculus: Integration',
      content: `TOPICS/CONTENTS/NOTES:
3. Integration:
(a) integration of explicit algebraic and simple trigonometrical functions;
(b) area under the curve. 

[Image of area under curve integration]


OBJECTIVES:
Candidates should be able to:
i. solve problems of integration involving algebraic and simple trigonometric functions;
ii. calculate area under the curve (simple cases only).`
    },
    {
      name: 'V. Statistics: Representation and Location',
      content: `TOPICS/CONTENTS/NOTES:
1. Representation of data:
(a) frequency distribution;
(b) histogram, bar chart and pie chart. 
2. Measures of Location:
(a) mean, mode and median of ungrouped and grouped data – (simple cases only);
(b) cumulative frequency.

OBJECTIVES:
Candidates should be able to:
i. identify and interpret frequency distribution tables;
ii. interpret information on histogram, bar chat and pie chart.
iii. calculate the mean, mode and median of ungrouped and grouped data (simple cases only);
iv. use ogive to find the median, quartiles and percentiles.`
    },
    {
      name: 'V. Statistics: Dispersion, Permutation, Probability',
      content: `TOPICS/CONTENTS/NOTES:
3. Measures of Dispersion: range, mean deviation, variance and standard deviation.
4. Permutation and Combination:
(a) Linear and circular arrangements;
(b) Arrangements involving repeated objects.
5. Probability:
(a) experimental probability (tossing of coin, throwing of a dice etc);
(b) Addition and multiplication of probabilities (mutual and independent cases). 

[Image of probability tree diagram]


OBJECTIVES:
Candidates should be able to:
i. calculate the range, mean deviation, variance and standard deviation of ungrouped and grouped data.
ii. solve simple problems involving permutation and combination.
iii. solve simple problems in probability (including addition and multiplication).`
    },
    {
      name: 'Recommended Texts',
      content: `RECOMMENDED TEXTS:
1. Adelodun A. A. (2000) Distinction in Mathematics: Comprehensive Revision Text, (3rd Edition) Ado –Ekiti: FNPL.
2. Anyebe, J. A. B. (1998) Basic Mathematics for Senior Secondary Schools and Remedial Students in Higher Institutions, Lagos: Kenny Moore.
3. Channon, J. B. Smith, A. M. (2001) New General Mathematics for West Africa SSS 1 to 3, Lagos: Longman.
4. David –Osuagwu, M. et al. (2000) New School Mathematics for Senior Secondary Schools, Onitsha: Africana - FIRST Publishers.
5. Egbe. E et al (2000) Further Mathematics, Onitsha: Africana – FIRST Publishers
6. Ibude, S. O. et al.. (2003) Algebra and Calculus for Schools and Colleges: LINCEL Publishers.
7. Tuttuh – Adegun M. R. et al. (1997) Further Mathematics Project Books 1 to 3, Ibadan: NPS Educational`
    }
  ]
};

async function importMath() {
  console.log('📐 Starting Full JAMB Mathematics syllabus import...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const topic of MATH_SYLLABUS.topics) {
    try {
      const { data, error } = await supabase
        .from('question_sources')
        .insert({
          subject: MATH_SYLLABUS.subject,
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
  
  console.log(`\n📊 Mathematics Import Summary:`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total: ${MATH_SYLLABUS.topics.length}`);
}

importMath().catch(console.error);
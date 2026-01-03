require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const GeminiService = require('../services/gemini.service');

async function testFuzzyMatching() {
  console.log('🔍 Testing Fuzzy Matching for Subject/Topic Names\n');
  
  const testCases = [
    // Test subject variations
    { subject: 'Literature', topic: 'Poetry', expected: 'Literature in English' },
    { subject: 'Lit in Eng', topic: 'Drama', expected: 'Literature in English' },
    { subject: 'English Lit', topic: 'Prose', expected: 'Literature in English' },
    
    { subject: 'Math', topic: 'Algebra', expected: 'Mathematics' },
    { subject: 'Maths', topic: 'Geometry', expected: 'Mathematics' },
    
    { subject: 'Bio', topic: 'Ecology', expected: 'Biology' },
    { subject: 'Chem', topic: 'Atomic Structure', expected: 'Chemistry' },
    { subject: 'Phy', topic: 'Mechanics', expected: 'Physics' },
    
    { subject: 'Econs', topic: 'Demand and Supply', expected: 'Economics' },
    { subject: 'Govt', topic: 'Democracy', expected: 'Government' },
    
    // Test typos
    { subject: 'Biologgy', topic: 'Ecology', expected: 'Biology' },
    { subject: 'Chemestry', topic: 'Acids', expected: 'Chemistry' },
    
    // Test topic variations (case insensitive, spacing)
    { subject: 'Biology', topic: 'ecology', expected: 'Biology' },
    { subject: 'Mathematics', topic: 'ALGEBRA', expected: 'Mathematics' },
    { subject: 'Chemistry', topic: 'atomic  structure', expected: 'Chemistry' }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of testCases) {
    console.log(`\nTest: "${test.subject}" - "${test.topic}"`);
    
    try {
      const questions = await GeminiService.generateQuestions({
        subject: test.subject,
        topic: test.topic,
        difficulty: 'medium',
        totalQuestions: 2
      });

      if (questions && questions.length > 0) {
        console.log(`✅ PASS - Generated ${questions.length} questions`);
        console.log(`   Q1: ${questions[0].question.substring(0, 80)}...`);
        passed++;
      } else {
        console.log(`❌ FAIL - No questions generated`);
        failed++;
      }

    } catch (error) {
      console.log(`❌ FAIL - Error: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 Results: ${passed} passed, ${failed} failed`);
  console.log(`${'='.repeat(60)}\n`);
}

testFuzzyMatching().catch(console.error);

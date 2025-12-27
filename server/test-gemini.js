require('dotenv').config();
const geminiService = require('./services/gemini.service');

async function testGemini() {
  console.log('🧪 Testing Gemini API...\n');
  
  try {
    console.log('📝 Generating 5 Mathematics questions on Algebra...');
    const questions = await geminiService.generateQuestions({
      subject: 'Mathematics',
      topic: 'Algebra',
      difficulty: 'medium',
      totalQuestions: 5
    });
    
    console.log(`\n✅ Success! Generated ${questions.length} questions:\n`);
    questions.forEach((q, i) => {
      console.log(`${i + 1}. ${q.question}`);
      console.log(`   Options: ${q.options.join(', ')}`);
      console.log(`   Answer: ${q.answer}`);
      console.log(`   Explanation: ${q.explanation}\n`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testGemini();

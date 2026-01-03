require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const GeminiService = require('../services/gemini.service');

async function testQuestionGeneration() {
  console.log('🧪 Testing Question Generation with Database Syllabus\n');
  
  const testCases = [
    { subject: 'Biology', topic: 'Ecology', count: 5 },
    { subject: 'Mathematics', topic: 'Algebra', count: 5 },
    { subject: 'Chemistry', topic: 'Atomic Structure', count: 5 }
  ];

  for (const test of testCases) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📚 Testing: ${test.subject} - ${test.topic}`);
    console.log(`${'='.repeat(60)}\n`);

    try {
      const questions = await GeminiService.generateQuestions({
        subject: test.subject,
        topic: test.topic,
        difficulty: 'medium',
        totalQuestions: test.count
      });

      console.log(`✅ Generated ${questions.length} questions\n`);

      questions.forEach((q, idx) => {
        console.log(`Question ${idx + 1}:`);
        console.log(`Q: ${q.question}`);
        console.log(`Options:`);
        q.options.forEach((opt, i) => {
          const letter = ['A', 'B', 'C', 'D'][i];
          const marker = letter === q.answer ? '✓' : ' ';
          console.log(`  ${marker} ${letter}. ${opt}`);
        });
        console.log(`Answer: ${q.answer}`);
        console.log(`Explanation: ${q.explanation}`);
        
        // Check for meta-content
        const hasMeta = q.question.toLowerCase().includes('text') || 
                       q.question.toLowerCase().includes('source') ||
                       q.question.toLowerCase().includes('instruction');
        if (hasMeta) {
          console.log(`⚠️  WARNING: Possible meta-content detected!`);
        }
        console.log('');
      });

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('🎉 Test Complete!');
  console.log(`${'='.repeat(60)}\n`);
}

testQuestionGeneration().catch(console.error);

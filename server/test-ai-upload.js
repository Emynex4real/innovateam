// Load environment variables first
require('dotenv').config();

const supabase = require('./supabaseClient');

async function testAIUpload() {
  try {
    console.log('Testing AI Examiner upload...');
    
    // Test 1: Check Supabase connection
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Supabase connection failed:', testError);
      return;
    }
    console.log('✅ Supabase connection works');
    
    // Test 2: Check if ai_documents table exists
    const { data: docData, error: docError } = await supabase
      .from('ai_documents')
      .select('id')
      .limit(1);
    
    if (docError) {
      console.error('❌ ai_documents table issue:', docError);
      return;
    }
    console.log('✅ ai_documents table exists');
    
    // Test 3: Check if ai_exams table exists
    const { data: examData, error: examError } = await supabase
      .from('ai_exams')
      .select('id')
      .limit(1);
    
    if (examError) {
      console.error('❌ ai_exams table issue:', examError);
      return;
    }
    console.log('✅ ai_exams table exists');
    
    console.log('✅ All AI Examiner components are ready!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAIUpload();
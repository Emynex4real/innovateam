const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './server/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testQuestionBanks() {
  console.log('🔍 Testing Question Banks Setup...\n');

  // Test 1: Check if tables exist
  console.log('1. Checking if question_banks table exists...');
  const { data: banks, error: banksError } = await supabase
    .from('question_banks')
    .select('*')
    .limit(1);

  if (banksError) {
    console.error('❌ Error accessing question_banks table:', banksError.message);
    console.log('\n💡 Solution: Run the SQL migration:');
    console.log('   File: supabase/ai_question_banks.sql');
    return;
  }
  console.log('✅ question_banks table exists');

  // Test 2: Check if questions table exists
  console.log('\n2. Checking if questions table exists...');
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .limit(1);

  if (questionsError) {
    console.error('❌ Error accessing questions table:', questionsError.message);
    return;
  }
  console.log('✅ questions table exists');

  // Test 3: Check current data
  console.log('\n3. Checking existing data...');
  const { count: bankCount } = await supabase
    .from('question_banks')
    .select('*', { count: 'exact', head: true });
  
  const { count: questionCount } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true });

  console.log(`   - Question Banks: ${bankCount || 0}`);
  console.log(`   - Questions: ${questionCount || 0}`);

  // Test 4: Check RLS policies
  console.log('\n4. Checking RLS policies...');
  const { data: policies, error: policiesError } = await supabase
    .rpc('exec_sql', { 
      sql: `SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('question_banks', 'questions')`
    })
    .catch(() => {
      // If RPC doesn't exist, try direct query
      return supabase
        .from('pg_policies')
        .select('tablename, policyname')
        .in('tablename', ['question_banks', 'questions']);
    });

  if (!policiesError && policies) {
    console.log('✅ RLS policies found:', policies.length);
  } else {
    console.log('⚠️ Could not verify RLS policies (this is okay)');
  }

  // Test 5: List all banks with details
  if (bankCount > 0) {
    console.log('\n5. Listing all question banks:');
    const { data: allBanks } = await supabase
      .from('question_banks')
      .select('*')
      .order('created_at', { ascending: false });

    allBanks.forEach((bank, idx) => {
      console.log(`\n   Bank ${idx + 1}:`);
      console.log(`   - ID: ${bank.id}`);
      console.log(`   - Name: ${bank.name}`);
      console.log(`   - Subject: ${bank.subject}`);
      console.log(`   - Difficulty: ${bank.difficulty}`);
      console.log(`   - Active: ${bank.is_active}`);
      console.log(`   - Created: ${bank.created_at}`);
    });
  }

  console.log('\n✅ All tests completed!');
}

testQuestionBanks().catch(console.error);

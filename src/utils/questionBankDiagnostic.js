// Question Bank Diagnostic Tool
// Run this in browser console: window.diagnoseQuestionBank()

import supabase from '../config/supabase';

export async function diagnoseQuestionBank() {
  console.log('🔍 Question Bank Diagnostic Tool\n');
  console.log('================================\n');

  const results = {
    auth: false,
    admin: false,
    tables: false,
    data: false,
    api: false
  };

  // Test 1: Check Authentication
  console.log('1️⃣ Checking Authentication...');
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    if (session) {
      console.log('✅ User is authenticated');
      console.log(`   Email: ${session.user.email}`);
      console.log(`   User ID: ${session.user.id}`);
      console.log(`   Token: ${session.access_token.substring(0, 20)}...`);
      results.auth = true;

      // Check admin role
      const role = session.user.user_metadata?.role;
      console.log(`   Role: ${role || 'user'}`);
      if (role === 'admin') {
        console.log('✅ User has admin role');
        results.admin = true;
      } else {
        console.log('❌ User is NOT admin');
        console.log('   Solution: Update user role in Supabase');
      }
    } else {
      console.log('❌ No active session');
      console.log('   Solution: Log in first');
    }
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
  }

  console.log('\n2️⃣ Checking Database Tables...');
  try {
    // Check question_banks table
    const { data: banks, error: banksError } = await supabase
      .from('question_banks')
      .select('id')
      .limit(1);

    if (banksError) {
      console.error('❌ question_banks table error:', banksError.message);
      console.log('   Solution: Run supabase/ai_question_banks.sql');
    } else {
      console.log('✅ question_banks table exists');
      results.tables = true;
    }

    // Check questions table
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id')
      .limit(1);

    if (questionsError) {
      console.error('❌ questions table error:', questionsError.message);
    } else {
      console.log('✅ questions table exists');
    }
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }

  console.log('\n3️⃣ Checking Data...');
  try {
    const { count: bankCount } = await supabase
      .from('question_banks')
      .select('*', { count: 'exact', head: true });

    const { count: questionCount } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true });

    console.log(`   Question Banks: ${bankCount || 0}`);
    console.log(`   Questions: ${questionCount || 0}`);

    if (bankCount > 0) {
      results.data = true;
      console.log('✅ Data exists');
    } else {
      console.log('ℹ️ No data yet (this is normal for new setup)');
      console.log('   Solution: Generate questions from the Generate tab');
    }
  } catch (error) {
    console.error('❌ Data check error:', error.message);
  }

  console.log('\n4️⃣ Testing API Endpoint...');
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('⏭️ Skipping API test (not authenticated)');
    } else {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/admin/ai-questions/banks`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API endpoint working');
        console.log(`   Banks returned: ${data.data?.length || 0}`);
        results.api = true;
      } else {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('❌ API error:', error);
        
        if (response.status === 401) {
          console.log('   Solution: Token expired, try logging out and back in');
        } else if (response.status === 403) {
          console.log('   Solution: User is not admin, update role in database');
        } else if (response.status === 404) {
          console.log('   Solution: API route not registered, check server.js');
        }
      }
    }
  } catch (error) {
    console.error('❌ API test error:', error.message);
    console.log('   Solution: Make sure backend server is running on port 5000');
  }

  // Summary
  console.log('\n📊 Diagnostic Summary');
  console.log('================================');
  console.log(`Authentication: ${results.auth ? '✅' : '❌'}`);
  console.log(`Admin Role: ${results.admin ? '✅' : '❌'}`);
  console.log(`Database Tables: ${results.tables ? '✅' : '❌'}`);
  console.log(`Has Data: ${results.data ? '✅' : 'ℹ️ Empty'}`);
  console.log(`API Working: ${results.api ? '✅' : '❌'}`);

  const allGood = results.auth && results.admin && results.tables && results.api;
  
  if (allGood) {
    console.log('\n🎉 Everything looks good!');
    if (!results.data) {
      console.log('💡 Tip: Generate some questions to get started');
    }
  } else {
    console.log('\n⚠️ Issues found. Follow the solutions above.');
  }

  return results;
}

// Make it available globally
if (typeof window !== 'undefined') {
  window.diagnoseQuestionBank = diagnoseQuestionBank;
}

export default diagnoseQuestionBank;

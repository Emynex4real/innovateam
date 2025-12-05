// Test AI Questions Setup
require('dotenv').config({ path: './server/.env' });

console.log('\n🔍 Checking AI Questions Setup...\n');

// Check 1: GEMINI_API_KEY
console.log('1. GEMINI_API_KEY:');
if (process.env.GEMINI_API_KEY) {
  console.log('   ✅ Found:', process.env.GEMINI_API_KEY.substring(0, 20) + '...');
} else {
  console.log('   ❌ Missing! Add GEMINI_API_KEY to server/.env');
}

// Check 2: Supabase Config
console.log('\n2. Supabase Configuration:');
if (process.env.SUPABASE_URL) {
  console.log('   ✅ SUPABASE_URL:', process.env.SUPABASE_URL);
} else {
  console.log('   ❌ SUPABASE_URL missing');
}

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('   ✅ SUPABASE_SERVICE_ROLE_KEY: Found');
} else {
  console.log('   ❌ SUPABASE_SERVICE_ROLE_KEY missing');
}

// Check 3: Test Gemini API
console.log('\n3. Testing Gemini API Connection...');
const testGemini = async () => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Gemini API Connected!');
      console.log('   Available models:', data.models?.length || 0);
    } else {
      console.log('   ❌ Gemini API Error:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('   ❌ Connection Error:', error.message);
  }
};

// Check 4: Test Supabase Connection
console.log('\n4. Testing Supabase Connection...');
const testSupabase = async () => {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Try to query question_banks table
    const { data, error } = await supabase
      .from('question_banks')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('   ⚠️  Tables not created yet. Run SQL migration in Supabase!');
        console.log('   📝 File: supabase/ai_question_banks.sql');
      } else {
        console.log('   ❌ Supabase Error:', error.message);
      }
    } else {
      console.log('   ✅ Supabase Connected! Tables exist.');
    }
  } catch (error) {
    console.log('   ❌ Connection Error:', error.message);
  }
};

// Run tests
(async () => {
  await testGemini();
  await testSupabase();
  
  console.log('\n📋 Next Steps:');
  console.log('   1. If tables missing: Run SQL migration in Supabase');
  console.log('   2. Restart server: cd server && npm start');
  console.log('   3. Login as admin and test AI Questions tab');
  console.log('\n');
})();

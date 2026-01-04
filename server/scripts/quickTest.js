const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function quickTest() {
  const email = process.argv[2];
  
  if (!email) {
    console.log('Usage: node scripts/quickTest.js user@example.com');
    process.exit(1);
  }

  console.log(`🔍 Checking user: ${email}\n`);

  const { data: user, error } = await supabase
    .from('user_profiles')
    .select('id, email, role, is_admin, is_tutor, is_student')
    .eq('email', email)
    .single();

  if (error || !user) {
    console.log('❌ User not found');
    return;
  }

  console.log('Current Status:');
  console.log(`  Role: ${user.role}`);
  console.log(`  is_admin: ${user.is_admin}`);
  console.log(`  is_tutor: ${user.is_tutor}`);
  console.log(`  is_student: ${user.is_student}`);
  
  const isCorrect = 
    (user.role === 'admin' && user.is_admin) ||
    (user.role === 'tutor' && user.is_tutor) ||
    (user.role === 'student' && user.is_student);
  
  console.log(`\n${isCorrect ? '✅' : '❌'} Flags are ${isCorrect ? 'correct' : 'INCORRECT'}`);
  
  if (!isCorrect) {
    console.log('\n🔧 Run: node scripts/syncUserRoles.js');
  }
}

quickTest().then(() => process.exit(0)).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});

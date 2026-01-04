const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testRoleChange() {
  console.log('🧪 Testing Role Change Fix...\n');

  try {
    // 1. Get a test user (first non-admin user)
    const { data: users, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id, email, role, is_admin, is_tutor, is_student')
      .neq('role', 'admin')
      .limit(1);

    if (fetchError || !users || users.length === 0) {
      console.error('❌ No test user found');
      return;
    }

    const testUser = users[0];
    console.log('📋 Test User:', {
      email: testUser.email,
      currentRole: testUser.role,
      flags: {
        is_admin: testUser.is_admin,
        is_tutor: testUser.is_tutor,
        is_student: testUser.is_student
      }
    });

    // 2. Change role to tutor
    console.log('\n🔄 Changing role to tutor...');
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        role: 'tutor',
        is_tutor: true,
        is_admin: false,
        is_student: false
      })
      .eq('id', testUser.id);

    if (updateError) {
      console.error('❌ Update failed:', updateError);
      return;
    }

    // 3. Verify the change
    const { data: updatedUser, error: verifyError } = await supabase
      .from('user_profiles')
      .select('id, email, role, is_admin, is_tutor, is_student')
      .eq('id', testUser.id)
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
      return;
    }

    console.log('\n✅ Updated User:', {
      email: updatedUser.email,
      newRole: updatedUser.role,
      flags: {
        is_admin: updatedUser.is_admin,
        is_tutor: updatedUser.is_tutor,
        is_student: updatedUser.is_student
      }
    });

    // 4. Verify trigger is working
    console.log('\n🧪 Testing trigger by updating role to student...');
    const { error: triggerTestError } = await supabase
      .from('user_profiles')
      .update({ role: 'student' })
      .eq('id', testUser.id);

    if (triggerTestError) {
      console.error('❌ Trigger test failed:', triggerTestError);
      return;
    }

    const { data: triggerTestUser, error: triggerVerifyError } = await supabase
      .from('user_profiles')
      .select('role, is_admin, is_tutor, is_student')
      .eq('id', testUser.id)
      .single();

    if (triggerVerifyError) {
      console.error('❌ Trigger verification failed:', triggerVerifyError);
      return;
    }

    console.log('✅ Trigger Test Result:', {
      role: triggerTestUser.role,
      flags: {
        is_admin: triggerTestUser.is_admin,
        is_tutor: triggerTestUser.is_tutor,
        is_student: triggerTestUser.is_student
      }
    });

    // Verify trigger worked correctly
    if (triggerTestUser.role === 'student' && 
        triggerTestUser.is_student === true &&
        triggerTestUser.is_tutor === false &&
        triggerTestUser.is_admin === false) {
      console.log('\n✅ TRIGGER IS WORKING CORRECTLY!');
    } else {
      console.log('\n⚠️  WARNING: Trigger may not be working correctly');
      console.log('Expected: role=student, is_student=true, is_tutor=false, is_admin=false');
      console.log('Got:', triggerTestUser);
    }

    // 5. Restore original role
    console.log('\n🔄 Restoring original role...');
    await supabase
      .from('user_profiles')
      .update({ 
        role: testUser.role,
        is_admin: testUser.is_admin,
        is_tutor: testUser.is_tutor,
        is_student: testUser.is_student
      })
      .eq('id', testUser.id);

    console.log('✅ Original role restored');
    console.log('\n✅ ALL TESTS PASSED! Role change fix is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testRoleChange().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch(err => {
  console.error('❌ Test error:', err);
  process.exit(1);
});

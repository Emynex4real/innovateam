const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function syncAllUserRoles() {
  console.log('🔄 Syncing all user roles with flags...\n');

  try {
    // 1. Get all users
    const { data: users, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id, email, role, is_admin, is_tutor, is_student');

    if (fetchError) {
      console.error('❌ Failed to fetch users:', fetchError);
      return;
    }

    console.log(`📊 Found ${users.length} users to check\n`);

    let syncedCount = 0;
    let alreadySyncedCount = 0;

    // 2. Check and sync each user
    for (const user of users) {
      const expectedFlags = {
        is_admin: user.role === 'admin',
        is_tutor: user.role === 'tutor',
        is_student: user.role === 'student'
      };

      const needsSync = 
        user.is_admin !== expectedFlags.is_admin ||
        user.is_tutor !== expectedFlags.is_tutor ||
        user.is_student !== expectedFlags.is_student;

      if (needsSync) {
        console.log(`🔧 Syncing ${user.email}:`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Before: admin=${user.is_admin}, tutor=${user.is_tutor}, student=${user.is_student}`);
        console.log(`   After:  admin=${expectedFlags.is_admin}, tutor=${expectedFlags.is_tutor}, student=${expectedFlags.is_student}`);

        const { error: updateError } = await supabase
          .from('user_profiles')
          .update(expectedFlags)
          .eq('id', user.id);

        if (updateError) {
          console.error(`   ❌ Failed to sync: ${updateError.message}`);
        } else {
          console.log(`   ✅ Synced successfully\n`);
          syncedCount++;
        }
      } else {
        alreadySyncedCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Already synced: ${alreadySyncedCount}`);
    console.log(`   🔧 Newly synced: ${syncedCount}`);
    console.log(`   📋 Total users: ${users.length}`);

    if (syncedCount > 0) {
      console.log('\n✅ Role sync completed successfully!');
      console.log('💡 Users will see changes after logging out and back in.');
    } else {
      console.log('\n✅ All users already have correct role flags!');
    }

  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
}

// Run the sync
syncAllUserRoles().then(() => {
  console.log('\n🏁 Sync completed');
  process.exit(0);
}).catch(err => {
  console.error('❌ Sync error:', err);
  process.exit(1);
});

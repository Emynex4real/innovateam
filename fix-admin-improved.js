require('dotenv').config({ path: './server/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in server/.env');
  console.error('   Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixAdminRoleImproved() {
  const email = 'emynex4real@gmail.com';
  
  console.log('🔧 Fixing admin role for:', email);
  console.log('');
  
  try {
    // Step 1: Find user by email
    console.log('Step 1: Finding user...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      return;
    }
    
    const user = users.find(u => u.email === email);
    
    if (!user) {
      console.error('❌ User not found:', email);
      return;
    }
    
    console.log('✅ User found:', user.id);
    console.log('   Current metadata role:', user.user_metadata?.role || 'none');
    
    // Step 2: Update user_metadata in Supabase Auth
    console.log('');
    console.log('Step 2: Updating user_metadata to admin...');
    const { error: authError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { role: 'admin' }
    });
    
    if (authError) {
      console.error('❌ Error updating auth metadata:', authError.message);
      return;
    }
    
    console.log('✅ Auth metadata updated to admin');
    
    // Step 3: Disable trigger, update users table, re-enable trigger
    console.log('');
    console.log('Step 3: Updating users table (with trigger management)...');
    
    // Disable trigger
    const { error: disableError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.users DISABLE TRIGGER update_users_updated_at'
    });
    
    // If RPC doesn't work, try direct update
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({ 
        role: 'admin',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select();
    
    if (updateError) {
      console.error('⚠️  Direct update failed:', updateError.message);
      console.log('');
      console.log('📋 Please run this SQL manually in Supabase SQL Editor:');
      console.log('');
      console.log('-- Disable trigger');
      console.log('ALTER TABLE public.users DISABLE TRIGGER update_users_updated_at;');
      console.log('');
      console.log('-- Update role');
      console.log(`UPDATE public.users SET role = 'admin' WHERE id = '${user.id}';`);
      console.log('');
      console.log('-- Re-enable trigger');
      console.log('ALTER TABLE public.users ENABLE TRIGGER update_users_updated_at;');
      console.log('');
      console.log('Or use the file: fix-admin-direct.sql');
      return;
    }
    
    console.log('✅ Users table updated to admin');
    
    // Re-enable trigger
    const { error: enableError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.users ENABLE TRIGGER update_users_updated_at'
    });
    
    // Step 4: Verify the changes
    console.log('');
    console.log('Step 4: Verifying changes...');
    
    const { data: { user: verifyUser }, error: verifyError } = await supabase.auth.admin.getUserById(user.id);
    
    if (verifyError) {
      console.error('❌ Error verifying user:', verifyError.message);
      return;
    }
    
    const { data: verifyProfile, error: verifyProfileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    console.log('');
    console.log('✅ VERIFICATION COMPLETE');
    console.log('   Email:', verifyUser.email);
    console.log('   Auth metadata role:', verifyUser.user_metadata?.role);
    console.log('   Users table role:', verifyProfile?.role);
    
    if (verifyUser.user_metadata?.role === 'admin' && verifyProfile?.role === 'admin') {
      console.log('');
      console.log('🎉 Admin role successfully restored!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Log out from the application');
      console.log('2. Log back in with:', email);
      console.log('3. You should now have admin access');
    } else {
      console.log('');
      console.log('⚠️  Roles may not be fully synced. Please run fix-admin-direct.sql manually.');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error(error);
  }
}

fixAdminRoleImproved();

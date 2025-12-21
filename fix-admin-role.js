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

async function fixAdminRole() {
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
    
    // Step 3: Check if user exists in users table
    console.log('');
    console.log('Step 3: Checking users table...');
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Error checking users table:', profileError.message);
    }
    
    if (!userProfile) {
      // Create user profile
      console.log('   User not in users table, creating...');
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.name || user.user_metadata?.full_name || email.split('@')[0],
          role: 'admin'
        });
      
      if (insertError) {
        console.error('❌ Error creating user profile:', insertError.message);
        return;
      }
      
      console.log('✅ User profile created with admin role');
    } else {
      // Update existing profile
      console.log('   Current users table role:', userProfile.role);
      
      if (userProfile.role !== 'admin') {
        console.log('   Updating users table role to admin...');
        const { error: updateError } = await supabase
          .from('users')
          .update({ role: 'admin' })
          .eq('id', user.id);
        
        if (updateError) {
          console.error('❌ Error updating users table:', updateError.message);
          return;
        }
        
        console.log('✅ Users table updated to admin');
      } else {
        console.log('✅ Users table already has admin role');
      }
    }
    
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
    console.log('');
    console.log('🎉 Admin role successfully restored!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Log out from the application');
    console.log('2. Log back in with:', email);
    console.log('3. You should now have admin access');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error(error);
  }
}

fixAdminRole();

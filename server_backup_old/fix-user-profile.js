require('dotenv').config();
const supabase = require('./supabaseClient');

async function fixUserProfile() {
  try {
    console.log('Checking user profiles...');
    
    // Get auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;
    
    console.log(`Found ${authUsers.users.length} auth users`);
    
    for (const authUser of authUsers.users) {
      console.log(`\nChecking user: ${authUser.email}`);
      
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (profileError && profileError.code === 'PGRST116') {
        console.log('Profile not found, creating...');
        
        // Create profile
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert([{
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.name || authUser.email.split('@')[0],
            phone: authUser.user_metadata?.phone || '',
            role: authUser.user_metadata?.role || 'user',
            wallet_balance: 0,
            is_active: true
          }])
          .select()
          .single();
        
        if (createError) {
          console.log('Error creating profile:', createError);
        } else {
          console.log('Profile created:', newProfile);
        }
      } else if (profile) {
        console.log('Profile exists:', profile);
      } else {
        console.log('Profile error:', profileError);
      }
    }
    
    console.log('\nUser profile check complete!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixUserProfile();
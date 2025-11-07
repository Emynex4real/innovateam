import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const checkSupabaseUsers = async () => {
  try {
    console.log('🔍 Checking Supabase for users...');
    
    // Try to get current session
    const { data: session } = await supabase.auth.getSession();
    console.log('Current session:', session.session ? 'Active' : 'None');
    
    // Try to get user (this won't work with anon key for other users)
    const { data: user } = await supabase.auth.getUser();
    console.log('Current user:', user.user ? user.user.email : 'None');
    
    // Check if we can access auth.users (this requires service role key)
    try {
      const { data: users, error } = await supabase
        .from('auth.users')
        .select('*')
        .limit(5);
        
      if (error) {
        console.log('❌ Cannot access auth.users table (expected with anon key)');
        console.log('Error:', error.message);
      } else {
        console.log('✅ Found users in Supabase:', users.length);
        users.forEach(user => {
          console.log(`- ${user.email} (${user.created_at})`);
        });
      }
    } catch (authError) {
      console.log('❌ Auth table access failed:', authError.message);
    }
    
    return {
      hasSession: !!session.session,
      currentUser: user.user?.email || null,
      canAccessUsers: false // anon key cannot access auth.users
    };
    
  } catch (error) {
    console.error('❌ Supabase check failed:', error);
    return { error: error.message };
  }
};

export const testSupabaseSignup = async (email, password) => {
  try {
    console.log('🧪 Testing Supabase signup...');
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: 'Test User'
        }
      }
    });
    
    if (error) {
      console.log('❌ Signup failed:', error.message);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Signup successful!');
    console.log('User ID:', data.user?.id);
    console.log('Email confirmed:', !!data.user?.email_confirmed_at);
    console.log('Confirmation sent:', !data.user?.email_confirmed_at);
    
    return { success: true, data };
    
  } catch (error) {
    console.error('❌ Signup test failed:', error);
    return { success: false, error: error.message };
  }
};
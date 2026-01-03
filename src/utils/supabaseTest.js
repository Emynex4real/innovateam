import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const testSupabaseConnection = async () => {
  console.log('🔍 Testing Supabase Configuration...');
  console.log('URL:', supabaseUrl);
  console.log('Key (first 20 chars):', supabaseAnonKey?.substring(0, 20) + '...');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials');
    return false;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test connection by trying to get session
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Supabase connection error:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    console.log('Current session:', data.session ? 'Active' : 'None');
    
    return true;
  } catch (error) {
    console.error('❌ Supabase test failed:', error);
    return false;
  }
};

// Test signup process
export const testSignup = async (email, password) => {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    console.log('🔍 Testing signup for:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/email-confirmation`
      }
    });
    
    if (error) {
      console.error('❌ Signup error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Signup successful');
    console.log('User created:', !!data.user);
    console.log('Email confirmed:', !!data.user?.email_confirmed_at);
    console.log('Confirmation sent:', !data.user?.email_confirmed_at);
    
    return { success: true, data };
  } catch (error) {
    console.error('❌ Signup test failed:', error);
    return { success: false, error: error.message };
  }
};
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jdedscbvbkjvqmmdabig.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZWRzY2J2YmtqdnFtbWRhYmlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDcyNzMsImV4cCI6MjA3NTM4MzI3M30.brACmztEwNfk3IzJtaxPI83MPilteu9qLxwsgIlHZQQ';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZWRzY2J2YmtqdnFtbWRhYmlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTgwNzI3MywiZXhwIjoyMDc1MzgzMjczfQ.OAtp8dTtIuekKgcAo5WagT30xpzZiTivKxH-LujRFW4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const createProfileForExistingUser = async () => {
  console.log('🔧 Creating profile for existing user...');
  
  try {
    // Get the existing user ID (emynex4real@Gmail.com)
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = users.users.find(u => u.email === 'emynex4real@gmail.com');
    
    if (!existingUser) {
      console.log('❌ User not found');
      return { success: false, error: 'User not found' };
    }
    
    console.log('✅ Found user:', existingUser.id);
    
    // Create profile for existing user
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        id: existingUser.id,
        full_name: existingUser.user_metadata?.full_name || 'User',
        phone: existingUser.user_metadata?.phone || '',
        wallet_balance: 0,
        role: 'user',
        status: 'active'
      });
      
    if (error) {
      console.error('❌ Profile creation failed:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Profile created successfully!');
    return { success: true, data };
    
  } catch (error) {
    console.error('❌ Profile creation failed:', error);
    return { success: false, error: error.message };
  }
};

export const testRegistration = async () => {
  console.log('🧪 Testing Supabase Registration...');
  
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  
  try {
    // Test signup
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User',
          phone: '1234567890'
        }
      }
    });
    
    if (error) {
      console.error('❌ Signup failed:', error.message);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Signup successful!');
    console.log('User ID:', data.user?.id);
    console.log('Email:', data.user?.email);
    console.log('Confirmed:', !!data.user?.email_confirmed_at);
    
    // Check if user appears in admin view
    setTimeout(async () => {
      try {
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        const newUser = users.users.find(u => u.email === testEmail);
        console.log('User found in admin:', !!newUser);
        
        // Check user_profiles table
        const { data: profiles } = await supabaseAdmin
          .from('user_profiles')
          .select('*')
          .eq('id', data.user?.id);
          
        console.log('Profile created:', profiles?.length > 0);
        if (profiles?.length > 0) {
          console.log('Profile data:', profiles[0]);
        }
      } catch (adminError) {
        console.error('Admin check failed:', adminError);
      }
    }, 2000);
    
    return { success: true, user: data.user };
    
  } catch (error) {
    console.error('❌ Registration test failed:', error);
    return { success: false, error: error.message };
  }
};
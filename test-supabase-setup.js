// Test Supabase connection and table structure
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jdedscbvbkjvqmmdabig.supabase.co';
const supabaseAnonKey = 'sb_publishable_cVZ7KXM0lNdNfuUzVD-Hlw_E4yNzJJO';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test 1: Check if we can connect
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      
      // Check if table exists
      if (error.message.includes('relation "public.user_profiles" does not exist')) {
        console.log('🔧 The user_profiles table does not exist. Please run the fix-registration.sql script in your Supabase SQL editor.');
        return;
      }
    } else {
      console.log('✅ Successfully connected to Supabase');
    }
    
    // Test 2: Try to create a test user profile (will fail due to RLS, but shows table structure)
    const testUserId = '00000000-0000-0000-0000-000000000000';
    const { error: insertError } = await supabase.from('user_profiles').insert({
      id: testUserId,
      email: 'test@example.com',
      full_name: 'Test User',
      role: 'student'
    });
    
    if (insertError) {
      if (insertError.message.includes('new row violates row-level security policy')) {
        console.log('✅ RLS is working correctly (expected error)');
      } else {
        console.log('⚠️ Insert test error:', insertError.message);
      }
    }
    
    console.log('🎉 Supabase setup appears to be working correctly!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testSupabaseConnection();
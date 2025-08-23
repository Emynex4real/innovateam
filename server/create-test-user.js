require('dotenv').config();
const supabase = require('./supabaseClient');

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'test123',
      email_confirm: true,
      user_metadata: {
        name: 'Test User',
        role: 'user'
      }
    });
    
    if (error) {
      console.log('Error creating auth user:', error.message);
      return;
    }
    
    console.log('Auth user created:', data.user.id);
    
    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: data.user.id,
          email: 'test@example.com',
          name: 'Test User',
          phone_number: '1234567890',
          role: 'user',
          status: 'active'
        }
      ])
      .select()
      .single();
    
    if (profileError) {
      console.log('Error creating profile:', profileError.message);
    } else {
      console.log('Profile created:', profile);
    }
    
    console.log('Test user created successfully!');
    console.log('Email: test@example.com');
    console.log('Password: test123');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestUser();
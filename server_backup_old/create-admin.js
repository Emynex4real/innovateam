// Load environment variables first
require('dotenv').config();
const supabase = require('./supabaseClient');

async function createAdmin() {
  const adminEmail = 'admin@innovateam.com';
  const adminPassword = 'Admin@123456';
  const adminName = 'System Administrator';
  
  try {
    console.log('🚀 Creating admin user...');
    
    // Create admin user with auto-confirmation
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      user_metadata: { 
        name: adminName, 
        phone_number: '08000000000',
        role: 'admin'
      },
      email_confirm: true
    });
    
    if (error) {
      console.error('❌ Failed to create admin user:', error);
      return;
    }
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('👤 User ID:', data.user.id);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createAdmin();
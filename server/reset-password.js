require('dotenv').config();
const supabase = require('./supabaseClient');

async function resetUserPassword() {
  try {
    console.log('Resetting password for michaelbalogun34@gmail.com...');
    
    // Update user password
    const { data, error } = await supabase.auth.admin.updateUserById(
      '1fd73b6c-6bdc-4b90-9900-4720d7613569', // User ID from database check
      {
        password: 'newpassword123',
        email_confirm: true
      }
    );
    
    if (error) {
      console.log('Error updating password:', error.message);
      return;
    }
    
    console.log('Password updated successfully!');
    console.log('Email: michaelbalogun34@gmail.com');
    console.log('New Password: newpassword123');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

resetUserPassword();
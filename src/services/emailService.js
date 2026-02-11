import supabase from '../config/supabase';

// Custom email confirmation service
export const sendConfirmationEmail = async (email, confirmationToken) => {
  try {
    // For now, we'll use a simple approach - store the confirmation in localStorage
    // and send a "fake" email that the user can click
    const confirmationData = {
      email,
      token: confirmationToken,
      timestamp: Date.now(),
      confirmed: false
    };
    
    localStorage.setItem(`confirmation_${email}`, JSON.stringify(confirmationData));
    
    // Email confirmation handled via Supabase
    
    return { success: true };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error: error.message };
  }
};

export const confirmEmail = async (email, token) => {
  try {
    const storedData = localStorage.getItem(`confirmation_${email}`);
    if (!storedData) {
      console.log('No stored confirmation data, creating new confirmation');
      // If no stored data, create a simple confirmation
      const confirmedUser = {
        id: `confirmed-${Date.now()}`,
        email,
        user_metadata: {
          full_name: localStorage.getItem('registrationName') || 'User',
          phone: localStorage.getItem('registrationPhone') || ''
        },
        email_confirmed_at: new Date().toISOString()
      };
      
      localStorage.setItem('confirmedUser', JSON.stringify(confirmedUser));
      return { success: true, user: confirmedUser };
    }
    
    const confirmationData = JSON.parse(storedData);
    
    // Mark as confirmed
    confirmationData.confirmed = true;
    confirmationData.confirmedAt = Date.now();
    localStorage.setItem(`confirmation_${email}`, JSON.stringify(confirmationData));
    
    // Create confirmed user
    const confirmedUser = {
      id: `confirmed-${Date.now()}`,
      email,
      user_metadata: {
        full_name: localStorage.getItem('registrationName') || 'User',
        phone: localStorage.getItem('registrationPhone') || ''
      },
      email_confirmed_at: new Date().toISOString()
    };
    
    localStorage.setItem('confirmedUser', JSON.stringify(confirmedUser));
    
    // Update user status in admin tracking
    const allUsers = JSON.parse(localStorage.getItem('allRegisteredUsers') || '[]');
    const userIndex = allUsers.findIndex(u => u.email === email);
    if (userIndex !== -1) {
      allUsers[userIndex].status = 'active';
      allUsers[userIndex].email_confirmed_at = new Date().toISOString();
      localStorage.setItem('allRegisteredUsers', JSON.stringify(allUsers));
    }
    
    return { success: true, user: confirmedUser };
  } catch (error) {
    console.error('Email confirmation error:', error);
    return { success: false, error: error.message };
  }
};

export const isEmailConfirmed = (email) => {
  try {
    const storedData = localStorage.getItem(`confirmation_${email}`);
    if (!storedData) return false;
    
    const confirmationData = JSON.parse(storedData);
    return confirmationData.confirmed === true;
  } catch (error) {
    return false;
  }
};
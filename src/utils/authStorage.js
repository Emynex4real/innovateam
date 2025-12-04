// Utility to ensure user data is properly stored in localStorage
export const storeUserData = (user) => {
  if (!user) {
    console.error('❌ Cannot store null user');
    return false;
  }

  try {
    // Ensure user object has all required fields
    const normalizedUser = {
      id: user.id,
      email: user.email || user.user_metadata?.email,
      name: user.name || user.user_metadata?.full_name || user.email?.split('@')[0],
      user_metadata: {
        full_name: user.name || user.user_metadata?.full_name,
        email: user.email || user.user_metadata?.email,
        phone: user.phone || user.user_metadata?.phone,
        ...(user.user_metadata || {})
      },
      role: user.role || 'user',
      isAdmin: user.isAdmin || user.role === 'admin',
      email_confirmed_at: user.email_confirmed_at,
      walletBalance: user.walletBalance || 0
    };

    // Validate required fields
    if (!normalizedUser.email) {
      console.error('❌ User object missing email:', user);
      throw new Error('User email is required');
    }

    if (!normalizedUser.id) {
      console.error('❌ User object missing id:', user);
      throw new Error('User id is required');
    }

    // Store in localStorage
    localStorage.setItem('confirmedUser', JSON.stringify(normalizedUser));
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    
    console.log('✅ User stored successfully:', {
      id: normalizedUser.id,
      email: normalizedUser.email,
      name: normalizedUser.name
    });

    return true;
  } catch (error) {
    console.error('❌ Failed to store user:', error);
    return false;
  }
};

export const getUserData = () => {
  try {
    const userStr = localStorage.getItem('confirmedUser') || localStorage.getItem('user');
    if (!userStr) return null;

    const user = JSON.parse(userStr);
    
    // Validate user has required fields
    if (!user.email || !user.id) {
      console.warn('⚠️ Stored user missing required fields:', user);
      return null;
    }

    return user;
  } catch (error) {
    console.error('❌ Failed to get user:', error);
    return null;
  }
};

export const clearUserData = () => {
  try {
    localStorage.removeItem('confirmedUser');
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('wallet_balance');
    console.log('✅ User data cleared');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear user data:', error);
    return false;
  }
};

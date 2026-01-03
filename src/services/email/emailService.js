// ❌ CRITICAL ISSUE: Resend cannot be used in frontend!
// Email service must be moved to backend

// Frontend email service - sends requests to backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const sendEmailRequest = async (endpoint, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/email/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`Email ${endpoint} error:`, error);
    return { success: false, error: error.message };
  }
};



export const emailService = {
  async sendWelcomeEmail(userEmail, userName) {
    return await sendEmailRequest('welcome', { userEmail, userName });
  },

  async sendTransactionEmail(userEmail, userName, transaction) {
    return await sendEmailRequest('transaction', { userEmail, userName, transaction });
  },

  async sendCreditApprovalEmail(userEmail, userName, amount, approved) {
    return await sendEmailRequest('credit-approval', { userEmail, userName, amount, approved });
  },

  async sendPasswordResetEmail(userEmail, resetLink) {
    return await sendEmailRequest('password-reset', { userEmail, resetLink });
  },

  async sendLowBalanceAlert(userEmail, userName, balance) {
    return await sendEmailRequest('low-balance', { userEmail, userName, balance });
  }
};

export default emailService;

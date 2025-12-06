const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = 'InnovaTeam <onboarding@resend.dev>';

class EmailService {
  async sendWelcomeEmail(userEmail, userName) {
    if (!resend) {
      console.log('Email service disabled - RESEND_API_KEY not configured');
      return { success: false, error: 'Email service not configured' };
    }
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: userEmail,
        subject: 'Welcome to InnovaTeam! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #16a34a;">Welcome to InnovaTeam, ${userName}!</h1>
            <p>Thank you for joining our educational platform. We're excited to help you achieve your academic goals.</p>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #16a34a; margin-top: 0;">Get Started:</h2>
              <ul style="line-height: 1.8;">
                <li>📚 Practice with AI-generated questions</li>
                <li>🎯 Get personalized course recommendations</li>
                <li>📊 Track your performance analytics</li>
                <li>🏆 Compete on the leaderboard</li>
              </ul>
            </div>
            
            <p>Need help? Contact our support team anytime.</p>
            <p style="color: #666; font-size: 14px;">Best regards,<br>The InnovaTeam Team</p>
          </div>
        `
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Welcome email error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendTransactionEmail(userEmail, userName, transaction) {
    if (!resend) return { success: false, error: 'Email service not configured' };
    const isCredit = transaction.type === 'credit';
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: userEmail,
        subject: `${isCredit ? '✅' : '💳'} Transaction ${transaction.status} - ₦${transaction.amount.toLocaleString()}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: ${isCredit ? '#16a34a' : '#ea580c'};">
              ${isCredit ? 'Credit' : 'Debit'} Transaction
            </h1>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666;">Amount:</td>
                  <td style="padding: 8px 0; font-weight: bold; text-align: right;">₦${transaction.amount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Type:</td>
                  <td style="padding: 8px 0; font-weight: bold; text-align: right;">${transaction.type}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Status:</td>
                  <td style="padding: 8px 0; font-weight: bold; text-align: right; color: ${transaction.status === 'successful' ? '#16a34a' : '#dc2626'};">
                    ${transaction.status}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Description:</td>
                  <td style="padding: 8px 0; text-align: right;">${transaction.description}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Date:</td>
                  <td style="padding: 8px 0; text-align: right;">${new Date().toLocaleString()}</td>
                </tr>
              </table>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              If you didn't authorize this transaction, please contact support immediately.
            </p>
          </div>
        `
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Transaction email error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendCreditApprovalEmail(userEmail, userName, amount, approved) {
    if (!resend) return { success: false, error: 'Email service not configured' };
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: userEmail,
        subject: approved ? '✅ Test Credit Approved!' : '❌ Test Credit Request Update',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: ${approved ? '#16a34a' : '#dc2626'};">
              ${approved ? 'Credit Request Approved!' : 'Credit Request Update'}
            </h1>
            
            ${approved ? `
              <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
                <p style="margin: 0; font-size: 18px;">
                  Great news! Your test credit request of <strong>₦${amount.toLocaleString()}</strong> has been approved.
                </p>
                <p style="margin: 10px 0 0 0; color: #666;">
                  The amount has been added to your wallet and you can start using it immediately.
                </p>
              </div>
            ` : `
              <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <p style="margin: 0;">
                  Unfortunately, your test credit request of <strong>₦${amount.toLocaleString()}</strong> was not approved at this time.
                </p>
                <p style="margin: 10px 0 0 0; color: #666;">
                  Please contact support if you have any questions.
                </p>
              </div>
            `}
            
            <p style="color: #666; font-size: 14px;">Best regards,<br>The InnovaTeam Team</p>
          </div>
        `
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Credit approval email error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendPasswordResetEmail(userEmail, resetLink) {
    if (!resend) return { success: false, error: 'Email service not configured' };
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: userEmail,
        subject: '🔐 Reset Your Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #16a34a;">Reset Your Password</h1>
            <p>You requested to reset your password. Click the button below to proceed:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              This link will expire in 1 hour. If you didn't request this, please ignore this email.
            </p>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              Or copy this link: ${resetLink}
            </p>
          </div>
        `
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Password reset email error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendLowBalanceAlert(userEmail, userName, balance) {
    if (!resend) return { success: false, error: 'Email service not configured' };
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: userEmail,
        subject: '⚠️ Low Wallet Balance Alert',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ea580c;">Low Balance Alert</h1>
            <p>Hi ${userName},</p>
            <p>Your wallet balance is running low: <strong>₦${balance.toLocaleString()}</strong></p>
            
            <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ea580c;">
              <p style="margin: 0;">
                To continue using our services without interruption, please fund your wallet.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/wallet" 
                 style="background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Fund Wallet
              </a>
            </div>
          </div>
        `
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Low balance email error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
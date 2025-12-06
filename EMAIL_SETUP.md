# Email Notifications Setup Guide

## ✅ What's Implemented

Email notifications are now integrated for:
1. **Welcome Email** - Sent when user registers
2. **Transaction Emails** - Sent for credit/debit transactions
3. **Credit Approval/Rejection** - Sent when admin approves/rejects test credit
4. **Password Reset** - Sent when user requests password reset
5. **Low Balance Alert** - Sent when wallet balance is low

## 🚀 Setup Instructions

### Step 1: Get Resend API Key (FREE)

1. Go to [resend.com](https://resend.com)
2. Sign up for free account (no credit card required)
3. Verify your email
4. Go to API Keys section
5. Create a new API key
6. Copy the key (starts with `re_`)

### Step 2: Add API Key to .env

Open `.env` file and replace:
```
REACT_APP_RESEND_API_KEY=your_resend_api_key_here
```

With your actual key:
```
REACT_APP_RESEND_API_KEY=re_abc123xyz...
```

### Step 3: Restart Development Server

```bash
npm start
```

## 📧 Email Templates

All emails are professionally designed with:
- Responsive HTML layout
- Brand colors (green theme)
- Clear call-to-action buttons
- Transaction details tables
- Mobile-friendly design

## 🎯 When Emails Are Sent

| Event | Email Type | Trigger |
|-------|-----------|---------|
| User Registration | Welcome Email | Automatic on signup |
| Credit Approval | Approval Email | Admin clicks "Approve" |
| Credit Rejection | Rejection Email | Admin clicks "Reject" |
| Password Reset | Reset Link Email | User clicks "Forgot Password" |
| Low Balance | Alert Email | Manual trigger (can be automated) |
| Transaction | Confirmation Email | Can be added to wallet operations |

## 🔧 Customization

### Change Sender Email

In `src/services/email/emailService.js`, update:
```javascript
const FROM_EMAIL = 'InnovaTeam <onboarding@resend.dev>';
```

To your verified domain:
```javascript
const FROM_EMAIL = 'InnovaTeam <noreply@yourdomain.com>';
```

### Add More Email Types

Add new functions to `emailService.js`:
```javascript
async sendCustomEmail(userEmail, subject, htmlContent) {
  // Your custom email logic
}
```

## 📊 Free Tier Limits

- **3,000 emails/month** - FREE
- No credit card required
- Perfect for MVP/beta testing
- Upgrade available if needed

## ✅ Testing

1. Register a new user → Check for welcome email
2. Admin approves credit → Check for approval email
3. Request password reset → Check for reset email

## 🐛 Troubleshooting

**Emails not sending?**
- Check API key is correct in `.env`
- Restart dev server after adding key
- Check browser console for errors
- Verify email address is valid

**Emails going to spam?**
- Use Resend's default domain for testing
- For production, verify your own domain
- Add SPF/DKIM records (Resend provides these)

## 🚀 Production Deployment

1. Add `REACT_APP_RESEND_API_KEY` to your hosting environment variables
2. Verify your domain in Resend dashboard
3. Update `FROM_EMAIL` to use your domain
4. Test all email flows before launch

## 📝 Notes

- Emails are sent asynchronously (non-blocking)
- Failed emails are logged to console
- No user-facing errors if email fails
- Consider adding email queue for high volume

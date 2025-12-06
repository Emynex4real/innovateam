# Email Notifications Setup Guide

## What We Built
Email notifications for:
- ✅ Welcome emails (new users)
- ✅ Transaction confirmations (credit/debit)
- ✅ Credit approval/rejection (admin actions)
- ✅ Password reset links
- ✅ Low balance alerts

## Setup Steps (3 minutes)

### 1. Create Free Resend Account
1. Go to https://resend.com/signup
2. Sign up with email (FREE - 3,000 emails/month, no credit card)
3. Verify your email address

### 2. Get API Key
1. Go to https://resend.com/api-keys
2. Click "Create API Key"
3. Name it: "InnovaTeam Production"
4. Copy the key (starts with `re_`)

### 3. Add API Key to Environment
Open `.env` file and replace:
```
REACT_APP_RESEND_API_KEY=your_resend_api_key_here
```
With your actual API key from Resend.

### 4. Test It Works
1. Restart your dev server: `npm start`
2. Register a new account
3. Check your email inbox
4. You should receive a welcome email!

## Email Templates

### 1. Welcome Email
**Sent when**: User registers
**Contains**:
- Welcome message
- Getting started guide
- Feature highlights

### 2. Transaction Email
**Sent when**: Wallet credit/debit
**Contains**:
- Amount and type
- Transaction status
- Description and date

### 3. Credit Approval Email
**Sent when**: Admin approves/rejects test credit
**Contains**:
- Approval status
- Amount credited
- Next steps

### 4. Password Reset Email
**Sent when**: User requests password reset
**Contains**:
- Reset link (expires in 1 hour)
- Security notice

### 5. Low Balance Alert
**Sent when**: Wallet balance is low
**Contains**:
- Current balance
- Fund wallet button

## Production Setup

### Before Deploying:

#### 1. Verify Your Domain (Important!)
By default, emails come from `onboarding@resend.dev`. To use your own domain:

1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Enter your domain (e.g., `innovateam.com`)
4. Add DNS records (Resend provides them)
5. Wait for verification (5-10 minutes)

#### 2. Update FROM Email
Once domain is verified, update `src/services/email/emailService.js`:
```javascript
const FROM_EMAIL = 'InnovaTeam <noreply@innovateam.com>';
```

#### 3. Environment Variables for Production
Add to Vercel/Netlify:
```
REACT_APP_RESEND_API_KEY=re_your_actual_key
REACT_APP_URL=https://innovateam.com
```

## Testing Emails

### Test Welcome Email:
1. Register new account
2. Check email inbox (including spam)

### Test Transaction Email:
1. Admin credits your wallet
2. Check email for transaction confirmation

### Test Credit Approval:
1. Request test credit
2. Admin approves
3. Check email for approval notification

## Email Deliverability

### ✅ Best Practices:
- Use verified domain (not resend.dev)
- Add SPF, DKIM, DMARC records
- Avoid spam trigger words
- Include unsubscribe link (for marketing emails)

### 🚫 Avoid:
- Sending too many emails too fast
- Using ALL CAPS in subject
- Too many exclamation marks!!!
- Misleading subject lines

## Cost

### Free Tier:
- 3,000 emails/month
- 100 emails/day
- All features included

### Paid Plans (If You Grow):
- $20/month for 50K emails
- $80/month for 500K emails
- Only pay if you exceed free tier

## Monitoring

### Resend Dashboard Shows:
- Emails sent/delivered/bounced
- Open rates (if tracking enabled)
- Click rates
- Bounce reasons

### Check Status:
https://resend.com/emails

## Troubleshooting

### "Email not received"
1. Check spam folder
2. Verify API key is correct
3. Check Resend dashboard for errors
4. Ensure email address is valid

### "Invalid API key"
1. Copy key again from Resend
2. Make sure no extra spaces
3. Restart dev server after updating .env

### "Rate limit exceeded"
1. Free tier: 100 emails/day
2. Wait 24 hours or upgrade plan
3. Check for email loops in code

## Email Service Code

Located in: `src/services/email/emailService.js`

### Add New Email Type:
```javascript
async sendCustomEmail(userEmail, data) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: 'Your Subject',
      html: `<div>Your HTML content</div>`
    });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
}
```

## Integration Points

### Current Integrations:
1. **Registration** (App.js) → Welcome email
2. **Credit Approval** (AdminDashboard.jsx) → Approval email
3. **Password Reset** (ForgotPassword page) → Reset email

### Future Integrations:
- Transaction emails (add to wallet service)
- Low balance alerts (add to wallet context)
- Weekly summary emails
- Achievement notifications

## Support

- Docs: https://resend.com/docs
- Dashboard: https://resend.com/
- Status: https://status.resend.com/

---

**You're all set!** Emails will be sent automatically. 📧

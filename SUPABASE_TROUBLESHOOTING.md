# Supabase Email Confirmation Troubleshooting Guide

## Current Configuration Status
- **Supabase URL**: https://jdedscbvbkjvqmmdabig.supabase.co
- **Environment**: Production-ready configuration
- **Email Mode**: Real emails enabled

## Common Issues and Solutions

### 1. Check Supabase Dashboard Settings

Go to your Supabase dashboard: https://supabase.com/dashboard/project/jdedscbvbkjvqmmdabig

#### Authentication Settings:
1. Navigate to **Authentication > Settings**
2. Check **Email Confirmation**:
   - ✅ Should be **ENABLED**
   - ✅ Confirm email should be **REQUIRED**

#### Site URL Configuration:
1. In **Authentication > URL Configuration**
2. Set **Site URL** to: `http://localhost:3000` (for development)
3. Add **Redirect URLs**:
   - `http://localhost:3000/email-confirmation`
   - `http://localhost:3000/**` (wildcard for all routes)

#### Email Templates:
1. Go to **Authentication > Email Templates**
2. Check **Confirm signup** template
3. Ensure the confirmation URL is correct: `{{ .ConfirmationURL }}`

### 2. Email Provider Configuration

#### Default Provider (Supabase):
- Supabase provides a default email service
- Limited to 3 emails per hour for free tier
- Check if you've exceeded the limit

#### Custom SMTP (Recommended):
1. Go to **Settings > Authentication**
2. Configure SMTP settings:
   - **SMTP Host**: Your email provider's SMTP server
   - **SMTP Port**: Usually 587 or 465
   - **SMTP User**: Your email address
   - **SMTP Pass**: Your email password or app password

### 3. Testing Steps

1. **Test Registration**:
   - Use the debug tools in the registration page
   - Click "Show Debug Info" → "Test Connection"
   - Check browser console for errors

2. **Check Email Delivery**:
   - Look in spam/junk folder
   - Try different email addresses
   - Check Supabase logs in dashboard

3. **Verify Database**:
   - Go to **Database > Table Editor**
   - Check `auth.users` table
   - Look for your user record
   - Check `email_confirmed_at` field (should be null until confirmed)

### 4. Environment Variables Check

Ensure your `.env` file has:
```
REACT_APP_SUPABASE_URL=https://jdedscbvbkjvqmmdabig.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Code Debugging

Check browser console for:
- Supabase connection errors
- Authentication state changes
- Network request failures

### 6. Manual Email Confirmation (Temporary)

If emails aren't working, you can manually confirm users:

1. Go to **Authentication > Users** in Supabase dashboard
2. Find your user
3. Click on the user
4. Toggle **Email Confirmed** to ON

### 7. Rate Limiting Issues

Supabase free tier limits:
- 3 emails per hour
- 10,000 monthly active users
- If exceeded, emails won't send

### 8. Common Error Messages

- **"Invalid email"**: Check email format
- **"User already registered"**: User exists but not confirmed
- **"Email not confirmed"**: User needs to click confirmation link
- **"Invalid confirmation token"**: Link expired or malformed

## Quick Fix Checklist

- [ ] Email confirmation enabled in Supabase dashboard
- [ ] Correct redirect URLs configured
- [ ] Site URL matches your domain
- [ ] Check spam folder
- [ ] Try different email address
- [ ] Check Supabase logs
- [ ] Verify environment variables
- [ ] Test with debug tools

## Need Help?

1. Check Supabase dashboard logs
2. Use the debug tools in the registration page
3. Check browser console for errors
4. Try manual confirmation in dashboard
5. Contact Supabase support if needed

## Production Deployment

When deploying to production:
1. Update Site URL to your production domain
2. Update redirect URLs to production URLs
3. Configure custom SMTP for better deliverability
4. Set up proper DNS records (SPF, DKIM, DMARC)
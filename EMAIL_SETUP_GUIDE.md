# Email Setup Guide for Supabase

## Quick Fix (Development Mode)
I've enabled development mode that skips email confirmation. You can now register and login immediately without waiting for emails.

**Current Status**: `REACT_APP_SKIP_EMAIL_CONFIRMATION=true` in your `.env` file

## To Enable Real Emails

### 1. Supabase Dashboard Settings
Go to: https://supabase.com/dashboard/project/jdedscbvbkjvqmmdabig/settings/auth

**Check these settings:**
- ✅ Enable email confirmations: **ON**
- ✅ Confirm email: **Required**
- ✅ Site URL: `http://localhost:3000`
- ✅ Redirect URLs: `http://localhost:3000/**`

### 2. Email Rate Limits (Most Common Issue)
Supabase free tier limits:
- **3 emails per hour**
- **30 emails per day**

If you've hit this limit, emails won't send until the limit resets.

### 3. Configure Custom SMTP (Recommended)
In Supabase Dashboard → Settings → Auth → SMTP Settings:

**Gmail Example:**
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Pass: your-app-password (not regular password)
```

**Outlook/Hotmail:**
```
SMTP Host: smtp-mail.outlook.com
SMTP Port: 587
SMTP User: your-email@outlook.com
SMTP Pass: your-password
```

### 4. Test Email Delivery
1. Set `REACT_APP_SKIP_EMAIL_CONFIRMATION=false` in `.env`
2. Register with a new email
3. Check spam folder
4. Check Supabase logs for errors

### 5. Production Setup
For production deployment:
1. Set `REACT_APP_SKIP_EMAIL_CONFIRMATION=false`
2. Configure custom SMTP
3. Update Site URL to your domain
4. Set up proper DNS records (SPF, DKIM)

## Current Workaround
With development mode enabled, you can:
1. Register normally
2. Skip email confirmation
3. Go directly to dashboard
4. Test all app features

This is perfect for development and testing!
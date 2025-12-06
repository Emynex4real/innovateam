# Sentry Setup Guide

## What is Sentry?
Sentry is your app's error monitoring system. It catches crashes, tracks performance, and records user sessions when errors occur.

## Setup Steps (5 minutes)

### 1. Create Free Sentry Account
1. Go to https://sentry.io/signup/
2. Sign up with email (FREE - 5,000 errors/month)
3. Create new project → Select "React"
4. Copy your DSN (looks like: https://xxxxx@xxxxx.ingest.sentry.io/xxxxx)

### 2. Add DSN to Environment
Open `.env` file and replace:
```
REACT_APP_SENTRY_DSN=your_sentry_dsn_here
```
With your actual DSN from Sentry dashboard.

### 3. Enable Sentry (Optional for Development)
```
REACT_APP_ENABLE_SENTRY=true  # Set to true to test in development
```

### 4. Test It Works
1. Restart your dev server: `npm start`
2. Open browser console
3. You should see: "✅ Sentry initialized" (if enabled)

## What Sentry Captures

### ✅ Automatic Error Tracking
- JavaScript errors
- Unhandled promise rejections
- Network failures
- Component crashes

### ✅ Performance Monitoring
- Page load times
- API response times
- Slow database queries

### ✅ Session Replay (Privacy-Safe)
- Records user actions when error occurs
- Masks all text and media for privacy
- Only captures 10% of normal sessions
- Captures 100% of error sessions

## Production Setup

### Before Deploying:
1. Set `REACT_APP_ENABLE_SENTRY=true` in production
2. Add your Sentry DSN to hosting platform (Vercel/Netlify)
3. Set `REACT_APP_VERSION=1.0.0` to track releases

### Environment Variables for Production:
```
REACT_APP_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
REACT_APP_ENABLE_SENTRY=true
REACT_APP_VERSION=1.0.0
```

## Privacy & Security

### ✅ What We Protect:
- All text is masked in replays
- No images/videos recorded
- Cookies and headers removed
- Sensitive data filtered

### ✅ What Gets Sent:
- Error messages
- Stack traces
- Browser/OS info
- User actions (clicks, navigation)
- Performance metrics

## Viewing Errors

### Sentry Dashboard Shows:
1. **Issues**: All errors grouped by type
2. **Performance**: Slow pages and APIs
3. **Replays**: Video of what user did before crash
4. **Releases**: Track errors per version

### Example Alert:
```
🚨 New Error: Cannot read property 'map' of undefined
📍 File: PracticeQuestions.jsx:45
👤 User: john@example.com
🌐 Browser: Chrome 120 on Windows 10
⏰ Time: 2024-01-15 14:32:18
📊 Affected: 5 users in last hour
```

## Testing Sentry

### Test Error Capture:
Add this button anywhere in your app:
```jsx
<button onClick={() => { throw new Error('Test Sentry Error'); }}>
  Test Sentry
</button>
```

Click it → Check Sentry dashboard → You should see the error!

## Cost

### Free Tier (Perfect for Beta):
- 5,000 errors/month
- 10,000 performance transactions/month
- 50 replay sessions/month
- 1 team member

### Paid Plans (If You Grow):
- $26/month for 50K errors
- $29/month for 100K transactions
- Only pay if you exceed free tier

## Support

- Docs: https://docs.sentry.io/platforms/javascript/guides/react/
- Dashboard: https://sentry.io/
- Status: https://status.sentry.io/

## Quick Commands

```bash
# Install (already done)
npm install @sentry/react

# Test in development
REACT_APP_ENABLE_SENTRY=true npm start

# Build for production
npm run build
```

## Troubleshooting

### "Sentry disabled in development"
- This is normal! Set `REACT_APP_ENABLE_SENTRY=true` to enable

### "DSN not configured"
- Add your DSN to `.env` file
- Restart dev server

### "No errors showing in dashboard"
- Check DSN is correct
- Verify Sentry is enabled
- Test with error button above

---

**You're all set!** Sentry will now catch all errors automatically. 🎉

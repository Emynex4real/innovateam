# 🚀 QUICK PASTE GUIDE

## Files Ready for Your Keys

I've prepared 2 files with placeholders. Just copy-paste your new keys.

---

## 1️⃣ Frontend: `.env.local`

**Location**: `innovateam/.env.local`

**What to paste**:
```
REACT_APP_SUPABASE_URL=PASTE_HERE
REACT_APP_SUPABASE_ANON_KEY=PASTE_HERE (use "Publishable key" - starts with sb_publishable_)
REACT_APP_SENTRY_DSN=PASTE_HERE (optional)
```

**Where to get keys**:
- Supabase: https://supabase.com/dashboard/project/jdedscbvbkjvqmmdabig/settings/api
  - Copy "Project URL" → paste in SUPABASE_URL
  - Copy "Publishable key" (sb_publishable_...) → paste in SUPABASE_ANON_KEY
- Sentry: https://sentry.io/settings/ (optional)

---

## 2️⃣ Backend: `server/.env`

**Location**: `innovateam/server/.env`

**What to paste**:
```
SUPABASE_URL=PASTE_HERE (same as frontend)
SUPABASE_KEY=PASTE_HERE (use "Publishable key" - sb_publishable_...)
SUPABASE_SERVICE_ROLE_KEY=PASTE_HERE (use "Secret key" - sb_secret_... - KEEP SECRET!)
SUPABASE_JWT_SECRET=PASTE_HERE (from JWT Keys tab)
DEEPSEEK_API_KEY=PASTE_HERE
GEMINI_API_KEY=PASTE_HERE
PAYSTACK_SECRET_KEY=PASTE_HERE (use SECRET key, not public)
RESEND_API_KEY=PASTE_HERE (optional)
SENTRY_DSN=PASTE_HERE (optional)
```

**Where to get keys**:
- Supabase: https://supabase.com/dashboard/project/jdedscbvbkjvqmmdabig/settings/api
  - "Project URL" → SUPABASE_URL
  - "Publishable key" (sb_publishable_...) → SUPABASE_KEY
  - "Secret key" (sb_secret_...) → SUPABASE_SERVICE_ROLE_KEY
  - Click "JWT Keys" tab → Copy JWT Secret → SUPABASE_JWT_SECRET
- DeepSeek: https://platform.deepseek.com/api_keys
- Gemini: https://makersuite.google.com/app/apikey
- Paystack: https://dashboard.paystack.com/#/settings/developers
- Resend: https://resend.com/api-keys (optional)

**Already generated for you**:
- JWT_SECRET ✅ (already filled)
- SESSION_SECRET ✅ (already filled)

---

## 3️⃣ Production Deployment

### Vercel (Frontend)
Go to: https://vercel.com/YOUR_USERNAME/innovateam/settings/environment-variables

Add these for **Production** environment:
```
REACT_APP_SUPABASE_URL = (paste your Supabase URL)
REACT_APP_SUPABASE_ANON_KEY = (paste your NEW anon key)
REACT_APP_API_URL = https://your-render-backend.onrender.com
REACT_APP_SENTRY_DSN = (optional)
```

### Render (Backend)
Go to: https://dashboard.render.com/

Find your service → Environment tab

Update these variables:
```
SUPABASE_URL
SUPABASE_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET
DEEPSEEK_API_KEY
GEMINI_API_KEY
JWT_SECRET = 4f79e0b98cfdcceca5a330a355440830e5de78d20cdeece4471bf7b18b26f6d6a3a325f766ca2dbf00100b90eecd73f32c389030c1a456779bd19ef42d355075
SESSION_SECRET = 131d651860db4419e47a6cb73749a520e22b76744309053309e3acc316c50e2a
PAYSTACK_SECRET_KEY
CORS_ORIGIN = http://localhost:3000,https://innovateam.vercel.app
```

Click "Save Changes" → Service will auto-restart

---

## ✅ Verification Checklist

After pasting keys:

- [ ] Open `.env.local` - no "PASTE_HERE" text remaining
- [ ] Open `server/.env` - no "PASTE_HERE" text remaining
- [ ] Run: `git status` - should NOT show .env files
- [ ] Start backend: `cd server && npm start`
- [ ] Start frontend: `npm start`
- [ ] Test login at http://localhost:3000
- [ ] Update Vercel environment variables
- [ ] Update Render environment variables
- [ ] Redeploy both services

---

## 🔒 Security Reminder

✅ Frontend uses: anon/publishable keys (safe in browser)
🔒 Backend uses: service_role/secret keys (never exposed)

Never commit `.env.local` or `server/.env` to git!

---

## Need Help?

If you see errors after pasting:
1. Check for extra spaces before/after keys
2. Make sure you used the correct key type (anon vs service_role)
3. Verify keys are from the correct service
4. Restart both servers after updating

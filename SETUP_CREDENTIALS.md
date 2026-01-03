# Secure Credential Setup Guide

## DO NOT share credentials in chat, email, or Slack. Follow this guide.

---

## Step 1: Frontend Environment (.env.local)

1. Copy the template:
   ```bash
   copy .env.example .env.local
   ```

2. Open `.env.local` and fill in:

```env
# Get from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...  # Use ANON KEY (safe for frontend)

REACT_APP_API_URL=http://localhost:5000
REACT_APP_URL=http://localhost:3000

# Optional - Get from: https://sentry.io/settings/YOUR_ORG/projects/YOUR_PROJECT/keys/
REACT_APP_SENTRY_DSN=https://...@sentry.io/...  # Public DSN (safe for frontend)
REACT_APP_ENABLE_SENTRY=false
```

---

## Step 2: Backend Environment (server/.env)

1. Copy the template:
   ```bash
   copy server\.env.example server\.env
   ```

2. Run secret generator:
   ```bash
   node scripts\generate-secrets.js
   ```

3. Open `server/.env` and fill in:

```env
PORT=5000
NODE_ENV=development

# From: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_KEY=eyJhbGc...  # Use ANON KEY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Use SERVICE_ROLE KEY (keep secret!)
SUPABASE_JWT_SECRET=your-jwt-secret-from-supabase

# From: https://platform.deepseek.com/api_keys
DEEPSEEK_API_KEY=sk-...

# From: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=AIza...

# From generator output above
JWT_SECRET=4f79e0b98cfdcceca5a330a355440830e5de78d20cdeece4471bf7b18b26f6d6a3a325f766ca2dbf00100b90eecd73f32c389030c1a456779bd19ef42d355075
SESSION_SECRET=131d651860db4419e47a6cb73749a520e22b76744309053309e3acc316c50e2a

JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

CORS_ORIGIN=http://localhost:3000

# From: https://dashboard.paystack.com/#/settings/developers
PAYSTACK_SECRET_KEY=sk_test_...  # Use SECRET KEY (keep secret!)

# Optional - From: https://resend.com/api-keys
RESEND_API_KEY=re_...

FRONTEND_URL=http://localhost:3000
```

---

## Step 3: Verify Files Are Gitignored

```bash
git status
```

You should NOT see:
- `.env.local`
- `server/.env`

If you see them, run:
```bash
git rm --cached .env.local server/.env
git commit -m "Remove env files from tracking"
```

---

## Step 4: Production Deployment

### Vercel (Frontend)
1. Go to: https://vercel.com/YOUR_USERNAME/YOUR_PROJECT/settings/environment-variables
2. Add these variables for **Production**:
   - `REACT_APP_SUPABASE_URL` = (your Supabase URL)
   - `REACT_APP_SUPABASE_ANON_KEY` = (your anon key)
   - `REACT_APP_API_URL` = (your Render backend URL)
   - `REACT_APP_SENTRY_DSN` = (optional)

### Render (Backend)
1. Go to: https://dashboard.render.com/web/YOUR_SERVICE/env
2. Add ALL variables from `server/.env.example`
3. Use production values (not localhost)
4. Click "Save Changes"

---

## Key Types Reference

| Service | Frontend (Public) | Backend (Secret) |
|---------|------------------|------------------|
| Supabase | anon key ✅ | service_role key 🔒 |
| Paystack | publishable key ✅ | secret key 🔒 |
| Sentry | public DSN ✅ | - |
| DeepSeek | - | API key 🔒 |
| Gemini | - | API key 🔒 |

✅ = Safe to expose in browser
🔒 = NEVER expose (server-only)

---

## Security Checklist

- [ ] `.env.local` exists and is gitignored
- [ ] `server/.env` exists and is gitignored
- [ ] No credentials in `src/config/supabase.js`
- [ ] Frontend uses anon/publishable keys only
- [ ] Backend uses secret/service_role keys
- [ ] Production secrets in Vercel/Render dashboards
- [ ] Old credentials rotated

---

## If You Accidentally Commit Credentials

1. **STOP** - Don't push if you haven't already
2. **Rotate** all exposed credentials immediately
3. **Remove** from git:
   ```bash
   git reset HEAD~1  # If not pushed yet
   # OR
   git filter-branch --force --index-filter "git rm --cached --ignore-unmatch PATH_TO_FILE" --prune-empty --tag-name-filter cat -- --all
   ```
4. **Force push** (if already pushed and repo is private)
5. **Monitor** for unauthorized access

---

## Need Help?

- Supabase docs: https://supabase.com/docs/guides/api
- Environment variables: https://12factor.net/config
- Security practices: See SECURITY_PRACTICES.md

# CREDENTIAL ROTATION CHECKLIST

## ⚠️ YOUR CREDENTIALS ARE IN GIT HISTORY - ROTATE IMMEDIATELY

### 1. Supabase (CRITICAL)
- [ ] Go to: https://supabase.com/dashboard/project/jdedscbvbkjvqmmdabig/settings/api
- [ ] Click "Reset" on anon key
- [ ] Click "Reset" on service_role key
- [ ] Copy new keys to server/.env
- [ ] Update Render environment variables
- [ ] Update Vercel environment variables

### 2. Sentry
- [ ] Go to: https://sentry.io/settings/
- [ ] Navigate to your project
- [ ] Regenerate DSN
- [ ] Update .env.local
- [ ] Update Vercel environment variables

### 3. Paystack
- [ ] Go to: https://dashboard.paystack.com/#/settings/developers
- [ ] Regenerate test secret key
- [ ] Update server/.env
- [ ] Update Render environment variables

### 4. Gemini API
- [ ] Go to: https://makersuite.google.com/app/apikey
- [ ] Delete old key
- [ ] Create new key
- [ ] Update server/.env
- [ ] Update Render environment variables

### 5. Generate New Secrets
```bash
node scripts/generate-secrets.js
```
- [ ] Copy JWT_SECRET to server/.env
- [ ] Copy SESSION_SECRET to server/.env
- [ ] Update Render environment variables

### 6. Update Deployment Platforms

#### Vercel
```bash
vercel env rm REACT_APP_SUPABASE_ANON_KEY production
vercel env add REACT_APP_SUPABASE_ANON_KEY production
# Enter NEW key

vercel env rm REACT_APP_SENTRY_DSN production
vercel env add REACT_APP_SENTRY_DSN production
# Enter NEW DSN
```

#### Render
- [ ] Dashboard → Environment → Edit each variable
- [ ] Restart service after updating

### 7. Clean Git History (Optional - Nuclear Option)

⚠️ Only if repo is private and you have backups:

```bash
# Install BFG Repo-Cleaner
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Remove all .env files from history
java -jar bfg.jar --delete-files ".env*" --no-blob-protection

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (DANGEROUS - coordinate with team)
git push --force --all
```

### 8. Monitor for Unauthorized Access
- [ ] Check Supabase logs for unusual activity
- [ ] Check Paystack dashboard for unauthorized transactions
- [ ] Set up alerts in Sentry
- [ ] Review server logs

### 9. Verify Everything Works
- [ ] Test login
- [ ] Test payments
- [ ] Test AI features
- [ ] Check error tracking

## Completion Date: __________
## Verified By: __________

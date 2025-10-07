# IMMEDIATE SECURITY CLEANUP REQUIRED

## 🚨 CRITICAL ACTIONS - EXECUTE IMMEDIATELY

### 1. Rotate ALL Compromised Secrets
```bash
# Supabase Dashboard Actions:
# 1. Go to Settings > API
# 2. Reset anon key
# 3. Reset service_role key  
# 4. Reset JWT secret
# 5. Update RLS policies

# DeepSeek API
# 1. Login to deepseek.com
# 2. Revoke current API key: sk-f713b5f4c3a64a61bb1e42ca6735a995
# 3. Generate new API key

# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Clear Browser Storage (All Users)
```javascript
// Add to app initialization
localStorage.clear();
sessionStorage.clear();
// Clear all cookies
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
```

### 3. Git History Cleanup
```bash
# Remove sensitive files from git history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env' \
  --prune-empty --tag-name-filter cat -- --all

# Force push (DANGEROUS - coordinate with team)
git push origin --force --all
```

### 4. Update .env Files
```bash
# Remove current .env files
rm .env .env.production server_backup_old/.env

# Copy from secure template
cp .env.secure .env
# Edit with new secrets
```

### 5. Database Security Check
```sql
-- Check for any exposed data in Supabase
SELECT * FROM auth.users LIMIT 1;
-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

## ⚠️ DEPLOYMENT SECURITY

### Before Going Live:
1. ✅ All secrets rotated
2. ✅ HTTPS enforced
3. ✅ Security headers configured
4. ✅ Dependencies updated
5. ✅ Input validation implemented
6. ✅ Payment verification secured

### Monitoring Setup:
- Set up error tracking (Sentry)
- Enable Supabase audit logs
- Monitor failed authentication attempts
- Track unusual payment patterns
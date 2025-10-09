# 🗄️ SQL DEPLOYMENT GUIDE

## ⚠️ CRITICAL: Execute These SQL Files in Supabase

### 📋 DEPLOYMENT ORDER (Execute in this exact order):

#### 1. **FIRST: Base Database Setup**
```sql
-- File: supabase/database.sql
-- Go to Supabase Dashboard > SQL Editor > New Query
-- Copy and paste the entire content of database.sql
-- Click "Run" to execute
```

#### 2. **SECOND: Enhanced Security Policies**
```sql
-- File: supabase/enhanced_security_policies.sql  
-- This MUST be run after database.sql
-- Copy and paste the entire content
-- Click "Run" to execute
```

### 🔍 VERIFICATION QUERIES

After running both files, execute these to verify:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check if policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION';
```

### 📊 EXPECTED RESULTS:

**Tables Created:**
- users
- transactions  
- services
- purchased_services
- course_recommendations
- activity_logs

**Security Features:**
- RLS enabled on all tables
- Enhanced policies with JWT validation
- Security logging functions
- Audit triggers

### 🚨 IMPORTANT NOTES:

1. **Run database.sql FIRST** - Creates tables and basic policies
2. **Run enhanced_security_policies.sql SECOND** - Upgrades security
3. **Don't skip verification** - Ensure everything is created properly
4. **Backup first** - If you have existing data, backup before running

### 🔧 IF ERRORS OCCUR:

**Common Issues:**
- "relation already exists" - Safe to ignore if upgrading
- "policy already exists" - The enhanced policies will replace old ones
- "function already exists" - Will be replaced with new version

**Recovery:**
```sql
-- If you need to start fresh (DANGER: Deletes all data)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- Then run database.sql again
```

## ✅ DEPLOYMENT CHECKLIST:

- [ ] Backup existing Supabase data (if any)
- [ ] Execute `database.sql` in Supabase SQL Editor
- [ ] Execute `enhanced_security_policies.sql` in Supabase SQL Editor  
- [ ] Run verification queries
- [ ] Test user registration/login
- [ ] Verify RLS policies work
- [ ] Check security logging

### 🎯 AFTER DEPLOYMENT:

Your database will have:
- ✅ Secure user management
- ✅ Transaction tracking with wallet integration
- ✅ Enhanced RLS policies
- ✅ Security audit logging
- ✅ Admin privilege protection
- ✅ Immutable transaction records
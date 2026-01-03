# FIX SUPABASE KEYS

Your `.env` has FAKE placeholder keys. You need REAL keys.

## Steps:

1. Go to: https://supabase.com/dashboard/project/jdedscbvbkjvqmmdabig/settings/api

2. Copy these keys (they are LONG strings starting with eyJ...):
   - **anon public** key → SUPABASE_KEY
   - **service_role** key → SUPABASE_SERVICE_ROLE_KEY

3. Update `.env`:
```
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZWRzY2J2YmtqdnFtbWRhYmlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NTI4NzcsImV4cCI6MjA1MTIyODg3N30.YOUR_ACTUAL_KEY_HERE

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZWRzY2J2YmtqdnFtbWRhYmlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTY1Mjg3NywiZXhwIjoyMDUxMjI4ODc3fQ.YOUR_ACTUAL_KEY_HERE
```

4. Update Vercel environment variables with the same keys

5. Restart server

## Current Problem:
- Balance not showing = Database connection failing
- Admin page not showing = Auth failing
- Both caused by invalid Supabase keys

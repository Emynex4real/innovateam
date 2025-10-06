# Supabase Database Setup Instructions

## Step 1: Execute Database Schema

1. Go to your Supabase dashboard: https://djzbrnacgjzcyoxnhlip.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire content from `supabase/database.sql` file
5. Paste it into the SQL editor
6. Click **Run** to execute

## Step 2: Verify Tables Created

After running the SQL, verify these tables exist in **Table Editor**:
- ✅ users
- ✅ transactions  
- ✅ services
- ✅ purchased_services
- ✅ course_recommendations
- ✅ activity_logs

## Step 3: Test Authentication

1. Go to **Authentication** → **Users**
2. You should see the trigger function working when users sign up

## Step 4: Update Frontend

Replace old AuthContext imports:
```javascript
// OLD
import { useAuth } from '../contexts/AuthContext'

// NEW  
import { useAuth } from '../contexts/SupabaseAuthContext'
```

## Environment Variables ✅

Already configured in `.env`:
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_JWT_SECRET

## Ready to Test!

After database setup, you can:
1. Register new users
2. Purchase services
3. Manage wallet transactions
4. Generate course recommendations

All with enterprise-grade security and scalability!
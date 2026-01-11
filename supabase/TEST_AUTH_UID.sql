-- TEST IF auth.uid() WORKS IN RLS CONTEXT
-- Run this in Supabase SQL Editor

-- This query should return YOUR user ID if you're logged in to Supabase dashboard
SELECT auth.uid() as my_user_id;

-- This should return your profile if RLS is working correctly
SELECT id, email, role, is_admin, wallet_balance 
FROM user_profiles 
WHERE id = auth.uid();

-- If the above returns nothing, it means auth.uid() is NULL in SQL Editor
-- That's normal - SQL Editor doesn't have a user session

-- The real test is: Does the frontend work now?
-- Check browser console for errors after refreshing

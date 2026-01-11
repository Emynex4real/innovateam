-- FIND AND FIX TRIGGERS CAUSING INFINITE RECURSION
-- Run this in Supabase SQL Editor

-- STEP 1: Check for triggers on user_profiles
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'user_profiles'
AND trigger_name NOT LIKE 'RI_ConstraintTrigger%';

-- STEP 2: Check for functions that query user_profiles
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_definition LIKE '%user_profiles%'
AND routine_schema = 'public';

-- STEP 3: Check if there are any SECURITY DEFINER functions causing recursion
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND pg_get_functiondef(p.oid) LIKE '%user_profiles%'
AND p.prosecdef = true;  -- SECURITY DEFINER functions

-- STEP 4: Test query directly (bypass RLS with service role)
-- This should work if you're using service role key
SELECT id, email, role, is_admin, wallet_balance 
FROM user_profiles 
LIMIT 5;

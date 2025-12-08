-- TEMPORARY TEST: Disable RLS to confirm it's the issue
-- Run this, test your app, then re-enable below

-- Disable RLS temporarily
ALTER TABLE public.ai_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_exams DISABLE ROW LEVEL SECURITY;

-- Now test your app. If it works, RLS is the problem.

-- After testing, RE-ENABLE RLS:
-- ALTER TABLE public.ai_documents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.ai_exams ENABLE ROW LEVEL SECURITY;

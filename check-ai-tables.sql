-- Check if AI Examiner tables exist
-- Run this first to see what's already there

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ai_documents', 'ai_exams');

-- Check policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('ai_documents', 'ai_exams');
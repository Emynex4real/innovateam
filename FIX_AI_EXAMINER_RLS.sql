-- QUICK FIX: AI Examiner RLS Policies
-- Run this in Supabase SQL Editor to fix the permission issue

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own documents" ON public.ai_documents;
DROP POLICY IF EXISTS "Users can create own documents" ON public.ai_documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.ai_documents;
DROP POLICY IF EXISTS "Users can view own exams" ON public.ai_exams;
DROP POLICY IF EXISTS "Users can create own exams" ON public.ai_exams;
DROP POLICY IF EXISTS "Users can update own exams" ON public.ai_exams;

-- Create new policies that work with service role
-- These allow both authenticated users AND service role to access

-- ai_documents policies
CREATE POLICY "Users can view own documents" ON public.ai_documents 
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.role() = 'service_role'
  );

CREATE POLICY "Users can create own documents" ON public.ai_documents 
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    auth.role() = 'service_role'
  );

CREATE POLICY "Users can delete own documents" ON public.ai_documents 
  FOR DELETE USING (
    auth.uid() = user_id OR 
    auth.role() = 'service_role'
  );

-- ai_exams policies
CREATE POLICY "Users can view own exams" ON public.ai_exams 
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.role() = 'service_role'
  );

CREATE POLICY "Users can create own exams" ON public.ai_exams 
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    auth.role() = 'service_role'
  );

CREATE POLICY "Users can update own exams" ON public.ai_exams 
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    auth.role() = 'service_role'
  );

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('ai_documents', 'ai_exams')
ORDER BY tablename, policyname;

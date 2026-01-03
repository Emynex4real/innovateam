-- URGENT FIX: The INSERT policies have NULL conditions
-- This is blocking all inserts. Run this NOW:

-- Fix ai_documents INSERT policy
DROP POLICY IF EXISTS "Users can create own documents" ON public.ai_documents;
CREATE POLICY "Users can create own documents" ON public.ai_documents 
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    auth.role() = 'service_role'
  );

-- Fix ai_exams INSERT policy  
DROP POLICY IF EXISTS "Users can create own exams" ON public.ai_exams;
CREATE POLICY "Users can create own exams" ON public.ai_exams 
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    auth.role() = 'service_role'
  );

-- Verify the fix
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('ai_documents', 'ai_exams') 
AND cmd = 'INSERT';

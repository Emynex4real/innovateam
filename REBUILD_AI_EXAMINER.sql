-- COMPLETE REBUILD: AI Examiner Tables
-- Drop everything and start fresh

-- Drop existing tables
DROP TABLE IF EXISTS public.ai_exams CASCADE;
DROP TABLE IF EXISTS public.ai_documents CASCADE;

-- Create ai_documents table
CREATE TABLE public.ai_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  filename TEXT NOT NULL,
  content TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ai_exams table
CREATE TABLE public.ai_exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_id UUID REFERENCES public.ai_documents(id) ON DELETE CASCADE,
  questions JSONB NOT NULL,
  difficulty TEXT DEFAULT 'medium',
  subject TEXT DEFAULT 'General',
  total_questions INTEGER NOT NULL,
  total_points INTEGER NOT NULL,
  status TEXT DEFAULT 'active',
  score INTEGER,
  percentage DECIMAL(5,2),
  user_answers JSONB,
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX idx_ai_documents_user_id ON public.ai_documents(user_id);
CREATE INDEX idx_ai_exams_user_id ON public.ai_exams(user_id);

-- DISABLE RLS (we'll use service role which bypasses RLS anyway)
ALTER TABLE public.ai_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_exams DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT table_name, row_security 
FROM information_schema.tables 
WHERE table_name IN ('ai_documents', 'ai_exams');

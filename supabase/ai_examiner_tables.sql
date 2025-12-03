-- AI Examiner Tables
-- Run this in your Supabase SQL Editor

-- AI Documents table (stores uploaded documents)
CREATE TABLE IF NOT EXISTS public.ai_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  content TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Exams table (stores generated exams)
CREATE TABLE IF NOT EXISTS public.ai_exams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  document_id UUID REFERENCES public.ai_documents(id) ON DELETE CASCADE,
  questions JSONB NOT NULL,
  difficulty TEXT DEFAULT 'medium',
  subject TEXT DEFAULT 'General',
  total_questions INTEGER NOT NULL,
  total_points INTEGER NOT NULL,
  status TEXT DEFAULT 'active',
  score INTEGER,
  percentage DECIMAL(5,2),
  correct_answers INTEGER,
  user_answers JSONB,
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_documents_user_id ON public.ai_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_documents_created_at ON public.ai_documents(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_exams_user_id ON public.ai_exams(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_exams_status ON public.ai_exams(status);
CREATE INDEX IF NOT EXISTS idx_ai_exams_created_at ON public.ai_exams(created_at);

-- Enable RLS
ALTER TABLE public.ai_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_exams ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_documents
CREATE POLICY "Users can view own documents" ON public.ai_documents 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own documents" ON public.ai_documents 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON public.ai_documents 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for ai_exams
CREATE POLICY "Users can view own exams" ON public.ai_exams 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own exams" ON public.ai_exams 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exams" ON public.ai_exams 
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can view all documents" ON public.ai_documents 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can view all exams" ON public.ai_exams 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

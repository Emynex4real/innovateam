-- Migration: Create past_questions table for exam past questions library
-- Stores verified JAMB/WAEC/NECO past exam questions

CREATE TABLE IF NOT EXISTS past_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_body TEXT NOT NULL CHECK (exam_body IN ('jamb', 'waec', 'neco', 'nabteb')),
  exam_year INTEGER NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_past_questions_exam_body ON past_questions(exam_body);
CREATE INDEX IF NOT EXISTS idx_past_questions_exam_year ON past_questions(exam_year);
CREATE INDEX IF NOT EXISTS idx_past_questions_subject ON past_questions(subject);
CREATE INDEX IF NOT EXISTS idx_past_questions_body_year_subject ON past_questions(exam_body, exam_year, subject);

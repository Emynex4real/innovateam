-- Create tutor_notes table for storing tutor observations about students
CREATE TABLE IF NOT EXISTS tutor_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_tutor_notes_tutor ON tutor_notes(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_notes_student ON tutor_notes(student_id);
CREATE INDEX IF NOT EXISTS idx_tutor_notes_created ON tutor_notes(created_at DESC);

-- Enable RLS
ALTER TABLE tutor_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Tutors can view their own notes" ON tutor_notes
  FOR SELECT USING (auth.uid() = tutor_id);

CREATE POLICY "Tutors can create notes" ON tutor_notes
  FOR INSERT WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "Tutors can update their own notes" ON tutor_notes
  FOR UPDATE USING (auth.uid() = tutor_id);

CREATE POLICY "Tutors can delete their own notes" ON tutor_notes
  FOR DELETE USING (auth.uid() = tutor_id);

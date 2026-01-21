-- Fix tc_enrollments foreign key to user_profiles

-- Drop existing foreign key if it exists
ALTER TABLE tc_enrollments 
DROP CONSTRAINT IF EXISTS tc_enrollments_student_id_fkey;

-- Create proper foreign key constraint
ALTER TABLE tc_enrollments
ADD CONSTRAINT tc_enrollments_student_id_fkey 
FOREIGN KEY (student_id) 
REFERENCES user_profiles(id) 
ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_tc_enrollments_student_id ON tc_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_tc_enrollments_center_id ON tc_enrollments(center_id);

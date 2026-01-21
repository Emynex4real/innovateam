-- Fix tutorial_centers foreign key and add admin columns

-- 1. Drop existing foreign key if it exists (wrong reference)
ALTER TABLE tutorial_centers DROP CONSTRAINT IF EXISTS tutorial_centers_tutor_id_fkey;

-- 2. Add correct foreign key to user_profiles
ALTER TABLE tutorial_centers 
ADD CONSTRAINT tutorial_centers_tutor_id_fkey 
FOREIGN KEY (tutor_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- 3. Add admin management columns
ALTER TABLE tutorial_centers 
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES user_profiles(id);

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_tutorial_centers_tutor ON tutorial_centers(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_centers_suspended ON tutorial_centers(is_suspended) WHERE is_suspended = TRUE;

-- 5. Update RLS policies
DROP POLICY IF EXISTS "Students can view enrolled centers" ON tutorial_centers;
CREATE POLICY "Students can view enrolled centers"
  ON tutorial_centers FOR SELECT
  USING (
    is_suspended = FALSE AND
    deleted_at IS NULL AND
    EXISTS (
      SELECT 1 FROM tc_enrollments 
      WHERE tc_enrollments.center_id = tutorial_centers.id 
      AND tc_enrollments.student_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can view all centers" ON tutorial_centers;
CREATE POLICY "Admins can view all centers"
  ON tutorial_centers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = TRUE
    )
  );

DROP POLICY IF EXISTS "Admins can update any center" ON tutorial_centers;
CREATE POLICY "Admins can update any center"
  ON tutorial_centers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = TRUE
    )
  );

-- 6. Comments
COMMENT ON COLUMN tutorial_centers.is_suspended IS 'Whether the center is suspended by admin';
COMMENT ON COLUMN tutorial_centers.suspension_reason IS 'Reason for suspension';
COMMENT ON COLUMN tutorial_centers.suspended_at IS 'When the center was suspended';
COMMENT ON COLUMN tutorial_centers.deleted_by IS 'Admin user who deleted the center';

-- 7. Verify
SELECT 
  'tutorial_centers' as table_name,
  COUNT(*) as row_count,
  COUNT(DISTINCT tutor_id) as unique_tutors
FROM tutorial_centers;

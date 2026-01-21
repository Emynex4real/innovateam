-- Add admin management columns to tutorial_centers table

-- Add suspension columns
ALTER TABLE tutorial_centers 
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Create index for suspended centers
CREATE INDEX IF NOT EXISTS idx_tutorial_centers_suspended ON tutorial_centers(is_suspended) WHERE is_suspended = TRUE;

-- Update RLS policies to respect suspension
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

-- Admin can view all centers (including suspended and deleted)
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

-- Admin can update any center
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

COMMENT ON COLUMN tutorial_centers.is_suspended IS 'Whether the center is suspended by admin';
COMMENT ON COLUMN tutorial_centers.suspension_reason IS 'Reason for suspension';
COMMENT ON COLUMN tutorial_centers.suspended_at IS 'When the center was suspended';
COMMENT ON COLUMN tutorial_centers.deleted_by IS 'Admin user who deleted the center';

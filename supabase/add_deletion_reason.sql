-- Add missing deletion_reason column

ALTER TABLE tutorial_centers 
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

COMMENT ON COLUMN tutorial_centers.deletion_reason IS 'Reason for deletion by admin';

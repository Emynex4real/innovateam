-- Add soft delete columns to tutorial_centers table
ALTER TABLE public.tutorial_centers 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

-- Create index for active centers
CREATE INDEX IF NOT EXISTS idx_tutorial_centers_deleted_at ON public.tutorial_centers(deleted_at) WHERE deleted_at IS NULL;

-- Create stored procedure for soft delete
CREATE OR REPLACE FUNCTION public.delete_tutorial_center(
  center_id_param UUID,
  reason TEXT DEFAULT NULL
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  tutor_user_id UUID;
  center_record RECORD;
  result JSON;
BEGIN
  tutor_user_id := auth.uid();
  
  -- Get center and verify ownership
  SELECT * INTO center_record
  FROM tutorial_centers
  WHERE id = center_id_param AND tutor_id = tutor_user_id AND deleted_at IS NULL;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tutorial center not found or already deleted';
  END IF;
  
  -- Soft delete the center
  UPDATE tutorial_centers
  SET 
    deleted_at = NOW(),
    deleted_by = tutor_user_id,
    deletion_reason = reason
  WHERE id = center_id_param;
  
  -- Log in admin_actions
  INSERT INTO admin_actions (admin_id, action_type, details)
  VALUES (
    tutor_user_id,
    'delete_tutorial_center',
    jsonb_build_object(
      'center_id', center_id_param,
      'center_name', center_record.name,
      'reason', reason,
      'deleted_at', NOW()
    )
  );
  
  result := json_build_object(
    'success', true,
    'message', 'Tutorial center deleted successfully'
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_tutorial_center TO authenticated;

-- Update RLS policies to exclude deleted centers
DROP POLICY IF EXISTS "tutors_view_own_center" ON public.tutorial_centers;
CREATE POLICY "tutors_view_own_center" ON public.tutorial_centers
  FOR SELECT TO authenticated
  USING (tutor_id = auth.uid() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "admins_view_all_centers" ON public.tutorial_centers;
CREATE POLICY "admins_view_all_centers" ON public.tutorial_centers
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
  );

-- Verify
SELECT routine_name FROM information_schema.routines WHERE routine_name = 'delete_tutorial_center';

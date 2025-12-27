-- Add soft delete columns to tutorial_centers table
ALTER TABLE public.tutorial_centers 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

-- Create index for active centers
CREATE INDEX IF NOT EXISTS idx_tutorial_centers_deleted_at ON public.tutorial_centers(deleted_at) WHERE deleted_at IS NULL;

-- Update RLS policies FIRST (before stored procedure)
DROP POLICY IF EXISTS "tutors_view_own_center" ON public.tutorial_centers;
DROP POLICY IF EXISTS "tutors_manage_own_center" ON public.tutorial_centers;
DROP POLICY IF EXISTS "admins_view_all_centers" ON public.tutorial_centers;

-- Allow tutors to view their own centers (including deleted for the query)
CREATE POLICY "tutors_view_own_center" ON public.tutorial_centers
  FOR SELECT TO authenticated
  USING (tutor_id = auth.uid());

-- Allow tutors to update their own centers
CREATE POLICY "tutors_manage_own_center" ON public.tutorial_centers
  FOR UPDATE TO authenticated
  USING (tutor_id = auth.uid())
  WITH CHECK (tutor_id = auth.uid());

-- Allow admins to view all centers
CREATE POLICY "admins_view_all_centers" ON public.tutorial_centers
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
  );

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
  
  -- Get center and verify ownership (no deleted_at check here since policy handles it)
  SELECT * INTO center_record
  FROM tutorial_centers
  WHERE id = center_id_param AND tutor_id = tutor_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tutorial center not found';
  END IF;
  
  -- Check if already deleted
  IF center_record.deleted_at IS NOT NULL THEN
    RAISE EXCEPTION 'Tutorial center already deleted';
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

-- Verify
SELECT routine_name FROM information_schema.routines WHERE routine_name = 'delete_tutorial_center';

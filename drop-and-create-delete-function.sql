-- Drop old function versions
DROP FUNCTION IF EXISTS public.delete_tutorial_center(UUID, TEXT);
DROP FUNCTION IF EXISTS public.delete_tutorial_center(UUID, UUID, TEXT);

-- Create new function with tutor_id parameter
CREATE OR REPLACE FUNCTION public.delete_tutorial_center(
  center_id_param UUID,
  tutor_id_param UUID,
  reason TEXT DEFAULT NULL
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  center_record RECORD;
  result JSON;
BEGIN
  -- Get center and verify ownership
  SELECT * INTO center_record
  FROM tutorial_centers
  WHERE id = center_id_param AND tutor_id = tutor_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tutorial center not found or access denied';
  END IF;
  
  -- Check if already deleted
  IF center_record.deleted_at IS NOT NULL THEN
    RAISE EXCEPTION 'Tutorial center already deleted';
  END IF;
  
  -- Soft delete the center
  UPDATE tutorial_centers
  SET 
    deleted_at = NOW(),
    deleted_by = tutor_id_param,
    deletion_reason = reason
  WHERE id = center_id_param;
  
  -- Log in admin_actions
  INSERT INTO admin_actions (admin_id, action_type, details)
  VALUES (
    tutor_id_param,
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
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'delete_tutorial_center';

-- Remove the old trigger first
DROP TRIGGER IF EXISTS first_user_admin_trigger ON public.profiles;

-- Update function to make only the very first user admin, all others are bloggers
CREATE OR REPLACE FUNCTION public.make_first_user_admin()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Count existing users before this insert
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- If this is the very first user (count = 0), make them admin
  IF user_count = 0 THEN
    NEW.role = 'admin';
  ELSE
    -- All other users are bloggers by default
    NEW.role = 'blogger';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically assign roles
CREATE TRIGGER assign_user_role_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.make_first_user_admin();
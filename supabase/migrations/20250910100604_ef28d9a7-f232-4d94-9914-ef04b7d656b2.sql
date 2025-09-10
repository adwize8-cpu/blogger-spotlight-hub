-- Fix the function security issue by setting proper search_path
CREATE OR REPLACE FUNCTION public.make_first_user_admin()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Check if this is the first user
  IF (SELECT COUNT(*) FROM public.profiles) = 1 THEN
    NEW.role = 'admin';
  END IF;
  RETURN NEW;
END;
$$;
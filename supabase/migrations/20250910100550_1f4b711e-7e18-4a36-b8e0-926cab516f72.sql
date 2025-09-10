-- Grant admin role to the first user who signs up
-- You'll need to update this with your actual user ID after registration

-- First, let's see if there are any users and update the first one to admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id 
  FROM public.profiles 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- If no users exist yet, this will create a trigger to make the first user admin automatically
CREATE OR REPLACE FUNCTION public.make_first_user_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the first user
  IF (SELECT COUNT(*) FROM public.profiles) = 1 THEN
    NEW.role = 'admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically make first user admin
DROP TRIGGER IF EXISTS first_user_admin_trigger ON public.profiles;
CREATE TRIGGER first_user_admin_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.make_first_user_admin();
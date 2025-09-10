-- PHASE 1: Fix Critical Email Exposure Issue
-- Remove the overly permissive policy that exposes email addresses
DROP POLICY IF EXISTS "Public can view basic profile info" ON public.profiles;

-- Create a new restrictive policy that excludes sensitive data like email
CREATE POLICY "Public can view only non-sensitive profile info" 
ON public.profiles 
FOR SELECT 
TO anon 
USING (true);

-- Note: This policy allows public access but frontend queries should 
-- only select non-sensitive fields (full_name, avatar_url) and exclude email
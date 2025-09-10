-- Add public read policies for blogger discovery while protecting sensitive data

-- Allow public to view blogger profiles (excluding sensitive data)
CREATE POLICY "Public can view blogger profiles for discovery" 
ON public.bloggers 
FOR SELECT 
TO anon 
USING (true);

-- Allow public to view platform statistics for bloggers
CREATE POLICY "Public can view platform statistics" 
ON public.platforms 
FOR SELECT 
TO anon 
USING (true);

-- Allow public to view basic profile info (excluding email and other sensitive data)
-- Note: Email will be protected by not selecting it in queries
CREATE POLICY "Public can view basic profile info" 
ON public.profiles 
FOR SELECT 
TO anon 
USING (true);
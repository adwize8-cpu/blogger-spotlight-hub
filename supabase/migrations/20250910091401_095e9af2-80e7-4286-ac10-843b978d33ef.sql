-- Create enum for platform types
CREATE TYPE public.platform_type AS ENUM ('instagram', 'youtube', 'telegram', 'tiktok');

-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'blogger');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'blogger',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bloggers table for detailed blogger information
CREATE TABLE public.bloggers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  handle TEXT NOT NULL UNIQUE,
  bio TEXT,
  gender TEXT,
  topics TEXT[],
  post_price DECIMAL,
  story_price DECIMAL,
  barter_available BOOLEAN DEFAULT false,
  mart_available BOOLEAN DEFAULT false,
  work_conditions TEXT,
  restricted_topics TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create platforms table for blogger platform data
CREATE TABLE public.platforms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blogger_id UUID NOT NULL REFERENCES public.bloggers(id) ON DELETE CASCADE,
  platform_type platform_type NOT NULL,
  followers INTEGER,
  engagement_rate DECIMAL,
  post_reach INTEGER,
  story_reach INTEGER,
  screenshot_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(blogger_id, platform_type)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bloggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Anyone can insert their profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for bloggers
CREATE POLICY "Bloggers can view their own data"
ON public.bloggers FOR SELECT
USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Bloggers can update their own data"
ON public.bloggers FOR UPDATE
USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all blogger data"
ON public.bloggers FOR SELECT
USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage all blogger data"
ON public.bloggers FOR ALL
USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can insert their blogger profile"
ON public.bloggers FOR INSERT
WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS Policies for platforms
CREATE POLICY "Bloggers can view their own platforms"
ON public.platforms FOR SELECT
USING (blogger_id IN (
  SELECT b.id FROM public.bloggers b 
  JOIN public.profiles p ON p.id = b.profile_id 
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Bloggers can manage their own platforms"
ON public.platforms FOR ALL
USING (blogger_id IN (
  SELECT b.id FROM public.bloggers b 
  JOIN public.profiles p ON p.id = b.profile_id 
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all platforms"
ON public.platforms FOR ALL
USING (get_user_role(auth.uid()) = 'admin');

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bloggers_updated_at
  BEFORE UPDATE ON public.bloggers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platforms_updated_at
  BEFORE UPDATE ON public.platforms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
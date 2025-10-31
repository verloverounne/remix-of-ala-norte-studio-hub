-- Remove the 'Profiles are viewable by everyone' policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Add policy for users to view only their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);
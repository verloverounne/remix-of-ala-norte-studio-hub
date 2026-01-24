-- Fix 1: Reservations - Prevent NULL user_id from being created and accessed
-- Update the INSERT policy to require user_id
DROP POLICY IF EXISTS "Users can create reservations" ON public.reservations;
CREATE POLICY "Users can create reservations" 
ON public.reservations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);

-- Update the SELECT policy to exclude NULL user_id records from non-admin access
DROP POLICY IF EXISTS "Users can view their own reservations" ON public.reservations;
CREATE POLICY "Users can view their own reservations" 
ON public.reservations 
FOR SELECT 
USING ((auth.uid() = user_id AND user_id IS NOT NULL) OR has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Remove instagram_token column from contact_info (sensitive data should not be in public table)
ALTER TABLE public.contact_info DROP COLUMN IF EXISTS instagram_token;
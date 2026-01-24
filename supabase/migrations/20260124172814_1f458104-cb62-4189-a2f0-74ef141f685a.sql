-- Fix 1: Add explicit DELETE policy for quotes table (admin only)
CREATE POLICY "Admins can delete quotes" 
ON public.quotes
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Remove overly permissive equipment_images policies
DROP POLICY IF EXISTS "Authenticated users can insert equipment images" ON public.equipment_images;
DROP POLICY IF EXISTS "Authenticated users can update equipment images" ON public.equipment_images;
DROP POLICY IF EXISTS "Authenticated users can delete equipment images" ON public.equipment_images;

-- Create admin-only policy for equipment_images management
CREATE POLICY "Admins can manage equipment images"
ON public.equipment_images
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));
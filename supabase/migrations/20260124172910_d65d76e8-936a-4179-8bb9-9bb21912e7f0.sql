-- Fix 1: Add explicit DELETE policy for quotes table (admin only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Admins can delete quotes'
  ) THEN
    CREATE POLICY "Admins can delete quotes" 
    ON public.quotes
    FOR DELETE 
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

-- Fix 2: Remove overly permissive equipment_images policies and add admin-only
DROP POLICY IF EXISTS "Authenticated users can insert equipment images" ON public.equipment_images;
DROP POLICY IF EXISTS "Authenticated users can update equipment images" ON public.equipment_images;
DROP POLICY IF EXISTS "Authenticated users can delete equipment images" ON public.equipment_images;

-- Create admin-only policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'equipment_images' AND policyname = 'Admins can manage equipment images'
  ) THEN
    CREATE POLICY "Admins can manage equipment images"
    ON public.equipment_images
    FOR ALL
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;
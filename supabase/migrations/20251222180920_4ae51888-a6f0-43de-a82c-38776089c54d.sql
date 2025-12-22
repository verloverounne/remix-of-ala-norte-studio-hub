-- Create storage bucket for equipment images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'equipment-images',
  'equipment-images',
  true,
  10485760, -- 10MB limit per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Policy to allow authenticated users to upload
CREATE POLICY "Admins can upload equipment images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'equipment-images' AND
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Policy to allow public read access
CREATE POLICY "Public can view equipment images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'equipment-images');

-- Policy to allow admins to delete images
CREATE POLICY "Admins can delete equipment images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'equipment-images' AND
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Policy to allow admins to update images
CREATE POLICY "Admins can update equipment images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'equipment-images' AND
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
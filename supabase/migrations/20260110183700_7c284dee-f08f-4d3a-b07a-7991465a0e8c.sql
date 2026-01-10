-- Add category_id column to gallery_images for linking hero slides to specific categories
ALTER TABLE public.gallery_images 
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_gallery_images_category_id ON public.gallery_images(category_id);

-- Comment for clarity
COMMENT ON COLUMN public.gallery_images.category_id IS 'Links hero_rental slides to specific equipment categories';
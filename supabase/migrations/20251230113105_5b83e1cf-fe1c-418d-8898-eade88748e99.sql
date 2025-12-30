-- Update gallery_images to support new page types (home, servicios)
-- This requires dropping and recreating the constraint if it exists, or just updating the column

-- Add check constraint for valid page types
ALTER TABLE public.gallery_images 
DROP CONSTRAINT IF EXISTS gallery_images_page_type_check;

-- No constraint needed, just text column - but let's ensure the column can hold new values
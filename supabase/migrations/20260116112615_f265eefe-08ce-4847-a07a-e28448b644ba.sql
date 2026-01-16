-- Add vertical_video_url column to gallery_images table for mobile video support
ALTER TABLE public.gallery_images 
ADD COLUMN IF NOT EXISTS vertical_video_url TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN public.gallery_images.vertical_video_url IS 'URL for vertical video version (mobile/tablet) used in hero sliders';
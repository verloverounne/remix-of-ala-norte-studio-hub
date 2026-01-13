-- Add vertical_video_url column to gallery_images for mobile/tablet video versions
ALTER TABLE public.gallery_images 
ADD COLUMN IF NOT EXISTS vertical_video_url TEXT;

COMMENT ON COLUMN public.gallery_images.vertical_video_url IS 'URL for vertical video version to be used on mobile and tablet devices';

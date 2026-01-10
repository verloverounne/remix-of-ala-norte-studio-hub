-- Add media_type column to gallery_images table
-- Defaults to 'image' for backward compatibility with existing records

ALTER TABLE public.gallery_images 
ADD COLUMN IF NOT EXISTS media_type text DEFAULT 'image' CHECK (media_type IN ('image', 'video'));

-- Add media_type and media_url to home_services for hero content
ALTER TABLE public.home_services 
ADD COLUMN IF NOT EXISTS hero_media_type text DEFAULT 'image' CHECK (hero_media_type IN ('image', 'video'));

ALTER TABLE public.home_services 
ADD COLUMN IF NOT EXISTS hero_video_url text;

-- Update existing records in gallery_images: detect video URLs
UPDATE public.gallery_images 
SET media_type = 'video' 
WHERE page_type IN ('home_hero', 'galeria_hero', 'sala_grabacion_hero')
  AND (image_url ILIKE '%.mp4' OR image_url ILIKE '%.webm' OR image_url ILIKE '%.mov');

COMMENT ON COLUMN public.gallery_images.media_type IS 'Type of media: image or video';
COMMENT ON COLUMN public.home_services.hero_media_type IS 'Type of hero media: image or video';
COMMENT ON COLUMN public.home_services.hero_video_url IS 'URL for hero video when hero_media_type is video';
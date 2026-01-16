-- Add section media type and video URL columns to home_services
ALTER TABLE public.home_services 
ADD COLUMN IF NOT EXISTS section_media_type TEXT DEFAULT 'image',
ADD COLUMN IF NOT EXISTS section_video_url TEXT;
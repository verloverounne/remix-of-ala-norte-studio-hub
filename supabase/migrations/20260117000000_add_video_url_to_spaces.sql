-- Add video_url column to spaces table for gallery hero video
ALTER TABLE public.spaces 
ADD COLUMN IF NOT EXISTS video_url TEXT;

COMMENT ON COLUMN public.spaces.video_url IS 'URL for vertical video to be displayed in gallery hero section';

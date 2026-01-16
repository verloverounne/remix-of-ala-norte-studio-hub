-- Create home_sections table for page section configurations
CREATE TABLE IF NOT EXISTS public.home_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  background_media_type TEXT DEFAULT 'image' CHECK (background_media_type IN ('image', 'video')),
  background_image_url TEXT,
  background_video_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.home_sections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Home sections are viewable by everyone" 
ON public.home_sections 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage home sections" 
ON public.home_sections 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_home_sections_updated_at
BEFORE UPDATE ON public.home_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial Cartoni section config
INSERT INTO public.home_sections (section_key, background_media_type, is_active) 
VALUES ('cartoni', 'image', true)
ON CONFLICT (section_key) DO NOTHING;

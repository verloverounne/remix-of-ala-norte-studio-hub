-- Create table for equipment hero configuration
CREATE TABLE public.equipos_hero_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  media_url TEXT,
  title TEXT,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.equipos_hero_config ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can view equipment hero config"
ON public.equipos_hero_config
FOR SELECT
USING (true);

-- Allow admins to manage
CREATE POLICY "Admins can manage equipment hero config"
ON public.equipos_hero_config
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_equipos_hero_config_updated_at
BEFORE UPDATE ON public.equipos_hero_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
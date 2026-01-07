-- Add new columns to home_services for the services page
ALTER TABLE public.home_services
ADD COLUMN IF NOT EXISTS bullets jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS cta_label text,
ADD COLUMN IF NOT EXISTS cta_url text,
ADD COLUMN IF NOT EXISTS hero_image_url text,
ADD COLUMN IF NOT EXISTS slug text;

-- Update existing button columns to use new names (keeping old for backwards compatibility)
COMMENT ON COLUMN public.home_services.bullets IS 'Array of bullet points for the service section';
COMMENT ON COLUMN public.home_services.hero_image_url IS 'Image URL for the hero slider tab';
COMMENT ON COLUMN public.home_services.slug IS 'URL-friendly identifier for anchor navigation';

-- Generate slugs for existing services
UPDATE public.home_services SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g')) WHERE slug IS NULL;
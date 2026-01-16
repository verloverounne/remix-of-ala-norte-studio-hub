-- Create equipment_images table for 1:N relationship with equipment
CREATE TABLE public.equipment_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_equipment_images_equipment_id ON public.equipment_images(equipment_id);
CREATE INDEX idx_equipment_images_featured ON public.equipment_images(is_featured);

-- Enable RLS
ALTER TABLE public.equipment_images ENABLE ROW LEVEL SECURITY;

-- RLS policies - public read access (equipment is public)
CREATE POLICY "Equipment images are publicly readable"
ON public.equipment_images
FOR SELECT
USING (true);

-- RLS policies - authenticated users can manage
CREATE POLICY "Authenticated users can insert equipment images"
ON public.equipment_images
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update equipment images"
ON public.equipment_images
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete equipment images"
ON public.equipment_images
FOR DELETE
TO authenticated
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_equipment_images_updated_at
BEFORE UPDATE ON public.equipment_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Create equipment_unavailability table
CREATE TABLE IF NOT EXISTS public.equipment_unavailability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Enable RLS
ALTER TABLE public.equipment_unavailability ENABLE ROW LEVEL SECURITY;

-- Admins can manage unavailability periods
CREATE POLICY "Admins can manage unavailability periods"
ON public.equipment_unavailability
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Everyone can view unavailability periods (needed for checking availability)
CREATE POLICY "Unavailability periods are viewable by everyone"
ON public.equipment_unavailability
FOR SELECT
USING (true);

-- Create index for performance
CREATE INDEX idx_equipment_unavailability_equipment_id ON public.equipment_unavailability(equipment_id);
CREATE INDEX idx_equipment_unavailability_dates ON public.equipment_unavailability(start_date, end_date);
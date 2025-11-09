-- Create space_unavailability table (similar to equipment_unavailability)
CREATE TABLE public.space_unavailability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.space_unavailability ENABLE ROW LEVEL SECURITY;

-- Create policies for space unavailability
CREATE POLICY "Admins can manage space unavailability periods"
ON public.space_unavailability
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Space unavailability periods are viewable by everyone"
ON public.space_unavailability
FOR SELECT
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_space_unavailability_updated_at
BEFORE UPDATE ON public.space_unavailability
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_space_unavailability_space_id ON public.space_unavailability(space_id);
CREATE INDEX idx_space_unavailability_dates ON public.space_unavailability(start_date, end_date);
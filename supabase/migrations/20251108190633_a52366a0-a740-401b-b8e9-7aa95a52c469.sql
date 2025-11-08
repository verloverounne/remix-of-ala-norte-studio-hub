-- Create equipment_availability table
CREATE TABLE IF NOT EXISTS public.equipment_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('available', 'booked', 'maintenance')) DEFAULT 'available',
  quantity_available INTEGER DEFAULT 1 CHECK (quantity_available >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(equipment_id, date)
);

-- Create equipment_recommendations table
CREATE TABLE IF NOT EXISTS public.equipment_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  recommended_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  score DECIMAL(3,2) DEFAULT 0.5 CHECK (score >= 0 AND score <= 1),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(equipment_id, recommended_id)
);

-- Create reservations table
CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
  total_price INTEGER NOT NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CHECK (end_date > start_date)
);

-- Enable RLS on new tables
ALTER TABLE public.equipment_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for equipment_availability
CREATE POLICY "Availability is viewable by everyone"
  ON public.equipment_availability FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage availability"
  ON public.equipment_availability FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for equipment_recommendations
CREATE POLICY "Recommendations are viewable by everyone"
  ON public.equipment_recommendations FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage recommendations"
  ON public.equipment_recommendations FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for reservations
CREATE POLICY "Users can view their own reservations"
  ON public.reservations FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create reservations"
  ON public.reservations FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Admins can manage all reservations"
  ON public.reservations FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their own reservations"
  ON public.reservations FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_equipment_availability_equipment_date ON public.equipment_availability(equipment_id, date);
CREATE INDEX idx_equipment_availability_date ON public.equipment_availability(date);
CREATE INDEX idx_equipment_recommendations_equipment ON public.equipment_recommendations(equipment_id);
CREATE INDEX idx_reservations_equipment ON public.reservations(equipment_id);
CREATE INDEX idx_reservations_user ON public.reservations(user_id);
CREATE INDEX idx_reservations_dates ON public.reservations(start_date, end_date);
CREATE INDEX idx_equipment_search ON public.equipment USING gin(to_tsvector('spanish', name || ' ' || COALESCE(brand, '') || ' ' || COALESCE(model, '')));

-- Trigger for updated_at
CREATE TRIGGER update_equipment_availability_updated_at
  BEFORE UPDATE ON public.equipment_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
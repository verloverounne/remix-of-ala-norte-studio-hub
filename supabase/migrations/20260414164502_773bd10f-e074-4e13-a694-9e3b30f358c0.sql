
ALTER TABLE public.equipment
  ADD COLUMN IF NOT EXISTS serial_number text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS functional_status text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ownership_type text DEFAULT NULL;

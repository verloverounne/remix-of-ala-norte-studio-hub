-- Backfill NULLs and normalize any unexpected value to 'Propio'
UPDATE public.equipment
SET ownership_type = 'Propio'
WHERE ownership_type IS NULL
   OR ownership_type NOT IN ('Propio', 'Estacionado', 'Externo');

-- Set default and NOT NULL
ALTER TABLE public.equipment
  ALTER COLUMN ownership_type SET DEFAULT 'Propio',
  ALTER COLUMN ownership_type SET NOT NULL;

-- Add CHECK constraint (drop first if exists)
ALTER TABLE public.equipment DROP CONSTRAINT IF EXISTS equipment_ownership_type_check;
ALTER TABLE public.equipment
  ADD CONSTRAINT equipment_ownership_type_check
  CHECK (ownership_type IN ('Propio', 'Estacionado', 'Externo'));
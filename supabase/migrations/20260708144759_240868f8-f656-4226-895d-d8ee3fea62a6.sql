ALTER TABLE public.equipment
  ADD COLUMN IF NOT EXISTS manual_category_id uuid NULL REFERENCES public.categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS category_manually_edited boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_equipment_manual_category_id ON public.equipment(manual_category_id);
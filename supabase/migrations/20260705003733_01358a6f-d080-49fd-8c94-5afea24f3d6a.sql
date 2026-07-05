ALTER TABLE public.equipment
  ADD COLUMN IF NOT EXISTS subcategory_auto_assigned boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS equipment_subcat_auto_idx
  ON public.equipment (updated_at DESC)
  WHERE subcategory_auto_assigned = true;

INSERT INTO public.subcategories (category_id, name, name_en, slug, order_index)
SELECT c.id, 'Energía Varios', 'Power Misc', 'energia-varios',
       COALESCE((SELECT MAX(order_index) FROM public.subcategories WHERE category_id = c.id), 0) + 1
FROM public.categories c
WHERE c.name = 'Energía'
ON CONFLICT (slug) DO NOTHING;
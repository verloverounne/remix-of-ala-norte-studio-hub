CREATE TABLE IF NOT EXISTS public.rentalos_staging (
  key text PRIMARY KEY,
  nm text NOT NULL,
  sub_id uuid,
  cat_id uuid,
  price integer,
  qty integer,
  st text,
  ord integer,
  func text,
  tp text,
  ser text,
  dsc text
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rentalos_staging TO authenticated;
GRANT ALL ON public.rentalos_staging TO service_role;
ALTER TABLE public.rentalos_staging ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage staging" ON public.rentalos_staging FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
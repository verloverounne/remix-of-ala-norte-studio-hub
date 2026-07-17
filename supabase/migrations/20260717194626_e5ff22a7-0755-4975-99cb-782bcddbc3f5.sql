CREATE TABLE IF NOT EXISTS public.rentalos_stage (
  nkey text PRIMARY KEY,
  csv_cat text NOT NULL
);
GRANT ALL ON public.rentalos_stage TO service_role;
ALTER TABLE public.rentalos_stage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service only" ON public.rentalos_stage FOR ALL USING (false) WITH CHECK (false);
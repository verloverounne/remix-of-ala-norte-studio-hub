-- Agregar nuevas columnas a la tabla equipment basado en el CSV
ALTER TABLE public.equipment
ADD COLUMN IF NOT EXISTS sku_rentalos TEXT,
ADD COLUMN IF NOT EXISTS descripcion_corta_es TEXT,
ADD COLUMN IF NOT EXISTS descripcion_corta_en TEXT,
ADD COLUMN IF NOT EXISTS tamano TEXT,
ADD COLUMN IF NOT EXISTS tipo_equipo TEXT,
ADD COLUMN IF NOT EXISTS observaciones_internas TEXT,
ADD COLUMN IF NOT EXISTS id_original INTEGER;

-- Crear índice para el campo id_original para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_equipment_id_original ON public.equipment(id_original);
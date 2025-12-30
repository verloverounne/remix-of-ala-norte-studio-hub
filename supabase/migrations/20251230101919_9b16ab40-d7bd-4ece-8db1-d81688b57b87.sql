-- Add stock quantity column to equipment table
ALTER TABLE public.equipment 
ADD COLUMN stock_quantity integer NOT NULL DEFAULT 1;

-- Add a comment to explain the column
COMMENT ON COLUMN public.equipment.stock_quantity IS 'Number of units available in inventory';
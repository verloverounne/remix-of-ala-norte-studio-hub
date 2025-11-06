-- Add featured_copy field to equipment table for featured equipment descriptions
ALTER TABLE public.equipment
ADD COLUMN featured_copy text;
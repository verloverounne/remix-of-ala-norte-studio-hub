-- Add Instagram configuration columns to contact_info table
ALTER TABLE public.contact_info 
ADD COLUMN IF NOT EXISTS instagram_token text;
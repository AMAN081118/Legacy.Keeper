-- Add person field to transactions table
ALTER TABLE public.transactions
ADD COLUMN person TEXT;

-- Update existing records to set person field to name
UPDATE public.transactions
SET person = name
WHERE person IS NULL; 
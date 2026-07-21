-- Remove strict foreign key constraint so unregistered users can still save calculator leads
ALTER TABLE public.profit_calculator_leads DROP CONSTRAINT profit_calculator_leads_account_id_fkey;

ALTER TABLE public.investors ADD COLUMN IF NOT EXISTS email character varying;
ALTER TABLE public.investors ADD COLUMN IF NOT EXISTS folio_number character varying UNIQUE;

CREATE SEQUENCE IF NOT EXISTS folio_seq START 1;

CREATE OR REPLACE FUNCTION generate_folio_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.folio_number IS NULL THEN
    NEW.folio_number := lpad(nextval('folio_seq')::text, 3, '0') || '/2026-27';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_folio ON public.investors;
CREATE TRIGGER trigger_generate_folio
BEFORE INSERT ON public.investors
FOR EACH ROW EXECUTE FUNCTION generate_folio_number();

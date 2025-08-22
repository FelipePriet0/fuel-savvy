-- Corrigir função com search_path seguro
CREATE OR REPLACE FUNCTION public.set_posto_user_id()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.id IS NULL THEN
    NEW.id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$;
-- Corrigir funções com search_path apropriado
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = is_admin.user_id AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.get_admin_role(user_id UUID DEFAULT auth.uid())
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.admin_users 
  WHERE user_id = get_admin_role.user_id AND is_active = true
  LIMIT 1;
$$;
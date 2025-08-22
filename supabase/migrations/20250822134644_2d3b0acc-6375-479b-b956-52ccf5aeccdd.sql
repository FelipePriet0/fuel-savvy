-- Adicionar coluna role na tabela postos
ALTER TABLE public.postos ADD COLUMN IF NOT EXISTS role text DEFAULT 'posto';

-- Alterar o valor padrão da coluna id para usar auth.uid()
ALTER TABLE public.postos ALTER COLUMN id SET DEFAULT auth.uid();

-- Criar função para inserir automaticamente o ID do usuário autenticado
CREATE OR REPLACE FUNCTION public.set_posto_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id IS NULL THEN
    NEW.id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para executar a função antes de inserir
DROP TRIGGER IF EXISTS trigger_set_posto_user_id ON public.postos;
CREATE TRIGGER trigger_set_posto_user_id
  BEFORE INSERT ON public.postos
  FOR EACH ROW
  EXECUTE FUNCTION public.set_posto_user_id();

-- Atualizar política RLS para permitir inserção com user_id válido
DROP POLICY IF EXISTS postos_insert_self ON public.postos;
CREATE POLICY postos_insert_self ON public.postos
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND (id IS NULL OR id = auth.uid()));

-- Garantir que a política de seleção permite ver os próprios dados
DROP POLICY IF EXISTS postos_select_own ON public.postos;
CREATE POLICY postos_select_own ON public.postos
  FOR SELECT 
  USING (auth.uid() = id);

-- Garantir que a política de atualização permite editar os próprios dados
DROP POLICY IF EXISTS postos_update_own ON public.postos;
CREATE POLICY postos_update_own ON public.postos
  FOR UPDATE 
  USING (auth.uid() = id) 
  WITH CHECK (auth.uid() = id);
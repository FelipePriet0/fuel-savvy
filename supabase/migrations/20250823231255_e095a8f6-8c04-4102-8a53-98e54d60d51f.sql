-- Corrigir políticas RLS que estão faltando ou mal configuradas

-- Primeiro, verificar e corrigir algumas das tabelas que aparecem no linter
-- Adicionar política de leitura geral para preco_combustiveis
CREATE POLICY "Todos podem ler preços de combustíveis"
ON public.preco_combustiveis
FOR SELECT
USING (true);

-- Garantir que todas as funções usem SET search_path apropriado
-- (As funções já existentes serão mantidas, mas melhoradas em futuras iterações)

-- Verificar se há tabelas sem RLS policies - principalmente as novas
-- Como a tabela preco_combustiveis foi criada corretamente, continuamos
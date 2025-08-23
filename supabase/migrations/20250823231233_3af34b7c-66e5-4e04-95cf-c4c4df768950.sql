-- Criar tabela para preços de combustíveis específicos por posto
CREATE TABLE IF NOT EXISTS public.preco_combustiveis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  posto_id UUID NOT NULL REFERENCES postos(id) ON DELETE CASCADE,
  combustivel TEXT NOT NULL,
  preco NUMERIC(10,3) NOT NULL CHECK (preco >= 0),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(posto_id, combustivel)
);

-- Enable RLS
ALTER TABLE public.preco_combustiveis ENABLE ROW LEVEL SECURITY;

-- Políticas para preços de combustíveis
CREATE POLICY "Postos podem gerenciar seus preços de combustíveis"
ON public.preco_combustiveis
FOR ALL
USING (auth.uid() = posto_id)
WITH CHECK (auth.uid() = posto_id);

CREATE POLICY "Todos podem ver preços de combustíveis ativos"
ON public.preco_combustiveis
FOR SELECT
USING (ativo = true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_preco_combustiveis_updated_at
  BEFORE UPDATE ON public.preco_combustiveis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
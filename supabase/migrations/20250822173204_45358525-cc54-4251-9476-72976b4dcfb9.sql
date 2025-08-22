-- Criar tabela perfis com a mesma estrutura da tabela profiles
CREATE TABLE public.perfis (
  id uuid NOT NULL,
  nome text,
  telefone text,
  avatar_url text,
  latitude double precision,
  zip_code text,
  full_name text,
  phone text,
  role text DEFAULT 'motorista'::text,
  state text,
  cpf text,
  city text,
  total_savings numeric DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  tipo_usuario text,
  email text,
  longitude double precision,
  address text,
  PRIMARY KEY (id)
);

-- Migrar todos os dados da tabela profiles para perfis
INSERT INTO public.perfis (
  id, nome, telefone, avatar_url, latitude, zip_code, full_name, phone, 
  role, state, cpf, city, total_savings, updated_at, created_at, 
  tipo_usuario, email, longitude, address
)
SELECT 
  id, nome, telefone, avatar_url, latitude, zip_code, full_name, phone,
  role, state, cpf, city, total_savings, updated_at, created_at,
  tipo_usuario, email, longitude, address
FROM public.profiles;

-- Habilitar RLS na tabela perfis
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

-- Criar as mesmas políticas RLS da tabela profiles
CREATE POLICY "perfis_insert_self" 
ON public.perfis 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "perfis_read_own" 
ON public.perfis 
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "perfis_select_own" 
ON public.perfis 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "perfis_update_own" 
ON public.perfis 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Criar função para atualizar updated_at (se ainda não existir)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_perfis_updated_at 
BEFORE UPDATE ON public.perfis 
FOR EACH ROW 
EXECUTE FUNCTION public.update_updated_at_column();
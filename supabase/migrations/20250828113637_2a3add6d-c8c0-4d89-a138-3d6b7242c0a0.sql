-- Create profiles table for drivers (motoristas)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create postos table for gas stations
CREATE TABLE public.postos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT NOT NULL,
  cnpj TEXT NOT NULL UNIQUE,
  endereco TEXT,
  cep TEXT,
  cidade TEXT,
  estado TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_logs table for audit trail
CREATE TABLE public.admin_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  target_user_email TEXT NOT NULL,
  admin_user_id UUID NOT NULL REFERENCES auth.users(id),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.postos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for postos
CREATE POLICY "Postos can view their own data" 
ON public.postos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Postos can update their own data" 
ON public.postos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Postos can insert their own data" 
ON public.postos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admin can view all postos
CREATE POLICY "Admins can view all postos" 
ON public.postos 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.postos p 
    WHERE p.user_id = auth.uid() AND p.is_admin = true
  )
);

-- Create RLS policies for admin_logs
CREATE POLICY "Admins can view admin logs" 
ON public.admin_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.postos p 
    WHERE p.user_id = auth.uid() AND p.is_admin = true
  )
);

CREATE POLICY "Admins can insert admin logs" 
ON public.admin_logs 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.postos p 
    WHERE p.user_id = auth.uid() AND p.is_admin = true
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_postos_updated_at
  BEFORE UPDATE ON public.postos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
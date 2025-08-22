import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export type Profile = {
  id: string
  role: 'motorista'
  nome: string
  telefone: string
  cpf: string
  created_at: string
}

export type Posto = {
  id: string
  role: 'posto'
  cnpj: string
  nome_fantasia: string
  email: string
  telefone: string
  endereco?: {
    cep: string
    logradouro: string
    numero: string
    bairro: string
    cidade: string
    uf: string
  }
  bandeira?: string
  lat?: number
  lng?: number
  status: 'incomplete' | 'complete'
  created_at: string
}

export type Cupom = {
  id: string
  posto_id: string
  combustivel: string
  preco_base_litro: number
  desconto_total: number
  gasto_minimo: number
  valor_texto: string
  ativo: boolean
  validade_ini: string
  validade_fim: string
  criado_em: string
}

export type UsoCupom = {
  id: string
  cupom_id: string
  motorista_id: string
  usado_em: string
}
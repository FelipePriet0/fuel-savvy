import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://tjzssimbovlmskxdzsoq.supabase.co"
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqenNzaW1ib3ZsbXNreGR6c29xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NDA4MDIsImV4cCI6MjA2NTQxNjgwMn0.8xddBZduyGbpm7bm4pb1PQtoL3E8TM5baRwhDa8pNUk"

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)

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
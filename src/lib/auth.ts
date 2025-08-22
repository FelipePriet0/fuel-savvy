import { supabase } from './supabaseClient'
import { User } from '@supabase/supabase-js'

export type UserRole = 'motorista' | 'posto'

export interface UserWithRole extends User {
  role?: UserRole
}

export const getCurrentUser = async (): Promise<UserWithRole | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Buscar role do usuário
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile) {
    return { ...user, role: profile.role }
  }

  // Se não encontrou em profiles, buscar em postos
  const { data: posto } = await supabase
    .from('postos')
    .select('role')
    .eq('id', user.id)
    .single()

  if (posto) {
    return { ...user, role: posto.role as UserRole }
  }

  return { ...user, role: undefined }
}

export const signUp = async (email: string, password: string, userData: any, role: UserRole) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) throw error

  if (data.user) {
    if (role === 'motorista') {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          role: 'motorista',
          ...userData
        })

      if (profileError) throw profileError
    } else if (role === 'posto') {
      const { error: postoError } = await supabase
        .from('postos')
        .insert({
          id: data.user.id,
          role: 'posto',
          status: 'incomplete',
          ...userData
        })

      if (postoError) throw postoError
    }
  }

  return data
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Função para calcular preço equivalente
export const calcularPrecoEquivalente = (precoBase: number, descontoTotal: number, gastoMinimo: number) => {
  return precoBase * (1 - descontoTotal / gastoMinimo)
}
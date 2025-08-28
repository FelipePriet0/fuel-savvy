import { supabase } from './supabaseClient'
import { User } from '@supabase/supabase-js'

export type UserRole = 'motorista' | 'posto'

export interface UserWithRole extends User {
  role?: UserRole
}

export const getCurrentUser = async (): Promise<UserWithRole | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  console.log('🔍 Buscando role para usuário:', user.id, user.email)

  // Buscar em paralelo nas duas tabelas
  const [
    { data: profile, error: profileError },
    { data: posto, error: postoError }
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('postos')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
  ])

  console.log('📋 Resultado perfis:', profile, profileError)
  console.log('🏭 Resultado postos:', posto, postoError)

  // Se encontrou em ambas as tabelas, há um problema de dados
  if (profile && posto) {
    console.error('❌ ERRO: Usuário encontrado em ambas as tabelas!', { profile, posto })
    // Priorizar posto se ambos existem
    return { ...user, role: posto.role as UserRole }
  }

  // Se encontrou em postos, retornar como posto
  if (posto) {
    console.log('✅ Usuário identificado como posto')
    return { ...user, role: posto.role as UserRole }
  }

  // Se encontrou em perfis, retornar como motorista
  if (profile && profile.role) {
    console.log('✅ Usuário identificado como motorista:', profile.role)
    return { ...user, role: profile.role as UserRole }
  }

  console.log('⚠️ Role não encontrado para usuário')
  return { ...user, role: undefined }
}

export const signUp = async (email: string, password: string, userData: any, role: UserRole) => {
  console.log('📝 Iniciando cadastro:', { email, role })
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('❌ Erro no signUp:', error)
    throw error
  }

  if (data.user) {
    console.log('✅ Usuário criado:', data.user.id)
    
    try {
      if (role === 'motorista') {
        console.log('👤 Inserindo dados na tabela profiles...')
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            role: 'motorista',
            ...userData
          })

        if (profileError) {
          console.error('❌ Erro ao inserir perfil:', profileError)
          throw profileError
        }
        console.log('✅ Perfil de motorista criado com sucesso')
        
      } else if (role === 'posto') {
        console.log('🏭 Inserindo dados na tabela postos...')
        const { error: postoError } = await supabase
          .from('postos')
          .insert({
            id: data.user.id,
            cnpj: userData.cnpj,
            nome_fantasia: userData.nomeFantasia || userData.nome_fantasia,
            email: userData.email,
            telefone: userData.telefone,
            endereco: userData.endereco,
            bandeira: userData.bandeira,
            role: 'posto'
          })

        if (postoError) {
          console.error('❌ Erro ao inserir posto:', postoError)
          throw postoError
        }
        console.log('✅ Perfil de posto criado com sucesso')
      }
    } catch (insertError) {
      console.error('❌ Erro crítico na inserção dos dados do usuário:', insertError)
      throw insertError
    }
  }

  console.log('🎉 Cadastro concluído com sucesso')
  return data
}

export const signIn = async (email: string, password: string) => {
  console.log('🔐 Tentando fazer login:', email)
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('❌ Erro no login:', error)
    throw error
  }
  
  console.log('✅ Login realizado com sucesso:', data.user?.id)
  return data
}

export const signOut = async () => {
  console.log('🚪 Fazendo logout...')
  
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('❌ Erro no logout:', error)
    throw error
  }
  
  console.log('✅ Logout realizado com sucesso')
}

// Função para calcular preço equivalente
export const calcularPrecoEquivalente = (precoBase: number, descontoTotal: number, gastoMinimo: number) => {
  return precoBase * (1 - descontoTotal / gastoMinimo)
}
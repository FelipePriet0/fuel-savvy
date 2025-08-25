import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getCurrentUser, UserWithRole } from '@/lib/auth'
import { Loader2 } from 'lucide-react'

interface ProtectedProps {
  children: React.ReactNode
  roleRequired?: 'motorista' | 'posto'
}

const Protected = ({ children, roleRequired }: ProtectedProps) => {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔐 Verificando autenticação...')
        const currentUser = await getCurrentUser()
        console.log('👤 Usuário atual:', currentUser ? { id: currentUser.id, email: currentUser.email, role: currentUser.role } : 'Não logado')
        setUser(currentUser)
      } catch (error) {
        console.error('❌ Erro ao verificar autenticação:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    console.log('🚪 Usuário não autenticado, redirecionando para login')
    return <Navigate to="/entrar" replace />
  }

  if (roleRequired && user.role !== roleRequired) {
    console.log(`🚫 Acesso negado. Role necessário: ${roleRequired}, Role do usuário: ${user.role}`)
    
    // Se tentou acessar área do posto mas não é posto, vai para home
    if (roleRequired === 'posto') {
      console.log('⚠️ Tentativa de acesso à área do posto sem ser posto, redirecionando para home')
      return <Navigate to="/" replace />
    }
    // Se tentou acessar área do motorista mas não é motorista, vai para área do posto
    if (roleRequired === 'motorista' && user.role === 'posto') {
      console.log('⚠️ Usuário posto tentando acessar área de motorista, redirecionando para área do posto')
      return <Navigate to="/posto" replace />
    }
  }

  console.log('✅ Acesso liberado para:', user.role)

  return <>{children}</>
}

export default Protected
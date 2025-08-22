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
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
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
    return <Navigate to="/entrar" replace />
  }

  if (roleRequired && user.role !== roleRequired) {
    // Se tentou acessar área do posto mas não é posto, vai para home
    if (roleRequired === 'posto') {
      return <Navigate to="/" replace />
    }
    // Se tentou acessar área do motorista mas não é motorista, vai para área do posto
    if (roleRequired === 'motorista' && user.role === 'posto') {
      return <Navigate to="/posto" replace />
    }
  }

  return <>{children}</>
}

export default Protected
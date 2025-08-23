import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { signOut, getCurrentUser, UserWithRole } from '@/lib/auth'
import { LogOut, Settings, Home, BarChart3, User } from 'lucide-react'

const Header = () => {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const getUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      setLoading(false)
    }

    getUser()
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      setUser(null)
      navigate('/entrar')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center">
          <div className="flex">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary"></div>
              <span className="font-bold text-xl">ZUP</span>
            </Link>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-black font-bold text-sm">Z</span>
            </div>
            <span className="font-bold text-xl">ZUP</span>
          </Link>

          {user && (
            <nav className="flex items-center space-x-4">
              {user.role === 'posto' && (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/posto" className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Painel do Posto</span>
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/posto/novo">Criar Cupom</Link>
                  </Button>
                </>
              )}
              {user.role === 'motorista' && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/" className="flex items-center space-x-2">
                    <Home className="h-4 w-4" />
                    <span>Início</span>
                  </Link>
                </Button>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {user ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Olá, {user.email}
              </span>
              {user.role === 'posto' && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/posto/perfil" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/entrar">Entrar</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/cadastro/motorista">Cadastre-se</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { signUp } from '@/lib/auth'
import { Loader2, Building2, Phone, CreditCard, Mail, Lock, MapPin } from 'lucide-react'

const SignUpPosto = () => {
  const [formData, setFormData] = useState({
    cnpj: '',
    nome_fantasia: '',
    email: '',
    telefone: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { cnpj, nome_fantasia, email, telefone, password } = formData
      await signUp(email, password, { cnpj, nome_fantasia, email, telefone }, 'posto')
      navigate('/posto')
    } catch (error: any) {
      setError(error.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md bg-gradient-surface border-zup-border shadow-card">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <MapPin className="h-6 w-6 text-black" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Cadastro de Posto</CardTitle>
            <CardDescription>
              Registre seu posto e ofereça cupons aos motoristas
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="cnpj"
                  name="cnpj"
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj}
                  onChange={handleInputChange}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome_fantasia">Nome do posto</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="nome_fantasia"
                  name="nome_fantasia"
                  placeholder="Posto exemplo"
                  value={formData.nome_fantasia}
                  onChange={handleInputChange}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contato@posto.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="telefone"
                  name="telefone"
                  placeholder="(11) 99999-9999"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link to="/entrar" className="text-primary hover:underline">
                Fazer login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SignUpPosto
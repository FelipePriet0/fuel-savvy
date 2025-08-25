import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import StatCard from '@/components/StatCard'
import { supabase } from '@/lib/supabaseClient'
import { getCurrentUser } from '@/lib/auth'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, 
  Plus, 
  Ticket, 
  TrendingUp, 
  Calendar,
  CheckCircle2,
  Clock
} from 'lucide-react'

interface DashboardStats {
  cuponsAtivos: number
  cuponsExpirados: number
  resgates7dias: number
  resgates30dias: number
}

interface CupomRecente {
  id: string
  combustivel: string
  desconto_total: number
  gasto_minimo: number
  ativo: boolean
  validade_fim: string
  criado_em: string
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [cuponsRecentes, setCuponsRecentes] = useState<CupomRecente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) return

        const now = new Date().toISOString()
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

        // Cupons ativos
        const { count: cuponsAtivos } = await supabase
          .from('cupons')
          .select('*', { count: 'exact', head: true })
          .eq('posto_id', user.id)
          .eq('ativo', true)
          .lte('validade_ini', now)
          .gte('validade_fim', now)

        // Cupons expirados
        const { count: cuponsExpirados } = await supabase
          .from('cupons')
          .select('*', { count: 'exact', head: true })
          .eq('posto_id', user.id)
          .lt('validade_fim', now)

        // Resgates últimos 7 dias
        const { count: resgates7dias } = await supabase
          .from('uso_cupons')
          .select('cupom_id, cupons!inner(*)', { count: 'exact', head: true })
          .eq('cupons.posto_id', user.id)
          .gte('usado_em', sevenDaysAgo)

        // Resgates últimos 30 dias
        const { count: resgates30dias } = await supabase
          .from('uso_cupons')
          .select('cupom_id, cupons!inner(*)', { count: 'exact', head: true })
          .eq('cupons.posto_id', user.id)
          .gte('usado_em', thirtyDaysAgo)

        // Últimos cupons criados
        const { data: cupons } = await supabase
          .from('cupons')
          .select('id, combustivel, desconto_total, gasto_minimo, ativo, validade_fim, criado_em')
          .eq('posto_id', user.id)
          .order('criado_em', { ascending: false })
          .limit(5)

        setStats({
          cuponsAtivos: cuponsAtivos || 0,
          cuponsExpirados: cuponsExpirados || 0,
          resgates7dias: resgates7dias || 0,
          resgates30dias: resgates30dias || 0
        })

        setCuponsRecentes(cupons || [])
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const formatarPreco = (preco: number) => {
    return preco.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Painel do Posto</h1>
            <p className="text-muted-foreground">
              Gerencie seus cupons e acompanhe as estatísticas
            </p>
          </div>
          <Button asChild>
            <Link to="/posto/novo" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Criar Cupom
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Cupons Ativos"
            value={stats?.cuponsAtivos || 0}
            subtitle="Disponíveis para uso"
            icon={CheckCircle2}
          />
          <StatCard
            title="Cupons Expirados"
            value={stats?.cuponsExpirados || 0}
            subtitle="Fora do prazo"
            icon={Clock}
          />
          <StatCard
            title="Resgates (7 dias)"
            value={stats?.resgates7dias || 0}
            subtitle="Última semana"
            icon={TrendingUp}
          />
          <StatCard
            title="Resgates (30 dias)"
            value={stats?.resgates30dias || 0}
            subtitle="Último mês"
            icon={Calendar}
          />
        </div>

        {/* Últimos cupons */}
        <Card className="bg-gradient-surface border-zup-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-primary" />
                Últimos Cupons Criados
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/posto/gerenciar">Ver todos</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {cuponsRecentes.length > 0 ? (
              <div className="space-y-4">
                {cuponsRecentes.map((cupom) => (
                  <div
                    key={cupom.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{cupom.combustivel}</h4>
                        <Badge 
                          variant={cupom.ativo ? "default" : "secondary"}
                          className={cupom.ativo ? "bg-primary/20 text-primary" : ""}
                        >
                          {cupom.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatarPreco(cupom.desconto_total)} de desconto 
                        • Mínimo {formatarPreco(cupom.gasto_minimo)}
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>Criado em {formatarData(cupom.criado_em)}</div>
                      <div>Válido até {formatarData(cupom.validade_fim)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Nenhum cupom criado</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Comece criando seu primeiro cupom para atrair motoristas
                </p>
                <Button asChild>
                  <Link to="/posto/novo">Criar primeiro cupom</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard

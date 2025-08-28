import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  Clock,
  Settings,
  ToggleLeft,
  ToggleRight,
  Trash2
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

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

interface CupomCompleto {
  id: string
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

type FiltroStatus = 'todos' | 'ativos' | 'expirados' | 'inativos'

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [cuponsRecentes, setCuponsRecentes] = useState<CupomRecente[]>([])
  const [todosOsCupons, setTodosOsCupons] = useState<CupomCompleto[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todos')
  const [atualizandoCupom, setAtualizandoCupom] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('resumo')

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

        // Últimos cupons criados (resumo)
        const { data: cuponsResumo } = await supabase
          .from('cupons')
          .select('id, combustivel, desconto_total, gasto_minimo, ativo, validade_fim, criado_em')
          .eq('posto_id', user.id)
          .order('criado_em', { ascending: false })
          .limit(5)

        // Todos os cupons (para gerenciamento)
        const { data: cuponsCompletos } = await supabase
          .from('cupons')
          .select('*')
          .eq('posto_id', user.id)
          .order('criado_em', { ascending: false })

        setStats({
          cuponsAtivos: cuponsAtivos || 0,
          cuponsExpirados: cuponsExpirados || 0,
          resgates7dias: resgates7dias || 0,
          resgates30dias: resgates30dias || 0
        })

        setCuponsRecentes(cuponsResumo || [])
        setTodosOsCupons(cuponsCompletos || [])
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

  // Funções para gerenciamento de cupons
  const toggleCupomStatus = async (cupomId: string, novoStatus: boolean) => {
    setAtualizandoCupom(cupomId)
    
    try {
      const { error } = await supabase
        .from('cupons')
        .update({ ativo: novoStatus })
        .eq('id', cupomId)

      if (error) throw error

      setTodosOsCupons(prev => prev.map(cupom => 
        cupom.id === cupomId ? { ...cupom, ativo: novoStatus } : cupom
      ))

      // Atualizar também os cupons recentes se necessário
      setCuponsRecentes(prev => prev.map(cupom => 
        cupom.id === cupomId ? { ...cupom, ativo: novoStatus } : cupom
      ))

      toast({
        title: novoStatus ? "Cupom ativado" : "Cupom desativado",
        description: `O cupom foi ${novoStatus ? 'ativado' : 'desativado'} com sucesso`,
      })
    } catch (error) {
      console.error('Erro ao atualizar status do cupom:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do cupom",
        variant: "destructive"
      })
    } finally {
      setAtualizandoCupom(null)
    }
  }

  const excluirCupom = async (cupomId: string) => {
    if (!confirm('Tem certeza que deseja excluir este cupom?')) return

    setAtualizandoCupom(cupomId)

    try {
      const { error } = await supabase
        .from('cupons')
        .delete()
        .eq('id', cupomId)

      if (error) throw error

      setTodosOsCupons(prev => prev.filter(cupom => cupom.id !== cupomId))
      setCuponsRecentes(prev => prev.filter(cupom => cupom.id !== cupomId))

      toast({
        title: "Cupom excluído",
        description: "O cupom foi excluído com sucesso",
      })
    } catch (error) {
      console.error('Erro ao excluir cupom:', error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cupom",
        variant: "destructive"
      })
    } finally {
      setAtualizandoCupom(null)
    }
  }

  const filtrarCupons = () => {
    const agora = new Date()

    return todosOsCupons.filter(cupom => {
      const expirado = new Date(cupom.validade_fim) < agora

      switch (filtroStatus) {
        case 'ativos':
          return cupom.ativo && !expirado
        case 'expirados':
          return expirado
        case 'inativos':
          return !cupom.ativo
        default:
          return true
      }
    })
  }

  const getStatusBadge = (cupom: CupomCompleto) => {
    const agora = new Date()
    const expirado = new Date(cupom.validade_fim) < agora

    if (expirado) {
      return <Badge variant="outline" className="border-destructive text-destructive">Expirado</Badge>
    } else if (cupom.ativo) {
      return <Badge className="bg-primary/20 text-primary border-primary/30">Ativo</Badge>
    } else {
      return <Badge variant="secondary">Inativo</Badge>
    }
  }

  const cuponsFiltered = filtrarCupons()

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

        {/* Seção de Cupons com Tabs */}
        <Card className="bg-gradient-surface">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              Cupons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="resumo">Visão Geral</TabsTrigger>
                <TabsTrigger value="gerenciar">Gerenciar Todos Cupons</TabsTrigger>
              </TabsList>
              
              <TabsContent value="resumo" className="mt-6">
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
                    <div className="flex justify-center pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab('gerenciar')}
                      >
                        Ver todos os cupons
                      </Button>
                    </div>
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
              </TabsContent>

              <TabsContent value="gerenciar" className="mt-6">
                <div className="space-y-6">
                  {/* Filtros */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Status:</label>
                      <Select value={filtroStatus} onValueChange={(value: FiltroStatus) => setFiltroStatus(value)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          <SelectItem value="ativos">Ativos</SelectItem>
                          <SelectItem value="expirados">Expirados</SelectItem>
                          <SelectItem value="inativos">Inativos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      {cuponsFiltered.length} cupons
                    </Badge>
                  </div>

                  {/* Tabela de cupons */}
                  {cuponsFiltered.length > 0 ? (
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border">
                            <TableHead>Combustível</TableHead>
                            <TableHead>Desconto</TableHead>
                            <TableHead>Gasto Mín.</TableHead>
                            <TableHead>Validade</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cuponsFiltered.map((cupom) => (
                            <TableRow key={cupom.id} className="border-border">
                              <TableCell className="font-medium">
                                <div>
                                  <div>{cupom.combustivel}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {formatarPreco(cupom.preco_base_litro)}/L
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {formatarPreco(cupom.desconto_total)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {cupom.valor_texto}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {formatarPreco(cupom.gasto_minimo)}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div>Até {formatarData(cupom.validade_fim)}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Desde {formatarData(cupom.validade_ini)}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(cupom)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {/* Toggle ativo/inativo */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleCupomStatus(cupom.id, !cupom.ativo)}
                                    disabled={atualizandoCupom === cupom.id}
                                    className="h-8 w-8 p-0"
                                  >
                                    {atualizandoCupom === cupom.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : cupom.ativo ? (
                                      <ToggleRight className="h-4 w-4 text-primary border border-black rounded p-0.5" />
                                    ) : (
                                      <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </Button>

                                  {/* Excluir */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => excluirCupom(cupom.id)}
                                    disabled={atualizandoCupom === cupom.id}
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Nenhum cupom encontrado</h3>
                      <p className="text-muted-foreground">
                        {filtroStatus !== 'todos' 
                          ? 'Nenhum cupom corresponde aos filtros selecionados'
                          : 'Você ainda não criou nenhum cupom'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard

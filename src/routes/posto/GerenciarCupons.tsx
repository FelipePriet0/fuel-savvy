import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { supabase } from '@/lib/supabaseClient'
import { getCurrentUser } from '@/lib/auth'
import { 
  Loader2, 
  Settings,
  ToggleLeft,
  ToggleRight,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface CupomGerenciar {
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

const GerenciarCupons = () => {
  const [cupons, setCupons] = useState<CupomGerenciar[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todos')
  const [atualizandoCupom, setAtualizandoCupom] = useState<string | null>(null)

  useEffect(() => {
    fetchCupons()
  }, [])

  const fetchCupons = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) return

      const { data, error } = await supabase
        .from('cupons')
        .select('*')
        .eq('posto_id', user.id)
        .order('criado_em', { ascending: false })

      if (error) throw error

      setCupons(data || [])
    } catch (error) {
      console.error('Erro ao buscar cupons:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os cupons",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleCupomStatus = async (cupomId: string, novoStatus: boolean) => {
    setAtualizandoCupom(cupomId)
    
    try {
      const { error } = await supabase
        .from('cupons')
        .update({ ativo: novoStatus })
        .eq('id', cupomId)

      if (error) throw error

      setCupons(prev => prev.map(cupom => 
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

      setCupons(prev => prev.filter(cupom => cupom.id !== cupomId))

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

    return cupons.filter(cupom => {
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

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const formatarPreco = (preco: number) => {
    return preco.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const getStatusBadge = (cupom: CupomGerenciar) => {
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
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" />
            Gerenciar Cupons
          </h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todos os seus cupons
          </p>
        </div>

        {/* Filtros */}
        <Card className="bg-gradient-surface border-zup-border">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Tabela de cupons */}
        <Card className="bg-gradient-surface border-zup-border">
          <CardContent className="p-0">
            {cuponsFiltered.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-zup-border">
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
                    <TableRow key={cupom.id} className="border-zup-border">
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
                              <ToggleRight className="h-4 w-4 text-primary" />
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default GerenciarCupons
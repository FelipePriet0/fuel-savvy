import { useEffect, useState } from 'react'
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
  History,
  Calendar,
  User,
  Fuel
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface UsoHistorico {
  id: string
  usado_em: string
  cupom: {
    id: string
    combustivel: string
    desconto_total: number
    gasto_minimo: number
    valor_texto: string
  }
  motorista?: {
    nome: string
  }
}

type PeriodoFiltro = '7' | '30' | '90'

const HistoricoCupons = () => {
  const [usos, setUsos] = useState<UsoHistorico[]>([])
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('30')

  useEffect(() => {
    fetchHistorico()
  }, [periodo])

  const fetchHistorico = async () => {
    setLoading(true)
    
    try {
      const user = await getCurrentUser()
      if (!user) return

      // Calcular data de início baseada no período
      const dataInicio = new Date()
      dataInicio.setDate(dataInicio.getDate() - parseInt(periodo))

      const { data, error } = await supabase
        .from('uso_cupons')
        .select(`
          id,
          usado_em,
          motorista_id,
          cupons!inner(
            id,
            combustivel,
            desconto_total,
            gasto_minimo,
            valor_texto
          )
        `)
        .eq('cupons.posto_id', user.id)
        .gte('usado_em', dataInicio.toISOString())
        .order('usado_em', { ascending: false })

      if (error) throw error

      // Transform data to match expected format
      const transformedData = await Promise.all((data || []).map(async (item: any) => {
        // Get motorista data separately
        const { data: motoristaData } = await supabase
          .from('perfis')
          .select('nome')
          .eq('id', item.motorista_id)
          .single()

        return {
          id: item.id,
          usado_em: item.usado_em,
          cupom: item.cupons,
          motorista: motoristaData
        }
      }))

      setUsos(transformedData)
    } catch (error) {
      console.error('Erro ao buscar histórico:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatarPreco = (preco: number) => {
    return preco.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const getPeriodoLabel = () => {
    switch (periodo) {
      case '7':
        return 'últimos 7 dias'
      case '30':
        return 'últimos 30 dias'
      case '90':
        return 'últimos 90 dias'
      default:
        return ''
    }
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
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <History className="h-8 w-8 text-primary border-2 border-black rounded-lg p-1" />
            Histórico de Cupons
          </h1>
          <p className="text-muted-foreground">
            Visualize quando seus cupons foram utilizados
          </p>
        </div>

        {/* Stats e filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-surface">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Usos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {usos.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                nos {getPeriodoLabel()}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-surface">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Valor Total Descontado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatarPreco(
                  usos.reduce((total, uso) => total + (uso.cupom?.desconto_total || 0), 0)
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                em economia para motoristas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-surface">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Período
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={periodo} onValueChange={(value: PeriodoFiltro) => setPeriodo(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de histórico */}
        <Card className="bg-gradient-surface">
          <CardContent className="p-0">
            {usos.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Combustível</TableHead>
                    <TableHead>Desconto</TableHead>
                    <TableHead>Gasto Mín.</TableHead>
                    <TableHead>Motorista</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usos.map((uso) => (
                    <TableRow key={uso.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatarData(uso.usado_em)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Fuel className="h-4 w-4 text-primary border border-black rounded p-0.5" />
                          <div>
                            <div className="font-medium">
                              {uso.cupom?.combustivel}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {uso.cupom?.valor_texto}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-primary/20 text-primary border-primary/30">
                          {formatarPreco(uso.cupom?.desconto_total || 0)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatarPreco(uso.cupom?.gasto_minimo || 0)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {uso.motorista?.nome || 'Motorista'}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-16">
                <History className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum uso registrado</h3>
                <p className="text-muted-foreground">
                  Seus cupons ainda não foram utilizados nos {getPeriodoLabel()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default HistoricoCupons
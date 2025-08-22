import { useEffect, useState } from 'react'
import { supabase, Cupom } from '@/lib/supabaseClient'
import CouponCard from '@/components/CouponCard'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, Filter, Fuel } from 'lucide-react'

interface CupomComPosto extends Cupom {
  posto?: {
    id: string
    nome_fantasia: string
    bandeira?: string
    lat?: number
    lng?: number
  }
}

const Home = () => {
  const [cupons, setCupons] = useState<CupomComPosto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCombustivel, setSelectedCombustivel] = useState<string>('todos')
  const [combustiveis, setCombustiveis] = useState<string[]>([])

  useEffect(() => {
    const fetchCupons = async () => {
      try {
        const now = new Date().toISOString()
        
        const { data, error } = await supabase
          .from('cupons')
          .select(`
            *,
            posto:postos(id, nome_fantasia, bandeira, lat, lng)
          `)
          .eq('ativo', true)
          .lte('validade_ini', now)
          .gte('validade_fim', now)
          .order('criado_em', { ascending: false })

        if (error) {
          console.error('Erro ao buscar cupons:', error)
        } else {
          setCupons(data || [])
          
          // Extrair combustíveis únicos para o filtro
          const uniqueCombustiveis = Array.from(
            new Set((data || []).map(cupom => cupom.combustivel))
          ).sort()
          setCombustiveis(uniqueCombustiveis)
        }
      } catch (error) {
        console.error('Erro ao buscar cupons:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCupons()
  }, [])

  const filteredCupons = cupons.filter(cupom => {
    const matchesSearch = cupom.posto?.nome_fantasia
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase()) || 
      cupom.combustivel.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCombustivel = selectedCombustivel === 'todos' || 
      cupom.combustivel === selectedCombustivel

    return matchesSearch && matchesCombustivel
  })

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
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-gradient-primary text-black px-4 py-2 rounded-full text-sm font-medium">
            <Fuel className="h-4 w-4" />
            Cupons de combustível
          </div>
          <h1 className="text-4xl font-bold">
            Encontre os melhores <span className="text-primary">cupons</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubra ofertas exclusivas em postos de gasolina da sua região e economize no abastecimento
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por posto ou combustível..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCombustivel} onValueChange={setSelectedCombustivel}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {combustiveis.map(combustivel => (
                  <SelectItem key={combustivel} value={combustivel}>
                    {combustivel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center">
          <Badge variant="outline" className="text-primary border-primary/30">
            {filteredCupons.length} cupons disponíveis
          </Badge>
        </div>

        {/* Cupons Grid */}
        {filteredCupons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCupons.map(cupom => (
              <CouponCard key={cupom.id} cupom={cupom} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Fuel className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum cupom encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedCombustivel !== 'todos' 
                ? 'Tente ajustar os filtros de busca'
                : 'Não há cupons ativos no momento'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
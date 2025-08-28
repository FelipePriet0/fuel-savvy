import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabaseClient'
import { getCurrentUser } from '@/lib/auth'
import { calcularPrecoEquivalente } from '@/lib/auth'
import { 
  Loader2, 
  Fuel, 
  MapPin, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  ArrowLeft,
  ExternalLink,
  Building2,
  Phone,
  AlertCircle
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface CupomDetalhado {
  id: string
  posto_id: string
  combustivel: string
  preco_base_litro: number
  desconto_total: number
  gasto_minimo: number
  valor_texto: string
  ativo: boolean
  validade_ini: string
  validade_fim: string
  criado_em: string
  posto?: {
    id: string
    nome_fantasia: string
    bandeira?: string
    telefone?: string
    endereco?: any
    lat?: number
    lng?: number
  }
}

const Cupom = () => {
  const { id } = useParams<{ id: string }>()
  const [cupom, setCupom] = useState<CupomDetalhado | null>(null)
  const [loading, setLoading] = useState(true)
  const [marcandoUso, setMarcandoUso] = useState(false)
  const [jaUsado, setJaUsado] = useState(false)

  useEffect(() => {
    if (!id) return

    const fetchCupom = async () => {
      try {
        // Buscar dados do cupom
        const { data: cupomData, error: cupomError } = await supabase
          .from('cupons')
          .select(`
            *,
            posto:postos(*)
          `)
          .eq('id', id)
          .single()

        if (cupomError) {
          console.error('Erro ao buscar cupom:', cupomError)
          return
        }

        setCupom(cupomData)

        // Verificar se o usuário já usou este cupom
        const user = await getCurrentUser()
        if (user) {
          const { data: usoData } = await supabase
            .from('uso_cupons')
            .select('id')
            .eq('cupom_id', id)
            .eq('motorista_id', user.id)
            .maybeSingle()

          setJaUsado(!!usoData)
        }
      } catch (error) {
        console.error('Erro ao buscar cupom:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCupom()
  }, [id])

  const handleMarcarUso = async () => {
    if (!cupom?.id) return

    setMarcandoUso(true)

    try {
      const user = await getCurrentUser()
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para usar um cupom",
          variant: "destructive"
        })
        return
      }

      // Verificar duplicidade novamente
      const { data: existing } = await supabase
        .from('uso_cupons')
        .select('id')
        .eq('cupom_id', cupom.id)
        .eq('motorista_id', user.id)
        .maybeSingle()

      if (existing) {
        toast({
          title: "Cupom já utilizado",
          description: "Você já registrou o uso deste cupom anteriormente",
          variant: "destructive"
        })
        setJaUsado(true)
        return
      }

      // Inserir registro de uso
      const { error } = await supabase
        .from('uso_cupons')
        .insert({
          cupom_id: cupom.id,
          motorista_id: user.id,
          usado_em: new Date().toISOString()
        })

      if (error) throw error

      setJaUsado(true)
      toast({
        title: "Cupom registrado!",
        description: "O uso do cupom foi registrado com sucesso",
      })
    } catch (error) {
      console.error('Erro ao marcar uso:', error)
      toast({
        title: "Erro",
        description: "Não foi possível registrar o uso do cupom",
        variant: "destructive"
      })
    } finally {
      setMarcandoUso(false)
    }
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  if (!cupom) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Cupom não encontrado</h1>
          <Button asChild>
            <Link to="/">Voltar ao início</Link>
          </Button>
        </div>
      </div>
    )
  }

  const precoEquivalente = calcularPrecoEquivalente(
    cupom.preco_base_litro,
    cupom.desconto_total,
    cupom.gasto_minimo
  )

  const isExpired = new Date(cupom.validade_fim) < new Date()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container py-8 max-w-4xl">
        {/* Voltar */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar aos cupons
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Informações principais */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header do cupom */}
            <Card className="bg-gradient-surface">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Fuel className="h-6 w-6 text-primary" />
                      {cupom.combustivel}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{cupom.posto?.nome_fantasia}</span>
                      {cupom.posto?.bandeira && (
                        <Badge variant="outline" className="border-primary/30 text-primary">
                          {cupom.posto.bandeira}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {isExpired && (
                    <Badge variant="outline" className="border-destructive text-destructive">
                      Expirado
                    </Badge>
                  )}
                  {jaUsado && (
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Utilizado
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Preços destacados */}
                <div className="bg-primary/10 border-2 border-black rounded-lg p-6 text-center">
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-2xl line-through text-muted-foreground">
                        {formatarPreco(cupom.preco_base_litro)}/L
                      </span>
                      <span className="text-lg text-muted-foreground">→</span>
                      <span className="text-3xl font-bold text-primary">
                        até {formatarPreco(precoEquivalente)}/L
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Preço equivalente com desconto máximo
                    </p>
                  </div>
                </div>

                {/* Benefício */}
                <div className="flex items-center gap-3 text-primary bg-primary/5 p-4 rounded-lg">
                  <DollarSign className="h-5 w-5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">
                      Economize {formatarPreco(cupom.desconto_total)} no total
                    </div>
                    <div className="text-sm text-muted-foreground">
                      No mínimo de {formatarPreco(cupom.gasto_minimo)} em abastecimento
                    </div>
                  </div>
                </div>

                {/* Regras */}
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Como funciona
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Desconto de {formatarPreco(cupom.desconto_total)} aplicado no total da compra</li>
                    <li>• Abastecimento mínimo de {formatarPreco(cupom.gasto_minimo)}</li>
                    <li>• Se abastecer acima do mínimo, o desconto total permanece {formatarPreco(cupom.desconto_total)}</li>
                    <li>• Preço por litro aumenta proporcionalmente ao valor abastecido</li>
                  </ul>
                </div>

                {/* Validade */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    Válido até {formatarData(cupom.validade_fim)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Ação principal */}
            {!isExpired && (
              <Card className="bg-gradient-surface">
                <CardContent className="p-6">
                  {jaUsado ? (
                    <div className="text-center space-y-2">
                      <CheckCircle className="h-8 w-8 text-primary mx-auto border-2 border-black rounded-lg p-1" />
                      <h3 className="font-semibold">Cupom já utilizado</h3>
                      <p className="text-sm text-muted-foreground">
                        Você já registrou o uso deste cupom
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="font-semibold mb-2">Pronto para usar?</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Clique no botão abaixo para registrar o uso deste cupom
                        </p>
                      </div>
                      
                      <Button 
                        onClick={handleMarcarUso} 
                        disabled={marcandoUso}
                        className="w-full"
                      >
                        {marcandoUso ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Registrando uso...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Marcar como utilizado
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Informações do posto */}
          <div className="space-y-6">
            <Card className="bg-gradient-surface">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Informações do Posto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">{cupom.posto?.nome_fantasia}</h4>
                  {cupom.posto?.bandeira && (
                    <p className="text-sm text-muted-foreground">
                      Bandeira: {cupom.posto.bandeira}
                    </p>
                  )}
                </div>

                {cupom.posto?.telefone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{cupom.posto.telefone}</span>
                  </div>
                )}

                {cupom.posto?.endereco && (
                  <div className="text-sm">
                    <p className="font-medium mb-1">Endereço:</p>
                    <p className="text-muted-foreground">
                      {cupom.posto.endereco.logradouro}, {cupom.posto.endereco.numero}
                      <br />
                      {cupom.posto.endereco.bairro}
                      <br />
                      {cupom.posto.endereco.cidade} - {cupom.posto.endereco.uf}
                      <br />
                      CEP: {cupom.posto.endereco.cep}
                    </p>
                  </div>
                )}

                {cupom.posto?.lat && cupom.posto?.lng && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <a 
                      href={`https://maps.google.com/?q=${cupom.posto.lat},${cupom.posto.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Ver rota no mapa
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cupom
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { calcularPrecoEquivalente } from '@/lib/auth'
import { Fuel, DollarSign, Clock, MapPin } from 'lucide-react'

interface CupomCardProps {
  cupom: {
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
      lat?: number
      lng?: number
    }
  }
}

const CouponCard = ({ cupom }: CupomCardProps) => {
  const precoEquivalente = calcularPrecoEquivalente(
    cupom.preco_base_litro,
    cupom.desconto_total,
    cupom.gasto_minimo
  )

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const formatarPreco = (preco: number) => {
    return preco.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  return (
    <Card className="group hover:shadow-[0px_2px_0px_black] hover:translate-y-0.5 transition-all duration-300 bg-gradient-surface">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Fuel className="h-5 w-5 text-primary" />
            {cupom.combustivel}
          </CardTitle>
          <Badge variant="outline" className="border-primary/30 text-primary">
            {cupom.posto?.bandeira || 'Posto'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {cupom.posto?.nome_fantasia || 'Nome não disponível'}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Preços */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg line-through text-muted-foreground">
                {formatarPreco(cupom.preco_base_litro)}/L
              </span>
              <span className="text-xs text-muted-foreground">→</span>
              <span className="text-xl font-bold text-primary">
                até {formatarPreco(precoEquivalente)}/L
              </span>
            </div>
          </div>
        </div>

        {/* Benefício */}
        <div className="flex items-center gap-2 text-primary">
          <DollarSign className="h-4 w-4 border border-black rounded p-0.5" />
          <span className="text-sm font-medium">
            Economize {formatarPreco(cupom.desconto_total)} no total no mínimo de {formatarPreco(cupom.gasto_minimo)}
          </span>
        </div>

        {/* Observação */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
          Se abastecer acima de {formatarPreco(cupom.gasto_minimo)}, o preço equivalente por litro aumenta proporcionalmente. 
          O desconto total permanece {formatarPreco(cupom.desconto_total)}.
        </div>

        {/* Validade */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 border border-black rounded p-0.5" />
          <span>
            Válido até {formatarData(cupom.validade_fim)}
          </span>
        </div>

        {/* Localização */}
        {cupom.posto?.lat && cupom.posto?.lng && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 border border-black rounded p-0.5" />
            <span>Localização disponível</span>
          </div>
        )}

        {/* Ações */}
        <div className="pt-2">
          <Button asChild className="w-full">
            <Link to={`/cupom/${cupom.id}`}>
              Ver detalhes
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default CouponCard
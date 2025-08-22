import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabaseClient'
import { getCurrentUser } from '@/lib/auth'
import { isPostoProfileComplete } from '@/lib/utils'
import { Loader2, Plus, MapPin, Building2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface FormData {
  combustivel: string
  preco_base_litro: string
  desconto_total: string
  gasto_minimo: string
  validade_ini: string
  validade_fim: string
  ativo: boolean
  valor_texto: string
}

interface EnderecoData {
  cep: string
  logradoudo: string
  numero: string
  bairro: string
  cidade: string
  uf: string
}

interface PostoCompleto {
  endereco: EnderecoData
  bandeira: string
  lat: string
  lng: string
}

const CriarCupom = () => {
  const [formData, setFormData] = useState<FormData>({
    combustivel: '',
    preco_base_litro: '',
    desconto_total: '',
    gasto_minimo: '',
    validade_ini: '',
    validade_fim: '',
    ativo: true,
    valor_texto: ''
  })
  const [loading, setLoading] = useState(false)
  const [showCompleteProfile, setShowCompleteProfile] = useState(false)
  const [missingFields, setMissingFields] = useState<string[]>([])
  const [postoData, setPostoData] = useState<PostoCompleto>({
    endereco: {
      cep: '',
      logradoudo: '',
      numero: '',
      bairro: '',
      cidade: '',
      uf: ''
    },
    bandeira: '',
    lat: '',
    lng: ''
  })
  const [completingProfile, setCompletingProfile] = useState(false)
  const navigate = useNavigate()

  const combustiveis = [
    'Gasolina Comum',
    'Gasolina Aditivada',
    'Etanol',
    'Diesel',
    'Diesel S-10',
    'GNV'
  ]

  const bandeiras = [
    'Petrobras',
    'Ipiranga',
    'Shell',
    'Branca'
  ]

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ]

  useEffect(() => {
    const checkPostoStatus = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) return

        const { data: posto } = await supabase
          .from('postos')
          .select('status')
          .eq('id', user.id)
          .single()

        if (posto?.status === 'incomplete') {
          const fields = await isPostoProfileComplete(user.id)
          setMissingFields(fields)
          setShowCompleteProfile(true)
        }
      } catch (error) {
        console.error('Erro ao verificar status do posto:', error)
      }
    }

    checkPostoStatus()
  }, [])

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleEnderecoChange = (field: keyof EnderecoData, value: string) => {
    setPostoData(prev => ({
      ...prev,
      endereco: { ...prev.endereco, [field]: value }
    }))
  }

  const handleCompleteProfile = async () => {
    setCompletingProfile(true)
    
    try {
      const user = await getCurrentUser()
      if (!user) return

      const { error } = await supabase
        .from('postos')
        .update({
          endereco: postoData.endereco,
          bandeira: postoData.bandeira,
          lat: parseFloat(postoData.lat),
          lng: parseFloat(postoData.lng),
          status: 'complete'
        })
        .eq('id', user.id)

      if (error) throw error

      setShowCompleteProfile(false)
      setMissingFields([])
      toast({
        title: "Perfil completado!",
        description: "Agora você pode criar cupons",
      })
    } catch (error) {
      console.error('Erro ao completar perfil:', error)
      toast({
        title: "Erro",
        description: "Não foi possível completar o perfil",
        variant: "destructive"
      })
    } finally {
      setCompletingProfile(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = await getCurrentUser()
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado",
          variant: "destructive"
        })
        return
      }

      // Validações
      const gastoMinimo = parseFloat(formData.gasto_minimo)
      const descontoTotal = parseFloat(formData.desconto_total)
      const precoBase = parseFloat(formData.preco_base_litro)

      if (gastoMinimo <= 0) {
        toast({
          title: "Erro",
          description: "Gasto mínimo deve ser maior que zero",
          variant: "destructive"
        })
        return
      }

      if (descontoTotal <= 0) {
        toast({
          title: "Erro",
          description: "Desconto total deve ser maior que zero",
          variant: "destructive"
        })
        return
      }

      if (new Date(formData.validade_ini) >= new Date(formData.validade_fim)) {
        toast({
          title: "Erro",
          description: "Data de início deve ser anterior à data de fim",
          variant: "destructive"
        })
        return
      }

      const missing = await isPostoProfileComplete(user.id)
      if (missing.length > 0) {
        setMissingFields(missing)
        setShowCompleteProfile(true)
        return
      }

      const { error } = await supabase
        .from('cupons')
        .insert({
          posto_id: user.id,
          combustivel: formData.combustivel,
          preco_base_litro: precoBase,
          desconto_total: descontoTotal,
          gasto_minimo: gastoMinimo,
          valor_texto: formData.valor_texto,
          validade_ini: new Date(formData.validade_ini).toISOString(),
          validade_fim: new Date(formData.validade_fim).toISOString(),
          ativo: formData.ativo
        })

      if (error) throw error

      toast({
        title: "Cupom criado!",
        description: "O cupom foi criado com sucesso",
      })

      navigate('/posto')
    } catch (error) {
      console.error('Erro ao criar cupom:', error)
      toast({
        title: "Erro",
        description: "Não foi possível criar o cupom",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container py-8 max-w-2xl">
        <Card className="bg-gradient-surface border-zup-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Criar Novo Cupom
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Combustível */}
              <div className="space-y-2">
                <Label htmlFor="combustivel">Tipo de Combustível</Label>
                <Select 
                  value={formData.combustivel} 
                  onValueChange={(value) => handleInputChange('combustivel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o combustível" />
                  </SelectTrigger>
                  <SelectContent>
                    {combustiveis.map(combustivel => (
                      <SelectItem key={combustivel} value={combustivel}>
                        {combustivel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Preço base */}
              <div className="space-y-2">
                <Label htmlFor="preco_base">Preço Base por Litro (R$)</Label>
                <Input
                  id="preco_base"
                  type="number"
                  step="0.01"
                  placeholder="6.00"
                  value={formData.preco_base_litro}
                  onChange={(e) => handleInputChange('preco_base_litro', e.target.value)}
                  required
                />
              </div>

              {/* Desconto e gasto mínimo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="desconto_total">Desconto Total (R$)</Label>
                  <Input
                    id="desconto_total"
                    type="number"
                    step="0.01"
                    placeholder="10.00"
                    value={formData.desconto_total}
                    onChange={(e) => handleInputChange('desconto_total', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gasto_minimo">Gasto Mínimo (R$)</Label>
                  <Input
                    id="gasto_minimo"
                    type="number"
                    step="0.01"
                    placeholder="100.00"
                    value={formData.gasto_minimo}
                    onChange={(e) => handleInputChange('gasto_minimo', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Texto de exibição */}
              <div className="space-y-2">
                <Label htmlFor="valor_texto">Texto de Exibição</Label>
                <Input
                  id="valor_texto"
                  placeholder="R$0,20/L ou R$10 no total"
                  value={formData.valor_texto}
                  onChange={(e) => handleInputChange('valor_texto', e.target.value)}
                  required
                />
              </div>

              {/* Período de validade */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validade_ini">Válido a partir de</Label>
                  <Input
                    id="validade_ini"
                    type="datetime-local"
                    value={formData.validade_ini}
                    onChange={(e) => handleInputChange('validade_ini', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validade_fim">Válido até</Label>
                  <Input
                    id="validade_fim"
                    type="datetime-local"
                    value={formData.validade_fim}
                    onChange={(e) => handleInputChange('validade_fim', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Ativo */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => handleInputChange('ativo', !!checked)}
                />
                <Label htmlFor="ativo">Cupom ativo</Label>
              </div>

              {/* Botão de submit */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Criando cupom...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar cupom
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Modal para completar perfil */}
      <Dialog open={showCompleteProfile} onOpenChange={setShowCompleteProfile}>
        <DialogContent className="max-w-2xl bg-gradient-surface border-zup-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Complete seu perfil
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <p className="text-muted-foreground">
              Para criar cupons, precisamos de algumas informações adicionais sobre seu posto.
            </p>

            {missingFields.length > 0 && (
              <div className="p-4 text-sm rounded-md bg-destructive/10 text-destructive">
                Preencha os seguintes campos: {missingFields.join(', ')}
              </div>
            )}

            {/* Endereço */}
            <div className="space-y-4">
              <h4 className="font-medium">Endereço</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input
                    placeholder="00000-000"
                    value={postoData.endereco.cep}
                    onChange={(e) => handleEnderecoChange('cep', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Logradouro</Label>
                  <Input
                    placeholder="Rua, Avenida..."
                    value={postoData.endereco.logradoudo}
                    onChange={(e) => handleEnderecoChange('logradoudo', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input
                    placeholder="123"
                    value={postoData.endereco.numero}
                    onChange={(e) => handleEnderecoChange('numero', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bairro</Label>
                  <Input
                    placeholder="Centro"
                    value={postoData.endereco.bairro}
                    onChange={(e) => handleEnderecoChange('bairro', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input
                    placeholder="São Paulo"
                    value={postoData.endereco.cidade}
                    onChange={(e) => handleEnderecoChange('cidade', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>UF</Label>
                  <Select 
                    value={postoData.endereco.uf} 
                    onValueChange={(value) => handleEnderecoChange('uf', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {estados.map(estado => (
                        <SelectItem key={estado} value={estado}>
                          {estado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Bandeira */}
            <div className="space-y-2">
              <Label>Bandeira</Label>
              <Select 
                value={postoData.bandeira} 
                onValueChange={(value) => setPostoData(prev => ({ ...prev, bandeira: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a bandeira" />
                </SelectTrigger>
                <SelectContent>
                  {bandeiras.map(bandeira => (
                    <SelectItem key={bandeira} value={bandeira}>
                      {bandeira}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Coordenadas */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Localização (Latitude e Longitude)
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Latitude (ex: -23.5505)"
                  value={postoData.lat}
                  onChange={(e) => setPostoData(prev => ({ ...prev, lat: e.target.value }))}
                />
                <Input
                  placeholder="Longitude (ex: -46.6333)"
                  value={postoData.lng}
                  onChange={(e) => setPostoData(prev => ({ ...prev, lng: e.target.value }))}
                />
              </div>
            </div>

            <Button 
              onClick={handleCompleteProfile} 
              disabled={completingProfile}
              className="w-full"
            >
              {completingProfile ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Completando perfil...
                </>
              ) : (
                'Completar perfil'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CriarCupom

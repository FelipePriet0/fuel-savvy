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
import { Loader2, Plus, MapPin, Building2, X } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface FormData {
  nome_cupom: string
  combustiveis: string[]
  desconto_total: string
  gasto_minimo: string
  validade_ini: string
  validade_fim: string
  ativo: boolean
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
    nome_cupom: '',
    combustiveis: [],
    desconto_total: '',
    gasto_minimo: '',
    validade_ini: '',
    validade_fim: '',
    ativo: true
  })
  const [loading, setLoading] = useState(false)
  const [showCompleteProfile, setShowCompleteProfile] = useState(false)
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
  const [bandeiraPosto, setBandeiraPosto] = useState('')
  const navigate = useNavigate()

  // Combustíveis por bandeira
  const getCombustiveis = (bandeira: string) => {
    const combusiveisPorBandeira = {
      'Petrobras': ['Gasolina Comum', 'Gasolina Aditivada Podium', 'Etanol', 'Diesel', 'Diesel S-10', 'GNV'],
      'Ipiranga': ['Gasolina Comum', 'Gasolina Ipimax', 'Etanol', 'Diesel', 'Diesel S-10', 'GNV'],
      'Shell': ['Gasolina Comum', 'Shell V-Power', 'Etanol', 'Diesel', 'Diesel S-10', 'GNV'],
      'Branca': ['Gasolina Comum', 'Gasolina Aditivada', 'Etanol', 'Diesel', 'Diesel S-10', 'GNV']
    }
    return combusiveisPorBandeira[bandeira as keyof typeof combusiveisPorBandeira] || combusiveisPorBandeira['Branca']
  }

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

  // Buscar bandeira do posto ao carregar
  useEffect(() => {
    const fetchBandeiraPosto = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) return

        const { data: posto } = await supabase
          .from('postos')
          .select('bandeira')
          .eq('id', user.id)
          .single()
        
        if (posto?.bandeira) {
          setBandeiraPosto(posto.bandeira)
        }
      } catch (error) {
        console.error('Erro ao buscar bandeira do posto:', error)
      }
    }

    fetchBandeiraPosto()
  }, [])

  const handleClose = () => {
    navigate(-1)
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCombustivelToggle = (combustivel: string) => {
    setFormData(prev => ({
      ...prev,
      combustiveis: prev.combustiveis.includes(combustivel) 
        ? prev.combustiveis.filter(c => c !== combustivel)
        : [...prev.combustiveis, combustivel]
    }))
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
      toast({
        title: "Perfil completado!",
        description: "Agora você pode tentar criar o cupom novamente",
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

  const checkProfileComplete = async (user: any) => {
    const { data: posto } = await supabase
      .from('postos')
      .select('nome_fantasia, cnpj, email, telefone, bandeira, endereco, lat, lng')
      .eq('id', user.id)
      .single()
    
    if (!posto) return false
    
    const requiredFields = [
      posto.nome_fantasia,
      posto.cnpj,
      posto.email,
      posto.telefone,
      posto.bandeira,
      posto.lat,
      posto.lng
    ]
    
    const addressComplete = posto.endereco && 
      posto.endereco.cep &&
      posto.endereco.logradouro &&
      posto.endereco.numero &&
      posto.endereco.bairro &&
      posto.endereco.cidade &&
      posto.endereco.uf
    
    return requiredFields.every(field => field) && addressComplete
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

      // Validar perfil do posto ANTES de criar o cupom
      const profileComplete = await checkProfileComplete(user)
      
      if (!profileComplete) {
        setLoading(false)
        setShowCompleteProfile(true)
        return
      }

      // Validações do formulário
      if (!formData.nome_cupom.trim()) {
        toast({
          title: "Erro",
          description: "Nome do cupom é obrigatório",
          variant: "destructive"
        })
        return
      }

      if (formData.combustiveis.length === 0) {
        toast({
          title: "Erro",
          description: "Selecione pelo menos um tipo de combustível",
          variant: "destructive"
        })
        return
      }

      const gastoMinimo = parseFloat(formData.gasto_minimo)
      const descontoTotal = parseFloat(formData.desconto_total)

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

      // Criar um cupom para cada combustível selecionado
      const cuponsData = formData.combustiveis.map(combustivel => ({
        posto_id: user.id,
        combustivel: combustivel,
        preco_base_litro: 0, // Não será usado, mas é obrigatório no banco
        desconto_total: descontoTotal,
        gasto_minimo: gastoMinimo,
        valor_texto: formData.nome_cupom,
        validade_ini: new Date(formData.validade_ini).toISOString(),
        validade_fim: new Date(formData.validade_fim).toISOString(),
        ativo: formData.ativo
      }))

      const { error } = await supabase
        .from('cupons')
        .insert(cuponsData)

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
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Criar Novo Cupom
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome do cupom */}
              <div className="space-y-2">
                <Label htmlFor="nome_cupom">Nome do Cupom</Label>
                <Input
                  id="nome_cupom"
                  placeholder="Ex: Promo R$10 Acima de R$100"
                  value={formData.nome_cupom}
                  onChange={(e) => handleInputChange('nome_cupom', e.target.value)}
                  required
                />
              </div>

              {/* Tipos de Combustível */}
              <div className="space-y-3">
                <Label>Tipos de Combustível</Label>
                <div className="grid grid-cols-2 gap-3">
                  {getCombustiveis(bandeiraPosto).map(combustivel => (
                    <div key={combustivel} className="flex items-center space-x-2">
                      <Checkbox
                        id={combustivel}
                        checked={formData.combustiveis.includes(combustivel)}
                        onCheckedChange={() => handleCombustivelToggle(combustivel)}
                      />
                      <Label htmlFor={combustivel} className="text-sm font-normal">
                        {combustivel}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.combustiveis.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {formData.combustiveis.length} combustível(eis) selecionado(s)
                  </p>
                )}
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


              {/* Período de validade */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validade_ini">Válido de</Label>
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
                    Criar
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
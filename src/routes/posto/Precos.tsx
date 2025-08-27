import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabaseClient'
import { getCurrentUser } from '@/lib/auth'
import { Fuel, Plus, Search, Edit2, Trash2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface PrecoCombustivel {
  id: string
  combustivel: string
  preco: number
  ativo: boolean
}

const combustiveisPadrao = [
  'Gasolina Comum',
  'Gasolina Aditivada', 
  'Etanol',
  'Diesel',
  'Diesel S10',
  'GNV'
]

export default function Precos() {
  const [precos, setPrecos] = useState<PrecoCombustivel[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [newPrice, setNewPrice] = useState({ 
    combustivel: '', 
    preco: '',
    customCombustivel: ''
  })
  const [showCustomInput, setShowCustomInput] = useState(false)

  useEffect(() => {
    fetchPrecos()
  }, [])

  const fetchPrecos = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) return

      const { data, error } = await supabase
        .from('preco_combustiveis')
        .select('*')
        .eq('posto_id', user.id)
        .eq('ativo', true)
        .order('combustivel')

      if (error) throw error
      setPrecos(data || [])
    } catch (error) {
      console.error('Erro ao buscar preços:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPrice = async () => {
    const combustivel = showCustomInput ? newPrice.customCombustivel : newPrice.combustivel
    
    if (!combustivel || !newPrice.preco) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      })
      return
    }

    try {
      const user = await getCurrentUser()
      if (!user) return

      const { error } = await supabase
        .from('preco_combustiveis')
        .upsert({
          posto_id: user.id,
          combustivel: combustivel,
          preco: parseFloat(newPrice.preco),
          ativo: true
        })

      if (error) throw error

      setNewPrice({ combustivel: '', preco: '', customCombustivel: '' })
      setShowCustomInput(false)
      setModalOpen(false)
      fetchPrecos()
      
      toast({
        title: "Preço adicionado",
        description: "Preço de combustível salvo com sucesso",
      })
    } catch (error) {
      console.error('Erro ao adicionar preço:', error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o preço",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('preco_combustiveis')
        .update({ ativo: false })
        .eq('id', id)

      if (error) throw error

      fetchPrecos()
      
      toast({
        title: "Preço removido",
        description: "Preço de combustível removido com sucesso",
      })
    } catch (error) {
      console.error('Erro ao remover preço:', error)
      toast({
        title: "Erro",
        description: "Não foi possível remover o preço",
        variant: "destructive"
      })
    }
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    })
  }

  const filteredPrecos = precos.filter(preco => {
    const matchesSearch = preco.combustivel.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || preco.combustivel === filterType
    return matchesSearch && matchesFilter
  })

  const allFuelTypes = Array.from(new Set([
    ...combustiveisPadrao,
    ...precos.map(p => p.combustivel)
  ]))

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Fuel className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Nenhum preço cadastrado</h3>
      <p className="text-muted-foreground text-center mb-6">
        Comece adicionando os preços dos combustíveis do seu posto.
      </p>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Primeiro Preço
          </Button>
        </DialogTrigger>
        <ModalContent />
      </Dialog>
    </div>
  )

  const ModalContent = () => (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Adicionar novo Preço</DialogTitle>
        <p className="text-sm text-muted-foreground">
          Adicione um novo preço de combustível ao seu posto
        </p>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="combustivel">Tipo de Combustível *</Label>
          <Select 
            value={showCustomInput ? 'custom' : newPrice.combustivel}
            onValueChange={(value) => {
              if (value === 'custom') {
                setShowCustomInput(true)
                setNewPrice(prev => ({ ...prev, combustivel: '' }))
              } else {
                setShowCustomInput(false)
                setNewPrice(prev => ({ ...prev, combustivel: value, customCombustivel: '' }))
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de combustível" />
            </SelectTrigger>
            <SelectContent>
              {combustiveisPadrao.map(combustivel => (
                <SelectItem key={combustivel} value={combustivel}>
                  {combustivel}
                </SelectItem>
              ))}
              <SelectItem value="custom">Cadastrar novo combustível</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showCustomInput && (
          <div className="space-y-2">
            <Label htmlFor="customCombustivel">Nome do Combustível *</Label>
            <Input
              id="customCombustivel"
              placeholder="Ex: IPIMAX"
              value={newPrice.customCombustivel}
              onChange={(e) => setNewPrice(prev => ({ ...prev, customCombustivel: e.target.value }))}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="preco">Preço (R$) por litro *</Label>
          <Input
            id="preco"
            type="number"
            step="0.001"
            placeholder="Ex: 5.49"
            value={newPrice.preco}
            onChange={(e) => setNewPrice(prev => ({ ...prev, preco: e.target.value }))}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setModalOpen(false)
              setNewPrice({ combustivel: '', preco: '', customCombustivel: '' })
              setShowCustomInput(false)
            }}
          >
            Cancelar
          </Button>
          <Button 
            className="flex-1"
            onClick={handleAddPrice}
            disabled={(!newPrice.combustivel && !newPrice.customCombustivel) || !newPrice.preco}
          >
            Salvar Preço
          </Button>
        </div>
      </div>
    </DialogContent>
  )

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Preços de Combustível</h1>
            <p className="text-muted-foreground">Gerencie os preços dos combustíveis do seu posto</p>
          </div>
          
          {precos.length > 0 && (
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Preço
                </Button>
              </DialogTrigger>
              <ModalContent />
            </Dialog>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {precos.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por tipo de combustível..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {allFuelTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPrecos.map((preco) => (
                <Card key={preco.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{preco.combustivel}</CardTitle>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(preco.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {formatPrice(preco.preco)}
                    </div>
                    <p className="text-sm text-muted-foreground">por litro</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from '@/components/ui/sidebar'
import { supabase } from '@/lib/supabaseClient'
import { getCurrentUser } from '@/lib/auth'
import { Fuel, Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface PrecoCombustivel {
  id: string
  combustivel: string
  preco: number
  ativo: boolean
}

const combustiveis = [
  'Gasolina Comum',
  'Gasolina Aditivada', 
  'Etanol',
  'Diesel',
  'Diesel S-10',
  'GNV'
]

export default function FuelPricesSidebar() {
  const [precos, setPrecos] = useState<PrecoCombustivel[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addingNew, setAddingNew] = useState(false)
  const [newPrice, setNewPrice] = useState({ combustivel: '', preco: '' })
  const [editPrice, setEditPrice] = useState('')

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

  const handleAddNew = async () => {
    if (!newPrice.combustivel || !newPrice.preco) return

    try {
      const user = await getCurrentUser()
      if (!user) return

      const { error } = await supabase
        .from('preco_combustiveis')
        .upsert({
          posto_id: user.id,
          combustivel: newPrice.combustivel,
          preco: parseFloat(newPrice.preco),
          ativo: true
        })

      if (error) throw error

      setNewPrice({ combustivel: '', preco: '' })
      setAddingNew(false)
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

  const handleEdit = async (id: string) => {
    if (!editPrice) return

    try {
      const { error } = await supabase
        .from('preco_combustiveis')
        .update({ preco: parseFloat(editPrice) })
        .eq('id', id)

      if (error) throw error

      setEditingId(null)
      setEditPrice('')
      fetchPrecos()
      
      toast({
        title: "Preço atualizado",
        description: "Preço de combustível atualizado com sucesso",
      })
    } catch (error) {
      console.error('Erro ao atualizar preço:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o preço",
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

  const startEdit = (id: string, currentPrice: number) => {
    setEditingId(id)
    setEditPrice(currentPrice.toString())
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditPrice('')
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    })
  }

  if (loading) {
    return (
      <Sidebar>
        <SidebarContent>
          <div className="p-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </SidebarContent>
      </Sidebar>
    )
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Fuel className="h-4 w-4" />
            Preços dos Combustíveis
          </SidebarGroupLabel>
          
          <SidebarGroupContent className="space-y-2">
            {precos.map((preco) => (
              <Card key={preco.id} className="bg-gradient-surface border-zup-border">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{preco.combustivel}</h4>
                      {editingId === preco.id ? (
                        <div className="flex items-center gap-1 mt-1">
                          <Input
                            type="number"
                            step="0.001"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="h-6 text-xs"
                            placeholder="0.000"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => handleEdit(preco.id)}
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={cancelEdit}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-primary">
                          {formatPrice(preco.preco)}
                        </p>
                      )}
                    </div>
                    {editingId !== preco.id && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => startEdit(preco.id, preco.preco)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => handleDelete(preco.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {addingNew ? (
              <Card className="bg-gradient-surface border-zup-border">
                <CardContent className="p-3 space-y-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Combustível</Label>
                    <Select 
                      value={newPrice.combustivel} 
                      onValueChange={(value) => setNewPrice(prev => ({ ...prev, combustivel: value }))}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {combustiveis
                          .filter(c => !precos.some(p => p.combustivel === c))
                          .map(combustivel => (
                            <SelectItem key={combustivel} value={combustivel} className="text-xs">
                              {combustivel}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Preço (R$/L)</Label>
                    <Input
                      type="number"
                      step="0.001"
                      placeholder="0.000"
                      value={newPrice.preco}
                      onChange={(e) => setNewPrice(prev => ({ ...prev, preco: e.target.value }))}
                      className="h-7 text-xs"
                    />
                  </div>

                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      className="h-6 text-xs flex-1"
                      onClick={handleAddNew}
                      disabled={!newPrice.combustivel || !newPrice.preco}
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs"
                      onClick={() => {
                        setAddingNew(false)
                        setNewPrice({ combustivel: '', preco: '' })
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs"
                onClick={() => setAddingNew(true)}
                disabled={precos.length >= combustiveis.length}
              >
                <Plus className="h-3 w-3 mr-1" />
                Adicionar Preço
              </Button>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
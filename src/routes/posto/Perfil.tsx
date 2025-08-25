import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabaseClient'
import { getCurrentUser } from '@/lib/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { User, Building2, Mail, Phone, MapPin, Upload, Loader2, Lock, Eye, EyeOff } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface PostoProfile {
  id: string
  nome_fantasia: string
  cnpj: string
  email: string
  telefone: string
  bandeira: string
  logo_url?: string
  endereco: {
    cep: string
    logradouro: string
    numero: string
    bairro: string
    cidade: string
    uf: string
  } | null
  lat: number | null
  lng: number | null
  status: string
  created_at: string
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

export default function Perfil() {
  const [profile, setProfile] = useState<PostoProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoUrl, setLogoUrl] = useState<string>('')
  
  // Estados para alterar senha
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) return

      const { data, error } = await supabase
        .from('postos')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar o perfil",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    if (!profile) return
    
    if (field.startsWith('endereco.')) {
      const addressField = field.split('.')[1]
      setProfile(prev => ({
        ...prev!,
        endereco: {
          ...prev!.endereco,
          [addressField]: value
        } as any
      }))
    } else {
      setProfile(prev => ({
        ...prev!,
        [field]: value
      }))
    }
  }

  const handleCoordinateChange = (field: 'lat' | 'lng', value: string) => {
    if (!profile) return
    setProfile(prev => ({
      ...prev!,
      [field]: value ? parseFloat(value) : null
    }))
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.includes('image/')) {
        toast({
          title: "Erro",
          description: "Por favor, selecione uma imagem válida (PNG, JPG, SVG)",
          variant: "destructive"
        })
        return
      }

      // Validar tamanho (máx 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Erro", 
          description: "A imagem deve ter no máximo 2MB",
          variant: "destructive"
        })
        return
      }

      setLogoFile(file)
      
      // Criar preview da imagem
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadLogo = async () => {
    if (!logoFile || !profile) return null

    try {
      const fileExt = logoFile.name.split('.').pop()
      const fileName = `${profile.id}-logo.${fileExt}`
      const filePath = `postos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, logoFile, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Erro ao fazer upload do logo:', error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    
    try {
      let logoUrlToSave = profile.logo_url || ''

      // Se há um novo logo para upload
      if (logoFile) {
        logoUrlToSave = await uploadLogo() || ''
      }

      const { error } = await supabase
        .from('postos')
        .update({
          nome_fantasia: profile.nome_fantasia,
          cnpj: profile.cnpj,
          email: profile.email,
          telefone: profile.telefone,
          bandeira: profile.bandeira,
          endereco: profile.endereco,
          lat: profile.lat,
          lng: profile.lng,
          logo_url: logoUrlToSave,
          status: 'complete'
        })
        .eq('id', profile.id)

      if (error) throw error

      // Atualizar estado local
      setProfile(prev => prev ? { ...prev, logo_url: logoUrlToSave } : null)
      setLogoFile(null)

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso",
      })
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações
    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter no mínimo 6 caracteres",
        variant: "destructive"
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro", 
        description: "A confirmação da senha não confere",
        variant: "destructive"
      })
      return
    }

    setChangingPassword(true)

    try {
      // Primeiro, fazer login novamente para validar a senha atual
      const user = await getCurrentUser()
      if (!user?.email) throw new Error('Usuário não encontrado')

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      })

      if (signInError) {
        toast({
          title: "Erro",
          description: "Senha atual incorreta",
          variant: "destructive"
        })
        return
      }

      // Atualizar senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) throw updateError

      // Limpar campos
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso!",
      })

    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      toast({
        title: "Erro",
        description: "Não foi possível alterar a senha",
        variant: "destructive"
      })
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Perfil não encontrado</h3>
            <p className="text-sm text-muted-foreground">
              Não foi possível carregar as informações do seu perfil.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container py-8 max-w-4xl">
        <Card className="bg-gradient-surface border-zup-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Perfil do Posto
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Logo e informações básicas */}
              <div className="flex items-start gap-6">
                <div className="space-y-2">
                  <Label>Logo do Posto</Label>
                  <div className="flex flex-col items-center gap-3">
                    <Avatar className="h-24 w-24">
                      <AvatarImage 
                        src={logoUrl || profile.logo_url || ''} 
                        alt="Logo do posto" 
                      />
                      <AvatarFallback className="text-lg">
                        <Building2 className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="relative">
                      <input
                        type="file"
                        id="logo-upload"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('logo-upload')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome_fantasia">Nome Fantasia *</Label>
                    <Input
                      id="nome_fantasia"
                      value={profile.nome_fantasia}
                      onChange={(e) => handleInputChange('nome_fantasia', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      value={profile.cnpj}
                      onChange={(e) => handleInputChange('cnpj', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input
                      id="telefone"
                      value={profile.telefone}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Bandeira */}
              <div className="space-y-2">
                <Label htmlFor="bandeira">Bandeira *</Label>
                <Select 
                  value={profile.bandeira} 
                  onValueChange={(value) => handleInputChange('bandeira', value)}
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

              <Separator />

              {/* Endereço */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Endereço
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP *</Label>
                    <Input
                      id="cep"
                      placeholder="00000-000"
                      value={profile.endereco?.cep || ''}
                      onChange={(e) => handleInputChange('endereco.cep', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="logradouro">Logradouro *</Label>
                    <Input
                      id="logradouro"
                      placeholder="Rua, Avenida..."
                      value={profile.endereco?.logradouro || ''}
                      onChange={(e) => handleInputChange('endereco.logradouro', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numero">Número *</Label>
                    <Input
                      id="numero"
                      placeholder="123"
                      value={profile.endereco?.numero || ''}
                      onChange={(e) => handleInputChange('endereco.numero', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro *</Label>
                    <Input
                      id="bairro"
                      placeholder="Centro"
                      value={profile.endereco?.bairro || ''}
                      onChange={(e) => handleInputChange('endereco.bairro', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade *</Label>
                    <Input
                      id="cidade"
                      placeholder="São Paulo"
                      value={profile.endereco?.cidade || ''}
                      onChange={(e) => handleInputChange('endereco.cidade', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="uf">UF *</Label>
                    <Select 
                      value={profile.endereco?.uf || ''} 
                      onValueChange={(value) => handleInputChange('endereco.uf', value)}
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

              <Separator />

              {/* Coordenadas */}
              <div className="space-y-4">
                <h3 className="font-medium">Localização (Coordenadas) *</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lat">Latitude</Label>
                    <Input
                      id="lat"
                      type="number"
                      step="any"
                      placeholder="-23.5505"
                      value={profile.lat?.toString() || ''}
                      onChange={(e) => handleCoordinateChange('lat', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lng">Longitude</Label>
                    <Input
                      id="lng"
                      type="number"
                      step="any"
                      placeholder="-46.6333"
                      value={profile.lng?.toString() || ''}
                      onChange={(e) => handleCoordinateChange('lng', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Botão de salvar */}
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    Salvar Perfil
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Seção Alterar Senha */}
        <Card className="bg-gradient-surface border-zup-border mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Alterar Senha
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Mantenha sua conta segura com uma senha forte
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual *</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Digite sua senha atual"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha *</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Digite a nova senha"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Alterando...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Atualizar Senha
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
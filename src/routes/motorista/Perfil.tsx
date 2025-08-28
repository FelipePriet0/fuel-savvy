import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { getCurrentUser } from '@/lib/auth'
import { validateEmail, maskPhone } from '@/lib/validation'
import { Loader2, Camera, Eye, EyeOff, User, Mail, Phone, Lock } from 'lucide-react'

interface ProfileData {
  id: string
  nome?: string
  email?: string
  telefone?: string
  cpf?: string
  avatar_url?: string
}

const Perfil = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  
  // Form states
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const { toast } = useToast()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não encontrado",
          variant: "destructive"
        })
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Erro ao buscar perfil:', error)
        toast({
          title: "Erro",
          description: "Erro ao carregar dados do perfil",
          variant: "destructive"
        })
        return
      }

      setProfile(data)
      setNome(data.nome || '')
      setTelefone(data.telefone || '')
      setEmail(data.email || '')
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do perfil",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    if (!profile) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nome,
          telefone: telefone.replace(/\D/g, ''), // Remove formatting
        })
        .eq('id', profile.id)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Dados atualizados com sucesso!"
      })
      
      fetchProfile() // Reload data
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar dados",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEmailChange = async () => {
    if (!newEmail || !emailPassword) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive"
      })
      return
    }

    if (!validateEmail(newEmail)) {
      toast({
        title: "Erro",
        description: "Email inválido",
        variant: "destructive"
      })
      return
    }

    setSaving(true)
    try {
      // Re-authenticate user with current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: emailPassword
      })

      if (signInError) {
        toast({
          title: "Erro",
          description: "Senha atual incorreta",
          variant: "destructive"
        })
        return
      }

      // Update email
      const { error } = await supabase.auth.updateUser({ 
        email: newEmail 
      })

      if (error) throw error

      // Update in profiles table
      await supabase
        .from('profiles')
        .update({ email: newEmail })
        .eq('id', profile!.id)

      toast({
        title: "Sucesso",
        description: "Email atualizado com sucesso! Verifique seu novo email."
      })
      
      setNewEmail('')
      setEmailPassword('')
      fetchProfile()
    } catch (error) {
      console.error('Erro ao alterar email:', error)
      toast({
        title: "Erro",
        description: "Erro ao alterar email",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive"
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "Nova senha e confirmação não coincidem",
        variant: "destructive"
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "Nova senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      })
      return
    }

    setSaving(true)
    try {
      // Re-authenticate user with current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
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

      // Update password
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      })

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso!"
      })
      
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      toast({
        title: "Erro",
        description: "Erro ao alterar senha",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !profile) return

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "Arquivo muito grande. Máximo 2MB.",
        variant: "destructive"
      })
      return
    }

    setUploadingAvatar(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.id}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', profile.id)

      if (updateError) throw updateError

      toast({
        title: "Sucesso",
        description: "Foto de perfil atualizada!"
      })
      
      fetchProfile()
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da foto",
        variant: "destructive"
      })
    } finally {
      setUploadingAvatar(false)
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
      <div className="container py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Perfil não encontrado</h2>
          <p className="text-muted-foreground">Não foi possível carregar os dados do perfil.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container py-8 space-y-6 max-w-2xl mx-auto">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Meu Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
        </div>

        {/* Avatar Section */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <User className="h-5 w-5" />
              Foto de Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-lg">
                  {nome ? nome.charAt(0).toUpperCase() : 'M'}
                </AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-2 cursor-pointer transition-colors"
              >
                {uploadingAvatar ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploadingAvatar}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Clique na câmera para alterar sua foto
            </p>
          </CardContent>
        </Card>

        {/* Personal Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados Pessoais
            </CardTitle>
            <CardDescription>
              Atualize suas informações básicas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={telefone}
                onChange={(e) => setTelefone(maskPhone(e.target.value))}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={profile.cpf || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                CPF não pode ser alterado
              </p>
            </div>

            <Button 
              onClick={handleUpdateProfile} 
              disabled={saving}
              className="w-full"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>

        {/* Email Change */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Alterar Email
            </CardTitle>
            <CardDescription>
              Para alterar seu email, confirme sua senha atual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-email">Email Atual</Label>
              <Input
                id="current-email"
                value={email}
                disabled
                className="bg-muted"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="new-email">Novo Email</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="novo@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-password">Senha Atual</Label>
              <Input
                id="email-password"
                type="password"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                placeholder="Digite sua senha atual"
              />
            </div>

            <Button 
              onClick={handleEmailChange} 
              disabled={saving || !newEmail || !emailPassword}
              className="w-full"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Alterar Email
            </Button>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Alterar Senha
            </CardTitle>
            <CardDescription>
              Digite sua senha atual e escolha uma nova senha
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha Atual</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme a nova senha"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              onClick={handlePasswordChange} 
              disabled={saving || !currentPassword || !newPassword || !confirmPassword}
              className="w-full"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Alterar Senha
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Perfil
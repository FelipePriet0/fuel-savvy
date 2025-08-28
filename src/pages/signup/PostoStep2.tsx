import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stepper } from '@/components/Stepper';
import { useSignup } from '@/contexts/SignupContext';
import { validatePassword, maskPhone } from '@/lib/validation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const BANDEIRAS = [
  'Petrobras',
  'Shell',
  'Ipiranga',
  'Alesat',
  'Raízen',
  'Sem bandeira',
  'Outra'
];

export default function PostoStep2() {
  const navigate = useNavigate();
  const { postoData, setPostoData, resetContext, prevStep } = useSignup();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [customBandeira, setCustomBandeira] = useState('');

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;
    
    if (field === 'responsavel_telefone') {
      processedValue = maskPhone(value);
    }
    
    setPostoData({ [field]: processedValue });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBandeiraChange = (value: string) => {
    if (value === 'Outra') {
      setPostoData({ bandeira: '' });
    } else {
      setPostoData({ bandeira: value });
      setCustomBandeira('');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!postoData.bandeira && customBandeira.trim() === '') {
      newErrors.bandeira = 'Tipo de bandeira é obrigatório';
    }

    if (!postoData.responsavel_nome?.trim()) {
      newErrors.responsavel_nome = 'Nome do responsável é obrigatório';
    }

    if (!postoData.responsavel_telefone) {
      newErrors.responsavel_telefone = 'Telefone do responsável é obrigatório';
    }

    if (!postoData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else {
      const passwordValidation = validatePassword(postoData.senha);
      if (!passwordValidation.isValid) {
        newErrors.senha = passwordValidation.errors.join(', ');
      }
    }

    if (!postoData.confirmarSenha) {
      newErrors.confirmarSenha = 'Confirmação de senha é obrigatória';
    } else if (postoData.senha !== postoData.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const finalBandeira = customBandeira.trim() || postoData.bandeira;
      
      const { error } = await supabase.auth.signUp({
        email: postoData.email,
        password: postoData.senha!,
        options: {
          data: {
            user_type: 'posto',
            cnpj: postoData.cnpj,
            nome_fantasia: postoData.nome_fantasia,
            telefone: postoData.telefone,
            endereco: postoData.endereco,
            bandeira: finalBandeira,
            responsavel_nome: postoData.responsavel_nome,
            responsavel_telefone: postoData.responsavel_telefone,
          }
        }
      });

      if (error) throw error;

      toast.success('Cadastro realizado com sucesso!');
      resetContext();
      navigate('/');
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast.error(error.message || 'Erro ao realizar cadastro');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    prevStep();
    navigate('/signup/step1');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="mr-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Finalizar Cadastro</h1>
            <p className="text-sm text-muted-foreground">Detalhes finais</p>
          </div>
        </div>

        {/* Stepper */}
        <Stepper steps={['Dados Básicos', 'Detalhes']} currentStep={2} />

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Bandeira */}
            <div>
              <Label htmlFor="bandeira">Tipo de bandeira</Label>
              <Select
                value={postoData.bandeira || (customBandeira ? 'Outra' : '')}
                onValueChange={handleBandeiraChange}
              >
                <SelectTrigger className={errors.bandeira ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Selecione a bandeira" />
                </SelectTrigger>
                <SelectContent>
                  {BANDEIRAS.map((bandeira) => (
                    <SelectItem key={bandeira} value={bandeira}>
                      {bandeira}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {(postoData.bandeira === '' && customBandeira !== '') && (
                <Input
                  className="mt-2"
                  placeholder="Digite o nome da bandeira"
                  value={customBandeira}
                  onChange={(e) => setCustomBandeira(e.target.value)}
                />
              )}
              
              {errors.bandeira && (
                <p className="text-sm text-destructive mt-1">{errors.bandeira}</p>
              )}
            </div>

            {/* Responsável Nome */}
            <div>
              <Label htmlFor="responsavel_nome">Responsável (nome)</Label>
              <Input
                id="responsavel_nome"
                type="text"
                value={postoData.responsavel_nome || ''}
                onChange={(e) => handleInputChange('responsavel_nome', e.target.value)}
                placeholder="Nome do responsável"
                className={errors.responsavel_nome ? 'border-destructive' : ''}
              />
              {errors.responsavel_nome && (
                <p className="text-sm text-destructive mt-1">{errors.responsavel_nome}</p>
              )}
            </div>

            {/* Responsável Telefone */}
            <div>
              <Label htmlFor="responsavel_telefone">Responsável (celular)</Label>
              <Input
                id="responsavel_telefone"
                type="text"
                value={postoData.responsavel_telefone || ''}
                onChange={(e) => handleInputChange('responsavel_telefone', e.target.value)}
                placeholder="(11) 99999-9999"
                maxLength={15}
                className={errors.responsavel_telefone ? 'border-destructive' : ''}
              />
              {errors.responsavel_telefone && (
                <p className="text-sm text-destructive mt-1">{errors.responsavel_telefone}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <Label htmlFor="senha">Criar senha</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  value={postoData.senha || ''}
                  onChange={(e) => handleInputChange('senha', e.target.value)}
                  placeholder="Sua senha"
                  className={errors.senha ? 'border-destructive pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.senha && (
                <p className="text-sm text-destructive mt-1">{errors.senha}</p>
              )}
            </div>

            {/* Confirmar Senha */}
            <div>
              <Label htmlFor="confirmarSenha">Confirmar senha</Label>
              <div className="relative">
                <Input
                  id="confirmarSenha"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={postoData.confirmarSenha || ''}
                  onChange={(e) => handleInputChange('confirmarSenha', e.target.value)}
                  placeholder="Confirme sua senha"
                  className={errors.confirmarSenha ? 'border-destructive pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmarSenha && (
                <p className="text-sm text-destructive mt-1">{errors.confirmarSenha}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Finalizar Cadastro'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
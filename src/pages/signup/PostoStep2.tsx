import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stepper } from '@/components/Stepper';
import { useSignup } from '@/contexts/SignupContext';
import { validatePassword, maskPhone, maskCEP, validateCEP } from '@/lib/validation';
import { PasswordValidationFeedback } from '@/components/PasswordValidationFeedback';
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
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [customBandeira, setCustomBandeira] = useState('');
  const [isOutraBandeira, setIsOutraBandeira] = useState(false);

  const fetchAddressByCEP = async (cep: string) => {
    try {
      const cleanCEP = cep.replace(/\D/g, '');
      if (cleanCEP.length !== 8) return;

      setLoadingCEP(true);
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error('CEP não encontrado');
        return;
      }

      // Só preenche campos vazios
      const updates: any = {};
      if (!postoData.rua) updates.rua = data.logradouro;
      if (!postoData.bairro) updates.bairro = data.bairro;
      if (!postoData.cidade) updates.cidade = data.localidade;

      if (Object.keys(updates).length > 0) {
        setPostoData(updates);
        toast.success('Endereço encontrado!');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast.error('Erro ao buscar CEP');
    } finally {
      setLoadingCEP(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;
    
    if (field === 'cep') {
      processedValue = maskCEP(value);
      
      // Busca automática quando CEP estiver completo
      const cleanCEP = processedValue.replace(/\D/g, '');
      if (cleanCEP.length === 8) {
        fetchAddressByCEP(processedValue);
      }
    }
    
    setPostoData({ [field]: processedValue });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBandeiraChange = (value: string) => {
    if (value === 'Outra') {
      setIsOutraBandeira(true);
      setPostoData({ bandeira: '' });
      setCustomBandeira('');
      // Clear bandeira error when switching to "Outra"
      if (errors.bandeira) {
        setErrors(prev => ({ ...prev, bandeira: '' }));
      }
    } else {
      setIsOutraBandeira(false);
      setPostoData({ bandeira: value });
      setCustomBandeira('');
      // Clear bandeira error when selecting a valid option
      if (errors.bandeira) {
        setErrors(prev => ({ ...prev, bandeira: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validação do endereço
    if (!postoData.cep) {
      newErrors.cep = 'CEP é obrigatório';
    } else if (!validateCEP(postoData.cep)) {
      newErrors.cep = 'CEP inválido';
    }

    if (!postoData.rua?.trim()) {
      newErrors.rua = 'Rua é obrigatória';
    }

    if (!postoData.numero?.trim()) {
      newErrors.numero = 'Número é obrigatório';
    }

    if (!postoData.bairro?.trim()) {
      newErrors.bairro = 'Bairro é obrigatório';
    }

    if (!postoData.cidade?.trim()) {
      newErrors.cidade = 'Cidade é obrigatória';
    }

    if (!postoData.bandeira && !customBandeira.trim()) {
      newErrors.bandeira = 'Tipo de bandeira é obrigatório';
    }
    
    if (isOutraBandeira && !customBandeira.trim()) {
      newErrors.bandeira = 'Digite o nome da bandeira personalizada';
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
      const finalBandeira = isOutraBandeira ? customBandeira.trim() : postoData.bandeira;
      
      // Concatenar endereço completo
      const enderecoCompleto = `${postoData.rua}, ${postoData.numero}, ${postoData.bairro}, ${postoData.cidade} - CEP: ${postoData.cep}`;

      const { error } = await supabase.auth.signUp({
        email: postoData.email,
        password: postoData.senha!,
        options: {
          data: {
            user_type: 'posto',
            cnpj: postoData.cnpj,
            nome_fantasia: postoData.nome_fantasia,
            telefone: postoData.telefone,
            endereco: enderecoCompleto,
            bandeira: finalBandeira,
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seção Endereço */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Endereço</h3>
              
              {/* CEP */}
              <div>
                <Label htmlFor="cep">CEP</Label>
                <div className="relative">
                  <Input
                    id="cep"
                    type="text"
                    value={postoData.cep || ''}
                    onChange={(e) => handleInputChange('cep', e.target.value)}
                    placeholder="00000-000"
                    maxLength={9}
                    className={errors.cep ? 'border-destructive pr-10' : 'pr-10'}
                    disabled={loadingCEP}
                  />
                  {loadingCEP && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                {errors.cep && (
                  <p className="text-sm text-destructive mt-1">{errors.cep}</p>
                )}
              </div>

              {/* Rua e Número */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rua">Rua</Label>
                  <Input
                    id="rua"
                    type="text"
                    value={postoData.rua || ''}
                    onChange={(e) => handleInputChange('rua', e.target.value)}
                    placeholder="Nome da rua"
                    className={errors.rua ? 'border-destructive' : ''}
                  />
                  {errors.rua && (
                    <p className="text-sm text-destructive mt-1">{errors.rua}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="numero">Nº</Label>
                  <Input
                    id="numero"
                    type="text"
                    value={postoData.numero || ''}
                    onChange={(e) => handleInputChange('numero', e.target.value)}
                    placeholder="123"
                    className={errors.numero ? 'border-destructive' : ''}
                  />
                  {errors.numero && (
                    <p className="text-sm text-destructive mt-1">{errors.numero}</p>
                  )}
                </div>
              </div>

              {/* Bairro e Cidade */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    type="text"
                    value={postoData.bairro || ''}
                    onChange={(e) => handleInputChange('bairro', e.target.value)}
                    placeholder="Nome do bairro"
                    className={errors.bairro ? 'border-destructive' : ''}
                  />
                  {errors.bairro && (
                    <p className="text-sm text-destructive mt-1">{errors.bairro}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    type="text"
                    value={postoData.cidade || ''}
                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                    placeholder="Nome da cidade"
                    className={errors.cidade ? 'border-destructive' : ''}
                  />
                  {errors.cidade && (
                    <p className="text-sm text-destructive mt-1">{errors.cidade}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Seção Detalhes do Posto */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Detalhes do Posto</h3>
              
              {/* Bandeira */}
            <div>
              <Label htmlFor="bandeira">Tipo de bandeira</Label>
              <Select
                value={isOutraBandeira ? 'Outra' : postoData.bandeira || ''}
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
              
              {isOutraBandeira && (
                <Input
                  className="mt-2"
                  placeholder="Digite o nome da bandeira personalizada"
                  value={customBandeira}
                  onChange={(e) => {
                    setCustomBandeira(e.target.value);
                    // Clear error when typing
                    if (errors.bandeira) {
                      setErrors(prev => ({ ...prev, bandeira: '' }));
                    }
                  }}
                  autoFocus
                />
              )}
              
              {errors.bandeira && (
                <p className="text-sm text-destructive mt-1">{errors.bandeira}</p>
              )}
            </div>

            </div>

            {/* Seção Senha */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Criar Senha</h3>
              
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
              <PasswordValidationFeedback password={postoData.senha || ''} />
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
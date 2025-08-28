import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useSignup } from '@/contexts/SignupContext';
import { validateCPF, validateEmail, validatePassword, maskCPF, maskPhone, validateDriverData } from '@/lib/validation';
import { PasswordValidationFeedback } from '@/components/PasswordValidationFeedback';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function MotoristaForm() {
  const navigate = useNavigate();
  const { motoristaData, setMotoristaData, resetContext, profileType } = useSignup();

  // Redirect if not motorista profile
  React.useEffect(() => {
    if (profileType === 'posto') {
      navigate('/signup/step1/posto');
    } else if (!profileType) {
      navigate('/signup');
    }
  }, [profileType, navigate]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;
    
    if (field === 'cpf') {
      processedValue = maskCPF(value);
    } else if (field === 'telefone') {
      processedValue = maskPhone(value);
    }
    
    setMotoristaData({ [field]: processedValue });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!motoristaData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!motoristaData.cpf) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!validateCPF(motoristaData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    if (!motoristaData.telefone) {
      newErrors.telefone = 'Telefone é obrigatório';
    }

    if (!motoristaData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(motoristaData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!motoristaData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else {
      const passwordValidation = validatePassword(motoristaData.senha);
      if (!passwordValidation.isValid) {
        newErrors.senha = passwordValidation.errors.join(', ');
      }
    }

    if (!motoristaData.confirmarSenha) {
      newErrors.confirmarSenha = 'Confirmação de senha é obrigatória';
    } else if (motoristaData.senha !== motoristaData.confirmarSenha) {
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
      // Validação consolidada de duplicatas
      const validationResult = await validateDriverData(
        motoristaData.email,
        motoristaData.cpf,
        motoristaData.telefone
      );

      if (!validationResult.isValid) {
        toast.error(validationResult.message || 'Dados já existem no sistema');
        if (validationResult.field) {
          setErrors(prev => ({ 
            ...prev, 
            [validationResult.field!]: validationResult.message! 
          }));
        }
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email: motoristaData.email,
        password: motoristaData.senha,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            user_type: 'motorista',
            nome: motoristaData.nome,
            cpf: motoristaData.cpf,
            telefone: motoristaData.telefone,
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

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/signup')}
            className="mr-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dados Básicos</h1>
            <p className="text-sm text-muted-foreground">Preencha seus dados pessoais</p>
          </div>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div>
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                type="text"
                value={motoristaData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Seu nome completo"
                className={errors.nome ? 'border-destructive' : ''}
              />
              {errors.nome && (
                <p className="text-sm text-destructive mt-1">{errors.nome}</p>
              )}
            </div>

            {/* CPF */}
            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                type="text"
                value={motoristaData.cpf}
                onChange={(e) => handleInputChange('cpf', e.target.value)}
                placeholder="000.000.000-00"
                maxLength={14}
                className={errors.cpf ? 'border-destructive' : ''}
              />
              {errors.cpf && (
                <p className="text-sm text-destructive mt-1">{errors.cpf}</p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <Label htmlFor="telefone">Celular</Label>
              <Input
                id="telefone"
                type="text"
                value={motoristaData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                placeholder="(11) 99999-9999"
                maxLength={15}
                className={errors.telefone ? 'border-destructive' : ''}
              />
              {errors.telefone && (
                <p className="text-sm text-destructive mt-1">{errors.telefone}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={motoristaData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="seu@email.com"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <Label htmlFor="senha">Criar senha</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  value={motoristaData.senha}
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
              <PasswordValidationFeedback password={motoristaData.senha} />
            </div>

            {/* Confirmar Senha */}
            <div>
              <Label htmlFor="confirmarSenha">Confirmar senha</Label>
              <div className="relative">
                <Input
                  id="confirmarSenha"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={motoristaData.confirmarSenha}
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
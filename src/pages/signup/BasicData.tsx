import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, Lock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stepper } from '@/components/Stepper';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useNavigate } from 'react-router-dom';
import { validateEmail, validatePhone, validatePassword, maskPhone } from '@/lib/validation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const steps = [
  { id: 0, title: 'Perfil' },
  { id: 1, title: 'Dados Básicos' },
  { id: 2, title: 'Dados Específicos' },
  { id: 3, title: 'Localização' }
];

export const BasicData: React.FC = () => {
  const { state, updateBasicData, nextStep, prevStep } = useOnboarding();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    if (field === 'phone') {
      value = maskPhone(value);
    }
    updateBasicData({ [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!state.basicData.fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
    }

    if (!state.basicData.email && !state.basicData.phone) {
      newErrors.email = 'E-mail ou telefone é obrigatório';
      newErrors.phone = 'E-mail ou telefone é obrigatório';
    } else {
      if (state.basicData.email && !validateEmail(state.basicData.email)) {
        newErrors.email = 'E-mail inválido';
      }
      if (state.basicData.phone && !validatePhone(state.basicData.phone)) {
        newErrors.phone = 'Telefone inválido';
      }
    }

    if (!state.basicData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (!validatePassword(state.basicData.password)) {
      newErrors.password = 'Senha deve ter no mínimo 8 caracteres, 1 letra maiúscula e 1 número';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: state.basicData.email || `${state.basicData.phone}@temp.zup.com`,
        password: state.basicData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: state.basicData.fullName,
            phone: state.basicData.phone,
            role: state.role
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Este e-mail já está cadastrado. Tente fazer login.');
        } else {
          toast.error('Erro no cadastro: ' + error.message);
        }
        return;
      }

      if (data.user) {
        // Create profile in profiles_new table
        const { error: profileError } = await supabase
          .from('profiles_new')
          .insert({
            id: data.user.id,
            full_name: state.basicData.fullName,
            email: state.basicData.email || null,
            phone: state.basicData.phone || null,
            role: state.role!
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          toast.error('Erro ao criar perfil');
          return;
        }

        nextStep();
        
        // Navigate to role-specific step
        if (state.role === 'driver') {
          navigate('/signup/driver');
        } else {
          navigate('/signup/station');
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Erro inesperado no cadastro');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    prevStep();
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Stepper 
          steps={state.role === 'driver' ? steps.slice(0, 3) : steps} 
          currentStep={state.currentStep} 
          className="mb-8" 
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Dados Básicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                <User className="w-4 h-4 inline mr-2" />
                Nome Completo *
              </Label>
              <Input
                id="fullName"
                value={state.basicData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Seu nome completo"
                className={errors.fullName ? 'border-red-500' : ''}
              />
              {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="w-4 h-4 inline mr-2" />
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={state.basicData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="seu@email.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                <Phone className="w-4 h-4 inline mr-2" />
                Telefone
              </Label>
              <Input
                id="phone"
                value={state.basicData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                <Lock className="w-4 h-4 inline mr-2" />
                Criar Senha *
              </Label>
              <Input
                id="password"
                type="password"
                value={state.basicData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            <p className="text-xs text-muted-foreground">
              * E-mail ou telefone é obrigatório
            </p>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button 
                onClick={handleContinue} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Criando conta...' : 'Continuar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { ArrowLeft, CreditCard, MapPin, Car, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stepper } from '@/components/Stepper';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useNavigate } from 'react-router-dom';
import { validateCPF, validateLicensePlate, maskCPF, maskLicensePlate } from '@/lib/validation';
import { brazilianStates, paymentMethods } from '@/lib/maps';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const steps = [
  { id: 0, title: 'Perfil' },
  { id: 1, title: 'Dados Básicos' },
  { id: 2, title: 'Dados Específicos' }
];

export const DriverData: React.FC = () => {
  const { state, updateDriverData, nextStep, prevStep } = useOnboarding();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    let maskedValue = value;
    
    if (field === 'cpf') {
      maskedValue = maskCPF(value);
    } else if (field === 'licensePlate') {
      maskedValue = maskLicensePlate(value);
    }
    
    updateDriverData({ [field]: maskedValue });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!state.driverData.cpf) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!validateCPF(state.driverData.cpf)) {
      newErrors.cpf = 'CPF inválido. Confira os números.';
    }

    if (state.driverData.licensePlate && !validateLicensePlate(state.driverData.licensePlate)) {
      newErrors.licensePlate = 'Formato de placa inválido';
    }

    if (!state.driverData.city) {
      newErrors.city = 'Cidade é obrigatória';
    }

    if (!state.driverData.state) {
      newErrors.state = 'Estado é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        toast.error('Usuário não encontrado');
        navigate('/signup');
        return;
      }

      // Create driver-specific data
      const { error } = await supabase
        .from('drivers')
        .insert({
          id: user.user.id,
          cpf: state.driverData.cpf.replace(/\D/g, ''),
          license_plate: state.driverData.licensePlate || null,
          city: state.driverData.city,
          state: state.driverData.state,
          payment_method: state.driverData.paymentMethod || null
        });

      if (error) {
        if (error.message.includes('duplicate key')) {
          toast.error('CPF já cadastrado no sistema');
        } else {
          toast.error('Erro ao salvar dados: ' + error.message);
        }
        return;
      }

      toast.success('Cadastro realizado com sucesso!');
      navigate('/onboarding/driver');
    } catch (error) {
      console.error('Driver data error:', error);
      toast.error('Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    prevStep();
    navigate('/signup/basic');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Stepper steps={steps} currentStep={state.currentStep} className="mb-8" />

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Dados do Motorista</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">
                <User className="w-4 h-4 inline mr-2" />
                CPF *
              </Label>
              <Input
                id="cpf"
                value={state.driverData.cpf}
                onChange={(e) => handleInputChange('cpf', e.target.value)}
                placeholder="000.000.000-00"
                maxLength={14}
                className={errors.cpf ? 'border-red-500' : ''}
              />
              {errors.cpf && <p className="text-red-500 text-sm">{errors.cpf}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="licensePlate">
                <Car className="w-4 h-4 inline mr-2" />
                Placa do Veículo
              </Label>
              <Input
                id="licensePlate"
                value={state.driverData.licensePlate}
                onChange={(e) => handleInputChange('licensePlate', e.target.value)}
                placeholder="ABC-1234 ou ABC-1A23"
                maxLength={8}
                className={errors.licensePlate ? 'border-red-500' : ''}
              />
              {errors.licensePlate && <p className="text-red-500 text-sm">{errors.licensePlate}</p>}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="city">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Cidade *
                </Label>
                <Input
                  id="city"
                  value={state.driverData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Sua cidade"
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado *</Label>
                <Select 
                  value={state.driverData.state} 
                  onValueChange={(value) => handleInputChange('state', value)}
                >
                  <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {brazilianStates.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">
                <CreditCard className="w-4 h-4 inline mr-2" />
                Forma de Pagamento Preferida
              </Label>
              <Select 
                value={state.driverData.paymentMethod} 
                onValueChange={(value) => handleInputChange('paymentMethod', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                {loading ? 'Finalizando...' : 'Finalizar Cadastro'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
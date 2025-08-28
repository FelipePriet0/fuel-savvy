import React, { useState } from 'react';
import { ArrowLeft, Building, User, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stepper } from '@/components/Stepper';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useNavigate } from 'react-router-dom';
import { validateCNPJ, validatePhone, maskCNPJ, maskPhone } from '@/lib/validation';
import { stationBrands } from '@/lib/maps';

const steps = [
  { id: 0, title: 'Perfil' },
  { id: 1, title: 'Dados Básicos' },
  { id: 2, title: 'Dados do Posto' },
  { id: 3, title: 'Localização' }
];

export const StationData: React.FC = () => {
  const { state, updateStationData, nextStep, prevStep } = useOnboarding();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    let maskedValue = value;
    
    if (field === 'cnpj') {
      maskedValue = maskCNPJ(value);
    } else if (field === 'managerPhone') {
      maskedValue = maskPhone(value);
    }
    
    updateStationData({ [field]: maskedValue });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!state.stationData.cnpj) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else if (!validateCNPJ(state.stationData.cnpj)) {
      newErrors.cnpj = 'CNPJ inválido';
    }

    if (!state.stationData.stationName.trim()) {
      newErrors.stationName = 'Nome do posto é obrigatório';
    }

    if (!state.stationData.brand) {
      newErrors.brand = 'Tipo de bandeira é obrigatório';
    }

    if (!state.stationData.managerName.trim()) {
      newErrors.managerName = 'Nome do responsável é obrigatório';
    }

    if (!state.stationData.managerPhone) {
      newErrors.managerPhone = 'Telefone do responsável é obrigatório';
    } else if (!validatePhone(state.stationData.managerPhone)) {
      newErrors.managerPhone = 'Telefone inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateForm()) return;
    
    nextStep();
    navigate('/signup/location');
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
            <CardTitle className="text-center">Dados do Posto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cnpj">
                <Building className="w-4 h-4 inline mr-2" />
                CNPJ *
              </Label>
              <Input
                id="cnpj"
                value={state.stationData.cnpj}
                onChange={(e) => handleInputChange('cnpj', e.target.value)}
                placeholder="00.000.000/0000-00"
                maxLength={18}
                className={errors.cnpj ? 'border-red-500' : ''}
              />
              {errors.cnpj && <p className="text-red-500 text-sm">{errors.cnpj}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stationName">
                <Building className="w-4 h-4 inline mr-2" />
                Nome do Posto *
              </Label>
              <Input
                id="stationName"
                value={state.stationData.stationName}
                onChange={(e) => handleInputChange('stationName', e.target.value)}
                placeholder="Posto da Esquina"
                className={errors.stationName ? 'border-red-500' : ''}
              />
              {errors.stationName && <p className="text-red-500 text-sm">{errors.stationName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">
                <Building className="w-4 h-4 inline mr-2" />
                Tipo de Bandeira *
              </Label>
              <Select 
                value={state.stationData.brand} 
                onValueChange={(value) => handleInputChange('brand', value)}
              >
                <SelectTrigger className={errors.brand ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione a bandeira" />
                </SelectTrigger>
                <SelectContent>
                  {stationBrands.map((brand) => (
                    <SelectItem key={brand.value} value={brand.value}>
                      {brand.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.brand && <p className="text-red-500 text-sm">{errors.brand}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="managerName">
                <User className="w-4 h-4 inline mr-2" />
                Responsável *
              </Label>
              <Input
                id="managerName"
                value={state.stationData.managerName}
                onChange={(e) => handleInputChange('managerName', e.target.value)}
                placeholder="Nome do responsável"
                className={errors.managerName ? 'border-red-500' : ''}
              />
              {errors.managerName && <p className="text-red-500 text-sm">{errors.managerName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="managerPhone">
                <Phone className="w-4 h-4 inline mr-2" />
                Celular do Responsável *
              </Label>
              <Input
                id="managerPhone"
                value={state.stationData.managerPhone}
                onChange={(e) => handleInputChange('managerPhone', e.target.value)}
                placeholder="(11) 99999-9999"
                className={errors.managerPhone ? 'border-red-500' : ''}
              />
              {errors.managerPhone && <p className="text-red-500 text-sm">{errors.managerPhone}</p>}
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button onClick={handleContinue} className="flex-1">
                Continuar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
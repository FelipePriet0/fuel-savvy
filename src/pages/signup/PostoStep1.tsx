import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Stepper } from '@/components/Stepper';
import { useSignup } from '@/contexts/SignupContext';
import { validateCNPJ, validateEmail, maskCNPJ, maskPhone } from '@/lib/validation';

export default function PostoStep1() {
  const navigate = useNavigate();
  const { postoData, setPostoData, nextStep, profileType } = useSignup();

  // Redirect if not posto profile
  React.useEffect(() => {
    if (profileType === 'motorista') {
      navigate('/signup/step1');
    } else if (!profileType) {
      navigate('/signup');
    }
  }, [profileType, navigate]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;
    
    if (field === 'cnpj') {
      processedValue = maskCNPJ(value);
    } else if (field === 'telefone') {
      processedValue = maskPhone(value);
    }
    
    setPostoData({ [field]: processedValue });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!postoData.cnpj) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else if (!validateCNPJ(postoData.cnpj)) {
      newErrors.cnpj = 'CNPJ inválido';
    }

    if (!postoData.nome_fantasia.trim()) {
      newErrors.nome_fantasia = 'Nome do posto é obrigatório';
    }

    if (!postoData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(postoData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!postoData.telefone) {
      newErrors.telefone = 'Telefone é obrigatório';
    }

    if (!postoData.endereco.trim()) {
      newErrors.endereco = 'Endereço é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    nextStep();
    navigate('/signup/step2');
  };

  const handleLocationClick = () => {
    // TODO: Implementar seletor de localização com mapa
    console.log('Abrir seletor de localização');
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
            <h1 className="text-2xl font-bold text-foreground">Dados do Posto</h1>
            <p className="text-sm text-muted-foreground">Informações básicas</p>
          </div>
        </div>

        {/* Stepper */}
        <Stepper steps={['Dados Básicos', 'Detalhes']} currentStep={1} />

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* CNPJ */}
            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                type="text"
                value={postoData.cnpj}
                onChange={(e) => handleInputChange('cnpj', e.target.value)}
                placeholder="00.000.000/0000-00"
                maxLength={18}
                className={errors.cnpj ? 'border-destructive' : ''}
              />
              {errors.cnpj && (
                <p className="text-sm text-destructive mt-1">{errors.cnpj}</p>
              )}
            </div>

            {/* Nome do Posto */}
            <div>
              <Label htmlFor="nome_fantasia">Nome do Posto</Label>
              <Input
                id="nome_fantasia"
                type="text"
                value={postoData.nome_fantasia}
                onChange={(e) => handleInputChange('nome_fantasia', e.target.value)}
                placeholder="Nome fantasia do seu posto"
                className={errors.nome_fantasia ? 'border-destructive' : ''}
              />
              {errors.nome_fantasia && (
                <p className="text-sm text-destructive mt-1">{errors.nome_fantasia}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={postoData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contato@posto.com"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <Label htmlFor="telefone">Telefone do Posto</Label>
              <Input
                id="telefone"
                type="text"
                value={postoData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                placeholder="(11) 3333-4444"
                maxLength={15}
                className={errors.telefone ? 'border-destructive' : ''}
              />
              {errors.telefone && (
                <p className="text-sm text-destructive mt-1">{errors.telefone}</p>
              )}
            </div>

            {/* Endereço */}
            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <div className="relative">
                <Input
                  id="endereco"
                  type="text"
                  value={postoData.endereco}
                  onChange={(e) => handleInputChange('endereco', e.target.value)}
                  placeholder="Rua, número, bairro, cidade"
                  className={errors.endereco ? 'border-destructive pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={handleLocationClick}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                >
                  <MapPin className="w-4 h-4" />
                </button>
              </div>
              {errors.endereco && (
                <p className="text-sm text-destructive mt-1">{errors.endereco}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Clique no ícone do mapa para selecionar a localização exata
              </p>
            </div>

            <Button type="submit" className="w-full">
              Continuar
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
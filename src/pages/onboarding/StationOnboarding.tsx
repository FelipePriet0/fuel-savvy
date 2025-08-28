import React, { useState } from 'react';
import { Plus, Users, BarChart3, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const onboardingSteps = [
  {
    icon: Plus,
    title: "Crie cupons de combustível em segundos",
    description: "Interface simples e intuitiva para criar cupons atrativos para seus clientes."
  },
  {
    icon: Users,
    title: "Atraia mais motoristas para o seu posto",
    description: "Aumente o fluxo de clientes oferecendo descontos competitivos e promocões especiais."
  },
  {
    icon: BarChart3,
    title: "Acompanhe resultados em tempo real",
    description: "Dashboard completo com métricas de cupons, vendas e crescimento do seu negócio."
  }
];

export const StationOnboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/posto/novo');
    }
  };

  const handleSkip = () => {
    navigate('/posto');
  };

  const currentStepData = onboardingSteps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon className="w-10 h-10 text-primary" />
              </div>
              
              <h1 className="text-2xl font-bold text-foreground mb-4">
                {currentStepData.title}
              </h1>
              
              <p className="text-muted-foreground text-lg leading-relaxed">
                {currentStepData.description}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center space-x-2 mb-6">
                {onboardingSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              <Button 
                onClick={handleNext} 
                size="lg" 
                className="w-full"
              >
                {currentStep === onboardingSteps.length - 1 ? (
                  <>Criar meu primeiro cupom</>
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <Button 
                variant="ghost" 
                onClick={handleSkip}
                className="w-full"
              >
                Pular introdução
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Seus dados estão em análise. Você poderá criar cupons assim que aprovado.
          </p>
        </div>
      </div>
    </div>
  );
};
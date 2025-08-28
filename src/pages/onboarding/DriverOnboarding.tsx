import React, { useState } from 'react';
import { Car, Search, DollarSign, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const onboardingSteps = [
  {
    icon: Search,
    title: "Veja os postos próximos com cupons",
    description: "Encontre facilmente postos de combustível perto de você que oferecem cupons de desconto."
  },
  {
    icon: Car,
    title: "Resgate seu cupom com 1 clique",
    description: "Process simples e rápido para resgatar seus cupons diretamente pelo app."
  },
  {
    icon: DollarSign,
    title: "Abasteça pagando menos, sempre",
    description: "Economize em cada abastecimento com os melhores descontos da região."
  }
];

export const DriverOnboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/');
    }
  };

  const handleSkip = () => {
    navigate('/');
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
                  <>Ver cupons perto de mim</>
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
      </div>
    </div>
  );
};
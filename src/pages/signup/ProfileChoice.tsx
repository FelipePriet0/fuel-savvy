import React from 'react';
import { Car, Store } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOnboarding, UserRole } from '@/contexts/OnboardingContext';
import { useNavigate } from 'react-router-dom';

export const ProfileChoice: React.FC = () => {
  const { updateRole } = useOnboarding();
  const navigate = useNavigate();

  const handleRoleSelection = (role: UserRole) => {
    updateRole(role);
    navigate('/signup/basic');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Como você deseja usar a Zup?
          </h1>
          <p className="text-muted-foreground">
            Escolha o perfil que melhor se adequa a você
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 group"
            onClick={() => handleRoleSelection('driver')}
          >
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Car className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Sou Motorista
                </h2>
                <p className="text-muted-foreground">
                  Quero encontrar cupons de desconto para abastecer com economia
                </p>
              </div>
              <Button 
                size="lg" 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoleSelection('driver');
                }}
              >
                Continuar como Motorista
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 group"
            onClick={() => handleRoleSelection('station')}
          >
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Store className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Sou Posto
                </h2>
                <p className="text-muted-foreground">
                  Quero criar cupons para atrair mais clientes ao meu posto
                </p>
              </div>
              <Button 
                size="lg" 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoleSelection('station');
                }}
              >
                Continuar como Posto
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Button 
              variant="link" 
              className="p-0 h-auto text-primary"
              onClick={() => navigate('/entrar')}
            >
              Entre aqui
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};
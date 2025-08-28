import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Building2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useSignup, ProfileType } from '@/contexts/SignupContext';
export default function ProfileChoice() {
  const navigate = useNavigate();
  const {
    setProfileType
  } = useSignup();
  const handleProfileSelect = (type: ProfileType) => {
    setProfileType(type);
    if (type === 'motorista') {
      navigate('/signup/step1');
    } else {
      navigate('/signup/step1/posto');
    }
  };
  return <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Como você deseja usar a Zup?
          </h1>
          <p className="text-muted-foreground">
            Escolha o tipo de perfil para personalizar sua experiência
          </p>
        </div>

        {/* Profile Cards */}
        <div className="space-y-4">
          <Card className="p-6 cursor-pointer border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-glow" onClick={() => handleProfileSelect('motorista')}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Car className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  🚗 Sou Motorista
                </h3>
                
              </div>
            </div>
          </Card>

          <Card className="p-6 cursor-pointer border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-glow" onClick={() => handleProfileSelect('posto')}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  🏪 Sou Posto
                </h3>
                
              </div>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <button onClick={() => navigate('/entrar')} className="text-primary hover:underline font-medium">
              Entrar
            </button>
          </p>
        </div>
      </div>
    </div>;
}
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, Key, Mail, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminResetPasswordProps {
  trigger?: React.ReactNode;
}

export const AdminResetPassword = ({ trigger }: AdminResetPasswordProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      toast.error('Por favor, informe o email do usuário');
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('admin-reset-password', {
        body: { email }
      });

      if (error) {
        console.error('Erro na função:', error);
        toast.error(error.message || 'Erro ao resetar senha');
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      toast.success('Email de reset de senha enviado com sucesso!');
      setEmail('');
      setIsOpen(false);
      
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      toast.error('Erro ao resetar senha do usuário');
    } finally {
      setIsLoading(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" className="gap-2">
      <Key className="w-4 h-4" />
      Reset de Senha
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-destructive" />
            Reset Administrativo de Senha
          </DialogTitle>
          <DialogDescription>
            Esta ação enviará um email de reset de senha para o usuário especificado.
            Use apenas quando necessário para suporte ao cliente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-md border border-destructive/20">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <div className="text-sm text-destructive">
              <strong>Atenção:</strong> Esta ação será registrada nos logs de auditoria.
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email do Usuário
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleResetPassword}
            disabled={isLoading || !email}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading ? 'Enviando...' : 'Enviar Reset'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
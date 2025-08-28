import { useEffect, useState } from 'react';
import { Shield, Users, History, Key } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdminResetPassword } from '@/components/AdminResetPassword';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';

interface AdminLog {
  id: string;
  action: string;
  target_user_email: string;
  created_at: string;
  admin_user_id: string;
  details: any;
}

export const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
    loadLogs();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase.rpc('is_admin', { user_id: user.id });
      if (error) {
        console.error('Erro ao verificar status de admin:', error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(data || false);
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Erro ao carregar logs:', error);
        return;
      }

      setLogs(data || []);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Verificando permissões...</div>
      </div>
    );
  }

  if (isAdmin === false) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground">Ferramentas de suporte ao cliente</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Reset de Senha */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Reset de Senha
            </CardTitle>
            <CardDescription>
              Enviar email de reset de senha para usuários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminResetPassword />
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Usuários
            </CardTitle>
            <CardDescription>
              Informações sobre usuários cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Total: -</div>
            <p className="text-sm text-muted-foreground">
              Em desenvolvimento
            </p>
          </CardContent>
        </Card>

        {/* Logs Recentes */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Ações Recentes
            </CardTitle>
            <CardDescription>
              Últimas ações administrativas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadLogs}
              className="w-full mb-4"
            >
              Atualizar
            </Button>
            <div className="text-sm text-muted-foreground">
              {logs.length} ações registradas
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Detalhados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Log de Auditoria
          </CardTitle>
          <CardDescription>
            Histórico detalhado de ações administrativas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma ação registrada ainda
            </p>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      {log.action === 'reset_password' ? 'Reset de Senha' : log.action}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Email: {log.target_user_email}
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {new Date(log.created_at).toLocaleString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
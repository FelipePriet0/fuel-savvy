import { useEffect, useState } from 'react';
import { supabase, Cupom } from '@/lib/supabaseClient';
import CouponCard from '@/components/CouponCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search, Filter, Fuel, Wallet } from 'lucide-react';
interface CupomComPosto extends Cupom {
  posto?: {
    id: string;
    nome_fantasia: string;
    bandeira?: string;
    lat?: number;
    lng?: number;
  };
}

interface UserProfile {
  nome?: string;
  full_name?: string;
  total_savings?: number;
}

const Home = () => {
  const [cupons, setCupons] = useState<CupomComPosto[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCombustivel, setSelectedCombustivel] = useState<string>('todos');
  const [combustiveis, setCombustiveis] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Buscar perfil do usuário
        const { data: profile } = await supabase
          .from('profiles')
          .select('nome, full_name, total_savings')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    };

    const fetchCupons = async () => {
      try {
        const now = new Date().toISOString();
        const {
          data,
          error
        } = await supabase.from('cupons').select(`
            *,
            posto:postos(id, nome_fantasia, bandeira, lat, lng)
          `).eq('ativo', true).lte('validade_ini', now).gte('validade_fim', now).order('criado_em', {
          ascending: false
        });
        if (error) {
          console.error('Erro ao buscar cupons:', error);
        } else {
          setCupons(data || []);

          // Extrair combustíveis únicos para o filtro
          const uniqueCombustiveis = Array.from(new Set((data || []).map(cupom => cupom.combustivel))).sort();
          setCombustiveis(uniqueCombustiveis);
        }
      } catch (error) {
        console.error('Erro ao buscar cupons:', error);
      } finally {
        setLoading(false);
      }
    };

    Promise.all([fetchUserData(), fetchCupons()]);
  }, []);

  const filteredCupons = cupons.filter(cupom => {
    const matchesSearch = cupom.posto?.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase()) || cupom.combustivel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCombustivel = selectedCombustivel === 'todos' || cupom.combustivel === selectedCombustivel;
    return matchesSearch && matchesCombustivel;
  });

  const firstName = userProfile?.nome?.split(' ')[0] || userProfile?.full_name?.split(' ')[0] || 'Usuário';
  const totalSavings = userProfile?.total_savings || 0;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>;
  }

  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container py-6 space-y-6">
        {/* Headline 1: Olá, (Primeiro nome) */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Olá, {firstName}
          </h1>
          
          {/* SubHeadline */}
          <p className="text-lg text-muted-foreground">
            Veja o quanto você já economizou com a Zup
          </p>
        </div>

        {/* Card: Total economizado */}
        <Card className="bg-white border-2 border-black rounded-lg" style={{ boxShadow: '0px 6px 0px black' }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Economizado</p>
                <p className="text-3xl font-bold text-primary">
                  R$ {totalSavings.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Headline 2: Cupons Ativos */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            Cupons Ativos
          </h2>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Buscar por posto ou combustível..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCombustivel} onValueChange={setSelectedCombustivel}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {combustiveis.map(combustivel => <SelectItem key={combustivel} value={combustivel}>
                      {combustivel}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center">
            <Badge variant="outline" className="text-primary border-primary/30">
              {filteredCupons.length} cupons disponíveis
            </Badge>
          </div>
        </div>

        {/* Cards de cupons ativos */}
        {filteredCupons.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCupons.map(cupom => <CouponCard key={cupom.id} cupom={cupom} />)}
          </div> : <div className="text-center py-16">
            <Fuel className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum cupom encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedCombustivel !== 'todos' ? 'Tente ajustar os filtros de busca' : 'Não há cupons ativos no momento'}
            </p>
          </div>}
      </div>
    </div>;
};
export default Home;
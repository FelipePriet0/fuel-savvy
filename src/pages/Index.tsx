import { FuelCard } from '@/components/FuelCard'
import { ActionCard } from '@/components/ActionCard'
import { StationCard } from '@/components/StationCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Fuel, 
  Zap, 
  Truck, 
  TrendingUp, 
  Gift, 
  MapPin, 
  Users,
  Search,
  ArrowRight
} from 'lucide-react'

const Index = () => {
  const fuelTypes = [
    {
      title: "Gasolina",
      description: "Combustível mais popular para carros de passeio",
      icon: <Fuel className="w-8 h-8 text-primary" />,
      badge: "Mais Popular"
    },
    {
      title: "Etanol",
      description: "Opção sustentável e econômica",
      icon: <Zap className="w-8 h-8 text-primary" />,
      badge: "Eco-Friendly"
    },
    {
      title: "Diesel",
      description: "Ideal para veículos pesados e caminhões",
      icon: <Truck className="w-8 h-8 text-primary" />,
      badge: "Profissional"
    }
  ]

  const actions = [
    {
      title: "Tendências",
      subtitle: "Preços em alta",
      icon: <TrendingUp className="w-full h-full" />
    },
    {
      title: "Promoções",
      subtitle: "Ofertas especiais",
      icon: <Gift className="w-full h-full" />
    },
    {
      title: "Próximos",
      subtitle: "Postos perto de você",
      icon: <MapPin className="w-full h-full" />
    },
    {
      title: "Comunidade",
      subtitle: "Avaliações dos usuários",
      icon: <Users className="w-full h-full" />
    }
  ]

  const steps = [
    { number: "1", title: "Encontre", description: "Localize postos próximos" },
    { number: "2", title: "Compare", description: "Veja preços e promoções" },
    { number: "3", title: "Economize", description: "Use cupons de desconto" },
    { number: "4", title: "Avalie", description: "Compartilhe sua experiência" }
  ]

  const bestStations = [
    {
      name: "Posto Shell Centro",
      address: "Av. Principal, 123 - Centro",
      rating: 4.8,
      totalRatings: 127,
      fuelPrice: 5.49,
      fuelType: "Gasolina",
      discount: 15,
      distance: "2.1 km"
    },
    {
      name: "Ipiranga Bela Vista",
      address: "R. das Flores, 456 - Bela Vista", 
      rating: 4.6,
      totalRatings: 89,
      fuelPrice: 5.39,
      fuelType: "Gasolina",
      discount: 10,
      distance: "3.5 km"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Fuel className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Zup Gás</h1>
            </div>
            <Button variant="outline">Entrar</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Encontre os melhores preços de{' '}
            <span className="text-primary">combustível</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Compare preços, encontre promoções e economize no abastecimento
          </p>
        </section>

        {/* Fuel Types */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-center text-foreground">
            Tipos de Combustível
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {fuelTypes.map((fuel, index) => (
              <FuelCard
                key={index}
                title={fuel.title}
                description={fuel.description}
                icon={fuel.icon}
                badge={fuel.badge}
              />
            ))}
          </div>
        </section>

        {/* Action Cards */}
        <section className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {actions.map((action, index) => (
              <ActionCard
                key={index}
                title={action.title}
                subtitle={action.subtitle}
                icon={action.icon}
              />
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-center text-foreground">
            Como Funciona
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mx-auto">
                  {step.number}
                </div>
                <h3 className="font-semibold text-lg text-foreground">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Search Section */}
        <section className="bg-primary/5 rounded-2xl p-8 border-2 border-black">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-foreground">
              Encontre postos próximos
            </h2>
            <div className="max-w-md mx-auto flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Digite seu CEP ou cidade"
                  className="pl-10"
                />
              </div>
              <Button className="bg-primary hover:bg-primary/90">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Best Stations */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-center text-foreground">
            Melhores Postos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bestStations.map((station, index) => (
              <StationCard
                key={index}
                name={station.name}
                address={station.address}
                rating={station.rating}
                totalRatings={station.totalRatings}
                fuelPrice={station.fuelPrice}
                fuelType={station.fuelType}
                discount={station.discount}
                distance={station.distance}
                onGetCoupon={() => console.log('Get coupon for', station.name)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;

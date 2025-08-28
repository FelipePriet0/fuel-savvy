import { BrutalStationCard, BrutalProcessCard, BrutalServiceCard } from '@/components/BrutalCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Fuel, 
  Zap, 
  Truck, 
  Search,
  MapPin,
  Target,
  Ticket,
  Star,
  DollarSign,
  Droplets,
  Car,
  Wrench,
  ShoppingCart,
  Gauge
} from 'lucide-react'

const Index = () => {
  const processSteps = [
    { 
      number: "1", 
      title: "LOCALIZE", 
      description: "Encontre postos próximos a você",
      icon: <MapPin className="w-full h-full stroke-2" />
    },
    { 
      number: "2", 
      title: "RESGATE", 
      description: "Pegue seu cupom de desconto",
      icon: <Ticket className="w-full h-full stroke-2" />
    },
    { 
      number: "3", 
      title: "ABASTEÇA", 
      description: "Vá até o posto e abasteça",
      icon: <Fuel className="w-full h-full stroke-2" />
    },
    { 
      number: "4", 
      title: "ECONOMIZE", 
      description: "Pague menos e economize",
      icon: <DollarSign className="w-full h-full stroke-2" />
    }
  ]

  const stations = [
    {
      name: "Shell Centro",
      address: "Av. Paulista, 1000",
      price: 5.49,
      fuelType: "GASOLINA",
      discount: 15,
      rating: 4.9
    },
    {
      name: "Ipiranga Vila Olímpia",
      address: "R. Funchal, 500",
      price: 5.39,
      fuelType: "GASOLINA", 
      discount: 12,
      rating: 4.7
    },
    {
      name: "BR Jardins",
      address: "Av. Brigadeiro Faria Lima, 2000",
      price: 5.59,
      fuelType: "GASOLINA",
      discount: 8,
      rating: 4.8
    }
  ]

  const services = [
    { title: "GASOLINA", icon: <Fuel className="w-full h-full stroke-2" />, badge: "Mais Popular" },
    { title: "ETANOL", icon: <Zap className="w-full h-full stroke-2" />, badge: "Eco-Friendly" },
    { title: "DIESEL", icon: <Truck className="w-full h-full stroke-2" />, badge: "Profissional" },
    { title: "ADITIVADOS", icon: <Droplets className="w-full h-full stroke-2" /> },
    { title: "LAVAGEM", icon: <Car className="w-full h-full stroke-2" /> },
    { title: "TROCA DE ÓLEO", icon: <Wrench className="w-full h-full stroke-2" /> },
    { title: "CONVENIÊNCIA", icon: <ShoppingCart className="w-full h-full stroke-2" /> },
    { title: "CALIBRAGEM", icon: <Gauge className="w-full h-full stroke-2" /> }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b-4 border-black">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-black text-black">ZUP</h1>
            <div className="flex space-x-4">
              <Button className="bg-white text-black border-3 border-black font-black px-6 py-2 shadow-brutal-small hover:shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150 rounded-lg">
                CADASTRAR
              </Button>
              <Button className="bg-neon-green text-black border-3 border-black font-black px-6 py-2 shadow-brutal-small hover:shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150 rounded-lg">
                ENTRAR
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-black text-black leading-tight">
            ENCONTRE OS MELHORES<br />
            PREÇOS DE COMBUSTÍVEL<br />
            NO BRASIL - <span className="text-neon-green">ZUP GÁS</span>
          </h1>
          
          {/* Search */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="relative">
              <Input 
                placeholder="Qual o seu endereço?"
                className="h-16 text-lg font-bold border-4 border-black rounded-lg shadow-brutal-small text-center bg-white"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 stroke-2 text-black" />
            </div>
            <Button className="w-full h-16 bg-black text-white border-4 border-black font-black text-lg shadow-brutal hover:shadow-brutal-small hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150 rounded-lg">
              USAR LOCALIZAÇÃO ATUAL
            </Button>
          </div>
        </section>

        {/* Filters Section */}
        <section className="bg-neon-green border-4 border-black rounded-lg p-8 shadow-brutal">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-16 bg-black text-white border-3 border-black font-black shadow-brutal-small hover:shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150 rounded-lg">
              FILTROS
            </Button>
            <Button className="h-16 bg-white text-black border-3 border-black font-black shadow-brutal-small hover:shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150 rounded-lg">
              CATEGORIAS
            </Button>
            <Button className="h-16 bg-white text-black border-3 border-black font-black shadow-brutal-small hover:shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150 rounded-lg">
              DISTÂNCIA
            </Button>
            <Button className="h-16 bg-white text-black border-3 border-black font-black shadow-brutal-small hover:shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150 rounded-lg">
              PREÇO
            </Button>
          </div>
        </section>

        {/* Process Steps */}
        <section className="space-y-8">
          <h2 className="text-3xl font-black text-center text-black">
            COMO FUNCIONA
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {processSteps.map((step, index) => (
              <BrutalProcessCard
                key={index}
                number={step.number}
                title={step.title}
                description={step.description}
                icon={step.icon}
              />
            ))}
          </div>
        </section>

        {/* Best Stations */}
        <section className="space-y-8">
          <h2 className="text-3xl font-black text-center text-black">
            MELHORES POSTOS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stations.map((station, index) => (
              <BrutalStationCard
                key={index}
                name={station.name}
                address={station.address}
                price={station.price}
                fuelType={station.fuelType}
                discount={station.discount}
                rating={station.rating}
                onGetCoupon={() => console.log('Get coupon for', station.name)}
              />
            ))}
          </div>
        </section>

        {/* Fuel Types Section */}
        <section className="bg-neon-green border-4 border-black rounded-lg p-8 shadow-brutal">
          <h2 className="text-3xl font-black text-center text-black mb-8">
            GASOLINA, ETANOL, DIESEL
          </h2>
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-white border-4 border-black rounded-full flex items-center justify-center mx-auto shadow-brutal-small mb-4">
                <Fuel className="w-8 h-8 text-black stroke-2" />
              </div>
              <div className="bg-black text-white px-4 py-2 rounded-lg font-black text-sm">
                MAIS POPULAR
              </div>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-white border-4 border-black rounded-full flex items-center justify-center mx-auto shadow-brutal-small mb-4">
                <Zap className="w-8 h-8 text-black stroke-2" />
              </div>
              <div className="bg-black text-white px-4 py-2 rounded-lg font-black text-sm">
                ECO-FRIENDLY
              </div>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-white border-4 border-black rounded-full flex items-center justify-center mx-auto shadow-brutal-small mb-4">
                <Truck className="w-8 h-8 text-black stroke-2" />
              </div>
              <div className="bg-black text-white px-4 py-2 rounded-lg font-black text-sm">
                PROFISSIONAL
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="space-y-8">
          <h2 className="text-3xl font-black text-center text-black">
            TIPOS DE COMBUSTÍVEL E SERVIÇOS AUTOMOTIVOS
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <BrutalServiceCard
                key={index}
                title={service.title}
                icon={service.icon}
                badge={service.badge}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;

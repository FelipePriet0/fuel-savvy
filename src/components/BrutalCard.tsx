import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BrutalStationCardProps {
  name: string
  address: string
  price: number
  fuelType: string
  discount?: number
  rating?: number
  onGetCoupon?: () => void
  className?: string
}

export const BrutalStationCard = ({ 
  name,
  address,
  price,
  fuelType,
  discount,
  rating = 5.0,
  onGetCoupon,
  className 
}: BrutalStationCardProps) => {
  return (
    <Card className={cn(
      "bg-white border-4 border-black shadow-brutal-small hover:shadow-brutal transition-all duration-150 rounded-lg",
      className
    )}>
      <CardContent className="p-6 relative">
        {discount && (
          <Badge className="absolute -top-2 -right-2 bg-neon-green text-black border-2 border-black font-black text-sm px-3 py-1 shadow-brutal-small">
            {discount}% OFF
          </Badge>
        )}
        
        <div className="space-y-4">
          <div>
            <h3 className="font-black text-xl text-black mb-2">{name}</h3>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-1 stroke-2" />
              <span className="font-semibold">{address}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-neon-green stroke-black stroke-2" />
              <span className="font-bold text-black">{rating}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-black text-black">
                R$ {price.toFixed(2)}
              </div>
              <div className="text-sm font-bold text-gray-600 uppercase">
                {fuelType}
              </div>
            </div>
            <Button 
              onClick={onGetCoupon}
              className="bg-neon-green text-black border-3 border-black font-black text-sm px-6 py-3 shadow-brutal-small hover:shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150 rounded-lg"
            >
              OBTER CUPOM
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface BrutalProcessCardProps {
  number: string
  title: string
  description: string
  icon: React.ReactNode
  className?: string
}

export const BrutalProcessCard = ({ 
  number, 
  title, 
  description, 
  icon,
  className 
}: BrutalProcessCardProps) => {
  return (
    <Card className={cn(
      "bg-white border-3 border-black shadow-brutal-small hover:shadow-brutal transition-all duration-150 rounded-lg",
      className
    )}>
      <CardContent className="p-6 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-neon-green border-3 border-black rounded-full flex items-center justify-center mx-auto shadow-brutal-small">
            <span className="text-2xl font-black text-black">{number}</span>
          </div>
          <div className="w-12 h-12 mx-auto text-black stroke-2">
            {icon}
          </div>
          <div>
            <h3 className="font-black text-lg text-black mb-2">{title}</h3>
            <p className="text-sm font-semibold text-gray-600">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface BrutalServiceCardProps {
  title: string
  icon: React.ReactNode
  badge?: string
  className?: string
}

export const BrutalServiceCard = ({ 
  title, 
  icon, 
  badge,
  className 
}: BrutalServiceCardProps) => {
  return (
    <div className={cn(
      "relative text-center",
      className
    )}>
      {badge && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-white border-2 border-black font-black text-xs px-2 py-1 shadow-brutal-small z-10">
          {badge}
        </Badge>
      )}
      <div className="w-20 h-20 bg-neon-green border-4 border-black rounded-full flex items-center justify-center mx-auto shadow-brutal-small hover:shadow-brutal transition-all duration-150 cursor-pointer">
        <div className="w-8 h-8 text-black stroke-2">
          {icon}
        </div>
      </div>
      <h3 className="font-black text-sm text-black mt-3">{title}</h3>
    </div>
  )
}
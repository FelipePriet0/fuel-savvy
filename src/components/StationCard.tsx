import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StationCardProps {
  name: string
  address: string
  rating: number
  totalRatings: number
  fuelPrice: number
  fuelType: string
  discount?: number
  distance?: string
  onGetCoupon?: () => void
  className?: string
}

export const StationCard = ({ 
  name,
  address,
  rating,
  totalRatings,
  fuelPrice,
  fuelType,
  discount,
  distance,
  onGetCoupon,
  className 
}: StationCardProps) => {
  return (
    <Card className={cn(
      "hover:shadow-[0px_2px_0px_black] hover:translate-y-0.5 transition-all duration-200 bg-card",
      className
    )}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with discount badge */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground mb-1">{name}</h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{address}</span>
                {distance && <span className="ml-2">• {distance}</span>}
              </div>
            </div>
            {discount && (
              <Badge variant="default" className="bg-primary text-primary-foreground">
                -{discount}%
              </Badge>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star}
                  className={cn(
                    "w-4 h-4",
                    star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {rating.toFixed(1)} ({totalRatings})
            </span>
          </div>

          {/* Price and Action */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <div className="text-2xl font-bold text-foreground">
                R$ {fuelPrice.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">{fuelType}</div>
            </div>
            <Button 
              onClick={onGetCoupon}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Obter Cupom
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
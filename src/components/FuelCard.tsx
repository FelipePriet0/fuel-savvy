import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface FuelCardProps {
  title: string
  description: string
  icon: React.ReactNode
  badge?: string
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string
}

export const FuelCard = ({ 
  title, 
  description, 
  icon, 
  badge, 
  badgeVariant = 'default',
  className 
}: FuelCardProps) => {
  return (
    <Card className={cn(
      "relative overflow-hidden border-2 border-border hover:border-primary/50 transition-all duration-200 hover:shadow-glow/30 bg-card",
      className
    )}>
      {badge && (
        <div className="absolute top-3 right-3">
          <Badge variant={badgeVariant} className="text-xs font-medium">
            {badge}
          </Badge>
        </div>
      )}
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
            {icon}
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
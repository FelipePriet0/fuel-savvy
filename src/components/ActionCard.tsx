import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ActionCardProps {
  title: string
  subtitle: string
  icon: React.ReactNode
  onClick?: () => void
  className?: string
}

export const ActionCard = ({ 
  title, 
  subtitle, 
  icon, 
  onClick,
  className 
}: ActionCardProps) => {
  return (
    <Card 
      className={cn(
        "cursor-pointer hover:shadow-[0px_2px_0px_black] hover:translate-y-0.5 transition-all duration-200 bg-card group",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 text-primary group-hover:text-primary/80 transition-colors">
            {icon}
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-base text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
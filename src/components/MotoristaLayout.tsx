import { Link, useLocation, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Home, User } from 'lucide-react'

const bottomNavItems = [
  {
    title: "Início",
    href: "/",
    icon: Home,
  },
  {
    title: "Perfil",
    href: "/perfil",
    icon: User,
  },
]

export default function MotoristaLayout() {
  const location = useLocation()

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Main content */}
      <div className="flex-1 pb-20">
        <Outlet />
      </div>

      {/* Bottom Navigation - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="container max-w-lg mx-auto">
          <nav className="grid grid-cols-2 gap-1 p-2">
            {bottomNavItems.map((item) => {
              const isActive = location.pathname === item.href
              const Icon = item.icon
              
              return (
                <Button
                  key={item.href}
                  asChild
                  variant="ghost"
                  className={cn(
                    "flex flex-col items-center gap-1 h-auto py-3 px-2",
                    isActive && "bg-muted text-primary"
                  )}
                >
                  <Link to={item.href} className="flex flex-col items-center gap-1">
                    <Icon className={cn(
                      "h-5 w-5",
                      isActive && "text-primary"
                    )} />
                    <span className={cn(
                      "text-xs font-medium",
                      isActive && "text-primary"
                    )}>
                      {item.title}
                    </span>
                  </Link>
                </Button>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
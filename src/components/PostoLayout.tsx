import { Link, useLocation } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Plus, 
  Settings, 
  History, 
  User,
  Fuel
} from 'lucide-react'

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/posto",
    icon: LayoutDashboard,
  },
  {
    title: "Criar Cupom",
    href: "/posto/novo",
    icon: Plus,
  },
  {
    title: "Gerenciar Cupons",
    href: "/posto/gerenciar",
    icon: Settings,
  },
  {
    title: "Histórico",
    href: "/posto/historico",
    icon: History,
  },
  {
    title: "Preços",
    href: "/posto/precos",
    icon: Fuel,
  },
  {
    title: "Perfil",
    href: "/posto/perfil",
    icon: User,
  },
]

export default function PostoLayout() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border">
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h2 className="text-lg font-semibold">Painel do Posto</h2>
          </div>
          <nav className="flex-1 px-4 pb-4">
            <ul className="space-y-2">
              {sidebarNavItems.map((item) => {
                const isActive = location.pathname === item.href
                const Icon = item.icon
                
                return (
                  <li key={item.href}>
                    <Button
                      asChild
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        isActive && "bg-muted text-primary"
                      )}
                    >
                      <Link to={item.href} className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        {item.title}
                      </Link>
                    </Button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  )
}
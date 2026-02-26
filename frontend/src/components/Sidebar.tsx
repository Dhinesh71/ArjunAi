import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Users, Activity } from "lucide-react"
import { cn } from "../lib/utils"

export default function Sidebar() {
    const location = useLocation()

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Leads", href: "/leads", icon: Users },
    ]

    return (
        <div className="flex flex-col w-64 border-r border-border bg-card min-h-screen p-4">
            <div className="flex items-center gap-2 mb-8 px-2">
                <div className="bg-primary p-2 rounded-lg">
                    <Activity className="text-primary-foreground w-6 h-6" />
                </div>
                <span className="text-xl font-bold tracking-tight text-foreground">Fusion AI</span>
            </div>

            <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.href)
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}

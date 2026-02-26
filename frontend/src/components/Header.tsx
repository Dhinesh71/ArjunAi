import { useLocation } from "react-router-dom"
import { Bell, Search, UserCircle } from "lucide-react"

export default function Header() {
    const location = useLocation()

    const getTitle = () => {
        if (location.pathname === "/dashboard") return "Dashboard"
        if (location.pathname.startsWith("/leads/")) return "Lead Details"
        if (location.pathname === "/leads") return "All Leads"
        return ""
    }

    return (
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{getTitle()}</h1>

            <div className="flex items-center gap-4">
                <div className="relative group hidden sm:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search leads..."
                        className="h-9 w-64 rounded-md border border-input bg-background pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    />
                </div>

                <button className="relative p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive flex"></span>
                </button>

                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center cursor-pointer overflow-hidden border border-primary/30">
                    <UserCircle className="h-8 w-8 text-primary" strokeWidth={1.5} />
                </div>
            </div>
        </header>
    )
}

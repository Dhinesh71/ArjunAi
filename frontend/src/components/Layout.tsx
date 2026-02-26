import { useEffect } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Header from "./Header"
import { useCRMStore } from "../store/useCRMStore"

export default function Layout() {
    const { setupRealtimeSubscription } = useCRMStore()

    useEffect(() => {
        const unsubscribe = setupRealtimeSubscription()
        return () => {
            unsubscribe()
        }
    }, [setupRealtimeSubscription])

    return (
        <div className="flex min-h-screen bg-muted/20 font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

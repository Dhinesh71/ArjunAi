import { useEffect } from "react"
import { useCRMStore } from "../store/useCRMStore"
import LeadTable from "../components/LeadTable"
import { Loader2 } from "lucide-react"

export default function LeadsList() {
    const { leads, loading, error, fetchLeads } = useCRMStore()

    useEffect(() => {
        fetchLeads()
    }, [fetchLeads])

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-center">
                Error loading leads: {error}
            </div>
        )
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Leads Management</h2>
                    <p className="text-sm text-muted-foreground">View and manage all captured WhatsApp leads.</p>
                </div>
            </div>

            <LeadTable leads={leads} />
        </div>
    )
}

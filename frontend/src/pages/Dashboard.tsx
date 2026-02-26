import { useEffect } from "react"
import { useCRMStore } from "../store/useCRMStore"
import StatCard from "../components/StatCard"
import ConversationSummaryCard from "../components/ConversationSummaryCard"
import { Users, UserCheck, Calendar, Zap, Loader2 } from "lucide-react"
import { isToday, parseISO } from "date-fns"

export default function Dashboard() {
    const { leads, loading, error, fetchLeads } = useCRMStore()

    useEffect(() => {
        fetchLeads()
    }, [fetchLeads])

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error) {
        return <div className="p-8 text-destructive text-center">{error}</div>
    }

    const qualifiedLeads = leads.filter(
        (l) => l.deal_stage?.toLowerCase() === "qualified" || l.deal_stage?.toLowerCase() === "proposal" || l.deal_stage?.toLowerCase() === "negotiation" || l.deal_stage?.toLowerCase() === "closed"
    ).length

    const meetingsRequested = leads.filter((l) => l.meeting_requested === true).length

    const newLeadsToday = leads.filter((l) => {
        if (!l.created_at) return false
        return isToday(parseISO(l.created_at))
    }).length

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Leads"
                    value={leads.length.toString()}
                    icon={Users}
                    trend="up"
                    trendValue="+12%"
                    description="vs last month"
                />
                <StatCard
                    title="Qualified Leads"
                    value={qualifiedLeads.toString()}
                    icon={UserCheck}
                    trend="up"
                    trendValue="+4%"
                    description="vs last month"
                />
                <StatCard
                    title="Meetings Requested"
                    value={meetingsRequested.toString()}
                    icon={Calendar}
                    description="Awaiting scheduling"
                />
                <StatCard
                    title="New Leads Today"
                    value={newLeadsToday.toString()}
                    icon={Zap}
                    trend="neutral"
                    trendValue={newLeadsToday > 0 ? "+" + newLeadsToday : "0"}
                    description="captured today"
                />
            </div>

            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold tracking-tight">All Conversations & Summaries</h2>
                </div>
                {leads.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
                        No conversations found. Have the AI chat with some users first!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {leads.map((lead) => (
                            <ConversationSummaryCard key={lead.id} lead={lead} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

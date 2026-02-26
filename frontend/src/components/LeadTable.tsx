import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { Badge } from "./ui/badge"
import type { Lead } from "../types"

interface LeadTableProps {
    leads: Lead[]
}

const getStageBadgeVariant = (stage: string) => {
    const s = stage?.toLowerCase() || ""
    if (s.includes("new")) return "new"
    if (s.includes("discovery")) return "discovery"
    if (s.includes("qualified")) return "qualified"
    if (s.includes("proposal")) return "proposal"
    if (s.includes("negotiation")) return "negotiation"
    if (s.includes("closed")) return "closed"
    if (s.includes("lost")) return "lost"
    return "default"
}

export default function LeadTable({ leads }: LeadTableProps) {
    const navigate = useNavigate()

    return (
        <div className="w-full relative overflow-x-auto rounded-xl border border-border shadow-sm bg-card mt-6">
            <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
                    <tr>
                        <th className="px-6 py-4 font-medium">Name</th>
                        <th className="px-6 py-4 font-medium">Business</th>
                        <th className="px-6 py-4 font-medium">Service</th>
                        <th className="px-6 py-4 font-medium">Budget</th>
                        <th className="px-6 py-4 font-medium">Meeting</th>
                        <th className="px-6 py-4 font-medium">Stage</th>
                        <th className="px-6 py-4 font-medium">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {leads.map((lead) => (
                        <tr
                            key={lead.id}
                            onClick={() => navigate(`/leads/${lead.id}`)}
                            className="bg-card border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                        >
                            <td className="px-6 py-4">
                                <div className="font-semibold text-foreground">{lead.name || "N/A"}</div>
                                <div className="text-muted-foreground text-xs mt-0.5">{lead.phone_number}</div>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                                {lead.business_name || "-"}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate">
                                {lead.service_interest || "-"}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                                {lead.budget || "-"}
                            </td>
                            <td className="px-6 py-4">
                                {lead.meeting_requested ? (
                                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-50">
                                        Requested
                                    </Badge>
                                ) : (
                                    <span className="text-muted-foreground">-</span>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <Badge variant={getStageBadgeVariant(lead.deal_stage) as any} className="capitalize">
                                    {lead.deal_stage || "new"}
                                </Badge>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                {lead.created_at ? format(new Date(lead.created_at), "MMM d, yyyy") : "-"}
                            </td>
                        </tr>
                    ))}
                    {leads.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                No leads found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export { getStageBadgeVariant }

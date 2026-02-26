import { Link } from "react-router-dom"
import { format } from "date-fns"
import { Badge } from "./ui/badge"
import { getStageBadgeVariant } from "./LeadTable"
import type { Lead } from "../types"
import { MessageSquare, Calendar, Building } from "lucide-react"

interface Props {
    lead: Lead
}

export default function ConversationSummaryCard({ lead }: Props) {
    return (
        <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md hover:border-border/80">
            <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex flex-col items-center justify-center text-primary font-semibold shrink-0">
                            {lead.name && lead.name !== "N/A" ? lead.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground truncate max-w-[150px]">{lead.name || lead.phone_number}</h3>
                            <p className="text-xs text-muted-foreground">{lead.phone_number}</p>
                        </div>
                    </div>
                    <Badge variant={getStageBadgeVariant(lead.deal_stage) as any} className="capitalize">
                        {lead.deal_stage || "new"}
                    </Badge>
                </div>

                <div className="space-y-3 flex-1 mb-2">
                    {lead.business_name && (
                        <div className="flex items-start gap-2 text-sm">
                            <Building className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                            <span className="text-muted-foreground line-clamp-1" title={lead.business_name}>{lead.business_name}</span>
                        </div>
                    )}

                    <div className="bg-muted/50 p-3 rounded-lg border border-border/50 relative flex-1">
                        <MessageSquare className="w-4 h-4 text-primary absolute top-3 left-3" />
                        <div className="pl-6">
                            <p className="text-xs font-medium text-foreground mb-1">Conversation Summary:</p>
                            <p className="text-sm text-muted-foreground line-clamp-3" title={lead.problem_statement || lead.notes || ""}>
                                {lead.problem_statement || lead.notes || "No summary available yet. AI is currently exploring the user's needs."}
                            </p>
                        </div>
                        {lead.service_interest && (
                            <div className="pl-6 mt-2 pt-2 border-t border-border/50">
                                <p className="text-xs font-medium text-foreground mb-1">Interest:</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">{lead.service_interest}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between mt-auto rounded-b-xl">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {lead.created_at ? format(new Date(lead.created_at), "MMM d, yyyy") : "-"}
                </div>

                <Link
                    to={`/leads/${lead.id}`}
                    className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                >
                    View Full Chat &rarr;
                </Link>
            </div>
        </div>
    )
}

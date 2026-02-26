import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { getStageBadgeVariant } from "./LeadTable"
import type { Lead } from "../types"
import { BuildingIcon, Calendar, DollarSign, Mail, Phone, Clock, FileText, Compass, Info } from "lucide-react"

interface LeadInfoCardProps {
    lead: Lead
}

export default function LeadInfoCard({ lead }: LeadInfoCardProps) {
    return (
        <Card className="h-full">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl">{lead.name || "Unknown Lead"}</CardTitle>
                        <p className="text-muted-foreground mt-1 flex items-center gap-2">
                            <Phone className="w-4 h-4" /> {lead.phone_number}
                        </p>
                    </div>
                    <Badge variant={getStageBadgeVariant(lead.deal_stage) as any} className="capitalize text-sm px-3 py-1">
                        {lead.deal_stage || "new"}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 border-t pt-6">
                    <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2 text-foreground">
                            <Info className="w-5 h-5 text-primary" /> Contact & Business
                        </h4>
                        <div className="space-y-3 ps-7">
                            <div className="flex items-start gap-3">
                                <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <div className="text-sm font-medium">Email</div>
                                    <div className="text-sm text-muted-foreground">{lead.email || "-"}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <BuildingIcon className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <div className="text-sm font-medium">Business Name</div>
                                    <div className="text-sm text-muted-foreground">{lead.business_name || "-"}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Compass className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <div className="text-sm font-medium">Service Interest</div>
                                    <div className="text-sm text-muted-foreground">{lead.service_interest || "-"}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2 text-foreground">
                            <DollarSign className="w-5 h-5 text-emerald-500" /> Requirements
                        </h4>
                        <div className="space-y-3 ps-7">
                            <div className="flex items-start gap-3">
                                <DollarSign className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <div className="text-sm font-medium">Budget</div>
                                    <div className="text-sm text-muted-foreground">{lead.budget || "-"}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <div className="text-sm font-medium">Timeline</div>
                                    <div className="text-sm text-muted-foreground">{lead.timeline || "-"}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <div className="text-sm font-medium">Meeting Requested</div>
                                    <div className="text-sm text-muted-foreground">
                                        {lead.meeting_requested ? `Yes (${lead.meeting_time || "Time not specified"})` : "No"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 space-y-4">
                    <div className="bg-muted/30 p-4 rounded-xl border border-border">
                        <h4 className="font-semibold flex items-center gap-2 text-foreground mb-2">
                            <FileText className="w-4 h-4 text-primary" /> Problem Statement
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {lead.problem_statement || "No problem statement recorded."}
                        </p>
                    </div>

                    {lead.notes && (
                        <div className="bg-muted/30 p-4 rounded-xl border border-border">
                            <h4 className="font-semibold flex items-center gap-2 text-foreground mb-2">
                                <FileText className="w-4 h-4 text-orange-500" /> Notes
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {lead.notes}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

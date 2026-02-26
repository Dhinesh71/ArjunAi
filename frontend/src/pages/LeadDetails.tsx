import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getLeadById } from "../services/leadService"
import { getMessagesByUserId } from "../services/messageService"
import type { Lead, Message } from "../types"
import LeadInfoCard from "../components/LeadInfoCard"
import ConversationView from "../components/ConversationView"
import { Loader2, ArrowLeft } from "lucide-react"

export default function LeadDetails() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [lead, setLead] = useState<Lead | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchData() {
            if (!id) return
            setLoading(true)
            try {
                const leadData = await getLeadById(id)
                setLead(leadData)

                if (leadData?.user_id) {
                    const msgs = await getMessagesByUserId(leadData.user_id)
                    setMessages(msgs)
                }
            } catch (err: any) {
                setError(err.message || "Failed to fetch lead details")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id])

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error || !lead) {
        return (
            <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-center">
                Error: {error || "Lead not found"}
            </div>
        )
    }

    return (
        <div className="animate-in fade-in duration-500">
            <button
                onClick={() => navigate("/leads")}
                className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Leads
            </button>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-7">
                    <LeadInfoCard lead={lead} />
                </div>
                <div className="xl:col-span-5">
                    <ConversationView messages={messages} />
                </div>
            </div>
        </div>
    )
}

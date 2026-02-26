import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { MessageSquare, Bot } from "lucide-react"
import { cn } from "../lib/utils"
import type { Message } from "../types"

interface ConversationViewProps {
    messages: Message[]
    loading?: boolean
}

export default function ConversationView({ messages, loading }: ConversationViewProps) {
    if (loading) {
        return (
            <Card className="h-[600px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </Card>
        )
    }

    return (
        <Card className="flex flex-col h-[600px] border border-border shadow-sm">
            <CardHeader className="py-4 border-b border-border bg-muted/20 shrink-0">
                <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" /> Conversation History
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground mt-10">
                        No previous conversation found.
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex items-start gap-3 w-full max-w-[85%]",
                                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                            )}
                        >
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                                    msg.role === "user" ? "bg-primary/20 text-primary border border-primary/30" : "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30"
                                )}
                            >
                                {msg.role === "user" ? "U" : <Bot className="w-4 h-4" />}
                            </div>

                            <div className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
                                <div
                                    className={cn(
                                        "px-4 py-2.5 rounded-2xl shadow-sm text-sm whitespace-pre-wrap leading-relaxed",
                                        msg.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                                            : "bg-muted text-foreground rounded-tl-sm border border-border"
                                    )}
                                >
                                    {msg.content}
                                </div>
                                {msg.timestamp && (
                                    <span className="text-[10px] text-muted-foreground mt-1 px-1">
                                        {format(new Date(msg.timestamp), "MMM d, h:mm a")}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}

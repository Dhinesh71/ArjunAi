import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { cn } from "../lib/utils"

interface StatCardProps {
    title: string
    value: string | number
    icon: React.ElementType
    description?: string
    trend?: "up" | "down" | "neutral"
    trendValue?: string
}

export default function StatCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    trendValue,
}: StatCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {(description || trendValue) && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        {trendValue && (
                            <span
                                className={cn(
                                    trend === "up" && "text-emerald-500",
                                    trend === "down" && "text-red-500",
                                    trend === "neutral" && "text-gray-500"
                                )}
                            >
                                {trendValue}
                            </span>
                        )}
                        <span className="text-muted-foreground">{description}</span>
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

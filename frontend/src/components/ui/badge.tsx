import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/80",
                secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "text-foreground border border-input opacity-70",
                new: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
                discovery: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
                qualified: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
                proposal: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
                negotiation: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
                closed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
                lost: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }

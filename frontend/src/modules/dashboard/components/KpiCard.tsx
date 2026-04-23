import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  className?: string
}

export const KpiCard = ({ title, value, subtitle, icon: Icon, trend, className }: KpiCardProps) => {
  const isPositive = trend && trend.value >= 0

  return (
    <Card className={cn("gap-3 py-5", className)}>
      <CardContent className="flex flex-col gap-3 px-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-3xl font-bold tracking-tight">{value}</span>
          {subtitle && (
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          )}
        </div>

        {trend && (
          <div className="flex items-center gap-1">
            <span
              className={cn(
                "text-xs font-medium",
                isPositive ? "text-emerald-600" : "text-red-500"
              )}
            >
              {isPositive ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

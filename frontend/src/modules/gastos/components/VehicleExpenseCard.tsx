import { Card, CardContent } from "@/components/ui/card"
import { CarFrontIcon, DropletIcon, UserIcon } from "lucide-react"
import { cn, formatDateOnly } from "@/lib/utils"
import type { VehicleExpenseSummary } from "../types/gasto.types"
import { formatCurrency, formatKm, getOilStatus, oilStatusConfig } from "./expense-config"

interface VehicleExpenseCardProps {
  vehicle: VehicleExpenseSummary
  onSelect: (vehicle: VehicleExpenseSummary) => void
}

export const VehicleExpenseCard = ({ vehicle, onSelect }: VehicleExpenseCardProps) => {
  const oil = oilStatusConfig[getOilStatus(vehicle)]

  return (
    <button
      type="button"
      onClick={() => onSelect(vehicle)}
      className="text-left rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="flex flex-col gap-0 overflow-hidden py-0 h-full transition-colors hover:border-primary/60 hover:bg-accent/40 cursor-pointer">
        <div className={cn("h-2 w-full", oil.bar)} />

        <CardContent className="flex items-center gap-4 p-5">
          <div className="size-14 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden">
            {vehicle.photoUrl ? (
              <img src={vehicle.photoUrl} alt={vehicle.plate} className="size-full object-cover" />
            ) : (
              <CarFrontIcon className="size-7 text-muted-foreground" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-mono font-semibold text-base leading-tight tracking-wider">
              {vehicle.plate}
            </h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground truncate">
              <UserIcon className="size-3 shrink-0" />
              {vehicle.driverName ?? "Sin conductor"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Este mes</p>
            <p className="text-xl font-bold tabular-nums">{formatCurrency(vehicle.monthSpent)}</p>
          </div>
        </CardContent>

        <div className="border-t px-5 py-2.5 space-y-1 text-xs">
          <div className="flex justify-between gap-2 text-muted-foreground">
            <span>Total histórico</span>
            <span className="font-medium text-foreground tabular-nums">
              {formatCurrency(vehicle.totalSpent)}
            </span>
          </div>
          <div className={cn("flex items-center gap-2", oil.text)}>
            <DropletIcon className="size-3.5 shrink-0" />
            <span className="truncate">
              {vehicle.nextOilChangeKm != null || vehicle.nextOilChangeDate
                ? `Próximo aceite: ${[
                    vehicle.nextOilChangeKm != null && formatKm(vehicle.nextOilChangeKm),
                    vehicle.nextOilChangeDate && formatDateOnly(vehicle.nextOilChangeDate),
                  ]
                    .filter(Boolean)
                    .join(" · ")}`
                : oil.label}
            </span>
          </div>
        </div>
      </Card>
    </button>
  )
}

import Avatar from "react-avatar"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarIcon } from "lucide-react"
import { cn, formatDateOnly } from "@/lib/utils"
import type { DriverBalance } from "../types/deuda.types"
import { balanceTone, formatCurrency } from "./movement-config"

interface DriverDebtCardProps {
  driver: DriverBalance
  onSelect: (driver: DriverBalance) => void
}

export const DriverDebtCard = ({ driver, onSelect }: DriverDebtCardProps) => {
  const tone = balanceTone(driver.balance)

  return (
    <button
      type="button"
      onClick={() => onSelect(driver)}
      className="text-left rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="flex flex-col gap-0 overflow-hidden py-0 h-full transition-colors hover:border-primary/60 hover:bg-accent/40 cursor-pointer">
        <div className={cn("h-2 w-full", tone.bar)} />

        <CardContent className="flex items-center gap-4 p-5">
          <Avatar
            name={driver.driverName}
            src={driver.photoUrl ?? undefined}
            size="56px"
            round="12px"
          />

          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base leading-tight truncate">
              {driver.driverName}
            </h3>
            <p className={cn("mt-1 text-xs font-medium", tone.text)}>{tone.label}</p>
            <p className={cn("text-xl font-bold tabular-nums", tone.text)}>
              {formatCurrency(driver.balance)}
            </p>
          </div>
        </CardContent>

        <div className="border-t px-5 py-2.5 flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarIcon className="size-3.5 shrink-0" />
          <span>
            {driver.lastMovementDate
              ? `Último movimiento: ${formatDateOnly(driver.lastMovementDate)}`
              : "Sin movimientos"}
          </span>
        </div>
      </Card>
    </button>
  )
}

import Avatar from "react-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { PencilIcon, TrashIcon, StarIcon, CarIcon, PhoneIcon } from "lucide-react"
import type { Driver } from "../types/driver.types"

const statusConfig: Record<Driver["status"], { label: string; className: string }> = {
  active: {
    label: "Activo",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  inactive: {
    label: "Inactivo",
    className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  },
  on_trip: {
    label: "En viaje",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
}

interface DriverCardProps {
  driver: Driver
  onEdit: (driver: Driver) => void
  onDelete: (driver: Driver) => void
}

export const DriverCard = ({ driver, onEdit, onDelete }: DriverCardProps) => {
  const status = statusConfig[driver.status]

  return (
    <Card className="flex flex-col gap-0 overflow-hidden py-0">
      {/* Top colored strip */}
      <div className="h-2 bg-primary w-full" />

      <CardContent className="flex flex-col items-center gap-3 pt-6 pb-3 px-5">
        {/* Avatar + status */}
        <div className="relative">
          <Avatar
            name={driver.name}
            src={driver.avatarUrl}
            size="72px"
            round="12px"
          />
          <span
            className={`absolute -bottom-1 -right-1 size-3.5 rounded-full ring-2 ring-card ${
              driver.status === "active"
                ? "bg-emerald-500"
                : driver.status === "on_trip"
                ? "bg-blue-500"
                : "bg-zinc-400"
            }`}
          />
        </div>

        {/* Name + badge */}
        <div className="text-center">
          <h3 className="font-semibold text-base leading-tight">{driver.name}</h3>
          <Badge variant="outline" className={`mt-1 text-xs font-medium ${status.className}`}>
            {status.label}
          </Badge>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-4 w-full text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <StarIcon className="size-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium text-foreground">{driver.rating.toFixed(1)}</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <span>{driver.totalTrips} viajes</span>
        </div>

        {/* Details */}
        <div className="w-full space-y-1.5 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CarIcon className="size-3.5 shrink-0" />
            <span className="truncate">{driver.vehicleModel} · {driver.vehiclePlate}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <PhoneIcon className="size-3.5 shrink-0" />
            <span className="truncate">{driver.phone}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t px-5 py-3 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(driver)}
        >
          <PencilIcon className="size-3.5 mr-1.5" />
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(driver)}
        >
          <TrashIcon className="size-3.5" />
        </Button>
      </CardFooter>
    </Card>
  )
}

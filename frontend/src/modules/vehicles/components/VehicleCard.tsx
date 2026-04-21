import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  PencilIcon,
  TrashIcon,
  GaugeIcon,
  UserIcon,
  FuelIcon,
  CarFrontIcon,
} from "lucide-react"
import type { Vehicle } from "../types/vehicle.types"

const statusConfig: Record<Vehicle["status"], { label: string; className: string }> = {
  available: {
    label: "Disponible",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  on_trip: {
    label: "En viaje",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  maintenance: {
    label: "Mantenimiento",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  inactive: {
    label: "Inactivo",
    className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  },
}

const fuelLabels: Record<Vehicle["fuelType"], string> = {
  gasoline: "Gasolina",
  diesel: "Diésel",
  electric: "Eléctrico",
  hybrid: "Híbrido",
}

const statusDotColor: Record<Vehicle["status"], string> = {
  available: "bg-emerald-500",
  on_trip: "bg-blue-500",
  maintenance: "bg-amber-500",
  inactive: "bg-zinc-400",
}

interface VehicleCardProps {
  vehicle: Vehicle
  onEdit: (vehicle: Vehicle) => void
  onDelete: (vehicle: Vehicle) => void
}

export const VehicleCard = ({ vehicle, onEdit, onDelete }: VehicleCardProps) => {
  const status = statusConfig[vehicle.status]

  return (
    <Card className="flex flex-col gap-0 overflow-hidden py-0">
      {/* Top colored strip */}
      <div className="h-2 bg-primary w-full" />

      <CardContent className="flex flex-col gap-3 pt-5 pb-3 px-5">
        {/* Icon + plate + status */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <CarFrontIcon className="size-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-base leading-tight">
                {vehicle.brand} {vehicle.model}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {vehicle.year} · {vehicle.color}
              </p>
            </div>
          </div>

          {/* Status dot */}
          <span
            className={`mt-1 size-2.5 rounded-full shrink-0 ${statusDotColor[vehicle.status]}`}
          />
        </div>

        {/* Badge */}
        <Badge
          variant="outline"
          className={`w-fit text-xs font-medium ${status.className}`}
        >
          {status.label}
        </Badge>

        {/* Divider */}
        <div className="border-t" />

        {/* Details */}
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="font-mono font-semibold text-foreground tracking-wider text-sm">
              {vehicle.plate}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <FuelIcon className="size-3.5 shrink-0" />
            <span>{fuelLabels[vehicle.fuelType]}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <GaugeIcon className="size-3.5 shrink-0" />
            <span>{vehicle.mileage.toLocaleString()} km</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <UserIcon className="size-3.5 shrink-0" />
            <span className="truncate">
              {vehicle.assignedDriver ?? "Sin conductor asignado"}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t px-5 py-3 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(vehicle)}
        >
          <PencilIcon className="size-3.5 mr-1.5" />
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(vehicle)}
        >
          <TrashIcon className="size-3.5" />
        </Button>
      </CardFooter>
    </Card>
  )
}

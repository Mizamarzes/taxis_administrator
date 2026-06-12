import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  PencilIcon,
  TrashIcon,
  CarFrontIcon,
  CalendarOffIcon,
  FileTextIcon,
} from "lucide-react"
import type { Vehicle, VehicleStatus } from "../types/vehicle.types"
import { getRestrictionDayLabel } from "../types/vehicle.types"

const statusConfig: Record<VehicleStatus, { label: string; className: string; dot: string }> = {
  active: {
    label: "Activo",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  inactive: {
    label: "Inactivo",
    className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    dot: "bg-zinc-400",
  },
  in_maintenance: {
    label: "Mantenimiento",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  out_of_service: {
    label: "Fuera de servicio",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    dot: "bg-red-500",
  },
}

interface VehicleCardProps {
  vehicle: Vehicle
  onEdit: (vehicle: Vehicle) => void
  onDelete: (vehicle: Vehicle) => void
}

export const VehicleCard = ({ vehicle, onEdit, onDelete }: VehicleCardProps) => {
  const status = statusConfig[vehicle.vehicleStatus]

  return (
    <Card className="flex flex-col gap-0 overflow-hidden py-0">
      <div className="h-2 bg-primary w-full" />

      <CardContent className="flex flex-col gap-3 pt-5 pb-3 px-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <CarFrontIcon className="size-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-mono font-semibold text-base leading-tight tracking-wider">
                {vehicle.plate}
              </h3>
            </div>
          </div>

          <span className={`mt-1 size-2.5 rounded-full shrink-0 ${status.dot}`} />
        </div>

        <Badge variant="outline" className={`w-fit text-xs font-medium ${status.className}`}>
          {status.label}
        </Badge>

        <div className="border-t" />

        <div className="space-y-1.5 text-sm">
          {getRestrictionDayLabel(vehicle.drivingRestrictionDay) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarOffIcon className="size-3.5 shrink-0" />
              <span>Pico y placa: {getRestrictionDayLabel(vehicle.drivingRestrictionDay)}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileTextIcon className="size-3.5 shrink-0" />
            <span>
              {vehicle.documents.length > 0
                ? `${vehicle.documents.length} documento${vehicle.documents.length > 1 ? "s" : ""}`
                : "Sin documentos"}
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
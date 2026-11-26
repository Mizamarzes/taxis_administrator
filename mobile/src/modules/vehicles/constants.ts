import type { VehicleStatus } from "./types/vehicle.types"
import type { BadgeTone } from "@/components/ui/Badge"

export const VEHICLE_STATUS: Record<VehicleStatus, { label: string; tone: BadgeTone }> = {
  active: { label: "Activo", tone: "success" },
  inactive: { label: "Inactivo", tone: "muted" },
  in_maintenance: { label: "Mantenimiento", tone: "warning" },
  out_of_service: { label: "Fuera de servicio", tone: "destructive" },
}

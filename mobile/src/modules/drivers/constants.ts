import type { DriverStatus } from "./types/driver.types"
import type { BadgeTone } from "@/components/ui/Badge"

export const DRIVER_STATUS: Record<DriverStatus, { label: string; tone: BadgeTone }> = {
  active: { label: "Activo", tone: "success" },
  inactive: { label: "Inactivo", tone: "muted" },
  suspended: { label: "Suspendido", tone: "destructive" },
}

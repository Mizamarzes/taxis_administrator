import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  CarFrontIcon,
  CalendarOffIcon,
  UserIcon,
  FileTextIcon,
  CalendarIcon,
  PhoneIcon,
  MailIcon,
} from "lucide-react"
import type { Vehicle, VehicleStatus, DriverStatus } from "../types/vehicle.types"
import { getRestrictionDayLabel } from "../types/vehicle.types"

const driverStatusLabel: Record<DriverStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
  suspended: "Suspendido",
}

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

interface VehicleDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: Vehicle | null
}

const formatDate = (value: string | null): string => {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="mt-0.5 text-muted-foreground shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium wrap-break-word">{value || "—"}</p>
      </div>
    </div>
  )
}

export function VehicleDetailModal({ open, onOpenChange, vehicle }: VehicleDetailModalProps) {
  if (!vehicle) return null

  const status = statusConfig[vehicle.vehicleStatus]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalle del vehículo</DialogTitle>
          <DialogDescription>Información registrada del vehículo.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3 py-2">
          <div className="size-16 rounded-xl bg-muted flex items-center justify-center">
            <CarFrontIcon className="size-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h3 className="font-mono font-semibold text-lg leading-tight tracking-wider">
              {vehicle.plate}
            </h3>
            <Badge variant="outline" className={`mt-1 text-xs font-medium ${status.className}`}>
              {status.label}
            </Badge>
          </div>
        </div>

        <div className="divide-y rounded-lg border px-4">
          <DetailRow
            icon={<CalendarOffIcon className="size-4" />}
            label="Pico y placa"
            value={getRestrictionDayLabel(vehicle.drivingRestrictionDay)}
          />
          <DetailRow
            icon={<UserIcon className="size-4" />}
            label="Conductor asignado"
            value={
              vehicle.driver ? (
                <span className="flex flex-wrap items-center gap-2">
                  {vehicle.driver.name}
                  <Badge variant="outline" className="text-xs font-normal">
                    {driverStatusLabel[vehicle.driver.status]}
                  </Badge>
                </span>
              ) : (
                "Sin asignar"
              )
            }
          />
          {vehicle.driver?.phone && (
            <DetailRow
              icon={<PhoneIcon className="size-4" />}
              label="Teléfono del conductor"
              value={vehicle.driver.phone}
            />
          )}
          {vehicle.driver?.email && (
            <DetailRow
              icon={<MailIcon className="size-4" />}
              label="Correo del conductor"
              value={vehicle.driver.email}
            />
          )}
          <DetailRow
            icon={<FileTextIcon className="size-4" />}
            label="Documentos"
            value={
              vehicle.documents.length > 0
                ? `${vehicle.documents.length} documento${vehicle.documents.length > 1 ? "s" : ""}`
                : "Sin documentos"
            }
          />
          <DetailRow
            icon={<CalendarIcon className="size-4" />}
            label="Registrado"
            value={formatDate(vehicle.createdAt)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
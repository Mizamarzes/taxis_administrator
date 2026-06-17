import Avatar from "react-avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  CalendarIcon,
} from "lucide-react"
import type { Driver, DriverStatus } from "../types/driver.types"

const statusConfig: Record<DriverStatus, { label: string; className: string; dot: string }> = {
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
  suspended: {
    label: "Suspendido",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    dot: "bg-red-500",
  },
}

interface DriverDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  driver: Driver | null
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

export function DriverDetailModal({ open, onOpenChange, driver }: DriverDetailModalProps) {
  if (!driver) return null

  const status = statusConfig[driver.status]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalle del conductor</DialogTitle>
          <DialogDescription>Información registrada del conductor.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3 py-2">
          <div className="relative">
            <Avatar
              name={driver.name}
              src={driver.photoUrl ?? undefined}
              size="88px"
              round="14px"
            />
            <span
              className={`absolute -bottom-1 -right-1 size-4 rounded-full ring-2 ring-background ${status.dot}`}
            />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-lg leading-tight">{driver.name}</h3>
            <Badge variant="outline" className={`mt-1 text-xs font-medium ${status.className}`}>
              {status.label}
            </Badge>
          </div>
        </div>

        <div className="divide-y rounded-lg border px-4">
          <DetailRow icon={<PhoneIcon className="size-4" />} label="Teléfono" value={driver.phone} />
          <DetailRow icon={<MailIcon className="size-4" />} label="Correo" value={driver.email} />
          <DetailRow
            icon={<MapPinIcon className="size-4" />}
            label="Dirección"
            value={driver.address}
          />
          <DetailRow
            icon={<CalendarIcon className="size-4" />}
            label="Fecha de contratación"
            value={formatDate(driver.hireDate)}
          />
          <DetailRow
            icon={<CalendarIcon className="size-4" />}
            label="Registrado"
            value={formatDate(driver.createdAt)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
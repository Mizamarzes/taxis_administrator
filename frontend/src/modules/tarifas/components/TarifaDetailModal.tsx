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
  UserIcon,
  CalendarIcon,
  FileTextIcon,
  WalletIcon,
} from "lucide-react"
import { formatDateOnly } from "@/lib/utils"
import type { PaymentMethod, Tarifa } from "../types/tarifa.types"

const paymentMethodConfig: Record<PaymentMethod, { label: string; className: string }> = {
  cash: {
    label: "Efectivo",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  nequi: {
    label: "Nequi",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  daviplata: {
    label: "Daviplata",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
}

interface TarifaDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tarifa: Tarifa | null
}

const formatDate = (value: string | null): string =>
  formatDateOnly(value, { year: "numeric", month: "long", day: "numeric" })

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

export function TarifaDetailModal({ open, onOpenChange, tarifa }: TarifaDetailModalProps) {
  if (!tarifa) return null

  const payment = tarifa.paymentMethod ? paymentMethodConfig[tarifa.paymentMethod] : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalle de la tarifa</DialogTitle>
          <DialogDescription>
            Tarifa #{String(tarifa.id).padStart(3, "0")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-2 py-2">
          <p className="text-3xl font-bold">
            ${Number(tarifa.amount).toLocaleString("es-CO")}
          </p>
          {payment && (
            <Badge variant="outline" className={`text-xs font-medium ${payment.className}`}>
              {payment.label}
            </Badge>
          )}
        </div>

        <div className="divide-y rounded-lg border px-4">
          <DetailRow
            icon={<CarFrontIcon className="size-4" />}
            label="Vehículo"
            value={tarifa.vehiclePlate}
          />
          <DetailRow
            icon={<UserIcon className="size-4" />}
            label="Conductor"
            value={tarifa.driverName}
          />
          <DetailRow
            icon={<WalletIcon className="size-4" />}
            label="Método de pago"
            value={payment?.label}
          />
          <DetailRow
            icon={<CalendarIcon className="size-4" />}
            label="Fecha de la tarifa"
            value={formatDate(tarifa.tarifaDate)}
          />
          <DetailRow
            icon={<FileTextIcon className="size-4" />}
            label="Descripción"
            value={tarifa.description}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
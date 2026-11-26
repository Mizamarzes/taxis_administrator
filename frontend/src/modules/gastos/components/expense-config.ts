import type {
  ExpenseCategory,
  ExpenseItemType,
  VehicleExpenseSummary,
} from "../types/gasto.types"

export { formatCurrency, paymentMethodLabels } from "@/modules/deudas/components/movement-config"

export const expenseCategoryConfig: Record<
  ExpenseCategory,
  { label: string; className: string }
> = {
  oil_change: {
    label: "Cambio de aceite",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  maintenance: {
    label: "Mantenimiento",
    className: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  },
  repair: {
    label: "Reparación",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  spare_part: {
    label: "Repuesto",
    className: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  },
  tires: {
    label: "Llantas",
    className: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  },
  bodywork: {
    label: "Latonería y pintura",
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  wash: {
    label: "Lavada",
    className: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  },
  other: {
    label: "Otro",
    className: "bg-muted text-muted-foreground",
  },
}

export const itemTypeLabels: Record<ExpenseItemType, string> = {
  part: "Repuesto",
  fluid: "Aceite / líquido",
  labor: "Mano de obra",
  other: "Otro",
}

export const formatKm = (value: number | null) =>
  value == null ? "—" : `${value.toLocaleString("es-CO")} km`

const OIL_KM_WARNING = 500
const OIL_DAYS_WARNING = 15

export type OilStatus = "none" | "ok" | "soon" | "overdue"

export const getOilStatus = (summary: VehicleExpenseSummary): OilStatus => {
  const { nextOilChangeKm, nextOilChangeDate, lastOdometerKm } = summary
  if (nextOilChangeKm == null && !nextOilChangeDate) return "none"

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let daysLeft: number | null = null
  if (nextOilChangeDate) {
    const [year, month, day] = nextOilChangeDate.split("-").map(Number)
    daysLeft = Math.round((new Date(year, month - 1, day).getTime() - today.getTime()) / 86400000)
  }
  const kmLeft =
    nextOilChangeKm != null && lastOdometerKm != null ? nextOilChangeKm - lastOdometerKm : null

  if ((kmLeft != null && kmLeft <= 0) || (daysLeft != null && daysLeft < 0)) return "overdue"
  if (
    (kmLeft != null && kmLeft <= OIL_KM_WARNING) ||
    (daysLeft != null && daysLeft <= OIL_DAYS_WARNING)
  ) {
    return "soon"
  }
  return "ok"
}

export const oilStatusConfig: Record<OilStatus, { label: string; bar: string; text: string }> = {
  none: {
    label: "Sin cambio de aceite registrado",
    bar: "bg-muted-foreground/30",
    text: "text-muted-foreground",
  },
  ok: {
    label: "Aceite al día",
    bar: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  soon: {
    label: "Cambio de aceite próximo",
    bar: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
  },
  overdue: {
    label: "Cambio de aceite vencido",
    bar: "bg-red-500",
    text: "text-red-600 dark:text-red-400",
  },
}

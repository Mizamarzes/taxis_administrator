import type Ionicons from "@expo/vector-icons/Ionicons"
import type { BadgeTone } from "@/components/ui/Badge"
import { formatDateOnly, formatKm, parseDateOnly } from "@/lib/format"
import type { ExpenseCategory, ExpenseItemType, VehicleExpenseSummary } from "./types/gasto.types"

export const EXPENSE_CATEGORIES: Record<
  ExpenseCategory,
  { label: string; tone: BadgeTone; icon: keyof typeof Ionicons.glyphMap }
> = {
  oil_change: { label: "Cambio de aceite", tone: "warning", icon: "water-outline" },
  maintenance: { label: "Mantenimiento", tone: "info", icon: "build-outline" },
  repair: { label: "Reparación", tone: "destructive", icon: "construct-outline" },
  spare_part: { label: "Repuesto", tone: "primary", icon: "cog-outline" },
  tires: { label: "Llantas", tone: "muted", icon: "disc-outline" },
  bodywork: { label: "Latonería y pintura", tone: "warning", icon: "color-palette-outline" },
  wash: { label: "Lavada", tone: "info", icon: "sparkles-outline" },
  other: { label: "Otro", tone: "muted", icon: "ellipsis-horizontal-circle-outline" },
}

export const EXPENSE_CATEGORY_OPTIONS = (Object.keys(EXPENSE_CATEGORIES) as ExpenseCategory[]).map((value) => ({
  value,
  label: EXPENSE_CATEGORIES[value].label,
}))

export const isExpenseCategory = (value: unknown): value is ExpenseCategory =>
  typeof value === "string" && value in EXPENSE_CATEGORIES

export const ITEM_TYPES: Record<ExpenseItemType, string> = {
  part: "Repuesto",
  fluid: "Aceite / líquido",
  labor: "Mano de obra",
  other: "Otro",
}

export const ITEM_TYPE_OPTIONS = (Object.keys(ITEM_TYPES) as ExpenseItemType[]).map((value) => ({
  value,
  label: ITEM_TYPES[value],
}))

const OIL_KM_WARNING = 500
const OIL_DAYS_WARNING = 15

export type OilStatus = "none" | "ok" | "soon" | "overdue"

export const OIL_STATUS: Record<OilStatus, { label: string; tone: BadgeTone }> = {
  none: { label: "Sin cambio de aceite registrado", tone: "muted" },
  ok: { label: "Aceite al día", tone: "success" },
  soon: { label: "Cambio de aceite próximo", tone: "warning" },
  overdue: { label: "Cambio de aceite vencido", tone: "destructive" },
}

export function getOilStatus(summary: VehicleExpenseSummary): OilStatus {
  const { nextOilChangeKm, nextOilChangeDate, lastOdometerKm } = summary
  if (nextOilChangeKm == null && !nextOilChangeDate) return "none"

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const nextDate = parseDateOnly(nextOilChangeDate)
  const daysLeft = nextDate ? Math.round((nextDate.getTime() - today.getTime()) / 86400000) : null
  const kmLeft = nextOilChangeKm != null && lastOdometerKm != null ? nextOilChangeKm - lastOdometerKm : null

  if ((kmLeft != null && kmLeft <= 0) || (daysLeft != null && daysLeft < 0)) return "overdue"
  if ((kmLeft != null && kmLeft <= OIL_KM_WARNING) || (daysLeft != null && daysLeft <= OIL_DAYS_WARNING)) {
    return "soon"
  }
  return "ok"
}

export const isOilPending = (summary: VehicleExpenseSummary) => {
  const status = getOilStatus(summary)
  return status === "soon" || status === "overdue"
}

export function formatNextService(km: number | null, date: string | null): string | null {
  const parts = [km != null ? formatKm(km) : null, date ? formatDateOnly(date) : null].filter(Boolean)
  return parts.length > 0 ? parts.join(" · ") : null
}

import type Ionicons from "@expo/vector-icons/Ionicons"
import type { BadgeTone } from "@/components/ui/Badge"
import type { DeudaMovementType } from "./types/deuda.types"

export const MOVEMENT_TYPES: Record<
  DeudaMovementType,
  { label: string; sign: "+" | "-"; tone: BadgeTone; icon: keyof typeof Ionicons.glyphMap }
> = {
  debt: { label: "Deuda", sign: "+", tone: "destructive", icon: "add-circle-outline" },
  payment: { label: "Abono", sign: "-", tone: "success", icon: "cash-outline" },
  forgiveness: { label: "Condonación", sign: "-", tone: "info", icon: "heart-outline" },
}

export const MOVEMENT_TYPE_OPTIONS = (Object.keys(MOVEMENT_TYPES) as DeudaMovementType[]).map((value) => ({
  value,
  label: MOVEMENT_TYPES[value].label,
}))

export const isMovementType = (value: unknown): value is DeudaMovementType =>
  typeof value === "string" && value in MOVEMENT_TYPES

export function getBalanceTone(balance: number): { label: string; tone: BadgeTone } {
  if (balance > 0) return { label: "Debe", tone: "destructive" }
  if (balance < 0) return { label: "Saldo a favor", tone: "success" }
  return { label: "Al día", tone: "muted" }
}

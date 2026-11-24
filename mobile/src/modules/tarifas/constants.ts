import type { PaymentMethod } from "./types/tarifa.types"
import type { BadgeTone } from "@/components/ui/Badge"

export const PAYMENT_METHODS: Record<PaymentMethod, { label: string; tone: BadgeTone }> = {
  cash: { label: "Efectivo", tone: "success" },
  nequi: { label: "Nequi", tone: "info" },
  daviplata: { label: "Daviplata", tone: "destructive" },
}

export const PAYMENT_METHOD_OPTIONS = (Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((value) => ({
  value,
  label: PAYMENT_METHODS[value].label,
}))

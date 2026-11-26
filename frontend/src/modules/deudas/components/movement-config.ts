import type { PaymentMethod } from "@/modules/tarifas/types/tarifa.types"
import type { DeudaMovementType } from "../types/deuda.types"

export const movementTypeConfig: Record<
  DeudaMovementType,
  { label: string; sign: "+" | "-"; className: string; amountClassName: string }
> = {
  debt: {
    label: "Deuda",
    sign: "+",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    amountClassName: "text-red-600 dark:text-red-400",
  },
  payment: {
    label: "Abono",
    sign: "-",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    amountClassName: "text-emerald-600 dark:text-emerald-400",
  },
  forgiveness: {
    label: "Condonación",
    sign: "-",
    className: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
    amountClassName: "text-sky-600 dark:text-sky-400",
  },
}

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: "Efectivo",
  nequi: "Nequi",
  daviplata: "Daviplata",
}

export const formatCurrency = (value: number) =>
  `$${Math.abs(value).toLocaleString("es-CO", { maximumFractionDigits: 2 })}`

export const balanceTone = (balance: number) => {
  if (balance > 0) {
    return {
      label: "Debe",
      bar: "bg-red-500",
      text: "text-red-600 dark:text-red-400",
    }
  }
  if (balance < 0) {
    return {
      label: "Saldo a favor",
      bar: "bg-emerald-500",
      text: "text-emerald-600 dark:text-emerald-400",
    }
  }
  return {
    label: "Al día",
    bar: "bg-muted-foreground/30",
    text: "text-muted-foreground",
  }
}

import type { BadgeTone } from "@/components/ui/Badge"
import { formatDateOnly, formatKm } from "@/lib/format"
import type { OilChangePrediction, OilChangeStatus, PredictionConfidence } from "./types/prediction.types"

export const OIL_PREDICTION_STATUS: Record<OilChangeStatus, { label: string; tone: BadgeTone }> = {
  none: { label: "Sin registro", tone: "muted" },
  unknown: { label: "Sin datos", tone: "muted" },
  ok: { label: "Al día", tone: "success" },
  soon: { label: "Próximo", tone: "warning" },
  overdue: { label: "Vencido", tone: "destructive" },
}

export const CONFIDENCE_LABELS: Record<PredictionConfidence, string> = {
  high: "Confianza alta",
  medium: "Confianza media",
  low: "Confianza baja (promedio de la flota)",
}

const plural = (value: number, singular: string, pluralForm: string) => (value === 1 ? singular : pluralForm)

export function describeDue(prediction: OilChangePrediction): string {
  if (prediction.status === "none") return "Sin cambio de aceite registrado"

  const days = prediction.daysUntilDue
  if (days == null) {
    if (prediction.kmRemaining != null && prediction.kmRemaining <= 0) return "Kilometraje de cambio superado"
    if (prediction.kmRemaining != null) return `Faltan ${formatKm(prediction.kmRemaining)}`
    return "Registra el km en los gastos para estimar"
  }
  if (days < 0) {
    const elapsed = Math.abs(days)
    return `Vencido hace ${elapsed} ${plural(elapsed, "día", "días")}`
  }
  if (days === 0) return "Le toca hoy"

  const date = formatDateOnly(prediction.predictedDueDate, { day: "numeric", month: "short" })
  return `En ${days} ${plural(days, "día", "días")} · ${date}`
}

export function describeBasis(prediction: OilChangePrediction): string | null {
  const parts = [
    prediction.kmPerDay != null ? `${prediction.kmPerDay.toLocaleString("es-CO")} km/día` : null,
    prediction.dueBy === "date" ? "por fecha programada" : prediction.dueBy === "km" ? "por kilometraje" : null,
    prediction.confidence ? CONFIDENCE_LABELS[prediction.confidence] : null,
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(" · ") : null
}

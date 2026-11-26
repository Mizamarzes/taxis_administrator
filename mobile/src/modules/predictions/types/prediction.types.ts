export type OilChangeStatus = "none" | "unknown" | "ok" | "soon" | "overdue"
export type OilChangeMethod = "vehicle_regression" | "two_point_trend" | "fleet_average"
export type PredictionConfidence = "high" | "medium" | "low"

export interface TrainingInfo {
  name: string
  version: string
  trainedAt: string
  fleetKmPerDay: number | null
  metrics: Record<string, number | null>
}

export interface OilChangePrediction {
  vehicleId: number
  plate: string
  lastOdometerKm: number | null
  lastReadingDate: string | null
  kmPerDay: number | null
  estimatedCurrentKm: number | null
  nextOilChangeKm: number | null
  nextOilChangeDate: string | null
  kmRemaining: number | null
  daysUntilDue: number | null
  predictedDueDate: string | null
  dueBy: "km" | "date" | null
  status: OilChangeStatus
  method: OilChangeMethod | null
  confidence: PredictionConfidence | null
  r2: number | null
  readings: number
}

export interface OilChangePredictionsResponse {
  training: TrainingInfo
  predictions: OilChangePrediction[]
}

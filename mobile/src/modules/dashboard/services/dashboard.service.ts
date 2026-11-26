import api, { extractApiMessage, type ApiResponse } from "@/lib/api"
import type { DashboardSummary } from "../types/dashboard.types"

export async function getDashboardSummaryService(params: {
  from?: string
  to?: string
}): Promise<ApiResponse<DashboardSummary>> {
  try {
    const response = await api.get<ApiResponse<DashboardSummary>>("dashboard/summary", { params })
    return response.data
  } catch (error) {
    throw new Error(extractApiMessage(error, "Error al obtener la información del dashboard"))
  }
}

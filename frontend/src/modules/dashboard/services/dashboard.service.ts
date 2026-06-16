import api from "@/lib/axios"
import type { DashboardSummary } from "../types/dashboard.types"

interface ApiResponse<T> {
  message: string
  data: T
}

export async function getDashboardSummaryService(params: {
  from?: string
  to?: string
}): Promise<ApiResponse<DashboardSummary>> {
  try {
    const response = await api.get<ApiResponse<DashboardSummary>>(
      "dashboard/summary",
      { params }
    )
    return response.data
  } catch (error) {
    throw new Error("Error al obtener la información del dashboard")
  }
}

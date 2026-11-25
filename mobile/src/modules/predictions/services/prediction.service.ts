import api, { extractApiMessage, type ApiResponse } from "@/lib/api"
import type { OilChangePredictionsResponse } from "../types/prediction.types"

export async function getOilChangePredictionsService(
  vehicleId?: number,
): Promise<ApiResponse<OilChangePredictionsResponse>> {
  try {
    const response = await api.get<ApiResponse<OilChangePredictionsResponse>>("predictions/oil-change", {
      params: vehicleId ? { vehicleId } : undefined,
    })
    return response.data
  } catch (error) {
    throw new Error(extractApiMessage(error, "No se pudieron obtener las predicciones"))
  }
}

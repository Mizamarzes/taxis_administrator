import api from "@/lib/axios"
import type {
  ICreateTarifaPayload,
  IUpdateTarifaPayload,
  ITarifasPaginatedResponse,
  Tarifa,
} from "../types/tarifa.types"

interface ApiResponse<T> {
  message: string
  data: T
}

export async function createTarifaService(
  payload: ICreateTarifaPayload
): Promise<ApiResponse<Tarifa>> {
  try {
    const response = await api.post<ApiResponse<Tarifa>>("tarifas/create", payload)
    return response.data
  } catch (error) {
    throw new Error("Error al crear la tarifa")
  }
}

export async function getTarifasService(params: {
  page: number
  limit: number
  search?: string
  tarifaDateFrom?: string
  tarifaDateTo?: string
}): Promise<ApiResponse<ITarifasPaginatedResponse>> {
  try {
    const response = await api.get<ApiResponse<ITarifasPaginatedResponse>>(
      "tarifas/get-all",
      { params }
    )
    return response.data
  } catch (error) {
    throw new Error("Error al obtener las tarifas")
  }
}

export async function getTarifaByIdService(id: number): Promise<ApiResponse<Tarifa>> {
  try {
    const response = await api.get<ApiResponse<Tarifa>>(`tarifas/get/${id}`)
    return response.data
  } catch (error) {
    throw new Error("Error al obtener la tarifa")
  }
}

export async function updateTarifaService(
  id: number,
  payload: IUpdateTarifaPayload
): Promise<ApiResponse<Tarifa>> {
  try {
    const response = await api.patch<ApiResponse<Tarifa>>(`tarifas/update/${id}`, payload)
    return response.data
  } catch (error) {
    throw new Error("Error al actualizar la tarifa")
  }
}

export async function deleteTarifaService(
  id: number
): Promise<ApiResponse<{ message: string }>> {
  try {
    const response = await api.delete<ApiResponse<{ message: string }>>(
      `tarifas/remove/${id}`
    )
    return response.data
  } catch (error) {
    throw new Error("Error al eliminar la tarifa")
  }
}

import api from "@/lib/axios"
import type {
  ICreateDriverPayload,
  IUpdateDriverPayload,
  IDriversPaginatedResponse,
  Driver,
} from "../types/driver.types"

interface ApiResponse<T> {
  message: string
  data: T
}

export async function createDriverService(
  payload: ICreateDriverPayload
): Promise<ApiResponse<Driver>> {
  try {
    const response = await api.post<ApiResponse<Driver>>("drivers/create", payload)
    return response.data
  } catch (error) {
    throw new Error("Error al crear el conductor")
  }
}

export async function getDriversService(params: {
  page: number
  limit: number
}): Promise<ApiResponse<IDriversPaginatedResponse>> {
  try {
    const response = await api.get<ApiResponse<IDriversPaginatedResponse>>(
      "drivers/get-all",
      { params }
    )
    return response.data
  } catch (error) {
    throw new Error("Error al obtener los conductores")
  }
}

export async function getDriverByIdService(id: number): Promise<ApiResponse<Driver>> {
  try {
    const response = await api.get<ApiResponse<Driver>>(`drivers/get/${id}`)
    return response.data
  } catch (error) {
    throw new Error("Error al obtener el conductor")
  }
}

export async function updateDriverService(
  id: number,
  payload: IUpdateDriverPayload
): Promise<ApiResponse<Driver>> {
  try {
    const response = await api.patch<ApiResponse<Driver>>(`drivers/update/${id}`, payload)
    return response.data
  } catch (error) {
    throw new Error("Error al actualizar el conductor")
  }
}

export async function deleteDriverService(
  id: number
): Promise<ApiResponse<{ message: string }>> {
  try {
    const response = await api.delete<ApiResponse<{ message: string }>>(
      `drivers/remove/${id}`
    )
    return response.data
  } catch (error) {
    throw new Error("Error al eliminar el conductor")
  }
}
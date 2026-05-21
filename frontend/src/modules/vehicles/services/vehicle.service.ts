import api from "@/lib/axios"
import type {
  ICreateVehiclePayload,
  IUpdateVehiclePayload,
  IVehiclesPaginatedResponse,
  Vehicle,
} from "../types/vehicle.types"

interface ApiResponse<T> {
  message: string
  data: T
}

export async function createVehicleService(
  payload: ICreateVehiclePayload
): Promise<ApiResponse<Vehicle>> {
  try {
    const response = await api.post<ApiResponse<Vehicle>>("vehicles/create", payload)
    return response.data
  } catch (error) {
    throw new Error("Error al crear el vehículo")
  }
}

export async function getVehiclesService(params: {
  page: number
  limit: number
}): Promise<ApiResponse<IVehiclesPaginatedResponse>> {
  try {
    const response = await api.get<ApiResponse<IVehiclesPaginatedResponse>>(
      "vehicles/get-all",
      { params }
    )
    return response.data
  } catch (error) {
    throw new Error("Error al obtener los vehículos")
  }
}

export async function getVehicleByIdService(id: number): Promise<ApiResponse<Vehicle>> {
  try {
    const response = await api.get<ApiResponse<Vehicle>>(`vehicles/get/${id}`)
    return response.data
  } catch (error) {
    throw new Error("Error al obtener el vehículo")
  }
}

export async function updateVehicleService(
  id: number,
  payload: IUpdateVehiclePayload
): Promise<ApiResponse<Vehicle>> {
  try {
    const response = await api.patch<ApiResponse<Vehicle>>(`vehicles/update/${id}`, payload)
    return response.data
  } catch (error) {
    throw new Error("Error al actualizar el vehículo")
  }
}

export async function deleteVehicleService(
  id: number
): Promise<ApiResponse<{ message: string }>> {
  try {
    const response = await api.delete<ApiResponse<{ message: string }>>(
      `vehicles/remove/${id}`
    )
    return response.data
  } catch (error) {
    throw new Error("Error al eliminar el vehículo")
  }
}
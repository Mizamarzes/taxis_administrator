import api from "@/lib/axios"
import type {
  DeudaMovement,
  DriverBalance,
  DriverStatement,
  ICreateDeudaMovementPayload,
  IUpdateDeudaMovementPayload,
} from "../types/deuda.types"

interface ApiResponse<T> {
  message: string
  data: T
}

export async function getBalancesService(): Promise<ApiResponse<DriverBalance[]>> {
  try {
    const response = await api.get<ApiResponse<DriverBalance[]>>("deudas/balances")
    return response.data
  } catch (error) {
    throw new Error("Error al obtener los saldos")
  }
}

export async function getStatementService(
  driverId: number
): Promise<ApiResponse<DriverStatement>> {
  try {
    const response = await api.get<ApiResponse<DriverStatement>>(
      `deudas/statement/${driverId}`
    )
    return response.data
  } catch (error) {
    throw new Error("Error al obtener el extracto")
  }
}

export async function createMovementService(
  payload: ICreateDeudaMovementPayload
): Promise<ApiResponse<DeudaMovement>> {
  try {
    const response = await api.post<ApiResponse<DeudaMovement>>("deudas/create", payload)
    return response.data
  } catch (error) {
    throw new Error("Error al registrar el movimiento")
  }
}

export async function updateMovementService(
  id: number,
  payload: IUpdateDeudaMovementPayload
): Promise<ApiResponse<DeudaMovement>> {
  try {
    const response = await api.patch<ApiResponse<DeudaMovement>>(
      `deudas/update/${id}`,
      payload
    )
    return response.data
  } catch (error) {
    throw new Error("Error al actualizar el movimiento")
  }
}

export async function deleteMovementService(
  id: number
): Promise<ApiResponse<{ message: string }>> {
  try {
    const response = await api.delete<ApiResponse<{ message: string }>>(
      `deudas/remove/${id}`
    )
    return response.data
  } catch (error) {
    throw new Error("Error al eliminar el movimiento")
  }
}

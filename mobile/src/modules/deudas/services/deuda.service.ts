import api, { extractApiMessage, type ApiResponse } from "@/lib/api"
import type {
  DeudaMovement,
  DriverBalance,
  DriverStatement,
  ICreateDeudaMovementPayload,
  IUpdateDeudaMovementPayload,
} from "../types/deuda.types"

export async function getBalancesService(): Promise<ApiResponse<DriverBalance[]>> {
  try {
    const response = await api.get<ApiResponse<DriverBalance[]>>("deudas/balances")
    return response.data
  } catch (error) {
    throw new Error(extractApiMessage(error, "Error al obtener los saldos"))
  }
}

export async function getStatementService(driverId: number): Promise<ApiResponse<DriverStatement>> {
  try {
    const response = await api.get<ApiResponse<DriverStatement>>(`deudas/statement/${driverId}`)
    return response.data
  } catch (error) {
    throw new Error(extractApiMessage(error, "Error al obtener el estado de cuenta"))
  }
}

export async function getMovementByIdService(id: number): Promise<ApiResponse<DeudaMovement>> {
  try {
    const response = await api.get<ApiResponse<DeudaMovement>>(`deudas/get/${id}`)
    return response.data
  } catch (error) {
    throw new Error(extractApiMessage(error, "Error al obtener el movimiento"))
  }
}

export async function createMovementService(payload: ICreateDeudaMovementPayload): Promise<ApiResponse<DeudaMovement>> {
  try {
    const response = await api.post<ApiResponse<DeudaMovement>>("deudas/create", payload)
    return response.data
  } catch (error) {
    throw new Error(extractApiMessage(error, "Error al registrar el movimiento"))
  }
}

export async function updateMovementService(
  id: number,
  payload: IUpdateDeudaMovementPayload,
): Promise<ApiResponse<DeudaMovement>> {
  try {
    const response = await api.patch<ApiResponse<DeudaMovement>>(`deudas/update/${id}`, payload)
    return response.data
  } catch (error) {
    throw new Error(extractApiMessage(error, "Error al actualizar el movimiento"))
  }
}

export async function deleteMovementService(id: number): Promise<ApiResponse<{ message: string }>> {
  try {
    const response = await api.delete<ApiResponse<{ message: string }>>(`deudas/remove/${id}`)
    return response.data
  } catch (error) {
    throw new Error(extractApiMessage(error, "Error al eliminar el movimiento"))
  }
}

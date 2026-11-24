import api from "@/lib/axios"
import type {
  ICreateVehicleExpensePayload,
  IUpdateVehicleExpensePayload,
  VehicleExpense,
  VehicleExpenseSummary,
  VehicleExpensesStatement,
} from "../types/gasto.types"

interface ApiResponse<T> {
  message: string
  data: T
}

export async function getSummariesService(): Promise<ApiResponse<VehicleExpenseSummary[]>> {
  try {
    const response = await api.get<ApiResponse<VehicleExpenseSummary[]>>("gastos/summaries")
    return response.data
  } catch (error) {
    throw new Error("Error al obtener el resumen de gastos")
  }
}

export async function getVehicleExpensesService(
  vehicleId: number
): Promise<ApiResponse<VehicleExpensesStatement>> {
  try {
    const response = await api.get<ApiResponse<VehicleExpensesStatement>>(
      `gastos/vehicle/${vehicleId}`
    )
    return response.data
  } catch (error) {
    throw new Error("Error al obtener los gastos del vehículo")
  }
}

export async function createExpenseService(
  payload: ICreateVehicleExpensePayload
): Promise<ApiResponse<VehicleExpense>> {
  try {
    const response = await api.post<ApiResponse<VehicleExpense>>("gastos/create", payload)
    return response.data
  } catch (error) {
    throw new Error("Error al registrar el gasto")
  }
}

export async function updateExpenseService(
  id: number,
  payload: IUpdateVehicleExpensePayload
): Promise<ApiResponse<VehicleExpense>> {
  try {
    const response = await api.patch<ApiResponse<VehicleExpense>>(
      `gastos/update/${id}`,
      payload
    )
    return response.data
  } catch (error) {
    throw new Error("Error al actualizar el gasto")
  }
}

export async function deleteExpenseService(
  id: number
): Promise<ApiResponse<{ message: string }>> {
  try {
    const response = await api.delete<ApiResponse<{ message: string }>>(
      `gastos/remove/${id}`
    )
    return response.data
  } catch (error) {
    throw new Error("Error al eliminar el gasto")
  }
}

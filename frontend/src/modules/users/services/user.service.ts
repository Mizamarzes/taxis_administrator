import api from "@/lib/axios"
import type {
  ICreateUserPayload,
  IUpdateUserPayload,
  IUsersPaginatedResponse,
  User,
} from "../types/user.types"

interface ApiResponse<T> {
  message: string
  data: T
}

export async function createUserService(
  payload: ICreateUserPayload
): Promise<ApiResponse<User>> {
  try {
    const response = await api.post<ApiResponse<User>>("users/create", payload)
    return response.data
  } catch (error) {
    throw new Error("Error al crear el usuario")
  }
}

export async function getUsersService(params: {
  page: number
  limit: number
}): Promise<ApiResponse<IUsersPaginatedResponse>> {
  try {
    const response = await api.get<ApiResponse<IUsersPaginatedResponse>>(
      "users/get-all",
      { params }
    )
    return response.data
  } catch (error) {
    throw new Error("Error al obtener los usuarios")
  }
}

export async function getUserByIdService(id: number): Promise<ApiResponse<User>> {
  try {
    const response = await api.get<ApiResponse<User>>(`users/get/${id}`)
    return response.data
  } catch (error) {
    throw new Error("Error al obtener el usuario")
  }
}

export async function updateUserService(
  id: number,
  payload: IUpdateUserPayload
): Promise<ApiResponse<User>> {
  try {
    const response = await api.patch<ApiResponse<User>>(`users/update/${id}`, payload)
    return response.data
  } catch (error) {
    throw new Error("Error al actualizar el usuario")
  }
}

export async function deleteUserService(
  id: number
): Promise<ApiResponse<{ message: string }>> {
  try {
    const response = await api.delete<ApiResponse<{ message: string }>>(
      `users/remove/${id}`
    )
    return response.data
  } catch (error) {
    throw new Error("Error al eliminar el usuario")
  }
}
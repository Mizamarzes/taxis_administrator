import api, { extractApiMessage, type ApiResponse } from "@/lib/api"
import type { ILogin } from "../types/login.types"
import type { AuthUser, MobileLoginResponse } from "../types/auth.types"

export async function loginService(payload: ILogin): Promise<MobileLoginResponse> {
  try {
    const response = await api.post<ApiResponse<MobileLoginResponse>>("auth/login/mobile", payload)
    return response.data.data
  } catch (error) {
    throw new Error(extractApiMessage(error, "No se pudo iniciar sesión"))
  }
}

export async function getAuthProfileService(): Promise<AuthUser> {
  const response = await api.get<ApiResponse<AuthUser>>("auth/profile")
  return response.data.data
}

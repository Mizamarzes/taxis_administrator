import api from "@/lib/axios"
import type { Profile } from "../types/profile.types"

interface ApiResponse<T> {
  message: string
  data: T
}

export async function getProfileService(): Promise<ApiResponse<Profile>> {
  try {
    const response = await api.get<ApiResponse<Profile>>("users/me")
    return response.data
  } catch (error) {
    throw new Error("Error al obtener el perfil")
  }
}
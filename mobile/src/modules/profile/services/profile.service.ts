import api, { extractApiMessage, type ApiResponse } from "@/lib/api"
import type { Profile } from "../types/profile.types"

export async function getProfileService(): Promise<ApiResponse<Profile>> {
  try {
    const response = await api.get<ApiResponse<Profile>>("users/me")
    return response.data
  } catch (error) {
    throw new Error(extractApiMessage(error, "Error al obtener el perfil"))
  }
}

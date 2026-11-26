import api, { extractApiMessage, type ApiResponse } from "@/lib/api"
import type { IRolePayload, PermissionGroup, Role, RoleDetail, RoleOption } from "../types/role.types"

export async function getRolesService(): Promise<ApiResponse<Role[]>> {
  try {
    const response = await api.get<ApiResponse<Role[]>>("roles/get-all")
    return response.data
  } catch (error) {
    throw new Error(extractApiMessage(error, "Error al obtener los roles"))
  }
}

export async function getRoleService(id: number): Promise<ApiResponse<RoleDetail>> {
  try {
    const response = await api.get<ApiResponse<RoleDetail>>(`roles/get/${id}`)
    return response.data
  } catch (error) {
    throw new Error(extractApiMessage(error, "Error al obtener el rol"))
  }
}

export async function getRoleOptionsService(): Promise<ApiResponse<RoleOption[]>> {
  try {
    const response = await api.get<ApiResponse<RoleOption[]>>("roles/options")
    return response.data
  } catch (error) {
    throw new Error(extractApiMessage(error, "Error al obtener los roles"))
  }
}

export async function getPermissionCatalogService(): Promise<ApiResponse<PermissionGroup[]>> {
  try {
    const response = await api.get<ApiResponse<PermissionGroup[]>>("permissions/get-all")
    return response.data
  } catch (error) {
    throw new Error(extractApiMessage(error, "Error al obtener los permisos"))
  }
}

export async function createRoleService(payload: IRolePayload): Promise<ApiResponse<RoleDetail>> {
  try {
    const response = await api.post<ApiResponse<RoleDetail>>("roles/create", payload)
    return response.data
  } catch (error) {
    throw new Error(extractApiMessage(error, "Error al crear el rol"))
  }
}

export async function updateRoleService(id: number, payload: IRolePayload): Promise<ApiResponse<RoleDetail>> {
  try {
    const response = await api.patch<ApiResponse<RoleDetail>>(`roles/update/${id}`, payload)
    return response.data
  } catch (error) {
    throw new Error(extractApiMessage(error, "Error al actualizar el rol"))
  }
}

export async function updateRolePermissionsService(id: number, actions: string[]): Promise<ApiResponse<RoleDetail>> {
  try {
    const response = await api.put<ApiResponse<RoleDetail>>(`roles/${id}/permissions`, { actions })
    return response.data
  } catch (error) {
    throw new Error(extractApiMessage(error, "Error al guardar los permisos"))
  }
}

export async function deleteRoleService(id: number): Promise<ApiResponse<{ message: string }>> {
  try {
    const response = await api.delete<ApiResponse<{ message: string }>>(`roles/remove/${id}`)
    return response.data
  } catch (error) {
    throw new Error(extractApiMessage(error, "Error al eliminar el rol"))
  }
}

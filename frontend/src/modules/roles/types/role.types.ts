export interface Role {
  id: number
  name: string
  description: string | null
  isSystem: boolean
  isSuperAdmin: boolean
  userCount: number
  permissionCount: number
}

export interface RoleDetail extends Role {
  permissions: string[]
}

export interface RoleOption {
  id: number
  name: string
}

export interface PermissionItem {
  action: string
  verb: string
  description: string
}

export interface PermissionGroup {
  resource: string
  label: string
  permissions: PermissionItem[]
}

export interface IRolePayload {
  name?: string
  description?: string
}

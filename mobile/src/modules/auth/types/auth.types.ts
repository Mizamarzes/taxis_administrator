export interface AuthUserRole {
  id: number
  name: string
}

export interface AuthUser {
  id: number
  name: string
  email: string
  role: AuthUserRole
  isActive: boolean
}

export interface MobileLoginResponse {
  accessToken: string
  email: string
}

export interface UserRole {
  id: number
  name: string
}

export interface User {
  id: number
  name: string
  email: string
  roles: UserRole[]
  isActive: boolean
  lastLogin: string | null
  createdAt: string
  updatedAt: string
}

export interface ICreateUserPayload {
  name: string
  email: string
  password: string
  roleNames?: string[]
}

export interface IUpdateUserPayload {
  name?: string
  password?: string
  roleNames?: string[]
  isActive?: boolean
}

export interface IUsersPaginatedResponse {
  items: User[]
  totalItems: number
  currentPage: number
  totalPages: number
  previousPage: number | null
  nextPage: number | null
}
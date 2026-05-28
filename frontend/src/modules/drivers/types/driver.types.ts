export type DriverStatus = "active" | "inactive" | "suspended"

export interface Driver {
  id: number
  name: string
  status: DriverStatus
  phone: string | null
  email: string | null
  address: string | null
  hireDate: string | null
  photoUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface ICreateDriverPayload {
  name: string
  phone?: string
  email?: string
  address?: string
  hireDate?: string
  photoUrl?: string
  status?: DriverStatus
}

export interface IUpdateDriverPayload {
  name?: string
  phone?: string
  email?: string
  address?: string
  hireDate?: string
  photoUrl?: string
  status?: DriverStatus
}

export interface IDriversPaginatedResponse {
  items: Driver[]
  totalItems: number
  currentPage: number
  totalPages: number
  previousPage: number | null
  nextPage: number | null
}
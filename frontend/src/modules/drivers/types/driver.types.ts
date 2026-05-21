export type DriverStatus = "active" | "inactive" | "suspended"

export interface DriverUser {
  id: number
  name: string
  email: string
}

export interface Driver {
  id: number
  userId: number
  user: DriverUser
  status: DriverStatus
  phone: string | null
  hireDate: string | null
  vehicleId: number | null
  photoUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface ICreateDriverPayload {
  userId: number
  phone?: string
  hireDate?: string
  vehicleId?: number
  photoUrl?: string
  status?: DriverStatus
}

export interface IUpdateDriverPayload {
  phone?: string
  hireDate?: string
  vehicleId?: number
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
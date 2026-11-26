export type PaymentMethod = "cash"  | "nequi" | "daviplata"

export interface Tarifa {
  id: number
  amount: number
  description: string | null
  paymentMethod: PaymentMethod | null
  tarifaDate: string | null
  driverId: number | null
  driverName: string | null
  vehicleId: number | null
  vehiclePlate: string | null
  createdAt: string
  updatedAt: string
}

export interface ICreateTarifaPayload {
  amount: number
  description?: string
  paymentMethod?: PaymentMethod
  tarifaDate?: string
  vehicleId?: number
}

export interface IUpdateTarifaPayload {
  amount?: number
  description?: string
  paymentMethod?: PaymentMethod
  tarifaDate?: string
  vehicleId?: number
}

export interface ITarifasPaginatedResponse {
  items: Tarifa[]
  totalItems: number
  currentPage: number
  totalPages: number
  previousPage: number | null
  nextPage: number | null
}

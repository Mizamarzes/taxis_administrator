export interface Tarifa {
  id: string
  driverName: string
  vehiclePlate: string
  amount: number
  date: string
  status: "paid" | "pending" | "overdue"
  notes?: string
  createdAt: string
}

export interface ICreateTarifaPayload {
  driverName: string
  vehiclePlate: string
  amount: number
  date: string
  notes?: string
}

export interface IUpdateTarifaPayload {
  driverName?: string
  vehiclePlate?: string
  amount?: number
  date?: string
  status?: Tarifa["status"]
  notes?: string
}

import type { DriverStatus } from "@/modules/drivers/types/driver.types"
import type { PaymentMethod } from "@/modules/tarifas/types/tarifa.types"

export type DeudaMovementType = "debt" | "payment" | "forgiveness"

export interface DeudaMovement {
  id: number
  driverId: number
  driverName: string | null
  vehicleId: number | null
  vehiclePlate: string | null
  type: DeudaMovementType
  amount: number
  movementDate: string
  paymentMethod: PaymentMethod | null
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface StatementItem extends DeudaMovement {
  runningBalance: number
}

export interface DriverBalance {
  driverId: number
  driverName: string
  photoUrl: string | null
  status: DriverStatus
  totalDebt: number
  totalPaid: number
  totalForgiven: number
  balance: number
  lastMovementDate: string | null
}

export interface DriverStatement {
  summary: DriverBalance
  movements: StatementItem[]
}

export interface ICreateDeudaMovementPayload {
  driverId: number
  type: DeudaMovementType
  amount: number
  movementDate: string
  paymentMethod?: PaymentMethod
  description?: string
}

export interface IUpdateDeudaMovementPayload {
  type?: DeudaMovementType
  amount?: number
  movementDate?: string
  paymentMethod?: PaymentMethod
  description?: string
}

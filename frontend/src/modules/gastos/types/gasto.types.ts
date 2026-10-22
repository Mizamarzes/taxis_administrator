import type { PaymentMethod } from "@/modules/tarifas/types/tarifa.types"
import type { VehicleStatus } from "@/modules/vehicles/types/vehicle.types"

export type ExpenseCategory =
  | "oil_change"
  | "maintenance"
  | "repair"
  | "spare_part"
  | "tires"
  | "bodywork"
  | "wash"
  | "other"

export type ExpenseItemType = "part" | "fluid" | "labor" | "other"

export interface VehicleExpenseItem {
  id: number
  itemType: ExpenseItemType
  description: string
  brand: string | null
  quantity: number
  unit: string | null
  unitPrice: number
  subtotal: number
}

export interface VehicleExpense {
  id: number
  vehicleId: number
  vehiclePlate: string | null
  driverId: number | null
  driverName: string | null
  category: ExpenseCategory
  expenseDate: string
  odometerKm: number | null
  nextServiceKm: number | null
  nextServiceDate: string | null
  supplier: string | null
  invoiceNumber: string | null
  paymentMethod: PaymentMethod | null
  description: string | null
  items: VehicleExpenseItem[]
  total: number
  createdAt: string
  updatedAt: string
}

export interface VehicleExpenseSummary {
  vehicleId: number
  plate: string
  photoUrl: string | null
  vehicleStatus: VehicleStatus
  driverName: string | null
  totalSpent: number
  monthSpent: number
  expensesCount: number
  lastExpenseDate: string | null
  lastOdometerKm: number | null
  nextOilChangeKm: number | null
  nextOilChangeDate: string | null
}

export interface CategoryTotal {
  category: ExpenseCategory
  total: number
  count: number
}

export interface VehicleExpensesStatement {
  summary: VehicleExpenseSummary
  byCategory: CategoryTotal[]
  expenses: VehicleExpense[]
}

export interface IVehicleExpenseItemPayload {
  itemType: ExpenseItemType
  description: string
  brand?: string
  quantity: number
  unit?: string
  unitPrice: number
}

export interface ICreateVehicleExpensePayload {
  vehicleId: number
  category: ExpenseCategory
  expenseDate: string
  odometerKm?: number
  nextServiceKm?: number
  nextServiceDate?: string
  supplier?: string
  invoiceNumber?: string
  paymentMethod?: PaymentMethod
  description?: string
  items: IVehicleExpenseItemPayload[]
}

export interface IUpdateVehicleExpensePayload {
  category?: ExpenseCategory
  expenseDate?: string
  odometerKm?: number | null
  nextServiceKm?: number | null
  nextServiceDate?: string | null
  supplier?: string
  invoiceNumber?: string
  paymentMethod?: PaymentMethod | null
  description?: string
  items?: IVehicleExpenseItemPayload[]
}

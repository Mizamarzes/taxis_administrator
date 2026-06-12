export type VehicleStatus = "active" | "inactive" | "in_maintenance" | "out_of_service"

export const RESTRICTION_DAYS: { value: number; label: string }[] = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" },
]

export const getRestrictionDayLabel = (value: number | null): string | null =>
  RESTRICTION_DAYS.find((d) => d.value === value)?.label ?? null

export interface VehicleDocument {
  id: number
  issueDate: string | null
  expiryDate: string | null
  fileUrl: string | null
  documentTypeId: number | null
  createdAt: string
}

export interface Vehicle {
  id: number
  plate: string
  drivingRestrictionDay: number | null
  photoUrl: string | null
  driverId: number | null
  vehicleStatus: VehicleStatus
  documents: VehicleDocument[]
  createdAt: string
  updatedAt: string
}

export interface ICreateVehiclePayload {
  plate: string
  drivingRestrictionDay?: number
  photoUrl?: string
  vehicleStatus?: VehicleStatus
  driverId?: number
}

export interface IUpdateVehiclePayload {
  plate?: string
  drivingRestrictionDay?: number
  photoUrl?: string
  vehicleStatus?: VehicleStatus
  driverId?: number
}

export interface IVehiclesPaginatedResponse {
  items: Vehicle[]
  totalItems: number
  currentPage: number
  totalPages: number
  previousPage: number | null
  nextPage: number | null
}

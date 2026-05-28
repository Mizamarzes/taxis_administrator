export type VehicleStatus = "active" | "inactive" | "in_maintenance" | "out_of_service"

export interface VehicleBrand {
  id: number
  name: string
}

export interface VehicleModel {
  id: number
  name: string
  brand: VehicleBrand
}

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
  drivingRestrictionDay: string | null
  photoUrl: string | null
  driverId: number | null
  vehicleModelId: number | null
  vehicleModel: VehicleModel | null
  vehicleStatus: VehicleStatus
  documents: VehicleDocument[]
  createdAt: string
  updatedAt: string
}

export interface ICreateVehiclePayload {
  plate: string
  drivingRestrictionDay?: string
  photoUrl?: string
  vehicleModelId?: number
  vehicleStatus?: VehicleStatus
  driverId?: number
}

export interface IUpdateVehiclePayload {
  plate?: string
  drivingRestrictionDay?: string
  photoUrl?: string
  vehicleModelId?: number
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
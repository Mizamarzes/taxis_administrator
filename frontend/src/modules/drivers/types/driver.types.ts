export interface Driver {
  id: string
  name: string
  email: string
  phone: string
  licenseNumber: string
  vehiclePlate: string
  vehicleModel: string
  status: "active" | "inactive" | "on_trip"
  rating: number
  totalTrips: number
  avatarUrl?: string
  createdAt: string
}

export interface ICreateDriverPayload {
  name: string
  email: string
  phone: string
  licenseNumber: string
  vehiclePlate: string
  vehicleModel: string
}

export interface IUpdateDriverPayload {
  name?: string
  email?: string
  phone?: string
  licenseNumber?: string
  vehiclePlate?: string
  vehicleModel?: string
  status?: Driver["status"]
}

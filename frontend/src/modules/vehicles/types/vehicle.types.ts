export interface Vehicle {
  id: string
  plate: string
  brand: string
  model: string
  year: number
  color: string
  status: "available" | "on_trip" | "maintenance" | "inactive"
  mileage: number
  fuelType: "gasoline" | "diesel" | "electric" | "hybrid"
  assignedDriver?: string
  imageUrl?: string
  createdAt: string
}

export interface ICreateVehiclePayload {
  plate: string
  brand: string
  model: string
  year: number
  color: string
  fuelType: Vehicle["fuelType"]
  assignedDriver?: string
}

export interface IUpdateVehiclePayload {
  plate?: string
  brand?: string
  model?: string
  year?: number
  color?: string
  status?: Vehicle["status"]
  mileage?: number
  fuelType?: Vehicle["fuelType"]
  assignedDriver?: string
}

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, PlusIcon } from "lucide-react"
import { VehicleCard } from "./components/VehicleCard"
import type { Vehicle } from "./types/vehicle.types"

const mockVehicles: Vehicle[] = [
  {
    id: "1",
    plate: "ABC-123",
    brand: "Toyota",
    model: "Corolla",
    year: 2022,
    color: "Blanco",
    status: "available",
    mileage: 45200,
    fuelType: "gasoline",
    assignedDriver: "Carlos Ramírez",
    createdAt: "2024-01-10",
  },
  {
    id: "2",
    plate: "XYZ-456",
    brand: "Chevrolet",
    model: "Spark",
    year: 2021,
    color: "Rojo",
    status: "on_trip",
    mileage: 78900,
    fuelType: "gasoline",
    assignedDriver: "Andrés Torres",
    createdAt: "2024-02-05",
  },
  {
    id: "3",
    plate: "DEF-789",
    brand: "Renault",
    model: "Logan",
    year: 2020,
    color: "Gris",
    status: "maintenance",
    mileage: 112400,
    fuelType: "diesel",
    createdAt: "2024-03-18",
  },
  {
    id: "4",
    plate: "GHI-321",
    brand: "Kia",
    model: "Picanto",
    year: 2023,
    color: "Negro",
    status: "available",
    mileage: 18700,
    fuelType: "gasoline",
    assignedDriver: "Miguel Ángel Díaz",
    createdAt: "2024-04-22",
  },
  {
    id: "5",
    plate: "JKL-654",
    brand: "Hyundai",
    model: "i10",
    year: 2022,
    color: "Azul",
    status: "inactive",
    mileage: 63000,
    fuelType: "hybrid",
    createdAt: "2024-05-30",
  },
  {
    id: "6",
    plate: "MNO-987",
    brand: "Nissan",
    model: "Versa",
    year: 2023,
    color: "Plata",
    status: "available",
    mileage: 9800,
    fuelType: "gasoline",
    assignedDriver: "Jorge Herrera",
    createdAt: "2024-06-14",
  },
]

const Vehicles = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return mockVehicles.filter(
      (v) =>
        v.plate.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.color.toLowerCase().includes(q) ||
        (v.assignedDriver?.toLowerCase().includes(q) ?? false)
    )
  }, [searchQuery])

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    // TODO: abrir modal de edición
  }

  const handleDelete = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    // TODO: abrir modal de eliminación
  }

  return (
    <div className="w-full py-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar placa, marca, modelo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button>
          <PlusIcon className="size-4 mr-2" />
          Agregar vehículo
        </Button>
      </div>

      {/* Grid de tarjetas */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <Search className="size-8 opacity-30" />
          <p className="text-sm">No se encontraron vehículos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Vehicles


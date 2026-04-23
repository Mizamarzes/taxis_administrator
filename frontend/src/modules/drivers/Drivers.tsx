import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, UserPlusIcon } from "lucide-react"
import { DriverCard } from "./components/DriverCard"
import { CreateDriverModal } from "./components/CreateDriverModal"
import { EditDriverModal } from "./components/EditDriverModal"
import { DeleteDriverModal } from "./components/DeleteDriverModal"
import type { Driver, ICreateDriverPayload, IUpdateDriverPayload } from "./types/driver.types"

const mockDrivers: Driver[] = [
  {
    id: "1",
    name: "Carlos Ramírez",
    email: "carlos@example.com",
    phone: "+57 312 345 6789",
    licenseNumber: "LIC-001",
    vehiclePlate: "ABC-123",
    vehicleModel: "Toyota Corolla 2022",
    status: "active",
    rating: 4.8,
    totalTrips: 312,
    createdAt: "2024-01-10",
  },
  {
    id: "2",
    name: "Andrés Torres",
    email: "andres@example.com",
    phone: "+57 321 987 6543",
    licenseNumber: "LIC-002",
    vehiclePlate: "XYZ-456",
    vehicleModel: "Chevrolet Spark 2021",
    status: "on_trip",
    rating: 4.5,
    totalTrips: 198,
    createdAt: "2024-02-05",
  },
  {
    id: "3",
    name: "Luis Moreno",
    email: "luis@example.com",
    phone: "+57 300 111 2233",
    licenseNumber: "LIC-003",
    vehiclePlate: "DEF-789",
    vehicleModel: "Renault Logan 2020",
    status: "inactive",
    rating: 3.9,
    totalTrips: 87,
    createdAt: "2024-03-18",
  },
  {
    id: "4",
    name: "Miguel Ángel Díaz",
    email: "miguel@example.com",
    phone: "+57 316 555 7788",
    licenseNumber: "LIC-004",
    vehiclePlate: "GHI-321",
    vehicleModel: "Kia Picanto 2023",
    status: "active",
    rating: 4.9,
    totalTrips: 520,
    createdAt: "2024-04-22",
  },
  {
    id: "5",
    name: "Jorge Herrera",
    email: "jorge@example.com",
    phone: "+57 304 222 9900",
    licenseNumber: "LIC-005",
    vehiclePlate: "JKL-654",
    vehicleModel: "Hyundai i10 2022",
    status: "active",
    rating: 4.6,
    totalTrips: 275,
    createdAt: "2024-05-30",
  },
]

const Drivers = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [drivers, setDrivers] = useState<Driver[]>(mockDrivers)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return drivers.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.vehiclePlate.toLowerCase().includes(q) ||
        d.vehicleModel.toLowerCase().includes(q) ||
        d.phone.includes(q)
    )
  }, [searchQuery, drivers])

  const handleEdit = (driver: Driver) => {
    setSelectedDriver(driver)
    setEditOpen(true)
  }

  const handleDelete = (driver: Driver) => {
    setSelectedDriver(driver)
    setDeleteOpen(true)
  }

  const handleCreate = (payload: ICreateDriverPayload) => {
    const newDriver: Driver = {
      ...payload,
      id: Date.now().toString(),
      status: "active",
      rating: 0,
      totalTrips: 0,
      createdAt: new Date().toISOString().split("T")[0],
    }
    setDrivers((prev) => [newDriver, ...prev])
    setCreateOpen(false)
  }

  const handleUpdate = (id: string, payload: IUpdateDriverPayload) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...payload } : d))
    )
    setEditOpen(false)
    setSelectedDriver(null)
  }

  const handleConfirmDelete = (id: string) => {
    setDrivers((prev) => prev.filter((d) => d.id !== id))
    setSelectedDriver(null)
  }

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar conductor, placa o vehículo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <UserPlusIcon className="size-4 mr-2" />
          Agregar conductor
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <Search className="size-8 opacity-30" />
          <p className="text-sm">No se encontraron conductores</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((driver) => (
            <DriverCard
              key={driver.id}
              driver={driver}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <CreateDriverModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onConfirm={handleCreate}
      />

      <EditDriverModal
        open={editOpen}
        driver={selectedDriver}
        onClose={() => { setEditOpen(false); setSelectedDriver(null) }}
        onConfirm={handleUpdate}
      />

      <DeleteDriverModal
        open={deleteOpen}
        driver={selectedDriver}
        onClose={() => { setDeleteOpen(false); setSelectedDriver(null) }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

export default Drivers


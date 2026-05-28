import { useState, useMemo, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, PlusIcon, CarFrontIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { VehicleCard } from "./components/VehicleCard"
import { CreateVehicleModal } from "./components/CreateVehicleModal"
import { EditVehicleModal } from "./components/EditVehicleModal"
import { DeleteVehicleModal } from "./components/DeleteVehicleModal"
import type { Vehicle } from "./types/vehicle.types"
import { getVehiclesService } from "./services/vehicle.service"

const LIMIT = 20

const Vehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const fetchVehicles = useCallback(async () => {
    try {
      const response = await getVehiclesService({ page, limit: LIMIT })
      setVehicles(response.data.items)
      setTotalPages(response.data.totalPages || 1)
    } catch {
    }
  }, [page])

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return vehicles
    return vehicles.filter(
      (v) =>
        v.plate.toLowerCase().includes(q) ||
        (v.drivingRestrictionDay?.toLowerCase().includes(q) ?? false)
    )
  }, [search, vehicles])

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setIsEditOpen(true)
  }

  const handleDelete = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setIsDeleteOpen(true)
  }

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar placa, marca, modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <PlusIcon className="size-4 mr-2" />
          Agregar vehículo
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <CarFrontIcon className="size-8 opacity-30" />
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

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      )}

      <CreateVehicleModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={fetchVehicles}
      />

      <EditVehicleModal
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open)
          if (!open) setSelectedVehicle(null)
        }}
        vehicle={selectedVehicle}
        onSuccess={fetchVehicles}
      />

      <DeleteVehicleModal
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open)
          if (!open) setSelectedVehicle(null)
        }}
        vehicle={selectedVehicle}
        onSuccess={fetchVehicles}
      />
    </div>
  )
}

export default Vehicles
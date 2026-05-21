import { useState, useMemo, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, UserPlusIcon, UsersIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { DriverCard } from "./components/DriverCard"
import { CreateDriverModal } from "./components/CreateDriverModal"
import { EditDriverModal } from "./components/EditDriverModal"
import { DeleteDriverModal } from "./components/DeleteDriverModal"
import type { Driver } from "./types/driver.types"
import { getDriversService } from "./services/driver.service"

const LIMIT = 20

const Drivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const fetchDrivers = useCallback(async () => {
    try {
      const response = await getDriversService({ page, limit: LIMIT })
      setDrivers(response.data.items)
      setTotalPages(response.data.totalPages || 1)
    } catch {
    }
  }, [page])

  useEffect(() => {
    fetchDrivers()
  }, [fetchDrivers])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return drivers
    return drivers.filter(
      (d) =>
        d.user.name.toLowerCase().includes(q) ||
        d.user.email.toLowerCase().includes(q) ||
        (d.phone?.toLowerCase().includes(q) ?? false)
    )
  }, [search, drivers])

  const handleEdit = (driver: Driver) => {
    setSelectedDriver(driver)
    setIsEditOpen(true)
  }

  const handleDelete = (driver: Driver) => {
    setSelectedDriver(driver)
    setIsDeleteOpen(true)
  }

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <UserPlusIcon className="size-4 mr-2" />
          Agregar conductor
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <UsersIcon className="size-8 opacity-30" />
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

      <CreateDriverModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={fetchDrivers}
      />

      <EditDriverModal
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open)
          if (!open) setSelectedDriver(null)
        }}
        driver={selectedDriver}
        onSuccess={fetchDrivers}
      />

      <DeleteDriverModal
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open)
          if (!open) setSelectedDriver(null)
        }}
        driver={selectedDriver}
        onSuccess={fetchDrivers}
      />
    </div>
  )
}

export default Drivers
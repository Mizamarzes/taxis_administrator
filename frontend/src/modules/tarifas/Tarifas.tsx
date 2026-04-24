import { useState, useMemo, useEffect, useCallback } from "react"
import { DataTable } from "./components/DataTable"
import { getColumns } from "./components/columns"
import { CreateTarifaModal } from "./components/CreateTarifaModal"
import { EditTarifaModal } from "./components/EditTarifaModal"
import { DeleteTarifaModal } from "./components/DeleteTarifaModal"
import type { Tarifa } from "./types/tarifa.types"
import { getTarifasService } from "./services/tarifa.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, PlusIcon } from "lucide-react"

const Tarifas = () => {
  const [tarifas, setTarifas] = useState<Tarifa[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTarifa, setSelectedTarifa] = useState<Tarifa | null>(null)

  const fetchTarifas = useCallback(async () => {
    try {
      const response = await getTarifasService({ page: 1, limit: 100 })
      setTarifas(response.data.items)
    } catch {
    }
  }, [])

  useEffect(() => {
    fetchTarifas()
  }, [fetchTarifas])

  const handleEdit = (tarifa: Tarifa) => {
    setSelectedTarifa(tarifa)
    setIsEditModalOpen(true)
  }

  const handleDelete = (tarifa: Tarifa) => {
    setSelectedTarifa(tarifa)
    setIsDeleteModalOpen(true)
  }

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase()
    if (!q) return tarifas
    return tarifas.filter(
      (t) =>
        String(t.driverId).includes(q) ||
        String(t.vehicleId).includes(q) ||
        (t.description ?? "").toLowerCase().includes(q) ||
        (t.paymentMethod ?? "").toLowerCase().includes(q)
    )
  }, [searchQuery, tarifas])

  const columns = useMemo(
    () => getColumns({ onEdit: handleEdit, onDelete: handleDelete }),
    []
  )

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por conductor, vehículo o método..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusIcon className="size-4 mr-2" />
          Nueva tarifa
        </Button>
      </div>

      <DataTable columns={columns} data={filtered} />

      <CreateTarifaModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={fetchTarifas}
      />

      <EditTarifaModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        tarifa={selectedTarifa}
        onSuccess={fetchTarifas}
      />

      <DeleteTarifaModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        tarifa={selectedTarifa}
        onSuccess={fetchTarifas}
      />
    </div>
  )
}

export default Tarifas

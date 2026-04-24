import { useState, useMemo, useEffect, useCallback } from "react"
import type { DateRange } from "react-day-picker"
import { DataTable } from "./components/DataTable"
import { getColumns } from "./components/columns"
import { CreateTarifaModal } from "./components/CreateTarifaModal"
import { EditTarifaModal } from "./components/EditTarifaModal"
import { DeleteTarifaModal } from "./components/DeleteTarifaModal"
import { DateRangeFilter } from "./components/DateRangeFilter"
import type { Tarifa } from "./types/tarifa.types"
import { getTarifasService } from "./services/tarifa.service"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"

const Tarifas = () => {
  const [tarifas, setTarifas] = useState<Tarifa[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
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

  const filteredByDate = useMemo(() => {
    if (!dateRange?.from && !dateRange?.to) return tarifas
    return tarifas.filter((t) => {
      if (!t.tarifaDate) return false
      const date = new Date(t.tarifaDate)
      const from = dateRange.from ? new Date(dateRange.from.setHours(0, 0, 0, 0)) : null
      const to = dateRange.to ? new Date(dateRange.to.setHours(23, 59, 59, 999)) : null
      if (from && date < from) return false
      if (to && date > to) return false
      return true
    })
  }, [tarifas, dateRange])

  const columns = useMemo(
    () => getColumns({ onEdit: handleEdit, onDelete: handleDelete }),
    []
  )

  return (
    <div className="w-full py-4">
      <DataTable
        columns={columns}
        data={filteredByDate}
        filterPlaceholder="Buscar por conductor, vehículo o método..."
        toolbarRight={
          <div className="flex items-center gap-2">
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <PlusIcon className="size-4 mr-2" />
              Nueva tarifa
            </Button>
          </div>
        }
      />

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

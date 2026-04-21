import { useState, useMemo } from "react"
import { DataTable } from "./components/DataTable"
import { getColumns } from "./components/columns"
import { CreateTarifaModal } from "./components/CreateTarifaModal"
import { EditTarifaModal } from "./components/EditTarifaModal"
import { DeleteTarifaModal } from "./components/DeleteTarifaModal"
import type { Tarifa } from "./types/tarifa.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, PlusIcon } from "lucide-react"

const mockTarifas: Tarifa[] = [
  {
    id: "1",
    driverName: "Carlos Ramírez",
    vehiclePlate: "ABC-123",
    amount: 80000,
    date: "2026-04-21",
    status: "paid",
    createdAt: "2026-04-21",
  },
  {
    id: "2",
    driverName: "Andrés Torres",
    vehiclePlate: "XYZ-456",
    amount: 75000,
    date: "2026-04-21",
    status: "pending",
    notes: "Entrega en efectivo pendiente",
    createdAt: "2026-04-21",
  },
  {
    id: "3",
    driverName: "Luis Moreno",
    vehiclePlate: "DEF-789",
    amount: 70000,
    date: "2026-04-20",
    status: "overdue",
    notes: "No se presentó",
    createdAt: "2026-04-20",
  },
  {
    id: "4",
    driverName: "Miguel Ángel Díaz",
    vehiclePlate: "GHI-321",
    amount: 85000,
    date: "2026-04-21",
    status: "paid",
    createdAt: "2026-04-21",
  },
  {
    id: "5",
    driverName: "Jorge Herrera",
    vehiclePlate: "JKL-654",
    amount: 78000,
    date: "2026-04-20",
    status: "pending",
    createdAt: "2026-04-20",
  },
]

const Tarifas = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTarifa, setSelectedTarifa] = useState<Tarifa | null>(null)

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
    return mockTarifas.filter(
      (t) =>
        t.driverName.toLowerCase().includes(q) ||
        t.vehiclePlate.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q)
    )
  }, [searchQuery])

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
            placeholder="Buscar conductor, placa o estado..."
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
      />

      <EditTarifaModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        tarifa={selectedTarifa}
      />

      <DeleteTarifaModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        tarifa={selectedTarifa}
      />
    </div>
  )
}

export default Tarifas

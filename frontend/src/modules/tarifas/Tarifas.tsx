import { useState, useMemo, useEffect, useCallback } from "react"
import { format } from "date-fns"
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

const LIMIT = 20

const Tarifas = () => {
    const [tarifas, setTarifas] = useState<Tarifa[]>([])
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedTarifa, setSelectedTarifa] = useState<Tarifa | null>(null)

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400)
        return () => clearTimeout(timer)
    }, [search])

    useEffect(() => {
        setPage(1)
    }, [debouncedSearch, dateRange])

    const fetchTarifas = useCallback(async () => {
        try {
            const params: {
                page: number
                limit: number
                search?: string
                tarifaDateFrom?: string
                tarifaDateTo?: string
            } = { page, limit: LIMIT }

            if (debouncedSearch) params.search = debouncedSearch
            if (dateRange?.from) params.tarifaDateFrom = format(dateRange.from, "yyyy-MM-dd")
            if (dateRange?.to) params.tarifaDateTo = format(dateRange.to, "yyyy-MM-dd")

            const response = await getTarifasService(params)
            setTarifas(response.data.items)
            setTotalPages(response.data.totalPages || 1)
        } catch {
        }
    }, [page, debouncedSearch, dateRange])

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

    const columns = useMemo(
        () => getColumns({ onEdit: handleEdit, onDelete: handleDelete }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    )

    return (
        <div className="w-full py-4">
            <DataTable
                columns={columns}
                data={tarifas}
                filterPlaceholder="Buscar por descripción..."
                searchValue={search}
                onSearchChange={setSearch}
                pageCount={totalPages}
                currentPage={page}
                onPageChange={setPage}
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

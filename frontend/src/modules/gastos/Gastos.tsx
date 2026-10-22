import { useState, useMemo, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CarFrontIcon, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { VehicleExpenseCard } from "./components/VehicleExpenseCard"
import { VehicleExpensesView } from "./components/VehicleExpensesView"
import { formatCurrency, getOilStatus } from "./components/expense-config"
import type { VehicleExpenseSummary } from "./types/gasto.types"
import { getSummariesService } from "./services/gasto.service"

type ExpenseFilter = "all" | "oil" | "month"

const filterOptions: { value: ExpenseFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "oil", label: "Aceite pendiente" },
  { value: "month", label: "Con gastos este mes" },
]

const isOilPending = (vehicle: VehicleExpenseSummary) => {
  const status = getOilStatus(vehicle)
  return status === "soon" || status === "overdue"
}

const Gastos = () => {
  const [summaries, setSummaries] = useState<VehicleExpenseSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<ExpenseFilter>("all")
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null)

  const fetchSummaries = useCallback(async () => {
    try {
      const response = await getSummariesService()
      setSummaries(response.data)
    } catch {
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSummaries()
  }, [fetchSummaries])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return summaries.filter((v) => {
      if (filter === "oil" && !isOilPending(v)) return false
      if (filter === "month" && v.monthSpent <= 0) return false
      return (
        !q ||
        v.plate.toLowerCase().includes(q) ||
        (v.driverName ?? "").toLowerCase().includes(q)
      )
    })
  }, [summaries, search, filter])

  const totals = useMemo(
    () => ({
      monthSpent: summaries.reduce((sum, v) => sum + v.monthSpent, 0),
      totalSpent: summaries.reduce((sum, v) => sum + v.totalSpent, 0),
      oilPending: summaries.filter(isOilPending).length,
    }),
    [summaries]
  )

  const selectedVehicle = summaries.find((v) => v.vehicleId === selectedVehicleId) ?? null

  if (selectedVehicle) {
    return (
      <div className="w-full py-4">
        <VehicleExpensesView
          vehicle={selectedVehicle}
          onBack={() => setSelectedVehicleId(null)}
          onChange={fetchSummaries}
        />
      </div>
    )
  }

  return (
    <div className="w-full py-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="py-0">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Gastado este mes</p>
            <p className="text-2xl font-bold tabular-nums">{formatCurrency(totals.monthSpent)}</p>
          </CardContent>
        </Card>
        <Card className="py-0">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total histórico de la flota</p>
            <p className="text-2xl font-bold tabular-nums">{formatCurrency(totals.totalSpent)}</p>
          </CardContent>
        </Card>
        <Card className="py-0">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Cambios de aceite pendientes</p>
            <p
              className={cn(
                "text-2xl font-bold tabular-nums",
                totals.oilPending > 0 && "text-amber-600 dark:text-amber-400"
              )}
            >
              {totals.oilPending}
              <span className="text-sm font-normal text-muted-foreground"> de {summaries.length}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 min-w-56 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar placa o conductor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="inline-flex rounded-lg border p-1 gap-1">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant="ghost"
              size="sm"
              className={cn(filter === option.value && "bg-accent text-accent-foreground")}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <CarFrontIcon className="size-8 opacity-30" />
          <p className="text-sm">No se encontraron vehículos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((vehicle) => (
            <VehicleExpenseCard
              key={vehicle.vehicleId}
              vehicle={vehicle}
              onSelect={(v) => setSelectedVehicleId(v.vehicleId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Gastos

import { useState, useMemo, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, UsersIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { DriverDebtCard } from "./components/DriverDebtCard"
import { DriverStatementView } from "./components/DriverStatementView"
import { formatCurrency } from "./components/movement-config"
import type { DriverBalance } from "./types/deuda.types"
import { getBalancesService } from "./services/deuda.service"

type BalanceFilter = "all" | "debt" | "clear"

const filterOptions: { value: BalanceFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "debt", label: "Con deuda" },
  { value: "clear", label: "Al día" },
]

const Deudas = () => {
  const [balances, setBalances] = useState<DriverBalance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<BalanceFilter>("all")
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null)

  const fetchBalances = useCallback(async () => {
    try {
      const response = await getBalancesService()
      setBalances(response.data)
    } catch {
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBalances()
  }, [fetchBalances])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return balances.filter((b) => {
      if (filter === "debt" && b.balance <= 0) return false
      if (filter === "clear" && b.balance > 0) return false
      return !q || b.driverName.toLowerCase().includes(q)
    })
  }, [balances, search, filter])

  const totals = useMemo(() => {
    const withDebt = balances.filter((b) => b.balance > 0)
    return {
      totalOwed: withDebt.reduce((sum, b) => sum + b.balance, 0),
      driversWithDebt: withDebt.length,
    }
  }, [balances])

  const selectedDriver = balances.find((b) => b.driverId === selectedDriverId) ?? null

  if (selectedDriver) {
    return (
      <div className="w-full py-4">
        <DriverStatementView
          driver={selectedDriver}
          onBack={() => setSelectedDriverId(null)}
          onChange={fetchBalances}
        />
      </div>
    )
  }

  return (
    <div className="w-full py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card className="py-0">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total por cobrar</p>
            <p className="text-2xl font-bold tabular-nums text-red-600 dark:text-red-400">
              {formatCurrency(totals.totalOwed)}
            </p>
          </CardContent>
        </Card>
        <Card className="py-0">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Conductores con deuda</p>
            <p className="text-2xl font-bold tabular-nums">
              {totals.driversWithDebt}
              <span className="text-sm font-normal text-muted-foreground"> de {balances.length}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 min-w-56 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar conductor..."
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
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <UsersIcon className="size-8 opacity-30" />
          <p className="text-sm">No se encontraron conductores</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((driver) => (
            <DriverDebtCard
              key={driver.driverId}
              driver={driver}
              onSelect={(d) => setSelectedDriverId(d.driverId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Deudas

import { useEffect, useMemo, useState } from "react"
import { DollarSignIcon, ReceiptIcon, Loader2Icon } from "lucide-react"
import { format, startOfMonth } from "date-fns"
import { es } from "date-fns/locale"
import type { DateRange } from "react-day-picker"
import { KpiCard } from "./components/KpiCard"
import { GananciasChart } from "./components/GananciasChart"
import { RankingTaxis } from "./components/RankingTaxis"
import { DateRangeFilter } from "@/components/DateRangeFilter"
import { getDashboardSummaryService } from "./services/dashboard.service"
import type { DashboardSummary } from "./types/dashboard.types"

const Dashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date(),
  })
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError(null)

    const params: { from?: string; to?: string } = {}
    if (dateRange?.from) params.from = format(dateRange.from, "yyyy-MM-dd")
    if (dateRange?.to) params.to = format(dateRange.to, "yyyy-MM-dd")

    getDashboardSummaryService(params)
      .then((response) => {
        if (active) setSummary(response.data)
      })
      .catch(() => {
        if (active) setError("No se pudo cargar la información del dashboard.")
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [dateRange])

  const periodLabel = useMemo(() => {
    if (dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, "dd MMM", { locale: es })} – ${format(dateRange.to, "dd MMM yyyy", { locale: es })}`
    }
    if (dateRange?.from) {
      return `Desde ${format(dateRange.from, "dd MMM yyyy", { locale: es })}`
    }
    return "Todo el periodo"
  }, [dateRange])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Resumen de actividad del periodo.</p>
        </div>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2Icon className="h-6 w-6 animate-spin" />
        </div>
      ) : error || !summary ? (
        <div className="rounded-lg border py-10 text-center text-sm text-muted-foreground">
          {error ?? "No hay información disponible."}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <KpiCard
              title="Total ingresos"
              value={`$${summary.kpis.totalIngresos.toLocaleString("es-ES")}`}
              subtitle={periodLabel}
              icon={DollarSignIcon}
            />
            <KpiCard
              title="Total tarifas aplicadas"
              value={summary.kpis.totalTarifas}
              subtitle={periodLabel}
              icon={ReceiptIcon}
            />
          </div>

          <GananciasChart data={summary.gananciasPorDia} />

          <RankingTaxis data={summary.ranking} />
        </>
      )}
    </div>
  )
}

export default Dashboard

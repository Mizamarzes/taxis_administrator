import { useEffect, useMemo, useState } from "react"
import {
  DollarSignIcon,
  ReceiptIcon,
  Loader2Icon,
  FileSpreadsheetIcon,
} from "lucide-react"
import { format, subDays } from "date-fns"
import { es } from "date-fns/locale"
import type { DateRange } from "react-day-picker"
import { KpiCard } from "./components/KpiCard"
import { GananciasChart } from "./components/GananciasChart"
import { RankingTaxis } from "./components/RankingTaxis"
import { DateRangeFilter } from "@/components/DateRangeFilter"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getDashboardSummaryService } from "./services/dashboard.service"
import type { DashboardSummary } from "./types/dashboard.types"

type Preset = "today" | "week" | "month" | "custom"

const getPresetRange = (preset: Exclude<Preset, "custom">): DateRange => {
  const today = new Date()
  if (preset === "today") return { from: today, to: today }
  if (preset === "week") return { from: subDays(today, 6), to: today }
  return { from: subDays(today, 29), to: today }
}

const Dashboard = () => {
  const [preset, setPreset] = useState<Preset>("month")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() =>
    getPresetRange("month")
  )
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handlePresetChange = (value: string) => {
    const next = value as Exclude<Preset, "custom">
    setPreset(next)
    setDateRange(getPresetRange(next))
  }

  const handleRangeChange = (range: DateRange | undefined) => {
    setPreset("custom")
    setDateRange(range)
  }

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
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Resumen de actividad del periodo.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={preset} onValueChange={handlePresetChange}>
            <SelectTrigger className="h-9 w-40">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mes</SelectItem>
            </SelectContent>
          </Select>

          <DateRangeFilter value={dateRange} onChange={handleRangeChange} />

          <Button variant="outline" size="sm" className="h-9 gap-2">
            <FileSpreadsheetIcon className="h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
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

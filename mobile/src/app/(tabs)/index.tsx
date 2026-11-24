import { useCallback, useEffect, useMemo, useState } from "react"
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native"
import { AdminOnly } from "@/components/AdminOnly"
import { OptionSelector } from "@/components/ui/OptionSelector"
import { EmptyView, LoadingView } from "@/components/ui/StateView"
import { formatCurrency, formatDateOnly, subDays, toDateOnly } from "@/lib/format"
import { useTheme } from "@/theme/useTheme"
import { KpiCard } from "@/modules/dashboard/components/KpiCard"
import { GananciasChart } from "@/modules/dashboard/components/GananciasChart"
import { RankingTaxis } from "@/modules/dashboard/components/RankingTaxis"
import { getDashboardSummaryService } from "@/modules/dashboard/services/dashboard.service"
import type { DashboardSummary } from "@/modules/dashboard/types/dashboard.types"

type Preset = "today" | "week" | "month"

const PRESET_OPTIONS: { value: Preset; label: string }[] = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "Última semana" },
  { value: "month", label: "Último mes" },
]

const getPresetRange = (preset: Preset) => {
  const today = new Date()
  const days = { today: 0, week: 6, month: 29 }[preset]
  return { from: toDateOnly(subDays(today, days)), to: toDateOnly(today) }
}

function DashboardContent() {
  const theme = useTheme()
  const [preset, setPreset] = useState<Preset>("month")
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const range = useMemo(() => getPresetRange(preset), [preset])

  const load = useCallback(async () => {
    setError(null)
    try {
      const response = await getDashboardSummaryService(range)
      setSummary(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la información del dashboard.")
    }
  }, [range])

  useEffect(() => {
    setIsLoading(true)
    load().finally(() => setIsLoading(false))
  }, [load])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await load()
    setIsRefreshing(false)
  }

  const periodLabel = `${formatDateOnly(range.from, { day: "2-digit", month: "short" })} – ${formatDateOnly(range.to)}`

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={theme.primary} />}
    >
      <View>
        <Text style={[styles.title, { color: theme.foreground }]}>Resumen</Text>
        <Text style={{ color: theme.mutedForeground }}>Actividad del periodo seleccionado.</Text>
      </View>

      <OptionSelector
        options={PRESET_OPTIONS}
        value={preset}
        onChange={(value) => value && setPreset(value)}
        allowDeselect={false}
      />

      {isLoading ? (
        <LoadingView />
      ) : error || !summary ? (
        <EmptyView icon="cloud-offline-outline" message={error ?? "No hay información disponible."} actionLabel="Reintentar" onAction={handleRefresh} />
      ) : (
        <>
          <View style={styles.kpis}>
            <KpiCard title="Total ingresos" value={formatCurrency(summary.kpis.totalIngresos)} subtitle={periodLabel} icon="cash-outline" />
            <KpiCard title="Tarifas aplicadas" value={summary.kpis.totalTarifas} subtitle={periodLabel} icon="receipt-outline" />
          </View>
          <GananciasChart data={summary.gananciasPorDia} />
          <RankingTaxis data={summary.ranking} />
        </>
      )}
    </ScrollView>
  )
}

export default function DashboardScreen() {
  return (
    <AdminOnly>
      <DashboardContent />
    </AdminOnly>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  title: { fontSize: 22, fontWeight: "700" },
  kpis: { flexDirection: "row", gap: 12 },
})

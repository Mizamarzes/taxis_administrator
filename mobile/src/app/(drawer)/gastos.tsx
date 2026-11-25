import { useCallback, useMemo, useState } from "react"
import { FlatList, RefreshControl, StyleSheet, View } from "react-native"
import { router } from "expo-router"
import { RequirePermission } from "@/components/RequirePermission"
import { Input } from "@/components/ui/Input"
import { OptionSelector } from "@/components/ui/OptionSelector"
import { StatCard } from "@/components/ui/StatCard"
import { EmptyView, LoadingView } from "@/components/ui/StateView"
import { useFocusQuery } from "@/hooks/useFocusQuery"
import { formatCurrency } from "@/lib/format"
import { useTheme } from "@/theme/useTheme"
import { VehicleExpenseCard } from "@/modules/gastos/components/VehicleExpenseCard"
import { isOilPending } from "@/modules/gastos/constants"
import { getSummariesService } from "@/modules/gastos/services/gasto.service"

type ExpenseFilter = "all" | "oil" | "month"

const FILTER_OPTIONS: { value: ExpenseFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "oil", label: "Aceite pendiente" },
  { value: "month", label: "Con gastos este mes" },
]

function GastosContent() {
  const theme = useTheme()
  const fetcher = useCallback(() => getSummariesService().then((response) => response.data), [])
  const query = useFocusQuery(fetcher)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<ExpenseFilter>("all")

  const summaries = useMemo(() => query.data ?? [], [query.data])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return summaries.filter((vehicle) => {
      if (filter === "oil" && !isOilPending(vehicle)) return false
      if (filter === "month" && vehicle.monthSpent <= 0) return false
      return (
        !term ||
        vehicle.plate.toLowerCase().includes(term) ||
        (vehicle.driverName ?? "").toLowerCase().includes(term)
      )
    })
  }, [summaries, search, filter])

  const totals = useMemo(
    () => ({
      monthSpent: summaries.reduce((sum, vehicle) => sum + Number(vehicle.monthSpent), 0),
      totalSpent: summaries.reduce((sum, vehicle) => sum + Number(vehicle.totalSpent), 0),
      oilPending: summaries.filter(isOilPending).length,
    }),
    [summaries],
  )

  if (query.isLoading) return <LoadingView />
  if (!query.data) {
    return (
      <EmptyView
        icon="cloud-offline-outline"
        message={query.error ?? "No se pudieron cargar los gastos"}
        actionLabel="Reintentar"
        onAction={query.reload}
      />
    )
  }

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => String(item.vehicleId)}
      contentContainerStyle={styles.list}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={query.isRefreshing} onRefresh={query.refresh} tintColor={theme.primary} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.stats}>
            <StatCard label="Gastado este mes" value={formatCurrency(totals.monthSpent)} />
            <StatCard label="Total histórico" value={formatCurrency(totals.totalSpent)} />
          </View>
          <StatCard
            label="Cambios de aceite pendientes"
            value={String(totals.oilPending)}
            hint={`de ${summaries.length} vehículos`}
            color={totals.oilPending > 0 ? theme.warning : undefined}
            accentColor={totals.oilPending > 0 ? theme.warning : undefined}
            style={styles.fullCard}
          />
          <Input placeholder="Buscar placa o conductor..." value={search} onChangeText={setSearch} returnKeyType="search" />
          <OptionSelector
            options={FILTER_OPTIONS}
            value={filter}
            onChange={(value) => value && setFilter(value)}
            allowDeselect={false}
          />
        </View>
      }
      ListEmptyComponent={<EmptyView icon="car-outline" message="No se encontraron vehículos" />}
      renderItem={({ item }) => (
        <VehicleExpenseCard
          vehicle={item}
          onPress={() =>
            router.push({ pathname: "/gastos/[vehicleId]", params: { vehicleId: String(item.vehicleId) } })
          }
        />
      )}
    />
  )
}

export default function GastosScreen() {
  return (
    <RequirePermission permission="gastos.read">
      <GastosContent />
    </RequirePermission>
  )
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12, flexGrow: 1 },
  header: { gap: 12, marginBottom: 4 },
  stats: { flexDirection: "row", gap: 12 },
  fullCard: { flex: 0 },
})

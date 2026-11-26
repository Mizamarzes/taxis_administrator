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
import { DriverDebtCard } from "@/modules/deudas/components/DriverDebtCard"
import { getBalancesService } from "@/modules/deudas/services/deuda.service"

type BalanceFilter = "all" | "debt" | "clear"

const FILTER_OPTIONS: { value: BalanceFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "debt", label: "Con deuda" },
  { value: "clear", label: "Al día" },
]

function DeudasContent() {
  const theme = useTheme()
  const fetcher = useCallback(() => getBalancesService().then((response) => response.data), [])
  const query = useFocusQuery(fetcher)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<BalanceFilter>("all")

  const balances = useMemo(() => query.data ?? [], [query.data])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return balances.filter((item) => {
      if (filter === "debt" && item.balance <= 0) return false
      if (filter === "clear" && item.balance > 0) return false
      return !term || item.driverName.toLowerCase().includes(term)
    })
  }, [balances, search, filter])

  const totals = useMemo(() => {
    const withDebt = balances.filter((item) => item.balance > 0)
    return {
      totalOwed: withDebt.reduce((sum, item) => sum + Number(item.balance), 0),
      driversWithDebt: withDebt.length,
    }
  }, [balances])

  if (query.isLoading) return <LoadingView />
  if (!query.data) {
    return (
      <EmptyView
        icon="cloud-offline-outline"
        message={query.error ?? "No se pudieron cargar las deudas"}
        actionLabel="Reintentar"
        onAction={query.reload}
      />
    )
  }

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => String(item.driverId)}
      contentContainerStyle={styles.list}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={query.isRefreshing} onRefresh={query.refresh} tintColor={theme.primary} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.stats}>
            <StatCard label="Total por cobrar" value={formatCurrency(totals.totalOwed)} color={theme.destructive} />
            <StatCard
              label="Conductores con deuda"
              value={String(totals.driversWithDebt)}
              hint={`de ${balances.length}`}
            />
          </View>
          <Input placeholder="Buscar conductor..." value={search} onChangeText={setSearch} returnKeyType="search" />
          <OptionSelector
            options={FILTER_OPTIONS}
            value={filter}
            onChange={(value) => value && setFilter(value)}
            allowDeselect={false}
          />
        </View>
      }
      ListEmptyComponent={<EmptyView icon="people-outline" message="No se encontraron conductores" />}
      renderItem={({ item }) => (
        <DriverDebtCard
          driver={item}
          onPress={() =>
            router.push({ pathname: "/deudas/[driverId]", params: { driverId: String(item.driverId) } })
          }
        />
      )}
    />
  )
}

export default function DeudasScreen() {
  return (
    <RequirePermission permission="deudas.read">
      <DeudasContent />
    </RequirePermission>
  )
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12, flexGrow: 1 },
  header: { gap: 12, marginBottom: 4 },
  stats: { flexDirection: "row", gap: 12 },
})

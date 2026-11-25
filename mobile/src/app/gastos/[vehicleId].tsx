import { useCallback, useState } from "react"
import { Alert, FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { getToneColor } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { StatCard } from "@/components/ui/StatCard"
import { EmptyView, LoadingView } from "@/components/ui/StateView"
import { useFocusQuery } from "@/hooks/useFocusQuery"
import { formatCurrency, formatKm } from "@/lib/format"
import { useTheme } from "@/theme/useTheme"
import { ExpenseRow } from "@/modules/gastos/components/ExpenseRow"
import { EXPENSE_CATEGORIES, formatNextService, getOilStatus, OIL_STATUS } from "@/modules/gastos/constants"
import { deleteExpenseService, getVehicleExpensesService } from "@/modules/gastos/services/gasto.service"
import type { ExpenseCategory, VehicleExpense } from "@/modules/gastos/types/gasto.types"

export default function VehicleExpensesScreen() {
  const theme = useTheme()
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>()
  const fetcher = useCallback(
    () => getVehicleExpensesService(Number(vehicleId)).then((response) => response.data),
    [vehicleId],
  )
  const query = useFocusQuery(fetcher)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const openCreate = (category: ExpenseCategory) => {
    router.push({
      pathname: "/gastos/form",
      params: { vehicleId, category, plate: query.data?.summary.plate ?? "" },
    })
  }

  const confirmDelete = (expense: VehicleExpense) => {
    Alert.alert(
      "Eliminar gasto",
      `¿Eliminar el gasto de ${formatCurrency(expense.total)}? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteExpenseService(expense.id)
              setExpandedId(null)
              query.refresh()
            } catch (err) {
              Alert.alert("Error", err instanceof Error ? err.message : "No se pudo eliminar el gasto")
            }
          },
        },
      ],
    )
  }

  if (query.isLoading) return <LoadingView />
  if (!query.data) {
    return (
      <EmptyView
        icon="alert-circle-outline"
        message={query.error ?? "No se pudieron cargar los gastos"}
        actionLabel="Reintentar"
        onAction={query.reload}
      />
    )
  }

  const { summary, byCategory, expenses } = query.data
  const oil = OIL_STATUS[getOilStatus(summary)]
  const oilColor = getToneColor(theme, oil.tone)

  return (
    <>
      <Stack.Screen options={{ title: summary.plate }} />
      <FlatList
        data={expenses}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={query.isRefreshing} onRefresh={query.refresh} tintColor={theme.primary} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View>
              <Text style={[styles.plate, { color: theme.foreground }]}>{summary.plate}</Text>
              <Text style={{ color: theme.mutedForeground }}>
                Gastos e insumos · {summary.driverName ?? "Sin conductor"}
              </Text>
            </View>

            <StatCard
              label={oil.label}
              value={formatNextService(summary.nextOilChangeKm, summary.nextOilChangeDate) ?? "—"}
              color={oilColor}
              accentColor={oilColor}
              style={styles.fullCard}
            />

            <View style={styles.stats}>
              <StatCard label="Este mes" value={formatCurrency(summary.monthSpent)} />
              <StatCard label="Histórico" value={formatCurrency(summary.totalSpent)} />
              <StatCard label="Último km" value={formatKm(summary.lastOdometerKm)} />
            </View>

            {byCategory.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                {byCategory.map((item) => {
                  const config = EXPENSE_CATEGORIES[item.category]
                  const color = getToneColor(theme, config.tone)
                  return (
                    <View
                      key={item.category}
                      style={[styles.chip, { borderColor: color + "55", backgroundColor: color + "1A" }]}
                    >
                      <Text style={[styles.chipText, { color }]}>
                        {config.label} <Text style={styles.chipStrong}>{formatCurrency(item.total)}</Text> ({item.count})
                      </Text>
                    </View>
                  )
                })}
              </ScrollView>
            )}

            <View style={styles.actions}>
              <Button title="Registrar gasto" icon="add" onPress={() => openCreate("spare_part")} style={styles.flex} />
              <Button
                title="Aceite"
                icon="water-outline"
                variant="outline"
                onPress={() => openCreate("oil_change")}
                style={styles.flex}
              />
            </View>

            <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Historial ({expenses.length})</Text>
          </View>
        }
        ListEmptyComponent={<EmptyView icon="receipt-outline" message="Este vehículo no tiene gastos registrados" />}
        renderItem={({ item }) => (
          <ExpenseRow
            expense={item}
            expanded={expandedId === item.id}
            onToggle={() => setExpandedId((current) => (current === item.id ? null : item.id))}
            onEdit={() => router.push({ pathname: "/gastos/form", params: { id: String(item.id) } })}
            onDelete={() => confirmDelete(item)}
          />
        )}
      />
    </>
  )
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12, flexGrow: 1 },
  header: { gap: 12, marginBottom: 4 },
  plate: { fontSize: 24, fontWeight: "800", letterSpacing: 2 },
  fullCard: { flex: 0 },
  stats: { flexDirection: "row", gap: 8 },
  chips: { gap: 8 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { fontSize: 12, fontWeight: "500" },
  chipStrong: { fontWeight: "700" },
  actions: { flexDirection: "row", gap: 12 },
  flex: { flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginTop: 8 },
})

import { useCallback, useMemo } from "react"
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar } from "@/components/ui/Avatar"
import { getToneColor } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { StatCard } from "@/components/ui/StatCard"
import { EmptyView, LoadingView } from "@/components/ui/StateView"
import { useFocusQuery } from "@/hooks/useFocusQuery"
import { formatCurrency, formatDateOnly } from "@/lib/format"
import { useTheme } from "@/theme/useTheme"
import { MovementRow } from "@/modules/deudas/components/MovementRow"
import { getBalanceTone, MOVEMENT_TYPES } from "@/modules/deudas/constants"
import { deleteMovementService, getStatementService } from "@/modules/deudas/services/deuda.service"
import type { DeudaMovementType, StatementItem } from "@/modules/deudas/types/deuda.types"

export default function DriverStatementScreen() {
  const { can } = useAuth()
  const theme = useTheme()
  const { driverId } = useLocalSearchParams<{ driverId: string }>()
  const fetcher = useCallback(
    () => getStatementService(Number(driverId)).then((response) => response.data),
    [driverId],
  )
  const query = useFocusQuery(fetcher)

  const movements = useMemo(() => [...(query.data?.movements ?? [])].reverse(), [query.data])

  const openCreate = (type: DeudaMovementType) => {
    router.push({
      pathname: "/deudas/form",
      params: { driverId, type, driverName: query.data?.summary.driverName ?? "" },
    })
  }

  const confirmDelete = (movement: StatementItem) => {
    Alert.alert(
      "Eliminar movimiento",
      `¿Eliminar ${MOVEMENT_TYPES[movement.type].label.toLowerCase()} de ${formatCurrency(movement.amount)}? El saldo se recalculará.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMovementService(movement.id)
              query.refresh()
            } catch (err) {
              Alert.alert("Error", err instanceof Error ? err.message : "No se pudo eliminar el movimiento")
            }
          },
        },
      ],
    )
  }

  const openActions = (movement: StatementItem) => {
    Alert.alert(
      `${MOVEMENT_TYPES[movement.type].label} · ${formatCurrency(movement.amount)}`,
      formatDateOnly(movement.movementDate),
      [
        ...(can("deudas.update")
          ? [
              {
                text: "Editar",
                onPress: () => router.push({ pathname: "/deudas/form", params: { id: String(movement.id) } }),
              },
            ]
          : []),
        ...(can("deudas.delete")
          ? [{ text: "Eliminar", style: "destructive" as const, onPress: () => confirmDelete(movement) }]
          : []),
        { text: "Cancelar", style: "cancel" },
      ],
    )
  }

  if (query.isLoading) return <LoadingView />
  if (!query.data) {
    return (
      <EmptyView
        icon="alert-circle-outline"
        message={query.error ?? "No se pudo cargar el estado de cuenta"}
        actionLabel="Reintentar"
        onAction={query.reload}
      />
    )
  }

  const { summary } = query.data
  const tone = getBalanceTone(summary.balance)
  const toneColor = getToneColor(theme, tone.tone)

  return (
    <>
      <Stack.Screen options={{ title: summary.driverName }} />
      <FlatList
        data={movements}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={query.isRefreshing} onRefresh={query.refresh} tintColor={theme.primary} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.profile}>
              <Avatar name={summary.driverName} uri={summary.photoUrl} size={52} />
              <View style={styles.profileText}>
                <Text style={[styles.name, { color: theme.foreground }]} numberOfLines={1}>
                  {summary.driverName}
                </Text>
                <Text style={{ color: theme.mutedForeground }}>Estado de cuenta</Text>
              </View>
            </View>

            <StatCard
              label={`Saldo · ${tone.label}`}
              value={`${summary.balance < 0 ? "-" : ""}${formatCurrency(Math.abs(summary.balance))}`}
              color={toneColor}
              accentColor={toneColor}
              style={styles.balanceCard}
            />

            <View style={styles.stats}>
              <StatCard
                label="Deuda"
                value={formatCurrency(summary.totalDebt)}
                color={getToneColor(theme, MOVEMENT_TYPES.debt.tone)}
              />
              <StatCard
                label="Abonado"
                value={formatCurrency(summary.totalPaid)}
                color={getToneColor(theme, MOVEMENT_TYPES.payment.tone)}
              />
              <StatCard
                label="Condonado"
                value={formatCurrency(summary.totalForgiven)}
                color={getToneColor(theme, MOVEMENT_TYPES.forgiveness.tone)}
              />
            </View>

            {can("deudas.create") && (
              <Button title="Agregar deuda" icon="add" onPress={() => openCreate("debt")} />
            )}
            {can("deudas.create") && (
            <View style={styles.actions}>
              <Button
                title="Abono"
                icon="cash-outline"
                variant="outline"
                onPress={() => openCreate("payment")}
                style={styles.flex}
              />
              <Button
                title="Condonar"
                icon="heart-outline"
                variant="outline"
                onPress={() => openCreate("forgiveness")}
                style={styles.flex}
              />
            </View>
            )}

            <Text style={[styles.sectionTitle, { color: theme.foreground }]}>
              Movimientos ({movements.length})
            </Text>
          </View>
        }
        ListEmptyComponent={<EmptyView icon="receipt-outline" message="Este conductor no tiene movimientos" />}
        renderItem={({ item }) => <MovementRow movement={item} onPress={() => openActions(item)} />}
      />
    </>
  )
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12, flexGrow: 1 },
  header: { gap: 12, marginBottom: 4 },
  profile: { flexDirection: "row", alignItems: "center", gap: 12 },
  profileText: { flex: 1, gap: 2 },
  name: { fontSize: 20, fontWeight: "700" },
  balanceCard: { flex: 0 },
  stats: { flexDirection: "row", gap: 8 },
  actions: { flexDirection: "row", gap: 12 },
  flex: { flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginTop: 8 },
})

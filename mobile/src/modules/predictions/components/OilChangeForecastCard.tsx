import { useCallback } from "react"
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native"
import { router } from "expo-router"
import Ionicons from "@expo/vector-icons/Ionicons"
import { Badge, getToneColor } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { useFocusQuery } from "@/hooks/useFocusQuery"
import { useTheme } from "@/theme/useTheme"
import { describeDue, OIL_PREDICTION_STATUS } from "../constants"
import { getOilChangePredictionsService } from "../services/prediction.service"

const MAX_ITEMS = 5

export function OilChangeForecastCard() {
  const theme = useTheme()
  const fetcher = useCallback(() => getOilChangePredictionsService().then((response) => response.data), [])
  const query = useFocusQuery(fetcher)

  const upcoming = (query.data?.predictions ?? [])
    .filter((item) => item.daysUntilDue != null || item.status === "overdue")
    .slice(0, MAX_ITEMS)

  const renderBody = () => {
    if (query.isLoading) return <ActivityIndicator color={theme.primary} style={styles.loader} />
    if (!query.data) {
      return (
        <View style={styles.message}>
          <Ionicons name="cloud-offline-outline" size={18} color={theme.mutedForeground} />
          <Text style={[styles.messageText, { color: theme.mutedForeground }]}>
            {query.error ?? "Predicciones no disponibles"}
          </Text>
        </View>
      )
    }
    if (upcoming.length === 0) {
      return (
        <Text style={[styles.messageText, { color: theme.mutedForeground }]}>
          Aún no hay datos suficientes. Registra cambios de aceite con el kilometraje para obtener predicciones.
        </Text>
      )
    }
    return upcoming.map((item, index) => {
      const status = OIL_PREDICTION_STATUS[item.status]
      const color = getToneColor(theme, status.tone)
      return (
        <Pressable
          key={item.vehicleId}
          onPress={() => router.push({ pathname: "/gastos/[vehicleId]", params: { vehicleId: String(item.vehicleId) } })}
          style={({ pressed }) => [
            styles.row,
            index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border },
            pressed && { opacity: 0.6 },
          ]}
        >
          <View style={[styles.dot, { backgroundColor: color }]} />
          <View style={styles.info}>
            <Text style={[styles.plate, { color: theme.foreground }]}>{item.plate}</Text>
            <Text style={[styles.due, { color }]}>{describeDue(item)}</Text>
          </View>
          <Badge label={status.label} tone={status.tone} />
        </Pressable>
      )
    })
  }

  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="water-outline" size={18} color={theme.warning} />
          <Text style={[styles.title, { color: theme.foreground }]}>Próximos cambios de aceite</Text>
        </View>
        <View style={[styles.mlTag, { backgroundColor: theme.accent + "22" }]}>
          <Ionicons name="sparkles" size={12} color={theme.accent} />
          <Text style={[styles.mlText, { color: theme.accent }]}>Predicción</Text>
        </View>
      </View>
      {renderBody()}
    </Card>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  title: { fontSize: 16, fontWeight: "600" },
  mlTag: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  mlText: { fontSize: 11, fontWeight: "600" },
  loader: { marginVertical: 12 },
  message: { flexDirection: "row", alignItems: "center", gap: 8 },
  messageText: { fontSize: 13 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  info: { flex: 1, gap: 2 },
  plate: { fontSize: 15, fontWeight: "700", letterSpacing: 1 },
  due: { fontSize: 13, fontWeight: "500" },
})

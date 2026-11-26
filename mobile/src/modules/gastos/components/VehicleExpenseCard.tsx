import { Image, StyleSheet, Text, View } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { getToneColor } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { formatCurrency } from "@/lib/format"
import { useTheme } from "@/theme/useTheme"
import { formatNextService, getOilStatus, OIL_STATUS } from "../constants"
import type { VehicleExpenseSummary } from "../types/gasto.types"

export function VehicleExpenseCard({ vehicle, onPress }: { vehicle: VehicleExpenseSummary; onPress: () => void }) {
  const theme = useTheme()
  const oil = OIL_STATUS[getOilStatus(vehicle)]
  const oilColor = getToneColor(theme, oil.tone)
  const nextOil = formatNextService(vehicle.nextOilChangeKm, vehicle.nextOilChangeDate)

  return (
    <Card onPress={onPress} style={[styles.card, { borderLeftColor: oilColor }]}>
      <View style={styles.row}>
        <View style={[styles.thumb, { backgroundColor: theme.muted }]}>
          {vehicle.photoUrl ? (
            <Image source={{ uri: vehicle.photoUrl }} style={styles.thumbImage} />
          ) : (
            <Ionicons name="car-sport-outline" size={26} color={theme.mutedForeground} />
          )}
        </View>
        <View style={styles.info}>
          <Text style={[styles.plate, { color: theme.foreground }]}>{vehicle.plate}</Text>
          <View style={styles.inline}>
            <Ionicons name="person-outline" size={12} color={theme.mutedForeground} />
            <Text style={[styles.meta, { color: theme.mutedForeground }]} numberOfLines={1}>
              {vehicle.driverName ?? "Sin conductor"}
            </Text>
          </View>
        </View>
        <View style={styles.month}>
          <Text style={[styles.meta, { color: theme.mutedForeground }]}>Este mes</Text>
          <Text style={[styles.amount, { color: theme.foreground }]}>{formatCurrency(vehicle.monthSpent)}</Text>
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <View style={styles.between}>
          <Text style={[styles.meta, { color: theme.mutedForeground }]}>Total histórico</Text>
          <Text style={[styles.total, { color: theme.foreground }]}>{formatCurrency(vehicle.totalSpent)}</Text>
        </View>
        <View style={styles.inline}>
          <Ionicons name="water-outline" size={14} color={oilColor} />
          <Text style={[styles.meta, { color: oilColor }]} numberOfLines={1}>
            {nextOil ? `Próximo aceite: ${nextOil}` : oil.label}
          </Text>
        </View>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: { borderLeftWidth: 4, gap: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  thumb: { width: 52, height: 52, borderRadius: 12, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  thumbImage: { width: "100%", height: "100%" },
  info: { flex: 1, gap: 4 },
  plate: { fontSize: 18, fontWeight: "800", letterSpacing: 2 },
  inline: { flexDirection: "row", alignItems: "center", gap: 6 },
  meta: { fontSize: 12 },
  month: { alignItems: "flex-end", gap: 2 },
  amount: { fontSize: 17, fontWeight: "700" },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10, gap: 6 },
  between: { flexDirection: "row", justifyContent: "space-between" },
  total: { fontSize: 13, fontWeight: "600" },
})

import { StyleSheet, Text, View } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { Badge, getToneColor } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { formatCurrency, formatDateOnly } from "@/lib/format"
import { useTheme } from "@/theme/useTheme"
import { PAYMENT_METHODS } from "@/modules/tarifas/constants"
import { MOVEMENT_TYPES } from "../constants"
import type { StatementItem } from "../types/deuda.types"

export function MovementRow({ movement, onPress }: { movement: StatementItem; onPress: () => void }) {
  const theme = useTheme()
  const config = MOVEMENT_TYPES[movement.type]
  const amountColor = getToneColor(theme, config.tone)
  const meta = [
    movement.paymentMethod ? PAYMENT_METHODS[movement.paymentMethod].label : null,
    movement.vehiclePlate,
  ].filter(Boolean)

  return (
    <Card onPress={onPress}>
      <View style={styles.header}>
        <Badge label={config.label} tone={config.tone} />
        <Text style={[styles.date, { color: theme.mutedForeground }]}>{formatDateOnly(movement.movementDate)}</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.info}>
          <Text style={[styles.description, { color: theme.foreground }]} numberOfLines={2}>
            {movement.description || "Sin descripción"}
          </Text>
          {meta.length > 0 && (
            <Text style={[styles.meta, { color: theme.mutedForeground }]}>{meta.join(" · ")}</Text>
          )}
        </View>
        <View style={styles.amounts}>
          <Text style={[styles.amount, { color: amountColor }]}>
            {config.sign}
            {formatCurrency(movement.amount)}
          </Text>
          <Text style={[styles.running, { color: theme.mutedForeground }]}>
            Saldo {movement.runningBalance < 0 ? "-" : ""}
            {formatCurrency(Math.abs(movement.runningBalance))}
          </Text>
        </View>
        <Ionicons name="ellipsis-vertical" size={16} color={theme.mutedForeground} />
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  date: { fontSize: 13 },
  body: { flexDirection: "row", alignItems: "center", gap: 10 },
  info: { flex: 1, gap: 2 },
  description: { fontSize: 15 },
  meta: { fontSize: 12 },
  amounts: { alignItems: "flex-end", gap: 2 },
  amount: { fontSize: 17, fontWeight: "700" },
  running: { fontSize: 12 },
})

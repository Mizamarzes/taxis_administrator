import { StyleSheet, Text, View } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { formatCurrency, formatDateOnly } from "@/lib/format"
import { useTheme } from "@/theme/useTheme"
import { PAYMENT_METHODS } from "../constants"
import type { Tarifa } from "../types/tarifa.types"

export function TarifaCard({ tarifa, onPress }: { tarifa: Tarifa; onPress: () => void }) {
  const theme = useTheme()
  const method = tarifa.paymentMethod ? PAYMENT_METHODS[tarifa.paymentMethod] : null

  return (
    <Card onPress={onPress}>
      <View style={styles.header}>
        <Text style={[styles.amount, { color: theme.foreground }]}>{formatCurrency(tarifa.amount)}</Text>
        {method && <Badge label={method.label} tone={method.tone} />}
      </View>
      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Ionicons name="car-outline" size={14} color={theme.mutedForeground} />
          <Text style={[styles.metaText, { color: theme.mutedForeground }]}>{tarifa.vehiclePlate ?? "Sin vehículo"}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="person-outline" size={14} color={theme.mutedForeground} />
          <Text style={[styles.metaText, { color: theme.mutedForeground }]} numberOfLines={1}>
            {tarifa.driverName ?? "Sin conductor"}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={theme.mutedForeground} />
          <Text style={[styles.metaText, { color: theme.mutedForeground }]}>{formatDateOnly(tarifa.tarifaDate)}</Text>
        </View>
      </View>
      {tarifa.description ? (
        <Text style={[styles.description, { color: theme.mutedForeground }]} numberOfLines={2}>
          {tarifa.description}
        </Text>
      ) : null}
    </Card>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  amount: { fontSize: 20, fontWeight: "700" },
  meta: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4, maxWidth: "100%" },
  metaText: { fontSize: 13 },
  description: { fontSize: 13, fontStyle: "italic" },
})

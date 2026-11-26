import { StyleSheet, Text, View } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { Avatar } from "@/components/ui/Avatar"
import { getToneColor } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { formatCurrency, formatDateOnly } from "@/lib/format"
import { useTheme } from "@/theme/useTheme"
import { getBalanceTone } from "../constants"
import type { DriverBalance } from "../types/deuda.types"

export function DriverDebtCard({ driver, onPress }: { driver: DriverBalance; onPress: () => void }) {
  const theme = useTheme()
  const tone = getBalanceTone(driver.balance)
  const color = getToneColor(theme, tone.tone)

  return (
    <Card onPress={onPress} style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.row}>
        <Avatar name={driver.driverName} uri={driver.photoUrl} size={48} />
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.foreground }]} numberOfLines={1}>
            {driver.driverName}
          </Text>
          <Text style={[styles.toneLabel, { color }]}>{tone.label}</Text>
        </View>
        <Text style={[styles.balance, { color }]}>{formatCurrency(Math.abs(driver.balance))}</Text>
      </View>
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Ionicons name="calendar-outline" size={14} color={theme.mutedForeground} />
        <Text style={[styles.footerText, { color: theme.mutedForeground }]}>
          {driver.lastMovementDate
            ? `Último movimiento: ${formatDateOnly(driver.lastMovementDate)}`
            : "Sin movimientos"}
        </Text>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: { borderLeftWidth: 4, gap: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 16, fontWeight: "600" },
  toneLabel: { fontSize: 13, fontWeight: "500" },
  balance: { fontSize: 18, fontWeight: "700" },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
  },
  footerText: { fontSize: 12 },
})

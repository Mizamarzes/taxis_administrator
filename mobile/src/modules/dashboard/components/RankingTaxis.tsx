import { StyleSheet, Text, View } from "react-native"
import { Card } from "@/components/ui/Card"
import { formatCurrency } from "@/lib/format"
import { useTheme } from "@/theme/useTheme"
import type { RankingItem } from "../types/dashboard.types"

export function RankingTaxis({ data }: { data: RankingItem[] }) {
  const theme = useTheme()

  return (
    <Card>
      <Text style={[styles.title, { color: theme.foreground }]}>Ranking de taxis</Text>
      {data.length === 0 ? (
        <Text style={{ color: theme.mutedForeground }}>Sin datos en el periodo.</Text>
      ) : (
        data.map((item, index) => (
          <View key={item.id} style={[styles.row, index > 0 && { borderTopWidth: 1, borderTopColor: theme.border }]}>
            <View style={[styles.position, { backgroundColor: index < 3 ? theme.primary : theme.muted }]}>
              <Text style={[styles.positionText, { color: index < 3 ? "#FFFFFF" : theme.mutedForeground }]}>
                {index + 1}
              </Text>
            </View>
            <View style={styles.info}>
              <Text style={[styles.plate, { color: theme.foreground }]}>{item.placa}</Text>
              <Text style={[styles.driver, { color: theme.mutedForeground }]} numberOfLines={1}>
                {item.conductor || "Sin conductor"}
              </Text>
            </View>
            <View style={styles.totals}>
              <Text style={[styles.amount, { color: theme.foreground }]}>{formatCurrency(item.ingresos)}</Text>
              <Text style={[styles.driver, { color: theme.mutedForeground }]}>{item.tarifas} tarifas</Text>
            </View>
          </View>
        ))
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  position: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  positionText: { fontSize: 13, fontWeight: "700" },
  info: { flex: 1 },
  plate: { fontSize: 15, fontWeight: "600" },
  driver: { fontSize: 12 },
  totals: { alignItems: "flex-end" },
  amount: { fontSize: 15, fontWeight: "600" },
})

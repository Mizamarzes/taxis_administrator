import { StyleSheet, Text, View } from "react-native"
import { Card } from "@/components/ui/Card"
import { formatCurrency, formatDateOnly } from "@/lib/format"
import { useTheme } from "@/theme/useTheme"
import type { EarningDay } from "../types/dashboard.types"

const MAX_DAYS = 14

export function GananciasChart({ data }: { data: EarningDay[] }) {
  const theme = useTheme()
  const days = data.slice(-MAX_DAYS)
  const max = Math.max(...days.map((day) => Number(day.ingresos)), 1)

  return (
    <Card>
      <Text style={[styles.title, { color: theme.foreground }]}>Ganancias por día</Text>
      {days.length === 0 ? (
        <Text style={{ color: theme.mutedForeground }}>Sin datos en el periodo.</Text>
      ) : (
        days.map((day) => {
          const ratio = Number(day.ingresos) / max
          return (
            <View key={day.fecha} style={styles.row}>
              <Text style={[styles.date, { color: theme.mutedForeground }]}>
                {formatDateOnly(day.fecha, { day: "2-digit", month: "short" })}
              </Text>
              <View style={[styles.track, { backgroundColor: theme.muted }]}>
                <View style={[styles.bar, { width: `${Math.max(ratio * 100, 2)}%`, backgroundColor: theme.primary }]} />
              </View>
              <Text style={[styles.amount, { color: theme.foreground }]}>{formatCurrency(day.ingresos)}</Text>
            </View>
          )
        })
      )}
      {data.length > MAX_DAYS && (
        <Text style={[styles.note, { color: theme.mutedForeground }]}>Mostrando los últimos {MAX_DAYS} días.</Text>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  date: { width: 52, fontSize: 12 },
  track: { flex: 1, height: 10, borderRadius: 5, overflow: "hidden" },
  bar: { height: "100%", borderRadius: 5 },
  amount: { width: 88, fontSize: 12, fontWeight: "600", textAlign: "right" },
  note: { fontSize: 12, marginTop: 4 },
})

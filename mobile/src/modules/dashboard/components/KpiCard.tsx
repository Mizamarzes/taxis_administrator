import { StyleSheet, Text, View } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { Card } from "@/components/ui/Card"
import { useTheme } from "@/theme/useTheme"

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: keyof typeof Ionicons.glyphMap
}

export function KpiCard({ title, value, subtitle, icon }: KpiCardProps) {
  const theme = useTheme()
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.mutedForeground }]}>{title}</Text>
        <View style={[styles.iconBox, { backgroundColor: theme.muted }]}>
          <Ionicons name={icon} size={16} color={theme.mutedForeground} />
        </View>
      </View>
      <Text style={[styles.value, { color: theme.foreground }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {subtitle && <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>{subtitle}</Text>}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 13, fontWeight: "500", flex: 1 },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  value: { fontSize: 26, fontWeight: "700" },
  subtitle: { fontSize: 12 },
})

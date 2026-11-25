import { StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native"
import { useTheme } from "@/theme/useTheme"
import { Card } from "./Card"

interface StatCardProps {
  label: string
  value: string
  color?: string
  hint?: string
  accentColor?: string
  style?: StyleProp<ViewStyle>
}

export function StatCard({ label, value, color, hint, accentColor, style }: StatCardProps) {
  const theme = useTheme()
  return (
    <Card style={[styles.card, accentColor && { borderLeftWidth: 4, borderLeftColor: accentColor }, style]}>
      <Text style={[styles.label, { color: theme.mutedForeground }]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[styles.value, { color: color ?? theme.foreground }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {hint && (
        <Text style={[styles.hint, { color: theme.mutedForeground }]} numberOfLines={1}>
          {hint}
        </Text>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: { flex: 1, gap: 4, padding: 14 },
  label: { fontSize: 12, fontWeight: "500" },
  value: { fontSize: 20, fontWeight: "700" },
  hint: { fontSize: 12 },
})

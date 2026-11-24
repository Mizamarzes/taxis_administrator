import { StyleSheet, Text, View } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { useTheme } from "@/theme/useTheme"

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  value: string | null | undefined
}

export function InfoRow({ icon, label, value }: InfoRowProps) {
  const theme = useTheme()
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={18} color={theme.mutedForeground} />
      <Text style={[styles.label, { color: theme.mutedForeground }]}>{label}</Text>
      <Text style={[styles.value, { color: theme.foreground }]} numberOfLines={2}>
        {value || "—"}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  label: {
    fontSize: 14,
    width: 110,
  },
  value: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    textAlign: "right",
  },
})

import { StyleSheet, Text, View } from "react-native"
import type { Palette } from "@/theme/colors"
import { useTheme } from "@/theme/useTheme"

export type BadgeTone = "success" | "muted" | "destructive" | "warning" | "info" | "primary"

export function getToneColor(theme: Palette, tone: BadgeTone): string {
  return {
    success: theme.success,
    muted: theme.mutedForeground,
    destructive: theme.destructive,
    warning: theme.warning,
    info: theme.info,
    primary: theme.primary,
  }[tone]
}

export function Badge({ label, tone = "muted" }: { label: string; tone?: BadgeTone }) {
  const theme = useTheme()
  const color = getToneColor(theme, tone)

  return (
    <View style={[styles.badge, { borderColor: color + "55", backgroundColor: color + "1A" }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
})

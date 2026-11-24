import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { useTheme } from "@/theme/useTheme"
import { Button } from "./Button"

export function LoadingView() {
  const theme = useTheme()
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  )
}

interface EmptyViewProps {
  message: string
  icon?: keyof typeof Ionicons.glyphMap
  actionLabel?: string
  onAction?: () => void
}

export function EmptyView({ message, icon = "file-tray-outline", actionLabel, onAction }: EmptyViewProps) {
  const theme = useTheme()
  return (
    <View style={styles.center}>
      <Ionicons name={icon} size={40} color={theme.mutedForeground} />
      <Text style={[styles.message, { color: theme.mutedForeground }]}>{message}</Text>
      {actionLabel && onAction && <Button title={actionLabel} variant="outline" onPress={onAction} />}
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 32,
  },
  message: {
    fontSize: 15,
    textAlign: "center",
  },
})

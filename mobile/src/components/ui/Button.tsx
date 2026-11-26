import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { useTheme } from "@/theme/useTheme"

type Variant = "primary" | "outline" | "destructive" | "ghost"

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: Variant
  loading?: boolean
  disabled?: boolean
  icon?: keyof typeof Ionicons.glyphMap
  style?: StyleProp<ViewStyle>
}

export function Button({ title, onPress, variant = "primary", loading, disabled, icon, style }: ButtonProps) {
  const theme = useTheme()
  const isDisabled = disabled || loading

  const variants: Record<Variant, { bg: string; fg: string; border: string }> = {
    primary: { bg: theme.primary, fg: theme.primaryForeground, border: theme.primary },
    outline: { bg: "transparent", fg: theme.foreground, border: theme.border },
    destructive: { bg: theme.destructive, fg: "#FFFFFF", border: theme.destructive },
    ghost: { bg: "transparent", fg: theme.foreground, border: "transparent" },
  }
  const current = variants[variant]

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: current.bg, borderColor: current.border },
        (pressed || isDisabled) && { opacity: 0.7 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={current.fg} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={18} color={current.fg} />}
          <Text style={[styles.text, { color: current.fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
})

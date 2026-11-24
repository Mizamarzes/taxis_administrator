import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"
import type { ReactNode } from "react"
import { useTheme } from "@/theme/useTheme"

interface CardProps {
  children: ReactNode
  onPress?: () => void
  style?: StyleProp<ViewStyle>
}

export function Card({ children, onPress, style }: CardProps) {
  const theme = useTheme()
  const baseStyle = [styles.card, { backgroundColor: theme.card, borderColor: theme.border }, style]

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [...baseStyle, pressed && { opacity: 0.7 }]}
      >
        {children}
      </Pressable>
    )
  }

  return <View style={baseStyle}>{children}</View>
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
})

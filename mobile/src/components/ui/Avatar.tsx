import { Image, StyleSheet, Text, View } from "react-native"
import { useTheme } from "@/theme/useTheme"

interface AvatarProps {
  name?: string | null
  uri?: string | null
  size?: number
}

const initials = (name?: string | null) =>
  (name ?? "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?"

export function Avatar({ name, uri, size = 44 }: AvatarProps) {
  const theme = useTheme()
  const dimension = { width: size, height: size, borderRadius: size / 4 }

  if (uri) {
    return <Image source={{ uri }} style={[dimension, { backgroundColor: theme.muted }]} />
  }

  return (
    <View style={[styles.fallback, dimension, { backgroundColor: theme.primary + "26" }]}>
      <Text style={[styles.text, { color: theme.primary, fontSize: size * 0.38 }]}>{initials(name)}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  fallback: { alignItems: "center", justifyContent: "center" },
  text: { fontWeight: "700" },
})

import { Pressable, StyleSheet } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { useTheme } from "@/theme/useTheme"

export function Fab({ onPress, icon = "add" }: { onPress: () => void; icon?: keyof typeof Ionicons.glyphMap }) {
  const theme = useTheme()
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.fab, { backgroundColor: theme.primary }, pressed && { opacity: 0.8 }]}
    >
      <Ionicons name={icon} size={28} color={theme.primaryForeground} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
})

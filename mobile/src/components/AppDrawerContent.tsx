import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Ionicons from "@expo/vector-icons/Ionicons"
import type { DrawerContentComponentProps } from "expo-router/drawer"
import { useAuth } from "@/contexts/AuthContext"
import { PRIMARY_NAV, SECONDARY_NAV, type NavItem } from "@/constants/navigation"
import { useTheme } from "@/theme/useTheme"
import { Avatar } from "./ui/Avatar"

export function AppDrawerContent({ state, navigation }: DrawerContentComponentProps) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { user, logout } = useAuth()
  const activeRoute = state.routes[state.index]?.name

  const goTo = (name: string) => {
    navigation.navigate(name)
    navigation.closeDrawer()
  }

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Deseas cerrar tu sesión?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: () => void logout() },
    ])
  }

  const roleLabel = user?.roles?.map((role) => role.name).join(" · ") || user?.email

  const renderItem = (item: NavItem) => {
    const isActive = activeRoute === item.name
    return (
      <Pressable
        key={item.name}
        onPress={() => goTo(item.name)}
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
        style={({ pressed }) => [
          styles.item,
          isActive && { backgroundColor: theme.primary + "26" },
          pressed && !isActive && { backgroundColor: theme.muted },
        ]}
      >
        <Ionicons name={item.icon} size={24} color={theme[item.color]} />
        <Text style={[styles.itemText, { color: theme.foreground }, isActive && styles.itemTextActive]}>
          {item.title}
        </Text>
      </Pressable>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Pressable
        onPress={() => goTo("profile")}
        style={[styles.header, { backgroundColor: theme.card, paddingTop: insets.top + 24 }]}
      >
        <Avatar name={user?.name} size={56} />
        <View style={styles.headerText}>
          <Text style={[styles.name, { color: theme.foreground }]} numberOfLines={1}>
            {user?.name}
          </Text>
          <Text style={[styles.subtitle, { color: theme.mutedForeground }]} numberOfLines={1}>
            {roleLabel}
          </Text>
        </View>
      </Pressable>

      <ScrollView contentContainerStyle={styles.list}>
        {PRIMARY_NAV.map(renderItem)}
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        {SECONDARY_NAV.map(renderItem)}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: theme.border, paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          onPress={handleLogout}
          accessibilityRole="button"
          style={({ pressed }) => [styles.item, pressed && { backgroundColor: theme.muted }]}
        >
          <Ionicons name="log-out-outline" size={24} color={theme.destructive} />
          <Text style={[styles.itemText, { color: theme.destructive }]}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerText: { flex: 1, gap: 2 },
  name: { fontSize: 18, fontWeight: "700" },
  subtitle: { fontSize: 14 },
  list: { paddingHorizontal: 12, paddingVertical: 16, gap: 4 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 26,
  },
  itemText: { fontSize: 16, fontWeight: "500" },
  itemTextActive: { fontWeight: "700" },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 12, marginHorizontal: 16 },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12, paddingTop: 8 },
})

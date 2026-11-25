import { Pressable } from "react-native"
import { Drawer } from "expo-router/drawer"
import Ionicons from "@expo/vector-icons/Ionicons"
import { AppDrawerContent } from "@/components/AppDrawerContent"
import { ALL_NAV } from "@/constants/navigation"
import { useTheme } from "@/theme/useTheme"

export default function DrawerLayout() {
  const theme = useTheme()

  return (
    <Drawer
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: theme.card },
        headerTintColor: theme.foreground,
        headerTitleStyle: { fontWeight: "600" },
        headerShadowVisible: false,
        headerLeft: () => (
          <Pressable
            onPress={() => navigation.toggleDrawer()}
            hitSlop={12}
            style={{ marginLeft: 16, marginRight: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Abrir menú"
          >
            <Ionicons name="menu" size={26} color={theme.foreground} />
          </Pressable>
        ),
        drawerType: "front",
        drawerStyle: { backgroundColor: theme.background, width: "82%", maxWidth: 340 },
        overlayColor: "rgba(0, 0, 0, 0.55)",
        sceneStyle: { backgroundColor: theme.background },
        swipeEdgeWidth: 40,
      })}
    >
      {ALL_NAV.map((item) => (
        <Drawer.Screen key={item.name} name={item.name} options={{ title: item.title }} />
      ))}
    </Drawer>
  )
}

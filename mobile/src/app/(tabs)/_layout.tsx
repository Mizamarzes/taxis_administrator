import { Tabs } from "expo-router"
import Ionicons from "@expo/vector-icons/Ionicons"
import { useTheme } from "@/theme/useTheme"

type IconName = keyof typeof Ionicons.glyphMap

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: "index", title: "Dashboard", icon: "grid-outline" },
  { name: "tarifas", title: "Tarifas", icon: "wallet-outline" },
  { name: "vehicles", title: "Autos", icon: "car-outline" },
  { name: "drivers", title: "Conductores", icon: "id-card-outline" },
  { name: "profile", title: "Perfil", icon: "person-outline" },
]

export default function TabsLayout() {
  const theme = useTheme()

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.card },
        headerTintColor: theme.foreground,
        headerTitleStyle: { fontWeight: "600" },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.mutedForeground,
        tabBarStyle: { backgroundColor: theme.card, borderTopColor: theme.border },
        sceneStyle: { backgroundColor: theme.background },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }) => <Ionicons name={tab.icon} size={size} color={String(color)} />,
          }}
        />
      ))}
    </Tabs>
  )
}

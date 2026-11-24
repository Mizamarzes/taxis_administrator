import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { View } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { LoadingView } from "@/components/ui/StateView"
import { useTheme } from "@/theme/useTheme"

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth()
  const theme = useTheme()

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <LoadingView />
      </View>
    )
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.card },
        headerTintColor: theme.foreground,
        headerTitleStyle: { fontWeight: "600" },
        headerBackTitle: "Atrás",
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="tarifas/form" options={{ presentation: "modal", title: "Tarifa" }} />
        <Stack.Screen name="tarifas/[id]" options={{ title: "Detalle de tarifa" }} />
        <Stack.Screen name="vehicles/[id]" options={{ title: "Vehículo" }} />
        <Stack.Screen name="drivers/[id]" options={{ title: "Conductor" }} />
      </Stack.Protected>
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  )
}

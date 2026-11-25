import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
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
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        <Stack.Screen name="tarifas/form" options={{ presentation: "modal", title: "Tarifa" }} />
        <Stack.Screen name="tarifas/[id]" options={{ title: "Detalle de tarifa" }} />
        <Stack.Screen name="vehicles/form" options={{ presentation: "modal", title: "Vehículo" }} />
        <Stack.Screen name="vehicles/[id]" options={{ title: "Vehículo" }} />
        <Stack.Screen name="drivers/form" options={{ presentation: "modal", title: "Conductor" }} />
        <Stack.Screen name="drivers/[id]" options={{ title: "Conductor" }} />
        <Stack.Screen name="deudas/form" options={{ presentation: "modal", title: "Movimiento" }} />
        <Stack.Screen name="deudas/[driverId]" options={{ title: "Estado de cuenta" }} />
        <Stack.Screen name="gastos/form" options={{ presentation: "modal", title: "Gasto" }} />
        <Stack.Screen name="gastos/[vehicleId]" options={{ title: "Gastos del vehículo" }} />
        <Stack.Screen name="users/form" options={{ presentation: "modal", title: "Usuario" }} />
        <Stack.Screen name="users/[id]" options={{ title: "Usuario" }} />
      </Stack.Protected>
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="auto" />
          <RootNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

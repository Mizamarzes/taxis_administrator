import { useState } from "react"
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Ionicons from "@expo/vector-icons/Ionicons"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useTheme } from "@/theme/useTheme"

export default function LoginScreen() {
  const theme = useTheme()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError("Ingresa tu correo y contraseña")
      return
    }
    setLoading(true)
    setError("")
    try {
      await login({ email: email.trim(), password })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={[styles.logo, { backgroundColor: theme.primary }]}>
              <Ionicons name="car-sport" size={40} color="#FFFFFF" />
            </View>
            <Text style={[styles.title, { color: theme.foreground }]}>Taxis Administrator</Text>
            <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
              Ingresa tus credenciales para acceder al sistema
            </Text>
          </View>

          {error !== "" && (
            <View style={[styles.alert, { borderColor: theme.destructive, backgroundColor: theme.destructive + "1A" }]}>
              <Ionicons name="alert-circle" size={18} color={theme.destructive} />
              <Text style={[styles.alertText, { color: theme.destructive }]}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <Input
              label="Correo electrónico"
              placeholder="admin@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!loading}
            />
            <Input
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              editable={!loading}
              onSubmitEditing={handleSubmit}
            />
            <Button title="Iniciar sesión" onPress={handleSubmit} loading={loading} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    gap: 24,
  },
  header: {
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
  },
  alert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
  },
  form: {
    gap: 16,
  },
})

import { useCallback, useState } from "react"
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native"
import { useFocusEffect } from "expo-router"
import Constants from "expo-constants"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { InfoRow } from "@/components/ui/InfoRow"
import { formatDateTime } from "@/lib/format"
import { useTheme } from "@/theme/useTheme"
import { getProfileService } from "@/modules/profile/services/profile.service"
import type { Profile } from "@/modules/profile/types/profile.types"

export default function ProfileScreen() {
  const theme = useTheme()
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      const response = await getProfileService()
      setProfile(response.data)
    } catch {
      setProfile(null)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await load()
    setIsRefreshing(false)
  }

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Deseas cerrar tu sesión?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: () => void logout() },
    ])
  }

  const name = profile?.name ?? user?.name
  const email = profile?.email ?? user?.email
  const roles = profile?.roles ?? user?.roles ?? []
  const isActive = profile?.isActive ?? user?.isActive

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={theme.primary} />}
    >
      <Card style={styles.hero}>
        <Avatar name={name} size={88} />
        <Text style={[styles.name, { color: theme.foreground }]}>{name}</Text>
        <Text style={{ color: theme.mutedForeground }}>{email}</Text>
        <View style={styles.badges}>
          <Badge label={isActive ? "Activo" : "Inactivo"} tone={isActive ? "success" : "muted"} />
          {roles.map((role) => (
            <Badge key={role.id} label={role.name} tone="primary" />
          ))}
        </View>
      </Card>

      <Card>
        <InfoRow icon="log-in-outline" label="Último acceso" value={formatDateTime(profile?.lastLogin)} />
        <InfoRow icon="calendar-outline" label="Miembro desde" value={formatDateTime(profile?.createdAt)} />
        <InfoRow icon="phone-portrait-outline" label="Versión app" value={Constants.expoConfig?.version} />
      </Card>

      <Button title="Cerrar sesión" icon="log-out-outline" variant="destructive" onPress={handleLogout} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  hero: { alignItems: "center", paddingVertical: 24, gap: 6 },
  name: { fontSize: 22, fontWeight: "700", marginTop: 6 },
  badges: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 6 },
})

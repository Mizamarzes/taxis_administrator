import { useCallback, useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { InfoRow } from "@/components/ui/InfoRow"
import { EmptyView, LoadingView } from "@/components/ui/StateView"
import { useFocusQuery } from "@/hooks/useFocusQuery"
import { formatDateTime } from "@/lib/format"
import { useTheme } from "@/theme/useTheme"
import { getRoleConfig } from "@/modules/users/constants"
import { deleteUserService, getUserByIdService } from "@/modules/users/services/user.service"

export default function UserDetailScreen() {
  const theme = useTheme()
  const { user: currentUser, can } = useAuth()
  const { id } = useLocalSearchParams<{ id: string }>()
  const fetcher = useCallback(() => getUserByIdService(Number(id)).then((response) => response.data), [id])
  const query = useFocusQuery(fetcher)
  const [isDeleting, setIsDeleting] = useState(false)

  const user = query.data
  const isSelf = user?.id === currentUser?.id

  const handleDelete = () => {
    if (!user) return
    Alert.alert("Eliminar usuario", `¿Seguro que deseas eliminar a ${user.name}? Ya no podrá iniciar sesión.`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          setIsDeleting(true)
          try {
            await deleteUserService(user.id)
            router.back()
          } catch (err) {
            Alert.alert("Error", err instanceof Error ? err.message : "No se pudo eliminar el usuario")
            setIsDeleting(false)
          }
        },
      },
    ])
  }

  if (query.isLoading) return <LoadingView />
  if (!user) {
    return (
      <EmptyView
        icon="alert-circle-outline"
        message={query.error ?? "Usuario no encontrado"}
        actionLabel="Reintentar"
        onAction={query.reload}
      />
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: user.name }} />
      <Card style={styles.hero}>
        <Avatar name={user.name} size={88} />
        <Text style={[styles.name, { color: theme.foreground }]}>{user.name}</Text>
        <Text style={{ color: theme.mutedForeground }}>{user.email}</Text>
        <View style={styles.badges}>
          <Badge label={user.isActive ? "Activo" : "Inactivo"} tone={user.isActive ? "success" : "muted"} />
          {user.role && (
            <Badge label={getRoleConfig(user.role.name).label} tone={getRoleConfig(user.role.name).tone} />
          )}
        </View>
      </Card>

      <Card>
        <InfoRow icon="log-in-outline" label="Último acceso" value={formatDateTime(user.lastLogin)} />
        <InfoRow icon="calendar-outline" label="Creado" value={formatDateTime(user.createdAt)} />
        <InfoRow icon="time-outline" label="Actualizado" value={formatDateTime(user.updatedAt)} />
      </Card>

      <View style={styles.actions}>
        {can("users.update") && (
          <Button
            title="Editar"
            icon="create-outline"
            variant="outline"
            onPress={() => router.push({ pathname: "/users/form", params: { id: String(user.id) } })}
          />
        )}
        {isSelf ? (
          <Text style={[styles.note, { color: theme.mutedForeground }]}>No puedes eliminar tu propia cuenta.</Text>
        ) : (
          can("users.delete") && (
            <Button title="Eliminar" icon="trash-outline" variant="destructive" loading={isDeleting} onPress={handleDelete} />
          )
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  hero: { alignItems: "center", paddingVertical: 24, gap: 6 },
  name: { fontSize: 22, fontWeight: "700", marginTop: 6 },
  badges: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 6 },
  actions: { gap: 12 },
  note: { textAlign: "center", fontSize: 13 },
})

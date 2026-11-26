import { useCallback } from "react"
import { FlatList, RefreshControl, StyleSheet, View } from "react-native"
import { router } from "expo-router"
import { useAuth } from "@/contexts/AuthContext"
import { RequirePermission } from "@/components/RequirePermission"
import { Fab } from "@/components/ui/Fab"
import { EmptyView, LoadingView } from "@/components/ui/StateView"
import { useFocusQuery } from "@/hooks/useFocusQuery"
import { useTheme } from "@/theme/useTheme"
import { RoleCard } from "@/modules/roles/components/RoleCard"
import { getRolesService } from "@/modules/roles/services/role.service"

function RolesContent() {
  const theme = useTheme()
  const { can } = useAuth()
  const fetcher = useCallback(() => getRolesService().then((response) => response.data), [])
  const query = useFocusQuery(fetcher)

  if (query.isLoading) return <LoadingView />
  if (!query.data) {
    return (
      <EmptyView
        icon="alert-circle-outline"
        message={query.error ?? "No se pudieron cargar los roles"}
        actionLabel="Reintentar"
        onAction={query.reload}
      />
    )
  }

  return (
    <View style={styles.flex}>
      <FlatList
        data={query.data}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={query.isRefreshing} onRefresh={query.refresh} tintColor={theme.primary} />
        }
        ListEmptyComponent={<EmptyView icon="shield-outline" message="No hay roles registrados." />}
        renderItem={({ item }) => (
          <RoleCard
            role={item}
            onPress={() => router.push({ pathname: "/roles/[id]", params: { id: String(item.id) } })}
          />
        )}
      />
      {can("roles.create") && <Fab onPress={() => router.push("/roles/form")} />}
    </View>
  )
}

export default function RolesScreen() {
  return (
    <RequirePermission permission="roles.read">
      <RolesContent />
    </RequirePermission>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: 16, gap: 12, paddingBottom: 96, flexGrow: 1 },
})

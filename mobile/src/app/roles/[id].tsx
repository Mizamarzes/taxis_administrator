import { useCallback, useEffect, useMemo, useState } from "react"
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from "react-native"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { useAuth } from "@/contexts/AuthContext"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { EmptyView, LoadingView } from "@/components/ui/StateView"
import { useFocusQuery } from "@/hooks/useFocusQuery"
import { useTheme } from "@/theme/useTheme"
import { VERB_LABELS } from "@/modules/roles/constants"
import {
  deleteRoleService,
  getPermissionCatalogService,
  getRoleService,
  updateRolePermissionsService,
} from "@/modules/roles/services/role.service"
import type { PermissionGroup, RoleDetail } from "@/modules/roles/types/role.types"

const sameSet = (a: Set<string>, b: Set<string>) => a.size === b.size && [...a].every((value) => b.has(value))

export default function RoleDetailScreen() {
  const theme = useTheme()
  const { can, refreshProfile } = useAuth()
  const { id } = useLocalSearchParams<{ id: string }>()
  const fetcher = useCallback(
    () =>
      Promise.all([getRoleService(Number(id)), getPermissionCatalogService()]).then(
        ([role, catalog]) => ({ role: role.data, catalog: catalog.data }),
      ),
    [id],
  )
  const query = useFocusQuery(fetcher)
  const [role, setRole] = useState<RoleDetail | null>(null)
  const [draft, setDraft] = useState<Set<string>>(new Set())
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (query.data) {
      setRole(query.data.role)
      setDraft(new Set(query.data.role.permissions))
    }
  }, [query.data])

  const original = useMemo(() => new Set(role?.permissions ?? []), [role])
  const isDirty = !sameSet(original, draft)
  const isLocked = !role || role.isSuperAdmin || !can("roles.update")

  const toggle = (action: string, value: boolean) => {
    setDraft((prev) => {
      const next = new Set(prev)
      if (value) next.add(action)
      else next.delete(action)
      return next
    })
  }

  const toggleGroup = (group: PermissionGroup, value: boolean) => {
    setDraft((prev) => {
      const next = new Set(prev)
      for (const permission of group.permissions) {
        if (value) next.add(permission.action)
        else next.delete(permission.action)
      }
      return next
    })
  }

  const save = async () => {
    if (!role) return
    setIsSaving(true)
    try {
      const response = await updateRolePermissionsService(role.id, [...draft])
      setRole(response.data)
      setDraft(new Set(response.data.permissions))
      await refreshProfile()
      Alert.alert("Permisos guardados", "Pueden tardar hasta un minuto en aplicarse.")
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "No se pudieron guardar los permisos")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = () => {
    if (!role) return
    Alert.alert("Eliminar rol", `¿Seguro que deseas eliminar el rol ${role.name}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          setIsDeleting(true)
          try {
            await deleteRoleService(role.id)
            router.back()
          } catch (err) {
            Alert.alert("Error", err instanceof Error ? err.message : "No se pudo eliminar el rol")
          } finally {
            setIsDeleting(false)
          }
        },
      },
    ])
  }

  if (query.isLoading) return <LoadingView />
  if (!query.data || !role) {
    return (
      <EmptyView
        icon="alert-circle-outline"
        message={query.error ?? "No se pudo cargar el rol"}
        actionLabel="Reintentar"
        onAction={query.reload}
      />
    )
  }

  return (
    <View style={styles.flex}>
      <Stack.Screen options={{ title: role.name }} />
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.hero}>
          <Text style={[styles.name, { color: theme.foreground }]}>{role.name}</Text>
          <Text style={{ color: theme.mutedForeground, textAlign: "center" }}>
            {role.description || "Sin descripción"}
          </Text>
          <View style={styles.badges}>
            {role.isSystem && <Badge label="Sistema" tone="info" />}
            <Badge label={`${role.userCount} usuario(s)`} tone="muted" />
          </View>
        </Card>

        {role.isSuperAdmin && (
          <Text style={[styles.note, { color: theme.mutedForeground }]}>
            SUPERADMIN siempre tiene todos los permisos y no se puede editar.
          </Text>
        )}

        {query.data.catalog.map((group) => {
          const granted = group.permissions.filter((permission) => draft.has(permission.action)).length
          return (
            <Card key={group.resource} style={styles.group}>
              <View style={styles.groupHeader}>
                <View style={styles.flex}>
                  <Text style={[styles.groupTitle, { color: theme.foreground }]}>{group.label}</Text>
                  <Text style={[styles.groupMeta, { color: theme.mutedForeground }]}>
                    {granted} de {group.permissions.length}
                  </Text>
                </View>
                <Switch
                  value={granted === group.permissions.length}
                  onValueChange={(value) => toggleGroup(group, value)}
                  disabled={isLocked}
                  trackColor={{ true: theme.primary, false: theme.border }}
                  thumbColor="#FFFFFF"
                />
              </View>
              {group.permissions.map((permission) => (
                <View key={permission.action} style={[styles.permissionRow, { borderTopColor: theme.border }]}>
                  <View style={styles.flex}>
                    <Text style={[styles.permissionLabel, { color: theme.foreground }]}>
                      {VERB_LABELS[permission.verb] ?? permission.verb}
                    </Text>
                    <Text style={[styles.groupMeta, { color: theme.mutedForeground }]}>{permission.description}</Text>
                  </View>
                  <Switch
                    value={draft.has(permission.action)}
                    onValueChange={(value) => toggle(permission.action, value)}
                    disabled={isLocked}
                    trackColor={{ true: theme.primary, false: theme.border }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              ))}
            </Card>
          )
        })}

        <View style={styles.actions}>
          {can("roles.update") && (
            <Button
              title="Editar"
              icon="create-outline"
              variant="outline"
              onPress={() => router.push({ pathname: "/roles/form", params: { id: String(role.id) } })}
              style={styles.flex}
            />
          )}
          {can("roles.delete") && !role.isSystem && (
            <Button
              title="Eliminar"
              icon="trash-outline"
              variant="destructive"
              loading={isDeleting}
              onPress={handleDelete}
              style={styles.flex}
            />
          )}
        </View>
      </ScrollView>

      {!isLocked && isDirty && (
        <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <Button
            title="Descartar"
            variant="outline"
            onPress={() => setDraft(new Set(original))}
            disabled={isSaving}
            style={styles.flex}
          />
          <Button title="Guardar" onPress={save} loading={isSaving} style={styles.flex} />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 16, gap: 16, paddingBottom: 120 },
  hero: { alignItems: "center", paddingVertical: 20, gap: 8 },
  name: { fontSize: 22, fontWeight: "700" },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center" },
  note: { fontSize: 13, textAlign: "center" },
  group: { gap: 0 },
  groupHeader: { flexDirection: "row", alignItems: "center", gap: 12, paddingBottom: 8 },
  groupTitle: { fontSize: 16, fontWeight: "600" },
  groupMeta: { fontSize: 12 },
  permissionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  permissionLabel: { fontSize: 15, fontWeight: "500" },
  actions: { flexDirection: "row", gap: 12 },
  footer: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
})

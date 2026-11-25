import { StyleSheet, Text, View } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { useTheme } from "@/theme/useTheme"
import type { Role } from "../types/role.types"

export function RoleCard({ role, onPress }: { role: Role; onPress: () => void }) {
  const theme = useTheme()

  return (
    <Card onPress={onPress}>
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: theme.primary + "1F" }]}>
          <Ionicons name="shield-checkmark-outline" size={22} color={theme.primary} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.foreground }]} numberOfLines={1}>
            {role.name}
          </Text>
          {role.description ? (
            <Text style={[styles.description, { color: theme.mutedForeground }]} numberOfLines={2}>
              {role.description}
            </Text>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.mutedForeground} />
      </View>
      <View style={styles.badges}>
        {role.isSystem && <Badge label="Sistema" tone="info" />}
        <Badge label={`${role.userCount} usuario(s)`} tone="muted" />
        <Badge
          label={role.isSuperAdmin ? "Todos los permisos" : `${role.permissionCount} permiso(s)`}
          tone="primary"
        />
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 16, fontWeight: "600" },
  description: { fontSize: 13 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
})

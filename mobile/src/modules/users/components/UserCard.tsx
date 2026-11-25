import { StyleSheet, Text, View } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { Avatar } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { formatDateTime } from "@/lib/format"
import { useTheme } from "@/theme/useTheme"
import { getRoleConfig } from "../constants"
import type { User } from "../types/user.types"

export function UserCard({ user, isCurrent, onPress }: { user: User; isCurrent: boolean; onPress: () => void }) {
  const theme = useTheme()

  return (
    <Card onPress={onPress}>
      <View style={styles.row}>
        <Avatar name={user.name} size={46} />
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.foreground }]} numberOfLines={1}>
            {user.name}
            {isCurrent && <Text style={{ color: theme.mutedForeground }}> (tú)</Text>}
          </Text>
          <Text style={[styles.email, { color: theme.mutedForeground }]} numberOfLines={1}>
            {user.email}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.mutedForeground} />
      </View>
      <View style={styles.badges}>
        <Badge label={user.isActive ? "Activo" : "Inactivo"} tone={user.isActive ? "success" : "muted"} />
        {user.roles.map((role) => {
          const config = getRoleConfig(role.name)
          return <Badge key={role.id} label={config.label} tone={config.tone} />
        })}
      </View>
      <View style={styles.inline}>
        <Ionicons name="log-in-outline" size={14} color={theme.mutedForeground} />
        <Text style={[styles.meta, { color: theme.mutedForeground }]}>
          {user.lastLogin ? `Último acceso: ${formatDateTime(user.lastLogin)}` : "Nunca ha iniciado sesión"}
        </Text>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 16, fontWeight: "600" },
  email: { fontSize: 13 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  inline: { flexDirection: "row", alignItems: "center", gap: 6 },
  meta: { fontSize: 12 },
})

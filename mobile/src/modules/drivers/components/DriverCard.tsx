import { StyleSheet, Text, View } from "react-native"
import { Avatar } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { useTheme } from "@/theme/useTheme"
import { DRIVER_STATUS } from "../constants"
import type { Driver } from "../types/driver.types"

export function DriverCard({ driver, onPress }: { driver: Driver; onPress: () => void }) {
  const theme = useTheme()
  const status = DRIVER_STATUS[driver.status]

  return (
    <Card onPress={onPress} style={styles.card}>
      <Avatar name={driver.name} uri={driver.photoUrl} />
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.foreground }]} numberOfLines={1}>{driver.name}</Text>
        <Text style={[styles.meta, { color: theme.mutedForeground }]} numberOfLines={1}>
          {driver.phone ?? driver.email ?? "Sin contacto"}
        </Text>
      </View>
      <Badge label={status.label} tone={status.tone} />
    </Card>
  )
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12 },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 16, fontWeight: "600" },
  meta: { fontSize: 13 },
})

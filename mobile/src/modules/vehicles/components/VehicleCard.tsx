import { StyleSheet, Text, View } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { useTheme } from "@/theme/useTheme"
import { VEHICLE_STATUS } from "../constants"
import { getRestrictionDayLabel, type Vehicle } from "../types/vehicle.types"

export function VehicleCard({ vehicle, onPress }: { vehicle: Vehicle; onPress: () => void }) {
  const theme = useTheme()
  const status = VEHICLE_STATUS[vehicle.vehicleStatus]
  const restriction = getRestrictionDayLabel(vehicle.drivingRestrictionDay)

  return (
    <Card onPress={onPress}>
      <View style={styles.header}>
        <View style={[styles.plate, { borderColor: theme.primary, backgroundColor: theme.primary + "1A" }]}>
          <Text style={[styles.plateText, { color: theme.foreground }]}>{vehicle.plate}</Text>
        </View>
        <Badge label={status.label} tone={status.tone} />
      </View>
      <View style={styles.row}>
        <Ionicons name="person-outline" size={14} color={theme.mutedForeground} />
        <Text style={[styles.meta, { color: theme.mutedForeground }]}>{vehicle.driver?.name ?? "Sin conductor asignado"}</Text>
      </View>
      {restriction && (
        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={14} color={theme.mutedForeground} />
          <Text style={[styles.meta, { color: theme.mutedForeground }]}>Pico y placa: {restriction}</Text>
        </View>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  plate: { borderWidth: 2, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  plateText: { fontSize: 18, fontWeight: "800", letterSpacing: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  meta: { fontSize: 14 },
})

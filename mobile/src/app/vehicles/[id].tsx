import { useEffect, useState } from "react"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { Avatar } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { InfoRow } from "@/components/ui/InfoRow"
import { EmptyView, LoadingView } from "@/components/ui/StateView"
import { formatDateOnly, formatDateTime, parseDateOnly } from "@/lib/format"
import { useTheme } from "@/theme/useTheme"
import { DRIVER_STATUS } from "@/modules/drivers/constants"
import { VEHICLE_STATUS } from "@/modules/vehicles/constants"
import { getVehicleByIdService } from "@/modules/vehicles/services/vehicle.service"
import { getRestrictionDayLabel, type Vehicle } from "@/modules/vehicles/types/vehicle.types"

export default function VehicleDetailScreen() {
  const theme = useTheme()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getVehicleByIdService(Number(id))
      .then((response) => setVehicle(response.data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) return <LoadingView />
  if (error || !vehicle) return <EmptyView icon="alert-circle-outline" message={error ?? "Vehículo no encontrado"} />

  const status = VEHICLE_STATUS[vehicle.vehicleStatus]
  const today = new Date()

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: vehicle.plate }} />
      <Card style={styles.hero}>
        <View style={[styles.plate, { borderColor: theme.primary, backgroundColor: theme.primary + "1A" }]}>
          <Text style={[styles.plateText, { color: theme.foreground }]}>{vehicle.plate}</Text>
        </View>
        <Badge label={status.label} tone={status.tone} />
      </Card>

      <Card>
        <InfoRow icon="calendar-outline" label="Pico y placa" value={getRestrictionDayLabel(vehicle.drivingRestrictionDay)} />
        <InfoRow icon="time-outline" label="Registrado" value={formatDateTime(vehicle.createdAt)} />
      </Card>

      <Text style={[styles.section, { color: theme.foreground }]}>Conductor asignado</Text>
      {vehicle.driver ? (
        <Card
          style={styles.driver}
          onPress={() => router.push({ pathname: "/drivers/[id]", params: { id: String(vehicle.driver?.id) } })}
        >
          <Avatar name={vehicle.driver.name} uri={vehicle.driver.photoUrl} />
          <View style={styles.flex}>
            <Text style={[styles.driverName, { color: theme.foreground }]}>{vehicle.driver.name}</Text>
            <Text style={{ color: theme.mutedForeground }}>{vehicle.driver.phone ?? "Sin teléfono"}</Text>
          </View>
          <Badge label={DRIVER_STATUS[vehicle.driver.status].label} tone={DRIVER_STATUS[vehicle.driver.status].tone} />
        </Card>
      ) : (
        <Card>
          <Text style={{ color: theme.mutedForeground }}>Sin conductor asignado.</Text>
        </Card>
      )}

      <Text style={[styles.section, { color: theme.foreground }]}>Documentos</Text>
      <Card>
        {vehicle.documents.length === 0 ? (
          <Text style={{ color: theme.mutedForeground }}>No hay documentos registrados.</Text>
        ) : (
          vehicle.documents.map((doc) => {
            const expiry = parseDateOnly(doc.expiryDate)
            const expired = expiry !== null && expiry < today
            return (
              <View key={doc.id} style={styles.docRow}>
                <View style={styles.flex}>
                  <Text style={[styles.driverName, { color: theme.foreground }]}>Documento #{doc.id}</Text>
                  <Text style={{ color: theme.mutedForeground, fontSize: 13 }}>
                    Expedición: {formatDateOnly(doc.issueDate)} · Vence: {formatDateOnly(doc.expiryDate)}
                  </Text>
                </View>
                {expiry && <Badge label={expired ? "Vencido" : "Vigente"} tone={expired ? "destructive" : "success"} />}
              </View>
            )
          })
        )}
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  hero: { alignItems: "center", paddingVertical: 24, gap: 12 },
  plate: { borderWidth: 3, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 8 },
  plateText: { fontSize: 28, fontWeight: "800", letterSpacing: 4 },
  section: { fontSize: 16, fontWeight: "600", marginTop: 8 },
  driver: { flexDirection: "row", alignItems: "center", gap: 12 },
  driverName: { fontSize: 15, fontWeight: "600" },
  flex: { flex: 1 },
  docRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4 },
})

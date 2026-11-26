import { useEffect, useState } from "react"
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native"
import { Stack, useLocalSearchParams } from "expo-router"
import { Avatar } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { InfoRow } from "@/components/ui/InfoRow"
import { EmptyView, LoadingView } from "@/components/ui/StateView"
import { formatDateOnly, formatDateTime } from "@/lib/format"
import { useTheme } from "@/theme/useTheme"
import { DRIVER_STATUS } from "@/modules/drivers/constants"
import { getDriverByIdService } from "@/modules/drivers/services/driver.service"
import type { Driver } from "@/modules/drivers/types/driver.types"

export default function DriverDetailScreen() {
  const theme = useTheme()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [driver, setDriver] = useState<Driver | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getDriverByIdService(Number(id))
      .then((response) => setDriver(response.data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) return <LoadingView />
  if (error || !driver) return <EmptyView icon="alert-circle-outline" message={error ?? "Conductor no encontrado"} />

  const status = DRIVER_STATUS[driver.status]
  const phone = driver.phone?.replace(/\s+/g, "")

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: driver.name }} />
      <Card style={styles.hero}>
        <Avatar name={driver.name} uri={driver.photoUrl} size={88} />
        <Text style={[styles.name, { color: theme.foreground }]}>{driver.name}</Text>
        <Badge label={status.label} tone={status.tone} />
      </Card>

      <Card>
        <InfoRow icon="call-outline" label="Teléfono" value={driver.phone} />
        <InfoRow icon="mail-outline" label="Correo" value={driver.email} />
        <InfoRow icon="location-outline" label="Dirección" value={driver.address} />
        <InfoRow icon="briefcase-outline" label="Contratación" value={formatDateOnly(driver.hireDate)} />
        <InfoRow icon="time-outline" label="Registrado" value={formatDateTime(driver.createdAt)} />
      </Card>

      {phone && (
        <View style={styles.actions}>
          <Button title="Llamar" icon="call" onPress={() => Linking.openURL(`tel:${phone}`)} style={styles.flex} />
          <Button
            title="WhatsApp"
            icon="logo-whatsapp"
            variant="outline"
            onPress={() => Linking.openURL(`https://wa.me/${phone.replace(/^\+/, "")}`)}
            style={styles.flex}
          />
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  hero: { alignItems: "center", paddingVertical: 24, gap: 10 },
  name: { fontSize: 22, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 12 },
  flex: { flex: 1 },
})

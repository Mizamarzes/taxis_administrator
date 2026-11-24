import { useCallback, useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native"
import { router, Stack, useFocusEffect, useLocalSearchParams } from "expo-router"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { InfoRow } from "@/components/ui/InfoRow"
import { EmptyView, LoadingView } from "@/components/ui/StateView"
import { formatCurrency, formatDateOnly, formatDateTime } from "@/lib/format"
import { useTheme } from "@/theme/useTheme"
import { PAYMENT_METHODS } from "@/modules/tarifas/constants"
import { deleteTarifaService, getTarifaByIdService } from "@/modules/tarifas/services/tarifa.service"
import type { Tarifa } from "@/modules/tarifas/types/tarifa.types"

export default function TarifaDetailScreen() {
  const theme = useTheme()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [tarifa, setTarifa] = useState<Tarifa | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useFocusEffect(
    useCallback(() => {
      let active = true
      getTarifaByIdService(Number(id))
        .then((response) => active && setTarifa(response.data))
        .catch((err: Error) => active && setError(err.message))
        .finally(() => active && setIsLoading(false))
      return () => {
        active = false
      }
    }, [id]),
  )

  const handleDelete = () => {
    Alert.alert("Eliminar tarifa", "¿Seguro que deseas eliminar esta tarifa? Esta acción no se puede deshacer.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          setIsDeleting(true)
          try {
            await deleteTarifaService(Number(id))
            router.back()
          } catch (err) {
            Alert.alert("Error", err instanceof Error ? err.message : "No se pudo eliminar la tarifa")
            setIsDeleting(false)
          }
        },
      },
    ])
  }

  if (isLoading) return <LoadingView />
  if (error || !tarifa) return <EmptyView icon="alert-circle-outline" message={error ?? "Tarifa no encontrada"} />

  const method = tarifa.paymentMethod ? PAYMENT_METHODS[tarifa.paymentMethod] : null

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: `Tarifa #${tarifa.id}` }} />
      <Card style={styles.hero}>
        <Text style={{ color: theme.mutedForeground }}>Monto</Text>
        <Text style={[styles.amount, { color: theme.foreground }]}>{formatCurrency(tarifa.amount)}</Text>
        {method && <Badge label={method.label} tone={method.tone} />}
      </Card>

      <Card>
        <InfoRow icon="calendar-outline" label="Fecha" value={formatDateOnly(tarifa.tarifaDate)} />
        <InfoRow icon="car-outline" label="Vehículo" value={tarifa.vehiclePlate} />
        <InfoRow icon="person-outline" label="Conductor" value={tarifa.driverName} />
        <InfoRow icon="document-text-outline" label="Descripción" value={tarifa.description} />
        <InfoRow icon="time-outline" label="Registrada" value={formatDateTime(tarifa.createdAt)} />
      </Card>

      <View style={styles.actions}>
        <Button
          title="Editar"
          icon="create-outline"
          variant="outline"
          onPress={() => router.push({ pathname: "/tarifas/form", params: { id: String(tarifa.id) } })}
        />
        <Button title="Eliminar" icon="trash-outline" variant="destructive" loading={isDeleting} onPress={handleDelete} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  hero: { alignItems: "center", paddingVertical: 24 },
  amount: { fontSize: 34, fontWeight: "700" },
  actions: { gap: 12 },
})

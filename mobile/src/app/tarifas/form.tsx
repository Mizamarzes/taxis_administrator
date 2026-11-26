import { useEffect, useState } from "react"
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { OptionSelector } from "@/components/ui/OptionSelector"
import { LoadingView } from "@/components/ui/StateView"
import { isValidDateOnly, subDays, toDateOnly } from "@/lib/format"
import { PAYMENT_METHOD_OPTIONS } from "@/modules/tarifas/constants"
import {
  createTarifaService,
  getTarifaByIdService,
  updateTarifaService,
} from "@/modules/tarifas/services/tarifa.service"
import type { PaymentMethod } from "@/modules/tarifas/types/tarifa.types"
import { getVehiclesService } from "@/modules/vehicles/services/vehicle.service"
import type { Vehicle } from "@/modules/vehicles/types/vehicle.types"

interface FormState {
  amount: string
  vehicleId: number | undefined
  tarifaDate: string
  paymentMethod: PaymentMethod | undefined
  description: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const today = () => toDateOnly(new Date())

export default function TarifaFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const [form, setForm] = useState<FormState>({
    amount: "",
    vehicleId: undefined,
    tarifaDate: today(),
    paymentMethod: undefined,
    description: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(isEdit)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    getVehiclesService({ page: 1, limit: 100 })
      .then((response) => setVehicles(response.data.items))
      .catch(() => setVehicles([]))
  }, [])

  useEffect(() => {
    if (!id) return
    getTarifaByIdService(Number(id))
      .then(({ data }) =>
        setForm({
          amount: String(Number(data.amount)),
          vehicleId: data.vehicleId ?? undefined,
          tarifaDate: data.tarifaDate?.slice(0, 10) ?? today(),
          paymentMethod: data.paymentMethod ?? undefined,
          description: data.description ?? "",
        }),
      )
      .catch((err: Error) => {
        Alert.alert("Error", err.message)
        router.back()
      })
      .finally(() => setIsLoading(false))
  }, [id])

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = (): FormErrors => {
    const result: FormErrors = {}
    const amount = Number(form.amount)
    if (!form.amount || Number.isNaN(amount) || amount <= 0) result.amount = "Ingresa un monto mayor a 0"
    if (form.tarifaDate && !isValidDateOnly(form.tarifaDate)) result.tarifaDate = "Usa el formato AAAA-MM-DD"
    return result
  }

  const handleSubmit = async () => {
    const validation = validate()
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      return
    }
    setIsSaving(true)
    const payload = {
      amount: Number(form.amount),
      vehicleId: form.vehicleId,
      tarifaDate: form.tarifaDate || undefined,
      paymentMethod: form.paymentMethod,
      description: form.description.trim() || undefined,
    }
    try {
      if (isEdit) await updateTarifaService(Number(id), payload)
      else await createTarifaService(payload)
      router.back()
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "No se pudo guardar la tarifa")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <LoadingView />

  const vehicleOptions = vehicles.map((vehicle) => ({ value: vehicle.id, label: vehicle.plate }))
  const dateShortcuts = [
    { value: today(), label: "Hoy" },
    { value: toDateOnly(subDays(new Date(), 1)), label: "Ayer" },
  ]

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Stack.Screen options={{ title: isEdit ? "Editar tarifa" : "Nueva tarifa" }} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Input
          label="Monto ($)"
          placeholder="50000"
          keyboardType="numeric"
          value={form.amount}
          onChangeText={(value) => update("amount", value.replace(/[^0-9.]/g, ""))}
          error={errors.amount}
        />

        <OptionSelector
          label="Vehículo"
          options={vehicleOptions}
          value={form.vehicleId}
          onChange={(value) => update("vehicleId", value)}
          emptyText="No hay vehículos registrados"
        />

        <View style={styles.dateGroup}>
          <Input
            label="Fecha"
            placeholder="AAAA-MM-DD"
            value={form.tarifaDate}
            onChangeText={(value) => update("tarifaDate", value)}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            error={errors.tarifaDate}
          />
          <OptionSelector
            options={dateShortcuts}
            value={form.tarifaDate}
            onChange={(value) => value && update("tarifaDate", value)}
            allowDeselect={false}
          />
        </View>

        <OptionSelector
          label="Método de pago"
          options={PAYMENT_METHOD_OPTIONS}
          value={form.paymentMethod}
          onChange={(value) => update("paymentMethod", value)}
        />

        <Input
          label="Descripción (opcional)"
          placeholder="Observaciones..."
          value={form.description}
          onChangeText={(value) => update("description", value)}
          multiline
          style={styles.textArea}
        />

        <View style={styles.actions}>
          <Button title="Cancelar" variant="outline" onPress={() => router.back()} style={styles.flex} />
          <Button
            title={isEdit ? "Guardar" : "Crear tarifa"}
            onPress={handleSubmit}
            loading={isSaving}
            style={styles.flex}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 16, gap: 20 },
  dateGroup: { gap: 8 },
  textArea: { height: 96, paddingTop: 12, textAlignVertical: "top" },
  actions: { flexDirection: "row", gap: 12, marginTop: 8 },
})

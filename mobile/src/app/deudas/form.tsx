import { useEffect, useState } from "react"
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { Button } from "@/components/ui/Button"
import { DateField } from "@/components/ui/DateField"
import { Input } from "@/components/ui/Input"
import { OptionSelector } from "@/components/ui/OptionSelector"
import { LoadingView } from "@/components/ui/StateView"
import { isValidDateOnly, sanitizeDecimal, toDateOnly } from "@/lib/format"
import { useTheme } from "@/theme/useTheme"
import { isMovementType, MOVEMENT_TYPE_OPTIONS } from "@/modules/deudas/constants"
import {
  createMovementService,
  getMovementByIdService,
  updateMovementService,
} from "@/modules/deudas/services/deuda.service"
import type { DeudaMovementType } from "@/modules/deudas/types/deuda.types"
import { PAYMENT_METHOD_OPTIONS } from "@/modules/tarifas/constants"
import type { PaymentMethod } from "@/modules/tarifas/types/tarifa.types"

interface FormState {
  type: DeudaMovementType
  amount: string
  movementDate: string
  paymentMethod: PaymentMethod | undefined
  description: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

export default function MovementFormScreen() {
  const theme = useTheme()
  const params = useLocalSearchParams<{ id?: string; driverId?: string; type?: string; driverName?: string }>()
  const isEdit = Boolean(params.id)
  const initialType: DeudaMovementType = isMovementType(params.type) ? params.type : "debt"

  const [form, setForm] = useState<FormState>({
    type: initialType,
    amount: "",
    movementDate: toDateOnly(new Date()),
    paymentMethod: initialType === "payment" ? "cash" : undefined,
    description: "",
  })
  const [driverName, setDriverName] = useState(params.driverName ?? "")
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(isEdit)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!params.id) return
    getMovementByIdService(Number(params.id))
      .then(({ data }) => {
        setForm({
          type: data.type,
          amount: String(Number(data.amount)),
          movementDate: data.movementDate.slice(0, 10),
          paymentMethod: data.paymentMethod ?? undefined,
          description: data.description ?? "",
        })
        setDriverName(data.driverName ?? "")
      })
      .catch((err: Error) => {
        Alert.alert("Error", err.message)
        router.back()
      })
      .finally(() => setIsLoading(false))
  }, [params.id])

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const changeType = (type: DeudaMovementType) => {
    setForm((prev) => ({
      ...prev,
      type,
      paymentMethod: type === "payment" ? (prev.paymentMethod ?? "cash") : undefined,
    }))
  }

  const validate = (): FormErrors => {
    const result: FormErrors = {}
    const amount = Number(form.amount)
    if (!form.amount || Number.isNaN(amount) || amount <= 0) result.amount = "Ingresa un monto mayor a 0"
    if (!isValidDateOnly(form.movementDate)) result.movementDate = "Usa el formato AAAA-MM-DD"
    return result
  }

  const handleSubmit = async () => {
    const validation = validate()
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      return
    }
    setIsSaving(true)
    const base = {
      type: form.type,
      amount: Number(form.amount),
      movementDate: form.movementDate,
      paymentMethod: form.type === "payment" ? form.paymentMethod : undefined,
    }
    try {
      if (isEdit) {
        await updateMovementService(Number(params.id), { ...base, description: form.description.trim() })
      } else {
        await createMovementService({
          ...base,
          driverId: Number(params.driverId),
          description: form.description.trim() || undefined,
        })
      }
      router.back()
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "No se pudo guardar el movimiento")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <LoadingView />

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Stack.Screen options={{ title: isEdit ? "Editar movimiento" : "Nuevo movimiento" }} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {driverName !== "" && (
          <Text style={{ color: theme.mutedForeground }}>
            Conductor: <Text style={[styles.strong, { color: theme.foreground }]}>{driverName}</Text>
          </Text>
        )}

        <OptionSelector
          label="Tipo de movimiento"
          options={MOVEMENT_TYPE_OPTIONS}
          value={form.type}
          onChange={(value) => value && changeType(value)}
          allowDeselect={false}
        />

        <Input
          label="Monto ($)"
          placeholder="50000"
          keyboardType="decimal-pad"
          value={form.amount}
          onChangeText={(value) => update("amount", sanitizeDecimal(value))}
          error={errors.amount}
        />

        <DateField
          label="Fecha"
          value={form.movementDate}
          onChange={(value) => update("movementDate", value)}
          error={errors.movementDate}
        />

        {form.type === "payment" && (
          <OptionSelector
            label="Método de pago"
            options={PAYMENT_METHOD_OPTIONS}
            value={form.paymentMethod}
            onChange={(value) => value && update("paymentMethod", value)}
            allowDeselect={false}
          />
        )}

        <Input
          label="Descripción (opcional)"
          placeholder={form.type === "debt" ? "No entregó la tarifa del 15 y el 17" : "Observaciones..."}
          value={form.description}
          onChangeText={(value) => update("description", value)}
          multiline
          style={styles.textArea}
        />

        <View style={styles.actions}>
          <Button title="Cancelar" variant="outline" onPress={() => router.back()} style={styles.flex} />
          <Button
            title={isEdit ? "Guardar" : "Registrar"}
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
  strong: { fontWeight: "600" },
  textArea: { height: 96, paddingTop: 12, textAlignVertical: "top" },
  actions: { flexDirection: "row", gap: 12, marginTop: 8 },
})

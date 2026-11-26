import { useState } from "react"
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native"
import { router, Stack } from "expo-router"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { OptionSelector } from "@/components/ui/OptionSelector"
import { isValidDateOnly, toDateOnly } from "@/lib/format"
import { DRIVER_STATUS } from "@/modules/drivers/constants"
import { createDriverService } from "@/modules/drivers/services/driver.service"
import type { DriverStatus, ICreateDriverPayload } from "@/modules/drivers/types/driver.types"

interface FormState {
  name: string
  phone: string
  email: string
  address: string
  hireDate: string
  photoUrl: string
  status: DriverStatus
}

type FormErrors = Partial<Record<keyof FormState, string>>

const STATUS_OPTIONS = (Object.keys(DRIVER_STATUS) as DriverStatus[]).map((value) => ({
  value,
  label: DRIVER_STATUS[value].label,
}))

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_REGEX = /^https?:\/\/\S+$/i

export default function DriverFormScreen() {
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    address: "",
    hireDate: "",
    photoUrl: "",
    status: "active",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSaving, setIsSaving] = useState(false)

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = (): FormErrors => {
    const result: FormErrors = {}
    if (!form.name.trim()) result.name = "El nombre es obligatorio"
    if (form.email.trim() && !EMAIL_REGEX.test(form.email.trim())) result.email = "Correo no válido"
    if (form.hireDate.trim() && !isValidDateOnly(form.hireDate.trim())) result.hireDate = "Usa el formato AAAA-MM-DD"
    if (form.photoUrl.trim() && !URL_REGEX.test(form.photoUrl.trim())) result.photoUrl = "URL no válida"
    return result
  }

  const handleSubmit = async () => {
    const validation = validate()
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      return
    }
    setIsSaving(true)
    const payload: ICreateDriverPayload = {
      name: form.name.trim(),
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      address: form.address.trim() || undefined,
      hireDate: form.hireDate.trim() || undefined,
      photoUrl: form.photoUrl.trim() || undefined,
      status: form.status,
    }
    try {
      await createDriverService(payload)
      router.back()
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "No se pudo crear el conductor")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Stack.Screen options={{ title: "Nuevo conductor" }} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Input
          label="Nombre completo"
          placeholder="Juan Pérez"
          value={form.name}
          onChangeText={(value) => update("name", value)}
          maxLength={100}
          error={errors.name}
        />

        <Input
          label="Teléfono (opcional)"
          placeholder="+573001234567"
          value={form.phone}
          onChangeText={(value) => update("phone", value)}
          keyboardType="phone-pad"
          maxLength={50}
        />

        <Input
          label="Correo (opcional)"
          placeholder="juan@example.com"
          value={form.email}
          onChangeText={(value) => update("email", value)}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <Input
          label="Dirección (opcional)"
          placeholder="Calle 123 #45-67"
          value={form.address}
          onChangeText={(value) => update("address", value)}
          maxLength={255}
        />

        <View style={styles.dateGroup}>
          <Input
            label="Fecha de contratación (opcional)"
            placeholder="AAAA-MM-DD"
            value={form.hireDate}
            onChangeText={(value) => update("hireDate", value)}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            error={errors.hireDate}
          />
          <OptionSelector
            options={[{ value: toDateOnly(new Date()), label: "Hoy" }]}
            value={form.hireDate}
            onChange={(value) => update("hireDate", value ?? "")}
          />
        </View>

        <OptionSelector
          label="Estado"
          options={STATUS_OPTIONS}
          value={form.status}
          onChange={(value) => value && update("status", value)}
          allowDeselect={false}
        />

        <Input
          label="URL de foto (opcional)"
          placeholder="https://..."
          value={form.photoUrl}
          onChangeText={(value) => update("photoUrl", value)}
          keyboardType="url"
          autoCapitalize="none"
          error={errors.photoUrl}
        />

        <View style={styles.actions}>
          <Button title="Cancelar" variant="outline" onPress={() => router.back()} style={styles.flex} />
          <Button title="Crear conductor" onPress={handleSubmit} loading={isSaving} style={styles.flex} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 16, gap: 20 },
  dateGroup: { gap: 8 },
  actions: { flexDirection: "row", gap: 12, marginTop: 8 },
})

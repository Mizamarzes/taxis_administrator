import { useEffect, useState } from "react"
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native"
import { router, Stack } from "expo-router"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { OptionSelector } from "@/components/ui/OptionSelector"
import { getDriversService } from "@/modules/drivers/services/driver.service"
import type { Driver } from "@/modules/drivers/types/driver.types"
import { VEHICLE_STATUS } from "@/modules/vehicles/constants"
import { createVehicleService } from "@/modules/vehicles/services/vehicle.service"
import {
  RESTRICTION_DAYS,
  type ICreateVehiclePayload,
  type VehicleStatus,
} from "@/modules/vehicles/types/vehicle.types"

interface FormState {
  plate: string
  drivingRestrictionDay: number | undefined
  vehicleStatus: VehicleStatus
  driverId: number | undefined
  photoUrl: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const STATUS_OPTIONS = (Object.keys(VEHICLE_STATUS) as VehicleStatus[]).map((value) => ({
  value,
  label: VEHICLE_STATUS[value].label,
}))

const URL_REGEX = /^https?:\/\/\S+$/i

export default function VehicleFormScreen() {
  const [form, setForm] = useState<FormState>({
    plate: "",
    drivingRestrictionDay: undefined,
    vehicleStatus: "active",
    driverId: undefined,
    photoUrl: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    getDriversService({ page: 1, limit: 100 })
      .then((response) => setDrivers(response.data.items))
      .catch(() => setDrivers([]))
  }, [])

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = (): FormErrors => {
    const result: FormErrors = {}
    if (!form.plate.trim()) result.plate = "La placa es obligatoria"
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
    const payload: ICreateVehiclePayload = {
      plate: form.plate.trim().toUpperCase(),
      drivingRestrictionDay: form.drivingRestrictionDay,
      vehicleStatus: form.vehicleStatus,
      driverId: form.driverId,
      photoUrl: form.photoUrl.trim() || undefined,
    }
    try {
      await createVehicleService(payload)
      router.back()
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "No se pudo crear el vehículo")
    } finally {
      setIsSaving(false)
    }
  }

  const driverOptions = drivers.map((driver) => ({ value: driver.id, label: driver.name }))

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Stack.Screen options={{ title: "Nuevo vehículo" }} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Input
          label="Placa"
          placeholder="ABC123"
          value={form.plate}
          onChangeText={(value) => update("plate", value.toUpperCase())}
          autoCapitalize="characters"
          maxLength={20}
          error={errors.plate}
        />

        <OptionSelector
          label="Pico y placa (opcional)"
          options={RESTRICTION_DAYS}
          value={form.drivingRestrictionDay}
          onChange={(value) => update("drivingRestrictionDay", value)}
        />

        <OptionSelector
          label="Estado"
          options={STATUS_OPTIONS}
          value={form.vehicleStatus}
          onChange={(value) => value && update("vehicleStatus", value)}
          allowDeselect={false}
        />

        <OptionSelector
          label="Conductor asignado (opcional)"
          options={driverOptions}
          value={form.driverId}
          onChange={(value) => update("driverId", value)}
          emptyText="No hay conductores registrados"
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
          <Button title="Crear vehículo" onPress={handleSubmit} loading={isSaving} style={styles.flex} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 16, gap: 20 },
  actions: { flexDirection: "row", gap: 12, marginTop: 8 },
})

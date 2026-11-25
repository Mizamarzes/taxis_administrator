import { useEffect, useState } from "react"
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { Button } from "@/components/ui/Button"
import { DateField } from "@/components/ui/DateField"
import { Input } from "@/components/ui/Input"
import { OptionSelector } from "@/components/ui/OptionSelector"
import { LoadingView } from "@/components/ui/StateView"
import { sanitizeInteger, toOptionalNumber } from "@/lib/format"
import { useTheme } from "@/theme/useTheme"
import { ExpenseItemsEditor } from "@/modules/gastos/components/ExpenseItemsEditor"
import { EXPENSE_CATEGORY_OPTIONS, isExpenseCategory } from "@/modules/gastos/constants"
import {
  buildEmptyForm,
  expenseToForm,
  getFormError,
  toItemsPayload,
  type ExpenseForm,
} from "@/modules/gastos/expense-form"
import {
  createExpenseService,
  getExpenseByIdService,
  updateExpenseService,
} from "@/modules/gastos/services/gasto.service"
import { PAYMENT_METHOD_OPTIONS } from "@/modules/tarifas/constants"

export default function ExpenseFormScreen() {
  const theme = useTheme()
  const params = useLocalSearchParams<{ id?: string; vehicleId?: string; category?: string; plate?: string }>()
  const isEdit = Boolean(params.id)
  const [form, setForm] = useState<ExpenseForm>(() =>
    buildEmptyForm(isExpenseCategory(params.category) ? params.category : "spare_part"),
  )
  const [plate, setPlate] = useState(params.plate ?? "")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(isEdit)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!params.id) return
    getExpenseByIdService(Number(params.id))
      .then(({ data }) => {
        setForm(expenseToForm(data))
        setPlate(data.vehiclePlate ?? "")
      })
      .catch((err: Error) => {
        Alert.alert("Error", err.message)
        router.back()
      })
      .finally(() => setIsLoading(false))
  }, [params.id])

  const update = <K extends keyof ExpenseForm>(key: K, value: ExpenseForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError(null)
  }

  const handleSubmit = async () => {
    const formError = getFormError(form)
    if (formError) {
      setError(formError)
      return
    }
    setIsSaving(true)
    setError(null)
    try {
      if (isEdit) {
        await updateExpenseService(Number(params.id), {
          category: form.category,
          expenseDate: form.expenseDate,
          odometerKm: toOptionalNumber(form.odometerKm) ?? null,
          nextServiceKm: toOptionalNumber(form.nextServiceKm) ?? null,
          nextServiceDate: form.nextServiceDate || null,
          supplier: form.supplier.trim(),
          invoiceNumber: form.invoiceNumber.trim(),
          paymentMethod: form.paymentMethod ?? null,
          description: form.description.trim(),
          items: toItemsPayload(form.items),
        })
      } else {
        await createExpenseService({
          vehicleId: Number(params.vehicleId),
          category: form.category,
          expenseDate: form.expenseDate,
          odometerKm: toOptionalNumber(form.odometerKm),
          nextServiceKm: toOptionalNumber(form.nextServiceKm),
          nextServiceDate: form.nextServiceDate || undefined,
          supplier: form.supplier.trim() || undefined,
          invoiceNumber: form.invoiceNumber.trim() || undefined,
          paymentMethod: form.paymentMethod,
          description: form.description.trim() || undefined,
          items: toItemsPayload(form.items),
        })
      }
      router.back()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el gasto")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <LoadingView />

  const suggestedNextKm = form.odometerKm ? String(Number(form.odometerKm) + 5000) : "90300"

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Stack.Screen options={{ title: isEdit ? "Editar gasto" : "Registrar gasto" }} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {plate !== "" && (
          <Text style={{ color: theme.mutedForeground }}>
            Vehículo: <Text style={[styles.plate, { color: theme.foreground }]}>{plate}</Text>
          </Text>
        )}

        <OptionSelector
          label="Categoría"
          options={EXPENSE_CATEGORY_OPTIONS}
          value={form.category}
          onChange={(value) => value && update("category", value)}
          allowDeselect={false}
        />

        <DateField label="Fecha" value={form.expenseDate} onChange={(value) => update("expenseDate", value)} />

        <View style={styles.row}>
          <View style={styles.flex}>
            <Input
              label="Km actual"
              placeholder="85300"
              keyboardType="number-pad"
              value={form.odometerKm}
              onChangeText={(value) => update("odometerKm", sanitizeInteger(value))}
            />
          </View>
          <View style={styles.flex}>
            <Input
              label="Próximo servicio (km)"
              placeholder={suggestedNextKm}
              keyboardType="number-pad"
              value={form.nextServiceKm}
              onChangeText={(value) => update("nextServiceKm", sanitizeInteger(value))}
            />
          </View>
        </View>

        {form.odometerKm !== "" && form.nextServiceKm === "" && (
          <OptionSelector
            options={[{ value: suggestedNextKm, label: `+5.000 km → ${Number(suggestedNextKm).toLocaleString("es-CO")}` }]}
            value={undefined}
            onChange={(value) => value && update("nextServiceKm", value)}
          />
        )}

        <Input
          label="Próximo servicio fecha (opcional)"
          placeholder="AAAA-MM-DD"
          value={form.nextServiceDate}
          onChangeText={(value) => update("nextServiceDate", value)}
          keyboardType="numbers-and-punctuation"
          maxLength={10}
        />

        <Input
          label="Taller / proveedor (opcional)"
          placeholder="Lubricentro El Pistón"
          value={form.supplier}
          onChangeText={(value) => update("supplier", value)}
          maxLength={150}
        />

        <Input
          label="N° factura (opcional)"
          placeholder="FV-1234"
          value={form.invoiceNumber}
          onChangeText={(value) => update("invoiceNumber", value)}
          maxLength={50}
          autoCapitalize="characters"
        />

        <OptionSelector
          label="Método de pago (opcional)"
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

        <ExpenseItemsEditor items={form.items} onChange={(items) => update("items", items)} />

        {error && (
          <Text style={[styles.error, { color: theme.destructive }]}>{error}</Text>
        )}

        <View style={styles.actions}>
          <Button title="Cancelar" variant="outline" onPress={() => router.back()} style={styles.flex} />
          <Button title={isEdit ? "Guardar" : "Registrar"} onPress={handleSubmit} loading={isSaving} style={styles.flex} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 16, gap: 20, paddingBottom: 40 },
  plate: { fontWeight: "800", letterSpacing: 1 },
  row: { flexDirection: "row", gap: 12 },
  textArea: { height: 80, paddingTop: 12, textAlignVertical: "top" },
  error: { fontSize: 14, fontWeight: "500" },
  actions: { flexDirection: "row", gap: 12 },
})

import { useEffect, useState } from "react"
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { LoadingView } from "@/components/ui/StateView"
import { useTheme } from "@/theme/useTheme"
import { createRoleService, getRoleService, updateRoleService } from "@/modules/roles/services/role.service"

const NAME_REGEX = /^[A-Z][A-Z0-9_]{1,49}$/

export default function RoleFormScreen() {
  const theme = useTheme()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isSystem, setIsSystem] = useState(false)
  const [nameError, setNameError] = useState<string>()
  const [isLoading, setIsLoading] = useState(isEdit)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    getRoleService(Number(id))
      .then(({ data }) => {
        setName(data.name)
        setDescription(data.description ?? "")
        setIsSystem(data.isSystem)
      })
      .catch((err: Error) => {
        Alert.alert("Error", err.message)
        router.back()
      })
      .finally(() => setIsLoading(false))
  }, [id])

  const handleSubmit = async () => {
    const normalized = name.trim().toUpperCase()
    if (!isSystem && !NAME_REGEX.test(normalized)) {
      setNameError("De 2 a 50 caracteres: letras, números o guion bajo")
      return
    }
    setIsSaving(true)
    try {
      const payload = { ...(isSystem ? {} : { name: normalized }), description: description.trim() }
      if (id) {
        await updateRoleService(Number(id), payload)
        router.back()
      } else {
        const { data } = await createRoleService(payload)
        router.replace({ pathname: "/roles/[id]", params: { id: String(data.id) } })
      }
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "No se pudo guardar el rol")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <LoadingView />

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Stack.Screen options={{ title: isEdit ? "Editar rol" : "Nuevo rol" }} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Input
          label="Nombre"
          placeholder="CONTADOR"
          value={name}
          onChangeText={(value) => {
            setName(value.toUpperCase())
            setNameError(undefined)
          }}
          autoCapitalize="characters"
          editable={!isSystem}
          style={isSystem && { opacity: 0.6 }}
          error={nameError}
        />
        {isSystem && (
          <Text style={[styles.note, { color: theme.mutedForeground }]}>
            Los roles del sistema no se pueden renombrar.
          </Text>
        )}

        <Input
          label="Descripción"
          placeholder="Revisa tarifas y gastos"
          value={description}
          onChangeText={setDescription}
          maxLength={255}
        />

        {!isEdit && (
          <Text style={[styles.note, { color: theme.mutedForeground }]}>
            Después de crearlo podrás asignarle permisos.
          </Text>
        )}

        <View style={styles.actions}>
          <Button title="Cancelar" variant="outline" onPress={() => router.back()} style={styles.flex} />
          <Button title={isEdit ? "Guardar" : "Crear rol"} onPress={handleSubmit} loading={isSaving} style={styles.flex} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 16, gap: 20 },
  note: { fontSize: 13 },
  actions: { flexDirection: "row", gap: 12, marginTop: 8 },
})

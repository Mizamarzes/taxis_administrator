import { useEffect, useState } from "react"
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, View } from "react-native"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { OptionSelector } from "@/components/ui/OptionSelector"
import { LoadingView } from "@/components/ui/StateView"
import { useTheme } from "@/theme/useTheme"
import { isRoleName, ROLE_OPTIONS } from "@/modules/users/constants"
import { createUserService, getUserByIdService, updateUserService } from "@/modules/users/services/user.service"
import type { IUpdateUserPayload, RoleName } from "@/modules/users/types/user.types"

interface FormState {
  name: string
  email: string
  password: string
  role: RoleName
  isActive: boolean
}

type FormErrors = Partial<Record<keyof FormState, string>>

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function UserFormScreen() {
  const theme = useTheme()
  const { user: currentUser } = useAuth()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const isSelf = isEdit && Number(id) === currentUser?.id

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    role: "USER",
    isActive: true,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(isEdit)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    getUserByIdService(Number(id))
      .then(({ data }) => {
        const role = isRoleName(data.role?.name) ? data.role.name : "USER"
        setForm({ name: data.name, email: data.email, password: "", role, isActive: data.isActive })
      })
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
    if (form.name.trim().length < 2) result.name = "El nombre debe tener al menos 2 caracteres"
    if (!isEdit && !EMAIL_REGEX.test(form.email.trim())) result.email = "Correo no válido"
    const password = form.password.trim()
    if (!isEdit && password.length < 6) result.password = "La contraseña debe tener al menos 6 caracteres"
    if (isEdit && password.length > 0 && password.length < 6) {
      result.password = "La contraseña debe tener al menos 6 caracteres"
    }
    return result
  }

  const handleSubmit = async () => {
    const validation = validate()
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      return
    }
    setIsSaving(true)
    try {
      if (isEdit) {
        const payload: IUpdateUserPayload = { name: form.name.trim() }
        if (!isSelf) {
          payload.roleName = form.role
          payload.isActive = form.isActive
        }
        if (form.password.trim()) payload.password = form.password.trim()
        await updateUserService(Number(id), payload)
      } else {
        await createUserService({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password.trim(),
          roleName: form.role,
        })
      }
      router.back()
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "No se pudo guardar el usuario")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <LoadingView />

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Stack.Screen options={{ title: isEdit ? "Editar usuario" : "Nuevo usuario" }} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Input
          label="Nombre"
          placeholder="Juan Pérez"
          value={form.name}
          onChangeText={(value) => update("name", value)}
          error={errors.name}
        />

        <Input
          label="Correo electrónico"
          placeholder="juan@example.com"
          value={form.email}
          onChangeText={(value) => update("email", value)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          editable={!isEdit}
          style={isEdit && { opacity: 0.6 }}
          error={errors.email}
        />

        <Input
          label={isEdit ? "Nueva contraseña (opcional)" : "Contraseña"}
          placeholder="••••••••"
          value={form.password}
          onChangeText={(value) => update("password", value)}
          secureTextEntry
          autoComplete="new-password"
          error={errors.password}
        />

        {isSelf ? (
          <Text style={[styles.note, { color: theme.mutedForeground }]}>
            No puedes cambiar tu propio rol ni desactivar tu cuenta.
          </Text>
        ) : (
          <>
            <OptionSelector
              label="Rol"
              options={ROLE_OPTIONS}
              value={form.role}
              onChange={(value) => value && update("role", value)}
              allowDeselect={false}
            />

            {isEdit && (
              <Card style={styles.switchRow}>
                <View style={styles.flex}>
                  <Text style={[styles.switchLabel, { color: theme.foreground }]}>Usuario activo</Text>
                  <Text style={[styles.note, { color: theme.mutedForeground, textAlign: "left" }]}>
                    Un usuario inactivo no puede iniciar sesión.
                  </Text>
                </View>
                <Switch
                  value={form.isActive}
                  onValueChange={(value) => update("isActive", value)}
                  trackColor={{ true: theme.primary, false: theme.border }}
                  thumbColor="#FFFFFF"
                />
              </Card>
            )}
          </>
        )}

        <View style={styles.actions}>
          <Button title="Cancelar" variant="outline" onPress={() => router.back()} style={styles.flex} />
          <Button
            title={isEdit ? "Guardar" : "Crear usuario"}
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
  note: { fontSize: 13, textAlign: "center" },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  switchLabel: { fontSize: 15, fontWeight: "500" },
  actions: { flexDirection: "row", gap: 12, marginTop: 8 },
})

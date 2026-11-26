import { useState } from "react"
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { useTheme } from "@/theme/useTheme"

interface InputProps extends TextInputProps {
  label?: string
  error?: string
}

export function Input({ label, error, style, secureTextEntry, ...props }: InputProps) {
  const theme = useTheme()
  const [isHidden, setIsHidden] = useState(true)
  const isPassword = Boolean(secureTextEntry)

  return (
    <View style={styles.wrapper}>
      {label && <Text style={[styles.label, { color: theme.foreground }]}>{label}</Text>}
      <View>
        <TextInput
          placeholderTextColor={theme.mutedForeground}
          secureTextEntry={isPassword && isHidden}
          style={[
            styles.input,
            {
              color: theme.foreground,
              backgroundColor: theme.card,
              borderColor: error ? theme.destructive : theme.border,
            },
            isPassword && styles.inputWithIcon,
            style,
          ]}
          {...props}
        />
        {isPassword && (
          <Pressable
            onPress={() => setIsHidden((prev) => !prev)}
            hitSlop={8}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel={isHidden ? "Mostrar contraseña" : "Ocultar contraseña"}
          >
            <Ionicons name={isHidden ? "eye-outline" : "eye-off-outline"} size={22} color={theme.mutedForeground} />
          </Pressable>
        )}
      </View>
      {error && <Text style={[styles.error, { color: theme.destructive }]}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  inputWithIcon: {
    paddingRight: 48,
  },
  iconButton: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    fontSize: 12,
  },
})

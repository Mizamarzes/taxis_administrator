import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native"
import { useTheme } from "@/theme/useTheme"

interface InputProps extends TextInputProps {
  label?: string
  error?: string
}

export function Input({ label, error, style, ...props }: InputProps) {
  const theme = useTheme()

  return (
    <View style={styles.wrapper}>
      {label && <Text style={[styles.label, { color: theme.foreground }]}>{label}</Text>}
      <TextInput
        placeholderTextColor={theme.mutedForeground}
        style={[
          styles.input,
          {
            color: theme.foreground,
            backgroundColor: theme.card,
            borderColor: error ? theme.destructive : theme.border,
          },
          style,
        ]}
        {...props}
      />
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
  error: {
    fontSize: 12,
  },
})

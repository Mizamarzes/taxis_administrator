import { StyleSheet, View } from "react-native"
import { subDays, toDateOnly } from "@/lib/format"
import { Input } from "./Input"
import { OptionSelector } from "./OptionSelector"

interface DateFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  showPastShortcuts?: boolean
}

export function DateField({ label, value, onChange, error, showPastShortcuts = true }: DateFieldProps) {
  const today = new Date()
  const shortcuts = [
    { value: toDateOnly(today), label: "Hoy" },
    ...(showPastShortcuts ? [{ value: toDateOnly(subDays(today, 1)), label: "Ayer" }] : []),
  ]

  return (
    <View style={styles.group}>
      <Input
        label={label}
        placeholder="AAAA-MM-DD"
        value={value}
        onChangeText={onChange}
        keyboardType="numbers-and-punctuation"
        maxLength={10}
        error={error}
      />
      <OptionSelector options={shortcuts} value={value} onChange={(selected) => onChange(selected ?? "")} />
    </View>
  )
}

const styles = StyleSheet.create({
  group: { gap: 8 },
})

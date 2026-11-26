import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { useTheme } from "@/theme/useTheme"

export interface Option<T extends string | number> {
  value: T
  label: string
}

interface OptionSelectorProps<T extends string | number> {
  label?: string
  options: Option<T>[]
  value: T | undefined
  onChange: (value: T | undefined) => void
  allowDeselect?: boolean
  emptyText?: string
}

export function OptionSelector<T extends string | number>({
  label,
  options,
  value,
  onChange,
  allowDeselect = true,
  emptyText = "Sin opciones disponibles",
}: OptionSelectorProps<T>) {
  const theme = useTheme()

  return (
    <View style={styles.wrapper}>
      {label && <Text style={[styles.label, { color: theme.foreground }]}>{label}</Text>}
      {options.length === 0 ? (
        <Text style={{ color: theme.mutedForeground }}>{emptyText}</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {options.map((option) => {
            const selected = option.value === value
            return (
              <Pressable
                key={String(option.value)}
                onPress={() => onChange(selected && allowDeselect ? undefined : option.value)}
                style={[
                  styles.chip,
                  {
                    borderColor: selected ? theme.primary : theme.border,
                    backgroundColor: selected ? theme.primary + "22" : theme.card,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: selected ? theme.primary : theme.foreground }]}>
                  {option.label}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>
      )}
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
  row: {
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
  },
})

import { Pressable, StyleSheet, Text, View } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { OptionSelector } from "@/components/ui/OptionSelector"
import { formatCurrency, sanitizeDecimal } from "@/lib/format"
import { useTheme } from "@/theme/useTheme"
import { ITEM_TYPE_OPTIONS } from "../constants"
import { calcTotal, createItem, itemSubtotal, type ExpenseItemForm } from "../expense-form"

interface ExpenseItemsEditorProps {
  items: ExpenseItemForm[]
  onChange: (items: ExpenseItemForm[]) => void
}

export function ExpenseItemsEditor({ items, onChange }: ExpenseItemsEditorProps) {
  const theme = useTheme()

  const setItem = <K extends keyof ExpenseItemForm>(key: string, field: K, value: ExpenseItemForm[K]) =>
    onChange(items.map((item) => (item.key === key ? { ...item, [field]: value } : item)))

  const removeItem = (key: string) => onChange(items.filter((item) => item.key !== key))

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: theme.foreground }]}>Ítems ({items.length})</Text>
      </View>

      {items.map((item, index) => (
        <View key={item.key} style={[styles.item, { borderColor: theme.border, backgroundColor: theme.card }]}>
          <View style={styles.itemHeader}>
            <Text style={[styles.itemNumber, { color: theme.mutedForeground }]}>Ítem {index + 1}</Text>
            <Pressable
              onPress={() => removeItem(item.key)}
              disabled={items.length === 1}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Quitar ítem"
              style={{ opacity: items.length === 1 ? 0.3 : 1 }}
            >
              <Ionicons name="trash-outline" size={20} color={theme.destructive} />
            </Pressable>
          </View>

          <OptionSelector
            options={ITEM_TYPE_OPTIONS}
            value={item.itemType}
            onChange={(value) => value && setItem(item.key, "itemType", value)}
            allowDeselect={false}
          />

          <Input
            placeholder="Descripción (ej. Aceite 20W50)"
            value={item.description}
            onChangeText={(value) => setItem(item.key, "description", value)}
            maxLength={255}
          />
          <Input
            placeholder="Marca (opcional)"
            value={item.brand}
            onChangeText={(value) => setItem(item.key, "brand", value)}
            maxLength={100}
          />

          <View style={styles.row}>
            <View style={styles.qty}>
              <Input
                label="Cant."
                keyboardType="decimal-pad"
                value={item.quantity}
                onChangeText={(value) => setItem(item.key, "quantity", sanitizeDecimal(value))}
              />
            </View>
            <View style={styles.unit}>
              <Input
                label="Unidad"
                placeholder="und"
                value={item.unit}
                onChangeText={(value) => setItem(item.key, "unit", value)}
                maxLength={20}
                autoCapitalize="none"
              />
            </View>
            <View style={styles.price}>
              <Input
                label="Precio unit."
                placeholder="0"
                keyboardType="decimal-pad"
                value={item.unitPrice}
                onChangeText={(value) => setItem(item.key, "unitPrice", sanitizeDecimal(value))}
              />
            </View>
          </View>

          <View style={styles.subtotal}>
            <Text style={{ color: theme.mutedForeground }}>Subtotal</Text>
            <Text style={[styles.subtotalValue, { color: theme.foreground }]}>{formatCurrency(itemSubtotal(item))}</Text>
          </View>
        </View>
      ))}

      <Button title="Agregar ítem" icon="add" variant="outline" onPress={() => onChange([...items, createItem()])} />

      <View style={[styles.total, { borderTopColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.mutedForeground }]}>Total</Text>
        <Text style={[styles.totalValue, { color: theme.foreground }]}>{formatCurrency(calcTotal(items))}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { gap: 12 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: 14, fontWeight: "500" },
  item: { borderWidth: 1, borderRadius: 14, padding: 12, gap: 10 },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemNumber: { fontSize: 13, fontWeight: "600" },
  row: { flexDirection: "row", gap: 8 },
  qty: { flex: 2 },
  unit: { flex: 2 },
  price: { flex: 3 },
  subtotal: { flexDirection: "row", justifyContent: "space-between" },
  subtotalValue: { fontWeight: "600" },
  total: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, paddingTop: 12 },
  totalValue: { fontSize: 20, fontWeight: "700" },
})

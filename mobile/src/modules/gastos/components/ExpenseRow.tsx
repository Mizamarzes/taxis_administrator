import { StyleSheet, Text, View } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { formatCurrency, formatDateOnly, formatKm } from "@/lib/format"
import { useTheme } from "@/theme/useTheme"
import { PAYMENT_METHODS } from "@/modules/tarifas/constants"
import { EXPENSE_CATEGORIES, formatNextService, ITEM_TYPES } from "../constants"
import type { VehicleExpense } from "../types/gasto.types"

interface ExpenseRowProps {
  expense: VehicleExpense
  expanded: boolean
  onToggle: () => void
  onEdit?: () => void
  onDelete?: () => void
}

const summarizeItems = (expense: VehicleExpense) => {
  const [first, ...rest] = expense.items
  if (!first) return "Sin ítems"
  return rest.length > 0 ? `${first.description} + ${rest.length} más` : first.description
}

export function ExpenseRow({ expense, expanded, onToggle, onEdit, onDelete }: ExpenseRowProps) {
  const theme = useTheme()
  const category = EXPENSE_CATEGORIES[expense.category]
  const nextService = formatNextService(expense.nextServiceKm, expense.nextServiceDate)
  const details = [
    expense.supplier ? `Proveedor: ${expense.supplier}` : null,
    expense.odometerKm != null ? `Km: ${formatKm(expense.odometerKm)}` : null,
    expense.invoiceNumber ? `Factura: ${expense.invoiceNumber}` : null,
    expense.paymentMethod ? `Pago: ${PAYMENT_METHODS[expense.paymentMethod].label}` : null,
    expense.driverName ? `Conductor: ${expense.driverName}` : null,
    nextService ? `Próximo servicio: ${nextService}` : null,
  ].filter((value): value is string => Boolean(value))

  return (
    <Card onPress={onToggle}>
      <View style={styles.header}>
        <Badge label={category.label} tone={category.tone} />
        <Text style={[styles.date, { color: theme.mutedForeground }]}>{formatDateOnly(expense.expenseDate)}</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.info}>
          <Text style={[styles.summary, { color: theme.foreground }]} numberOfLines={expanded ? undefined : 1}>
            {summarizeItems(expense)}
          </Text>
          {!expanded && expense.supplier && (
            <Text style={[styles.meta, { color: theme.mutedForeground }]} numberOfLines={1}>
              {expense.supplier}
            </Text>
          )}
        </View>
        <Text style={[styles.total, { color: theme.foreground }]}>{formatCurrency(expense.total)}</Text>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={theme.mutedForeground} />
      </View>

      {expanded && (
        <View style={[styles.expanded, { borderTopColor: theme.border }]}>
          {details.map((detail) => (
            <Text key={detail} style={[styles.meta, { color: theme.mutedForeground }]}>
              {detail}
            </Text>
          ))}
          {expense.description && (
            <Text style={[styles.meta, { color: theme.mutedForeground }]}>{expense.description}</Text>
          )}

          <View style={[styles.items, { borderColor: theme.border, backgroundColor: theme.background }]}>
            {expense.items.map((item, index) => (
              <View
                key={item.id}
                style={[styles.item, index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border }]}
              >
                <View style={styles.info}>
                  <Text style={[styles.itemTitle, { color: theme.foreground }]}>
                    {item.description}
                    {item.brand ? <Text style={{ color: theme.mutedForeground }}> · {item.brand}</Text> : null}
                  </Text>
                  <Text style={[styles.meta, { color: theme.mutedForeground }]}>
                    {ITEM_TYPES[item.itemType]} · {Number(item.quantity)} {item.unit ?? ""} × {formatCurrency(item.unitPrice)}
                  </Text>
                </View>
                <Text style={[styles.itemTotal, { color: theme.foreground }]}>{formatCurrency(item.subtotal)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            {onEdit && (
              <Button title="Editar" icon="create-outline" variant="outline" onPress={onEdit} style={styles.flex} />
            )}
            {onDelete && (
              <Button title="Eliminar" icon="trash-outline" variant="destructive" onPress={onDelete} style={styles.flex} />
            )}
          </View>
        </View>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  date: { fontSize: 13 },
  body: { flexDirection: "row", alignItems: "center", gap: 10 },
  info: { flex: 1, gap: 2 },
  summary: { fontSize: 15, fontWeight: "500" },
  meta: { fontSize: 12 },
  total: { fontSize: 17, fontWeight: "700" },
  expanded: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10, gap: 6 },
  items: { borderWidth: 1, borderRadius: 10, marginTop: 4 },
  item: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8 },
  itemTitle: { fontSize: 14, fontWeight: "500" },
  itemTotal: { fontSize: 14, fontWeight: "600" },
  actions: { flexDirection: "row", gap: 12, marginTop: 6 },
  flex: { flex: 1 },
})

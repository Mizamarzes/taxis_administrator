import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { VehicleExpense } from "../types/gasto.types"
import { updateExpenseService } from "../services/gasto.service"
import {
  ExpenseFormFields,
  expenseToFormValues,
  getFormError,
  toItemsPayload,
  toOptionalNumber,
  type ExpenseFormValues,
} from "./ExpenseFormFields"

interface EditExpenseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense: VehicleExpense | null
  onSuccess?: () => void
}

export function EditExpenseModal({ open, onOpenChange, expense, onSuccess }: EditExpenseModalProps) {
  const [formData, setFormData] = useState<ExpenseFormValues | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (expense) {
      setFormData(expenseToFormValues(expense))
      setError(null)
    }
  }, [expense])

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!expense || !formData) return
    const formError = getFormError(formData)
    if (formError) {
      setError(formError)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      await updateExpenseService(expense.id, {
        category: formData.category,
        expenseDate: formData.expenseDate,
        odometerKm: toOptionalNumber(formData.odometerKm) ?? null,
        nextServiceKm: toOptionalNumber(formData.nextServiceKm) ?? null,
        nextServiceDate: formData.nextServiceDate || null,
        supplier: formData.supplier,
        invoiceNumber: formData.invoiceNumber,
        paymentMethod: formData.paymentMethod ?? null,
        description: formData.description,
        items: toItemsPayload(formData.items),
      })
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!expense || !formData) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar gasto</DialogTitle>
          <DialogDescription>
            Gasto{" "}
            <span className="font-mono font-semibold text-foreground">
              #{String(expense.id).padStart(3, "0")}
            </span>
            . Los totales se recalculan automáticamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <ExpenseFormFields values={formData} onChange={setFormData} />

          {error && <p className="text-sm text-destructive pb-4">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

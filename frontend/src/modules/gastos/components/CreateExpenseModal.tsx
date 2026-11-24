import { useState, useEffect } from "react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { ExpenseCategory } from "../types/gasto.types"
import { createExpenseService } from "../services/gasto.service"
import {
  ExpenseFormFields,
  emptyItem,
  getFormError,
  oilChangeItems,
  toItemsPayload,
  toOptionalNumber,
  type ExpenseFormValues,
} from "./ExpenseFormFields"

interface CreateExpenseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicleId: number
  plate: string
  initialCategory: ExpenseCategory
  onSuccess?: () => void
}

const buildEmptyForm = (category: ExpenseCategory): ExpenseFormValues => ({
  category,
  expenseDate: format(new Date(), "yyyy-MM-dd"),
  odometerKm: "",
  nextServiceKm: "",
  nextServiceDate: "",
  supplier: "",
  invoiceNumber: "",
  paymentMethod: "cash",
  description: "",
  items: category === "oil_change" ? oilChangeItems() : [emptyItem()],
})

export function CreateExpenseModal({
  open,
  onOpenChange,
  vehicleId,
  plate,
  initialCategory,
  onSuccess,
}: CreateExpenseModalProps) {
  const [formData, setFormData] = useState<ExpenseFormValues>(buildEmptyForm(initialCategory))
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setFormData(buildEmptyForm(initialCategory))
      setError(null)
    }
  }, [open, initialCategory])

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    const formError = getFormError(formData)
    if (formError) {
      setError(formError)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      await createExpenseService({
        vehicleId,
        category: formData.category,
        expenseDate: formData.expenseDate,
        odometerKm: toOptionalNumber(formData.odometerKm),
        nextServiceKm: toOptionalNumber(formData.nextServiceKm),
        nextServiceDate: formData.nextServiceDate || undefined,
        supplier: formData.supplier || undefined,
        invoiceNumber: formData.invoiceNumber || undefined,
        paymentMethod: formData.paymentMethod,
        description: formData.description || undefined,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar gasto</DialogTitle>
          <DialogDescription>
            Gasto para el vehículo{" "}
            <span className="font-mono font-semibold tracking-wider text-foreground">{plate}</span>.
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
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

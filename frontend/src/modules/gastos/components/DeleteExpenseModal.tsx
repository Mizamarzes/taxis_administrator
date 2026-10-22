import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatDateOnly } from "@/lib/utils"
import type { VehicleExpense } from "../types/gasto.types"
import { deleteExpenseService } from "../services/gasto.service"
import { expenseCategoryConfig, formatCurrency } from "./expense-config"

interface DeleteExpenseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense: VehicleExpense | null
  onSuccess?: () => void
}

export function DeleteExpenseModal({
  open,
  onOpenChange,
  expense,
  onSuccess,
}: DeleteExpenseModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!expense) return
    setIsLoading(true)
    setError(null)
    try {
      await deleteExpenseService(expense.id)
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!expense) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Eliminar gasto</DialogTitle>
          <DialogDescription>Los totales del vehículo se recalcularán.</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Estás eliminando{" "}
            <span className="font-semibold text-foreground">
              {expenseCategoryConfig[expense.category].label.toLowerCase()}
            </span>{" "}
            por{" "}
            <span className="font-semibold text-foreground">{formatCurrency(expense.total)}</span>{" "}
            del{" "}
            <span className="font-semibold text-foreground">
              {formatDateOnly(expense.expenseDate, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            .
          </p>
          {error && <p className="text-sm text-destructive pt-3">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

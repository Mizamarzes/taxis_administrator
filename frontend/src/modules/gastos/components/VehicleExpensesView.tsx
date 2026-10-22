import { Fragment, useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeftIcon,
  CarFrontIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DropletIcon,
  MoreVertical,
  Pencil,
  PlusIcon,
  ReceiptTextIcon,
  Trash2,
} from "lucide-react"
import { cn, formatDateOnly } from "@/lib/utils"
import type {
  ExpenseCategory,
  VehicleExpense,
  VehicleExpenseSummary,
  VehicleExpensesStatement,
} from "../types/gasto.types"
import { getVehicleExpensesService } from "../services/gasto.service"
import { CreateExpenseModal } from "./CreateExpenseModal"
import { EditExpenseModal } from "./EditExpenseModal"
import { DeleteExpenseModal } from "./DeleteExpenseModal"
import {
  expenseCategoryConfig,
  formatCurrency,
  formatKm,
  getOilStatus,
  itemTypeLabels,
  oilStatusConfig,
  paymentMethodLabels,
} from "./expense-config"

interface VehicleExpensesViewProps {
  vehicle: VehicleExpenseSummary
  onBack: () => void
  onChange: () => void
}

const summarizeItems = (expense: VehicleExpense) => {
  const [first, ...rest] = expense.items
  if (!first) return "—"
  return rest.length > 0 ? `${first.description} + ${rest.length} más` : first.description
}

export const VehicleExpensesView = ({ vehicle, onBack, onChange }: VehicleExpensesViewProps) => {
  const [statement, setStatement] = useState<VehicleExpensesStatement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [createCategory, setCreateCategory] = useState<ExpenseCategory>("spare_part")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<VehicleExpense | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const fetchStatement = useCallback(async () => {
    try {
      const response = await getVehicleExpensesService(vehicle.vehicleId)
      setStatement(response.data)
    } catch {
      setStatement(null)
    } finally {
      setIsLoading(false)
    }
  }, [vehicle.vehicleId])

  useEffect(() => {
    setIsLoading(true)
    fetchStatement()
  }, [fetchStatement])

  const handleSuccess = () => {
    fetchStatement()
    onChange()
  }

  const openCreate = (category: ExpenseCategory) => {
    setCreateCategory(category)
    setIsCreateOpen(true)
  }

  const summary = statement?.summary ?? vehicle
  const expenses = statement?.expenses ?? []
  const byCategory = statement?.byCategory ?? []
  const oil = oilStatusConfig[getOilStatus(summary)]

  const summaryItems = [
    { label: "Gastado este mes", value: formatCurrency(summary.monthSpent) },
    { label: "Total histórico", value: formatCurrency(summary.totalSpent) },
    { label: "Último km registrado", value: formatKm(summary.lastOdometerKm) },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Volver">
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div className="size-11 rounded-[10px] bg-muted flex items-center justify-center shrink-0 overflow-hidden">
            {vehicle.photoUrl ? (
              <img src={vehicle.photoUrl} alt={vehicle.plate} className="size-full object-cover" />
            ) : (
              <CarFrontIcon className="size-5 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="font-mono font-semibold text-lg leading-tight tracking-wider">
              {vehicle.plate}
            </h2>
            <p className="text-sm text-muted-foreground truncate">
              Gastos e insumos · {vehicle.driverName ?? "Sin conductor"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => openCreate("spare_part")}>
            <PlusIcon className="size-4 mr-2" />
            Registrar gasto
          </Button>
          <Button variant="outline" onClick={() => openCreate("oil_change")}>
            <DropletIcon className="size-4 mr-2" />
            Cambio de aceite
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="col-span-2 lg:col-span-1 py-0 overflow-hidden gap-0">
          <div className={cn("h-1.5 w-full", oil.bar)} />
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{oil.label}</p>
            <p className={cn("text-lg font-bold tabular-nums", oil.text)}>
              {summary.nextOilChangeKm != null || summary.nextOilChangeDate
                ? [
                    summary.nextOilChangeKm != null && formatKm(summary.nextOilChangeKm),
                    summary.nextOilChangeDate && formatDateOnly(summary.nextOilChangeDate),
                  ]
                    .filter(Boolean)
                    .join(" · ")
                : "—"}
            </p>
          </CardContent>
        </Card>
        {summaryItems.map((item) => (
          <Card key={item.label} className="py-0">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-lg font-semibold tabular-nums">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {byCategory.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {byCategory.map((item) => {
            const config = expenseCategoryConfig[item.category]
            return (
              <Badge
                key={item.category}
                variant="outline"
                className={cn("text-xs font-medium gap-1.5 py-1", config.className)}
              >
                {config.label}
                <span className="tabular-nums font-semibold">{formatCurrency(item.total)}</span>
                <span className="opacity-70">({item.count})</span>
              </Badge>
            )
          })}
        </div>
      )}

      <Card className="py-0">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <ReceiptTextIcon className="size-8 opacity-30" />
              <p className="text-sm">Este vehículo no tiene gastos registrados</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8 pl-4" />
                  <TableHead>Fecha</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Detalle</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead className="text-right">Km</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => {
                  const config = expenseCategoryConfig[expense.category]
                  const isExpanded = expandedId === expense.id
                  return (
                    <Fragment key={expense.id}>
                      <TableRow
                        className="cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : expense.id)}
                      >
                        <TableCell className="pl-4 text-muted-foreground">
                          {isExpanded ? (
                            <ChevronDownIcon className="size-4" />
                          ) : (
                            <ChevronRightIcon className="size-4" />
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatDateOnly(expense.expenseDate)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs font-medium ${config.className}`}>
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm truncate max-w-56 block">
                            {summarizeItems(expense)}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {expense.supplier || "—"}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground tabular-nums whitespace-nowrap">
                          {formatKm(expense.odometerKm)}
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {formatCurrency(expense.total)}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedExpense(expense)
                                  setIsEditOpen(true)
                                }}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedExpense(expense)
                                  setIsDeleteOpen(true)
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>

                      {isExpanded && (
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                          <TableCell />
                          <TableCell colSpan={7} className="py-3">
                            <div className="space-y-3">
                              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                                {expense.invoiceNumber && <span>Factura: {expense.invoiceNumber}</span>}
                                {expense.paymentMethod && (
                                  <span>Pago: {paymentMethodLabels[expense.paymentMethod]}</span>
                                )}
                                {expense.driverName && <span>Conductor: {expense.driverName}</span>}
                                {(expense.nextServiceKm != null || expense.nextServiceDate) && (
                                  <span>
                                    Próximo servicio:{" "}
                                    {[
                                      expense.nextServiceKm != null && formatKm(expense.nextServiceKm),
                                      expense.nextServiceDate && formatDateOnly(expense.nextServiceDate),
                                    ]
                                      .filter(Boolean)
                                      .join(" · ")}
                                  </span>
                                )}
                                {expense.description && <span>{expense.description}</span>}
                              </div>

                              <div className="divide-y rounded-md border bg-background">
                                {expense.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                                  >
                                    <div className="min-w-0">
                                      <span className="font-medium">{item.description}</span>
                                      {item.brand && (
                                        <span className="text-muted-foreground"> · {item.brand}</span>
                                      )}
                                      <span className="ml-2 text-xs text-muted-foreground">
                                        {itemTypeLabels[item.itemType]}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-4 tabular-nums">
                                      <span className="text-muted-foreground">
                                        {item.quantity} {item.unit ?? ""} × {formatCurrency(item.unitPrice)}
                                      </span>
                                      <span className="font-semibold">{formatCurrency(item.subtotal)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateExpenseModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        vehicleId={vehicle.vehicleId}
        plate={vehicle.plate}
        initialCategory={createCategory}
        onSuccess={handleSuccess}
      />

      <EditExpenseModal
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open)
          if (!open) setSelectedExpense(null)
        }}
        expense={selectedExpense}
        onSuccess={handleSuccess}
      />

      <DeleteExpenseModal
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open)
          if (!open) setSelectedExpense(null)
        }}
        expense={selectedExpense}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

import { useState, useEffect, useCallback, useMemo } from "react"
import Avatar from "react-avatar"
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
  HandCoinsIcon,
  HeartHandshakeIcon,
  MoreVertical,
  Pencil,
  PlusIcon,
  ReceiptTextIcon,
  Trash2,
} from "lucide-react"
import { cn, formatDateOnly } from "@/lib/utils"
import type {
  DeudaMovement,
  DeudaMovementType,
  DriverBalance,
  DriverStatement,
} from "../types/deuda.types"
import { getStatementService } from "../services/deuda.service"
import { CreateMovementModal } from "./CreateMovementModal"
import { EditMovementModal } from "./EditMovementModal"
import { DeleteMovementModal } from "./DeleteMovementModal"
import {
  balanceTone,
  formatCurrency,
  movementTypeConfig,
  paymentMethodLabels,
} from "./movement-config"

interface DriverStatementViewProps {
  driver: DriverBalance
  onBack: () => void
  onChange: () => void
}

export const DriverStatementView = ({ driver, onBack, onChange }: DriverStatementViewProps) => {
  const [statement, setStatement] = useState<DriverStatement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [createType, setCreateType] = useState<DeudaMovementType>("debt")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedMovement, setSelectedMovement] = useState<DeudaMovement | null>(null)

  const fetchStatement = useCallback(async () => {
    try {
      const response = await getStatementService(driver.driverId)
      setStatement(response.data)
    } catch {
      setStatement(null)
    } finally {
      setIsLoading(false)
    }
  }, [driver.driverId])

  useEffect(() => {
    setIsLoading(true)
    fetchStatement()
  }, [fetchStatement])

  const handleSuccess = () => {
    fetchStatement()
    onChange()
  }

  const openCreate = (type: DeudaMovementType) => {
    setCreateType(type)
    setIsCreateOpen(true)
  }

  const movements = useMemo(
    () => [...(statement?.movements ?? [])].reverse(),
    [statement]
  )

  const summary = statement?.summary ?? driver
  const tone = balanceTone(summary.balance)

  const summaryItems = [
    { label: "Total deuda", value: summary.totalDebt, className: movementTypeConfig.debt.amountClassName },
    { label: "Abonado", value: summary.totalPaid, className: movementTypeConfig.payment.amountClassName },
    { label: "Condonado", value: summary.totalForgiven, className: movementTypeConfig.forgiveness.amountClassName },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Volver">
            <ArrowLeftIcon className="size-4" />
          </Button>
          <Avatar
            name={driver.driverName}
            src={driver.photoUrl ?? undefined}
            size="44px"
            round="10px"
          />
          <div className="min-w-0">
            <h2 className="font-semibold text-lg leading-tight truncate">{driver.driverName}</h2>
            <p className="text-sm text-muted-foreground">Estado de cuenta</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => openCreate("debt")}>
            <PlusIcon className="size-4 mr-2" />
            Agregar deuda
          </Button>
          <Button variant="outline" onClick={() => openCreate("payment")}>
            <HandCoinsIcon className="size-4 mr-2" />
            Registrar abono
          </Button>
          <Button variant="ghost" onClick={() => openCreate("forgiveness")}>
            <HeartHandshakeIcon className="size-4 mr-2" />
            Condonar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="col-span-2 lg:col-span-1 py-0 overflow-hidden gap-0">
          <div className={cn("h-1.5 w-full", tone.bar)} />
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Saldo · {tone.label}</p>
            <p className={cn("text-2xl font-bold tabular-nums", tone.text)}>
              {formatCurrency(summary.balance)}
            </p>
          </CardContent>
        </Card>
        {summaryItems.map((item) => (
          <Card key={item.label} className="py-0">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className={cn("text-lg font-semibold tabular-nums", item.className)}>
                {formatCurrency(item.value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="py-0">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : movements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <ReceiptTextIcon className="size-8 opacity-30" />
              <p className="text-sm">Este conductor no tiene movimientos</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Vehículo</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => {
                  const config = movementTypeConfig[movement.type]
                  return (
                    <TableRow key={movement.id}>
                      <TableCell className="pl-4 whitespace-nowrap">
                        {formatDateOnly(movement.movementDate)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs font-medium ${config.className}`}>
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground truncate max-w-56 block">
                          {movement.description || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {movement.paymentMethod ? paymentMethodLabels[movement.paymentMethod] : "—"}
                      </TableCell>
                      <TableCell>
                        {movement.vehiclePlate ? (
                          <span className="font-mono font-semibold tracking-wider text-sm">
                            {movement.vehiclePlate}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell
                        className={cn("text-right font-semibold tabular-nums", config.amountClassName)}
                      >
                        {config.sign}
                        {formatCurrency(movement.amount)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium">
                        {movement.runningBalance < 0 && "-"}
                        {formatCurrency(movement.runningBalance)}
                      </TableCell>
                      <TableCell>
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
                                setSelectedMovement(movement)
                                setIsEditOpen(true)
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedMovement(movement)
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
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateMovementModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        driverId={driver.driverId}
        driverName={driver.driverName}
        initialType={createType}
        onSuccess={handleSuccess}
      />

      <EditMovementModal
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open)
          if (!open) setSelectedMovement(null)
        }}
        movement={selectedMovement}
        onSuccess={handleSuccess}
      />

      <DeleteMovementModal
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open)
          if (!open) setSelectedMovement(null)
        }}
        movement={selectedMovement}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

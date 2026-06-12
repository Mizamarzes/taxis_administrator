import Avatar from "react-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { PencilIcon, TrashIcon, PhoneIcon, MailIcon, EyeIcon } from "lucide-react"
import type { Driver, DriverStatus } from "../types/driver.types"

const statusConfig: Record<DriverStatus, { label: string; className: string; dot: string }> = {
  active: {
    label: "Activo",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  inactive: {
    label: "Inactivo",
    className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    dot: "bg-zinc-400",
  },
  suspended: {
    label: "Suspendido",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    dot: "bg-red-500",
  },
}

interface DriverCardProps {
  driver: Driver
  onView: (driver: Driver) => void
  onEdit: (driver: Driver) => void
  onDelete: (driver: Driver) => void
}

export const DriverCard = ({ driver, onView, onEdit, onDelete }: DriverCardProps) => {
  const status = statusConfig[driver.status]

  return (
    <Card className="flex flex-col gap-0 overflow-hidden py-0">
      <div className="h-2 bg-primary w-full" />

      <CardContent className="flex flex-col items-center gap-3 pt-6 pb-3 px-5">
        <div className="relative">
          <Avatar
            name={driver.name}
            src={driver.photoUrl ?? undefined}
            size="72px"
            round="12px"
          />
          <span className={`absolute -bottom-1 -right-1 size-3.5 rounded-full ring-2 ring-card ${status.dot}`} />
        </div>

        <div className="text-center">
          <h3 className="font-semibold text-base leading-tight">{driver.name}</h3>
          <Badge variant="outline" className={`mt-1 text-xs font-medium ${status.className}`}>
            {status.label}
          </Badge>
        </div>

        <div className="w-full space-y-1.5 text-sm">
          {driver.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <PhoneIcon className="size-3.5 shrink-0" />
              <span className="truncate">{driver.phone}</span>
            </div>
          )}
          {driver.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MailIcon className="size-3.5 shrink-0" />
              <span className="truncate">{driver.email}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t px-5 py-3 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onView(driver)}
        >
          <EyeIcon className="size-3.5 mr-1.5" />
          Ver
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(driver)}
        >
          <PencilIcon className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(driver)}
        >
          <TrashIcon className="size-3.5" />
        </Button>
      </CardFooter>
    </Card>
  )
}
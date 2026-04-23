import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { TriangleAlertIcon } from "lucide-react"
import type { User } from "../types/user.types"

interface DeleteUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
}

export function DeleteUserModal({
  open,
  onOpenChange,
  user,
}: DeleteUserModalProps) {
  const handleDelete = () => {
    console.log("Delete user:", user?.id)
    // Aquí harías la llamada a tu API para eliminar el usuario
    onOpenChange(false)
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TriangleAlertIcon className="h-5 w-5 text-destructive" />
            Eliminar usuario
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <p className="text-sm text-muted-foreground">
            Estás a punto de eliminar al usuario:{" "}
            <span className="font-semibold text-foreground">{user.name}</span>{" "}(
            {user.email})
          </p>
          <p className="mt-2 text-sm text-destructive">Esta acción no se puede deshacer.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Eliminar usuario
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

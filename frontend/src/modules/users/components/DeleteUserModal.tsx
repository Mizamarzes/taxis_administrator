import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this user? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            You are about to delete the user:{" "}
            <span className="font-semibold text-foreground">{user.name}</span> (
            {user.email})
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

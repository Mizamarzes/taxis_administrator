import { useState, useMemo } from "react"
import { DataTable } from "./components/DataTable"
import { getColumns } from "./components/columns"
import { CreateUserModal } from "./components/CreateUserModal"
import { EditUserModal } from "./components/EditUserModal"
import { DeleteUserModal } from "./components/DeleteUserModal"
import type { User } from "./types/user.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

// Datos de ejemplo - reemplaza esto con una llamada a tu API
const mockUsers: User[] = [
  {
    id: "1",
    name: "Paco",
    email: "paco@example.com",
    role: "Adm",
    status: "active",
    lastLogin: "2025-12-01",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Cristina",
    email: "cristina@example.com",
    role: "Cond",
    status: "active",
    lastLogin: "2025-12-01",
    createdAt: "2024-02-20",
  },
  {
    id: "3",
    name: "Paco",
    email: "paco2@example.com",
    role: "Adm",
    status: "inactive",
    lastLogin: "2025-12-01",
    createdAt: "2024-03-10",
  },
]

const Users = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const handleDelete = (user: User) => {
    setSelectedUser(user)
    setIsDeleteModalOpen(true)
  }

  const columns = useMemo(
    () => getColumns({ onEdit: handleEdit, onDelete: handleDelete }),
    []
  )

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>add</Button>
      </div>

      <DataTable columns={columns} data={mockUsers} />

      <CreateUserModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      <EditUserModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        user={selectedUser}
      />

      <DeleteUserModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        user={selectedUser}
      />
    </div>
  )
}

export default Users;

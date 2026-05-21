import { useState, useMemo, useEffect, useCallback } from "react"
import { DataTable } from "./components/DataTable"
import { getColumns } from "./components/columns"
import { CreateUserModal } from "./components/CreateUserModal"
import { EditUserModal } from "./components/EditUserModal"
import { DeleteUserModal } from "./components/DeleteUserModal"
import type { User } from "./types/user.types"
import { getUsersService } from "./services/user.service"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"

const LIMIT = 20

const Users = () => {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const fetchUsers = useCallback(async () => {
    try {
      const response = await getUsersService({ page, limit: LIMIT })
      setUsers(response.data.items)
      setTotalPages(response.data.totalPages || 1)
    } catch {
    }
  }, [page])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <div className="w-full py-4">
      <DataTable
        columns={columns}
        data={users}
        filterPlaceholder="Buscar por nombre o email..."
        searchValue={search}
        onSearchChange={setSearch}
        pageCount={totalPages}
        currentPage={page}
        onPageChange={setPage}
        toolbarRight={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <PlusIcon className="size-4 mr-2" />
            Agregar usuario
          </Button>
        }
      />

      <CreateUserModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={fetchUsers}
      />

      <EditUserModal
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open)
          if (!open) setSelectedUser(null)
        }}
        user={selectedUser}
        onSuccess={fetchUsers}
      />

      <DeleteUserModal
        open={isDeleteModalOpen}
        onOpenChange={(open) => {
          setIsDeleteModalOpen(open)
          if (!open) setSelectedUser(null)
        }}
        user={selectedUser}
        onSuccess={fetchUsers}
      />
    </div>
  )
}

export default Users
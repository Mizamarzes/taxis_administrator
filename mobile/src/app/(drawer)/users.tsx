import { useCallback } from "react"
import { router } from "expo-router"
import { RequirePermission } from "@/components/RequirePermission"
import { PaginatedScreen } from "@/components/PaginatedScreen"
import { useAuth } from "@/contexts/AuthContext"
import { UserCard } from "@/modules/users/components/UserCard"
import { getUsersService } from "@/modules/users/services/user.service"
import type { User } from "@/modules/users/types/user.types"

export default function UsersScreen() {
  const { user: currentUser, can } = useAuth()
  const fetcher = useCallback((page: number) => getUsersService({ page, limit: 15 }), [])

  return (
    <RequirePermission permission="users.read">
      <PaginatedScreen<User>
        fetcher={fetcher}
        keyExtractor={(item) => String(item.id)}
        emptyMessage="No hay usuarios registrados."
        onCreate={can("users.create") ? () => router.push("/users/form") : undefined}
        renderItem={(item) => (
          <UserCard
            user={item}
            isCurrent={item.id === currentUser?.id}
            onPress={() => router.push({ pathname: "/users/[id]", params: { id: String(item.id) } })}
          />
        )}
      />
    </RequirePermission>
  )
}

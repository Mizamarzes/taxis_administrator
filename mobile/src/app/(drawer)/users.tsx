import { useCallback } from "react"
import { router } from "expo-router"
import { AdminOnly } from "@/components/AdminOnly"
import { PaginatedScreen } from "@/components/PaginatedScreen"
import { useAuth } from "@/contexts/AuthContext"
import { UserCard } from "@/modules/users/components/UserCard"
import { getUsersService } from "@/modules/users/services/user.service"
import type { User } from "@/modules/users/types/user.types"

export default function UsersScreen() {
  const { user: currentUser } = useAuth()
  const fetcher = useCallback((page: number) => getUsersService({ page, limit: 15 }), [])

  return (
    <AdminOnly>
      <PaginatedScreen<User>
        fetcher={fetcher}
        keyExtractor={(item) => String(item.id)}
        emptyMessage="No hay usuarios registrados."
        onCreate={() => router.push("/users/form")}
        renderItem={(item) => (
          <UserCard
            user={item}
            isCurrent={item.id === currentUser?.id}
            onPress={() => router.push({ pathname: "/users/[id]", params: { id: String(item.id) } })}
          />
        )}
      />
    </AdminOnly>
  )
}

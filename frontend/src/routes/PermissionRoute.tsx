import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { APP_SIDEBAR } from "@/constants"
import type { PermissionAction } from "@/lib/permissions"

export const firstAllowedPath = (can: (permission: PermissionAction) => boolean) =>
  APP_SIDEBAR.primaryNav.find((item) => can(item.permission))?.url ?? "/profile"

export const PermissionRoute = ({ permission }: { permission: PermissionAction }) => {
  const { user, can } = useAuth()

  if (!user) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    )
  }

  if (can(permission)) {
    return <Outlet />
  }

  return <Navigate to={firstAllowedPath(can)} replace />
}

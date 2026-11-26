import type { ReactNode } from "react"
import { useAuth } from "@/contexts/AuthContext"
import type { PermissionAction } from "@/lib/permissions"
import { EmptyView } from "./ui/StateView"

export function RequirePermission({
  permission,
  children,
}: {
  permission: PermissionAction
  children: ReactNode
}) {
  const { can } = useAuth()
  if (!can(permission)) {
    return <EmptyView icon="lock-closed-outline" message="Tu rol no tiene permiso para ver esta sección." />
  }
  return <>{children}</>
}

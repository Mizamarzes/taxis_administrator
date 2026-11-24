import type { ReactNode } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { EmptyView } from "./ui/StateView"

export function AdminOnly({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth()
  if (!isAdmin) {
    return <EmptyView icon="lock-closed-outline" message="Tu cuenta no tiene permisos de administrador para ver esta sección." />
  }
  return <>{children}</>
}

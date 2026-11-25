import { useCallback, useEffect, useMemo, useState } from "react"
import { LockIcon, PencilIcon, PlusIcon, ShieldCheckIcon, Trash2Icon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import { DeleteRoleModal } from "./components/DeleteRoleModal"
import { PermissionMatrix } from "./components/PermissionMatrix"
import { RoleFormModal } from "./components/RoleFormModal"
import {
  getPermissionCatalogService,
  getRoleService,
  getRolesService,
  updateRolePermissionsService,
} from "./services/role.service"
import type { PermissionGroup, Role, RoleDetail } from "./types/role.types"

const sameSet = (a: Set<string>, b: Set<string>) =>
  a.size === b.size && [...a].every((value) => b.has(value))

const Roles = () => {
  const { can, refreshProfile } = useAuth()
  const [roles, setRoles] = useState<Role[]>([])
  const [catalog, setCatalog] = useState<PermissionGroup[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detail, setDetail] = useState<RoleDetail | null>(null)
  const [draft, setDraft] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<RoleDetail | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const canEditRoles = can("roles.update")
  const original = useMemo(() => new Set(detail?.permissions ?? []), [detail])
  const isDirty = !sameSet(original, draft)
  const isLocked = !detail || detail.isSuperAdmin || !canEditRoles

  const fetchRoles = useCallback(async () => {
    try {
      const response = await getRolesService()
      setRoles(response.data)
      setSelectedId((current) => current ?? response.data[0]?.id ?? null)
    } catch (err) {
      setError((err as Error).message)
    }
  }, [])

  useEffect(() => {
    fetchRoles()
    getPermissionCatalogService()
      .then((response) => setCatalog(response.data))
      .catch((err: Error) => setError(err.message))
  }, [fetchRoles])

  useEffect(() => {
    if (selectedId === null) {
      setDetail(null)
      return
    }
    getRoleService(selectedId)
      .then((response) => {
        setDetail(response.data)
        setDraft(new Set(response.data.permissions))
      })
      .catch((err: Error) => setError(err.message))
  }, [selectedId])

  const selectRole = (id: number) => {
    if (id === selectedId) return
    if (isDirty && !window.confirm("Tienes cambios sin guardar. ¿Descartarlos?")) return
    setNotice(null)
    setError(null)
    setSelectedId(id)
  }

  const toggle = (action: string, checked: boolean) => {
    setDraft((prev) => {
      const next = new Set(prev)
      if (checked) next.add(action)
      else next.delete(action)
      return next
    })
  }

  const toggleGroup = (group: PermissionGroup, checked: boolean) => {
    setDraft((prev) => {
      const next = new Set(prev)
      for (const permission of group.permissions) {
        if (checked) next.add(permission.action)
        else next.delete(permission.action)
      }
      return next
    })
  }

  const save = async () => {
    if (!detail) return
    setIsSaving(true)
    setError(null)
    setNotice(null)
    try {
      const response = await updateRolePermissionsService(detail.id, [...draft])
      setDetail(response.data)
      setDraft(new Set(response.data.permissions))
      setNotice("Permisos guardados. Pueden tardar hasta un minuto en aplicarse.")
      await fetchRoles()
      await refreshProfile()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaved = async (role: RoleDetail) => {
    await fetchRoles()
    setSelectedId(role.id)
    setDetail(role)
    setDraft(new Set(role.permissions))
  }

  const handleDeleted = async () => {
    setSelectedId(null)
    setDetail(null)
    await fetchRoles()
  }

  return (
    <div className="w-full py-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Roles y permisos</h1>
          <p className="text-sm text-muted-foreground">
            Define qué puede hacer cada rol en el sistema.
          </p>
        </div>
        {can("roles.create") && (
          <Button
            onClick={() => {
              setEditingRole(null)
              setIsFormOpen(true)
            }}
          >
            <PlusIcon className="size-4 mr-2" />
            Nuevo rol
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <div className="space-y-2">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => selectRole(role.id)}
              className={cn(
                "w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent",
                role.id === selectedId && "border-primary bg-primary/5"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{role.name}</span>
                {role.isSystem && <Badge variant="secondary">Sistema</Badge>}
              </div>
              {role.description && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {role.description}
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                {role.userCount} usuario(s) ·{" "}
                {role.isSuperAdmin ? "todos los permisos" : `${role.permissionCount} permiso(s)`}
              </p>
            </button>
          ))}
        </div>

        <Card>
          {detail ? (
            <>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheckIcon className="size-5" />
                    {detail.name}
                  </CardTitle>
                  <CardDescription>
                    {detail.description || "Sin descripción"} · {detail.userCount} usuario(s)
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {canEditRoles && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingRole(detail)
                        setIsFormOpen(true)
                      }}
                    >
                      <PencilIcon className="size-3.5 mr-1.5" />
                      Editar
                    </Button>
                  )}
                  {can("roles.delete") && !detail.isSystem && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setIsDeleteOpen(true)}
                    >
                      <Trash2Icon className="size-3.5 mr-1.5" />
                      Eliminar
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {detail.isSuperAdmin && (
                  <Alert>
                    <LockIcon className="size-4" />
                    <AlertDescription>
                      SUPERADMIN siempre tiene todos los permisos y no se puede editar.
                    </AlertDescription>
                  </Alert>
                )}
                {notice && (
                  <Alert>
                    <AlertDescription>{notice}</AlertDescription>
                  </Alert>
                )}

                <PermissionMatrix
                  catalog={catalog}
                  selected={draft}
                  disabled={isLocked}
                  onToggle={toggle}
                  onToggleGroup={toggleGroup}
                />

                {!isLocked && (
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {isDirty && (
                      <span className="mr-auto text-sm text-muted-foreground">
                        Tienes cambios sin guardar
                      </span>
                    )}
                    <Button
                      variant="outline"
                      disabled={!isDirty || isSaving}
                      onClick={() => setDraft(new Set(original))}
                    >
                      Descartar
                    </Button>
                    <Button disabled={!isDirty || isSaving} onClick={save}>
                      {isSaving ? "Guardando..." : "Guardar cambios"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="py-16 text-center text-muted-foreground">
              Selecciona un rol para ver sus permisos.
            </CardContent>
          )}
        </Card>
      </div>

      <RoleFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        role={editingRole}
        onSuccess={handleSaved}
      />

      <DeleteRoleModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        role={detail}
        onSuccess={handleDeleted}
      />
    </div>
  )
}

export default Roles

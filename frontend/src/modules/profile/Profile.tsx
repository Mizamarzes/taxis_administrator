import { useEffect, useState } from "react"
import Avatar from "react-avatar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  UserIcon,
  MailIcon,
  ShieldIcon,
  CalendarIcon,
  ClockIcon,
  Loader2Icon,
} from "lucide-react"
import { getProfileService } from "./services/profile.service"
import type { Profile as ProfileType } from "./types/profile.types"

const formatDate = (value: string | null) => {
  if (!value) return "Sin registro"
  return new Date(value).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

const formatRoles = (roles: ProfileType["roles"]) => {
  if (!roles || roles.length === 0) return "Sin rol"
  return roles.map((role) => role.name).join(", ")
}

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) => (
  <div className="flex items-center gap-3 py-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  </div>
)

const Profile = () => {
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getProfileService()
      .then((response) => setProfile(response.data))
      .catch(() => setError("No se pudo cargar la información del perfil."))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="flex w-full max-w-4xl items-center justify-center py-20 text-muted-foreground">
        <Loader2Icon className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="w-full max-w-4xl">
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {error ?? "No hay información de perfil disponible."}
          </CardContent>
        </Card>
      </div>
    )
  }

  const roleLabel = formatRoles(profile.roles)

  return (
    <div className="w-full max-w-4xl space-y-6">
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="relative shrink-0">
              <Avatar name={profile.name} size="80px" round="12px" />
              <span
                className={`absolute bottom-1 right-1 block h-3 w-3 rounded-full ring-2 ring-background ${
                  profile.isActive ? "bg-emerald-500" : "bg-gray-400"
                }`}
              />
            </div>

            <div className="flex flex-1 flex-col gap-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold tracking-tight">{profile.name}</h2>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Badge variant="secondary">{roleLabel}</Badge>
                <Badge
                  variant="outline"
                  className={
                    profile.isActive
                      ? "border-emerald-500 text-emerald-600"
                      : "border-gray-400 text-gray-500"
                  }
                >
                  {profile.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Información personal</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-0">
            <InfoRow icon={UserIcon} label="Nombre completo" value={profile.name} />
            <Separator />
            <InfoRow icon={MailIcon} label="Correo electrónico" value={profile.email} />
            <Separator />
            <InfoRow icon={ShieldIcon} label="Rol" value={roleLabel} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Información de cuenta</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-0">
            <InfoRow
              icon={CalendarIcon}
              label="Miembro desde"
              value={formatDate(profile.createdAt)}
            />
            <Separator />
            <InfoRow
              icon={ClockIcon}
              label="Último acceso"
              value={formatDate(profile.lastLogin)}
            />
            <Separator />
            <InfoRow
              icon={ShieldIcon}
              label="Estado"
              value={profile.isActive ? "Activo" : "Inactivo"}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Profile
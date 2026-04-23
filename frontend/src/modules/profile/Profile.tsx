import Avatar from "react-avatar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { APP_SIDEBAR } from "@/constants"
import {
  UserIcon,
  MailIcon,
  ShieldIcon,
  CalendarIcon,
  ClockIcon,
} from "lucide-react"

const mockProfileData = {
  ...APP_SIDEBAR.curProfile,
  role: "Administrador",
  status: "active" as const,
  lastLogin: "2026-04-22",
  createdAt: "2024-01-15",
  phone: "+34 612 345 678",
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
  const profile = mockProfileData

  return (
    <div className="w-full max-w-4xl space-y-6">
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="relative shrink-0">
              <Avatar
                src={profile.src}
                name={profile.name}
                size="80px"
                round="12px"
              />
              <span className="absolute bottom-1 right-1 block h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background" />
            </div>

            <div className="flex flex-1 flex-col gap-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold tracking-tight">{profile.name}</h2>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Badge variant="secondary">{profile.role}</Badge>
                <Badge
                  variant="outline"
                  className={
                    profile.status === "active"
                      ? "border-emerald-500 text-emerald-600"
                      : "border-gray-400 text-gray-500"
                  }
                >
                  {profile.status === "active" ? "Activo" : "Inactivo"}
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
            <InfoRow icon={ShieldIcon} label="Rol" value={profile.role} />
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
              value={new Date(profile.createdAt).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />
            <Separator />
            <InfoRow
              icon={ClockIcon}
              label="Último acceso"
              value={new Date(profile.lastLogin).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />
            <Separator />
            <InfoRow
              icon={ShieldIcon}
              label="Estado"
              value={profile.status === "active" ? "Activo" : "Inactivo"}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Profile
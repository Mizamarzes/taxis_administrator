import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  UserIcon,
  LockIcon,
  BellIcon,
  PaletteIcon,
  ShieldIcon,
  SaveIcon,
  ConstructionIcon,
} from "lucide-react"

type Section = "cuenta" | "seguridad" | "notificaciones" | "apariencia"

const StandbyBanner = () => (
  <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-600 dark:text-amber-400">
    <ConstructionIcon className="mt-0.5 h-4 w-4 shrink-0" />
    <div className="space-y-0.5">
      <p className="text-sm font-medium">Funcionalidad en desarrollo</p>
      <p className="text-xs text-amber-600/80 dark:text-amber-400/80">
        Esta sección está disponible como vista previa. Las acciones de guardado
        se habilitarán próximamente.
      </p>
    </div>
  </div>
)

const NAV_ITEMS: { id: Section; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: "cuenta", label: "Cuenta", icon: UserIcon },
  { id: "seguridad", label: "Seguridad", icon: LockIcon },
  { id: "notificaciones", label: "Notificaciones", icon: BellIcon, badge: "3" },
  { id: "apariencia", label: "Apariencia", icon: PaletteIcon },
]

// ─── Sección: Cuenta ──────────────────────────────────────────────────────────
const CuentaSection = () => {
  const [form, setForm] = useState({
    name: "Salvador Pearson",
    email: "salvador.pearson@example.com",
    phone: "+34 612 345 678",
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Información de cuenta</h3>
        <p className="text-sm text-muted-foreground">
          Actualiza tus datos personales y de contacto.
        </p>
      </div>
      <Separator />

      <StandbyBanner />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre completo</Label>
          <Input
            id="name"
            value={form.name}
            disabled
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            disabled
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            value={form.phone}
            disabled
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button className="gap-2" disabled>
          <SaveIcon className="h-4 w-4" />
          Guardar cambios
        </Button>
      </div>
    </div>
  )
}

// ─── Sección: Seguridad ───────────────────────────────────────────────────────
const SeguridadSection = () => {
  const [form, setForm] = useState({
    current: "",
    next: "",
    confirm: "",
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Seguridad</h3>
        <p className="text-sm text-muted-foreground">
          Gestiona tu contraseña y opciones de acceso.
        </p>
      </div>
      <Separator />

      <StandbyBanner />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldIcon className="h-4 w-4" />
            Cambiar contraseña
          </CardTitle>
          <CardDescription>
            Usa una contraseña segura de al menos 8 caracteres.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current">Contraseña actual</Label>
            <Input
              id="current"
              type="password"
              placeholder="••••••••"
              value={form.current}
              disabled
              onChange={(e) => setForm({ ...form, current: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-pass">Nueva contraseña</Label>
            <Input
              id="new-pass"
              type="password"
              placeholder="••••••••"
              value={form.next}
              disabled
              onChange={(e) => setForm({ ...form, next: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirmar nueva contraseña</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="••••••••"
              value={form.confirm}
              disabled
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            />
          </div>
          <div className="flex justify-end">
            <Button className="gap-2" disabled>
              <SaveIcon className="h-4 w-4" />
              Actualizar contraseña
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Sección: Notificaciones ──────────────────────────────────────────────────
const notifItems = [
  {
    id: "new_users",
    label: "Nuevos usuarios",
    description: "Recibe alertas cuando se registre un nuevo usuario.",
  },
  {
    id: "new_drivers",
    label: "Nuevos conductores",
    description: "Recibe alertas cuando se registre un conductor.",
  },
  {
    id: "system",
    label: "Alertas del sistema",
    description: "Notificaciones sobre mantenimiento y actualizaciones.",
  },
  {
    id: "reports",
    label: "Reportes semanales",
    description: "Recibe un resumen semanal de actividad.",
  },
]

const NotificacionesSection = () => {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    new_users: true,
    new_drivers: true,
    system: false,
    reports: false,
  })

  const toggle = (id: string) =>
    setEnabled((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Notificaciones</h3>
        <p className="text-sm text-muted-foreground">
          Elige qué notificaciones quieres recibir.
        </p>
      </div>
      <Separator />

      <StandbyBanner />

      <div className="space-y-2">
        {notifItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border px-4 py-3"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{item.label}</span>
              <span className="text-xs text-muted-foreground">{item.description}</span>
            </div>
            <button
              type="button"
              role="switch"
              disabled
              aria-checked={enabled[item.id]}
              onClick={() => toggle(item.id)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-not-allowed items-center rounded-full border-2 border-transparent opacity-60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                enabled[item.id] ? "bg-primary" : "bg-input"
              }`}
            >
              <span
                className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                  enabled[item.id] ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button className="gap-2" disabled>
          <SaveIcon className="h-4 w-4" />
          Guardar preferencias
        </Button>
      </div>
    </div>
  )
}

// ─── Sección: Apariencia ──────────────────────────────────────────────────────
const AparienciaSection = () => {
  const [language, setLanguage] = useState("es")
  const [density, setDensity] = useState("normal")

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Apariencia</h3>
        <p className="text-sm text-muted-foreground">
          Personaliza el aspecto de la aplicación.
        </p>
      </div>
      <Separator />

      <StandbyBanner />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Idioma</Label>
          <Select value={language} onValueChange={setLanguage} disabled>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="pt">Português</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Densidad de la tabla</Label>
          <Select value={density} onValueChange={setDensity} disabled>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compact">Compacta</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="comfortable">Confortable</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button className="gap-2" disabled>
          <SaveIcon className="h-4 w-4" />
          Guardar apariencia
        </Button>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
const Settings = () => {
  const [activeSection, setActiveSection] = useState<Section>("cuenta")

  const renderSection = () => {
    switch (activeSection) {
      case "cuenta":
        return <CuentaSection />
      case "seguridad":
        return <SeguridadSection />
      case "notificaciones":
        return <NotificacionesSection />
      case "apariencia":
        return <AparienciaSection />
    }
  }

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <Badge variant="secondary" className="gap-1">
            <ConstructionIcon className="h-3 w-3" />
            Próximamente
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Administra las preferencias de tu cuenta y del sistema.
        </p>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        <aside className="w-full shrink-0 md:w-52">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  activeSection === item.id
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </button>
            ))}
          </nav>
        </aside>

        <Separator orientation="vertical" className="hidden md:block" />

        {/* Content */}
        <div className="flex-1 min-w-0">{renderSection()}</div>
      </div>
    </div>
  )
}

export default Settings
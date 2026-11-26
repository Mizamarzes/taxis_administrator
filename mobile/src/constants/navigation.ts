import type Ionicons from "@expo/vector-icons/Ionicons"
import type { Palette } from "@/theme/colors"
import type { PermissionAction } from "@/lib/permissions"

export interface NavItem {
  name: string
  title: string
  icon: keyof typeof Ionicons.glyphMap
  color: keyof Palette
  permission?: PermissionAction
}

export const PRIMARY_NAV: NavItem[] = [
  { name: "index", title: "Dashboard", icon: "grid-outline", color: "pink", permission: "dashboard.read" },
  { name: "tarifas", title: "Tarifas", icon: "wallet-outline", color: "success", permission: "tarifas.read" },
  { name: "vehicles", title: "Autos", icon: "car-outline", color: "primary", permission: "vehicles.read" },
  { name: "drivers", title: "Conductores", icon: "id-card-outline", color: "accent", permission: "drivers.read" },
  { name: "deudas", title: "Deudas", icon: "cash-outline", color: "destructive", permission: "deudas.read" },
  { name: "gastos", title: "Gastos", icon: "construct-outline", color: "warning", permission: "gastos.read" },
  { name: "users", title: "Usuarios", icon: "people-outline", color: "info", permission: "users.read" },
  { name: "roles", title: "Roles", icon: "shield-checkmark-outline", color: "accent", permission: "roles.read" },
]

export const SECONDARY_NAV: NavItem[] = [
  { name: "profile", title: "Mi perfil", icon: "person-circle-outline", color: "mutedForeground" },
]

export const ALL_NAV: NavItem[] = [...PRIMARY_NAV, ...SECONDARY_NAV]

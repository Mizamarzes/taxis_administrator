import type Ionicons from "@expo/vector-icons/Ionicons"
import type { Palette } from "@/theme/colors"

export interface NavItem {
  name: string
  title: string
  icon: keyof typeof Ionicons.glyphMap
  color: keyof Palette
}

export const PRIMARY_NAV: NavItem[] = [
  { name: "index", title: "Dashboard", icon: "grid-outline", color: "pink" },
  { name: "tarifas", title: "Tarifas", icon: "wallet-outline", color: "success" },
  { name: "vehicles", title: "Autos", icon: "car-outline", color: "primary" },
  { name: "drivers", title: "Conductores", icon: "id-card-outline", color: "accent" },
  { name: "deudas", title: "Deudas", icon: "cash-outline", color: "destructive" },
  { name: "gastos", title: "Gastos", icon: "construct-outline", color: "warning" },
  { name: "users", title: "Usuarios", icon: "people-outline", color: "info" },
]

export const SECONDARY_NAV: NavItem[] = [
  { name: "profile", title: "Mi perfil", icon: "person-circle-outline", color: "mutedForeground" },
]

export const ALL_NAV: NavItem[] = [...PRIMARY_NAV, ...SECONDARY_NAV]

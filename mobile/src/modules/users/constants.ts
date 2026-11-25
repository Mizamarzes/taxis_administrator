import type { BadgeTone } from "@/components/ui/Badge"
import type { RoleName } from "./types/user.types"

export const ROLES: Record<RoleName, { label: string; tone: BadgeTone }> = {
  USER: { label: "Usuario", tone: "muted" },
  ADMIN: { label: "Admin", tone: "primary" },
  SUPERADMIN: { label: "Superadmin", tone: "info" },
}

export const ROLE_OPTIONS = (Object.keys(ROLES) as RoleName[]).map((value) => ({
  value,
  label: ROLES[value].label,
}))

export const isRoleName = (value: unknown): value is RoleName => typeof value === "string" && value in ROLES

export const getRoleConfig = (name: string) =>
  isRoleName(name) ? ROLES[name] : { label: name, tone: "muted" as BadgeTone }

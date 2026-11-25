export interface Palette {
  background: string
  card: string
  foreground: string
  muted: string
  mutedForeground: string
  border: string
  primary: string
  primaryDark: string
  primaryForeground: string
  destructive: string
  success: string
  warning: string
  info: string
  accent: string
  pink: string
}

export const lightPalette: Palette = {
  background: "#F8FAFC",
  card: "#FFFFFF",
  foreground: "#0F172A",
  muted: "#F1F5F9",
  mutedForeground: "#64748B",
  border: "#E2E8F0",
  primary: "#F59E0B",
  primaryDark: "#D97706",
  primaryForeground: "#FFFFFF",
  destructive: "#DC2626",
  success: "#059669",
  warning: "#D97706",
  info: "#2563EB",
  accent: "#7C3AED",
  pink: "#DB2777",
}

export const darkPalette: Palette = {
  background: "#020617",
  card: "#0F172A",
  foreground: "#F8FAFC",
  muted: "#1E293B",
  mutedForeground: "#94A3B8",
  border: "#1E293B",
  primary: "#F59E0B",
  primaryDark: "#D97706",
  primaryForeground: "#FFFFFF",
  destructive: "#F87171",
  success: "#34D399",
  warning: "#FBBF24",
  info: "#60A5FA",
  accent: "#A78BFA",
  pink: "#F472B6",
}

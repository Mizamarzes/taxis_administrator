export type PermissionAction =
  | "dashboard.read"
  | `${"tarifas" | "drivers" | "vehicles" | "deudas" | "gastos" | "users" | "roles"}.${"create" | "read" | "update" | "delete"}`
  | "predictions.read"
  | "predictions.train"

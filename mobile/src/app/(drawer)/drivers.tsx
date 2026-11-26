import { useCallback } from "react"
import { router } from "expo-router"
import { useAuth } from "@/contexts/AuthContext"
import { RequirePermission } from "@/components/RequirePermission"
import { PaginatedScreen } from "@/components/PaginatedScreen"
import { DriverCard } from "@/modules/drivers/components/DriverCard"
import { getDriversService } from "@/modules/drivers/services/driver.service"
import type { Driver } from "@/modules/drivers/types/driver.types"

export default function DriversScreen() {
  const { can } = useAuth()
  const fetcher = useCallback((page: number) => getDriversService({ page, limit: 15 }), [])

  return (
    <RequirePermission permission="drivers.read">
      <PaginatedScreen<Driver>
        fetcher={fetcher}
        keyExtractor={(item) => String(item.id)}
        emptyMessage="No hay conductores registrados."
        onCreate={can("drivers.create") ? () => router.push("/drivers/form") : undefined}
        renderItem={(item) => (
          <DriverCard
            driver={item}
            onPress={() => router.push({ pathname: "/drivers/[id]", params: { id: String(item.id) } })}
          />
        )}
      />
    </RequirePermission>
  )
}

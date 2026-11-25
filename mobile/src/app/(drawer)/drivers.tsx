import { useCallback } from "react"
import { router } from "expo-router"
import { AdminOnly } from "@/components/AdminOnly"
import { PaginatedScreen } from "@/components/PaginatedScreen"
import { DriverCard } from "@/modules/drivers/components/DriverCard"
import { getDriversService } from "@/modules/drivers/services/driver.service"
import type { Driver } from "@/modules/drivers/types/driver.types"

export default function DriversScreen() {
  const fetcher = useCallback((page: number) => getDriversService({ page, limit: 15 }), [])

  return (
    <AdminOnly>
      <PaginatedScreen<Driver>
        fetcher={fetcher}
        keyExtractor={(item) => String(item.id)}
        emptyMessage="No hay conductores registrados."
        onCreate={() => router.push("/drivers/form")}
        renderItem={(item) => (
          <DriverCard
            driver={item}
            onPress={() => router.push({ pathname: "/drivers/[id]", params: { id: String(item.id) } })}
          />
        )}
      />
    </AdminOnly>
  )
}

import { useCallback } from "react"
import { router } from "expo-router"
import { AdminOnly } from "@/components/AdminOnly"
import { PaginatedScreen } from "@/components/PaginatedScreen"
import { VehicleCard } from "@/modules/vehicles/components/VehicleCard"
import { getVehiclesService } from "@/modules/vehicles/services/vehicle.service"
import type { Vehicle } from "@/modules/vehicles/types/vehicle.types"

export default function VehiclesScreen() {
  const fetcher = useCallback((page: number) => getVehiclesService({ page, limit: 15 }), [])

  return (
    <AdminOnly>
      <PaginatedScreen<Vehicle>
        fetcher={fetcher}
        keyExtractor={(item) => String(item.id)}
        emptyMessage="No hay vehículos registrados."
        renderItem={(item) => (
          <VehicleCard
            vehicle={item}
            onPress={() => router.push({ pathname: "/vehicles/[id]", params: { id: String(item.id) } })}
          />
        )}
      />
    </AdminOnly>
  )
}

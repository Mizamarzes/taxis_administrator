import { useCallback } from "react"
import { router } from "expo-router"
import { useAuth } from "@/contexts/AuthContext"
import { RequirePermission } from "@/components/RequirePermission"
import { PaginatedScreen } from "@/components/PaginatedScreen"
import { VehicleCard } from "@/modules/vehicles/components/VehicleCard"
import { getVehiclesService } from "@/modules/vehicles/services/vehicle.service"
import type { Vehicle } from "@/modules/vehicles/types/vehicle.types"

export default function VehiclesScreen() {
  const { can } = useAuth()
  const fetcher = useCallback((page: number) => getVehiclesService({ page, limit: 15 }), [])

  return (
    <RequirePermission permission="vehicles.read">
      <PaginatedScreen<Vehicle>
        fetcher={fetcher}
        keyExtractor={(item) => String(item.id)}
        emptyMessage="No hay vehículos registrados."
        onCreate={can("vehicles.create") ? () => router.push("/vehicles/form") : undefined}
        renderItem={(item) => (
          <VehicleCard
            vehicle={item}
            onPress={() => router.push({ pathname: "/vehicles/[id]", params: { id: String(item.id) } })}
          />
        )}
      />
    </RequirePermission>
  )
}

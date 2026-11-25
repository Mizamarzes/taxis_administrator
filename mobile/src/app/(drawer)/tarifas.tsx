import { useCallback, useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"
import { router } from "expo-router"
import { useAuth } from "@/contexts/AuthContext"
import { RequirePermission } from "@/components/RequirePermission"
import { PaginatedScreen } from "@/components/PaginatedScreen"
import { Input } from "@/components/ui/Input"
import { TarifaCard } from "@/modules/tarifas/components/TarifaCard"
import { getTarifasService } from "@/modules/tarifas/services/tarifa.service"
import type { Tarifa } from "@/modules/tarifas/types/tarifa.types"

function TarifasContent() {
  const { can } = useAuth()
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => clearTimeout(timeout)
  }, [search])

  const fetcher = useCallback(
    (page: number) => getTarifasService({ page, limit: 15, search: debouncedSearch || undefined }),
    [debouncedSearch],
  )

  return (
    <PaginatedScreen<Tarifa>
      fetcher={fetcher}
      keyExtractor={(item) => String(item.id)}
      emptyMessage="No hay tarifas registradas."
      onCreate={can("tarifas.create") ? () => router.push("/tarifas/form") : undefined}
      header={
        <View style={styles.searchBox}>
          <Input placeholder="Buscar por descripción..." value={search} onChangeText={setSearch} returnKeyType="search" />
        </View>
      }
      renderItem={(item) => (
        <TarifaCard
          tarifa={item}
          onPress={() => router.push({ pathname: "/tarifas/[id]", params: { id: String(item.id) } })}
        />
      )}
    />
  )
}

export default function TarifasScreen() {
  return (
    <RequirePermission permission="tarifas.read">
      <TarifasContent />
    </RequirePermission>
  )
}

const styles = StyleSheet.create({
  searchBox: { paddingHorizontal: 16, paddingTop: 12 },
})

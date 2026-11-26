import { useCallback, useEffect, useRef } from "react"
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native"
import { useFocusEffect } from "expo-router"
import type { ReactElement } from "react"
import type { ApiResponse, PaginatedResponse } from "@/lib/api"
import { usePaginatedList } from "@/hooks/usePaginatedList"
import { useTheme } from "@/theme/useTheme"
import { Fab } from "./ui/Fab"
import { EmptyView, LoadingView } from "./ui/StateView"

interface PaginatedScreenProps<T> {
  fetcher: (page: number) => Promise<ApiResponse<PaginatedResponse<T>>>
  renderItem: (item: T) => ReactElement
  keyExtractor: (item: T) => string
  emptyMessage: string
  header?: ReactElement
  onCreate?: () => void
}

export function PaginatedScreen<T>({
  fetcher,
  renderItem,
  keyExtractor,
  emptyMessage,
  header,
  onCreate,
}: PaginatedScreenProps<T>) {
  const theme = useTheme()
  const list = usePaginatedList<T>(fetcher)
  const { reload } = list
  const isFirstFocus = useRef(true)

  useEffect(() => {
    void reload()
  }, [fetcher])

  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false
        return
      }
      void reload()
    }, [fetcher]),
  )

  const renderContent = () => {
    if (list.isLoading) return <LoadingView />
    if (list.error) {
      return <EmptyView icon="cloud-offline-outline" message={list.error} actionLabel="Reintentar" onAction={list.reload} />
    }
    return (
      <FlatList
        data={list.items}
        keyExtractor={keyExtractor}
        contentContainerStyle={[styles.list, onCreate && styles.listWithFab]}
        renderItem={({ item }) => renderItem(item)}
        onEndReached={list.loadMore}
        onEndReachedThreshold={0.4}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={list.isRefreshing} onRefresh={list.refresh} tintColor={theme.primary} />}
        ListEmptyComponent={<EmptyView message={emptyMessage} />}
        ListFooterComponent={list.isLoadingMore ? <ActivityIndicator color={theme.primary} style={styles.footer} /> : undefined}
      />
    )
  }

  return (
    <View style={styles.flex}>
      {header}
      {renderContent()}
      {onCreate && <Fab onPress={onCreate} />}
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: 16, gap: 12, flexGrow: 1 },
  listWithFab: { paddingBottom: 96 },
  footer: { marginVertical: 16 },
})

import { useCallback, useRef, useState } from "react"
import type { ApiResponse, PaginatedResponse } from "@/lib/api"

type Fetcher<T> = (page: number) => Promise<ApiResponse<PaginatedResponse<T>>>

export function usePaginatedList<T>(fetcher: Fetcher<T>) {
  const [items, setItems] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)

  const load = useCallback(async (mode: "initial" | "refresh") => {
    const current = ++requestId.current
    if (mode === "refresh") setIsRefreshing(true)
    else setIsLoading(true)
    setError(null)
    try {
      const response = await fetcher(1)
      if (current !== requestId.current) return
      setItems(response.data.items)
      setPage(1)
      setHasMore(response.data.nextPage !== null)
    } catch (err) {
      if (current !== requestId.current) return
      setError(err instanceof Error ? err.message : "Error al cargar la información")
    } finally {
      if (current === requestId.current) {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    }
  }, [fetcher])

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading || isRefreshing) return
    const current = requestId.current
    setIsLoadingMore(true)
    try {
      const nextPage = page + 1
      const response = await fetcher(nextPage)
      if (current !== requestId.current) return
      setItems((prev) => [...prev, ...response.data.items])
      setPage(nextPage)
      setHasMore(response.data.nextPage !== null)
    } catch {
      if (current === requestId.current) setHasMore(false)
    } finally {
      setIsLoadingMore(false)
    }
  }, [fetcher, hasMore, isLoading, isLoadingMore, isRefreshing, page])

  return {
    items,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    reload: () => load("initial"),
    refresh: () => load("refresh"),
    loadMore,
  }
}

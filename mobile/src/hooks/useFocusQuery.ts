import { useCallback, useRef, useState } from "react"
import { useFocusEffect } from "expo-router"

export function useFocusQuery<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)

  const run = useCallback(
    async (mode: "silent" | "refresh") => {
      const current = ++requestId.current
      if (mode === "refresh") setIsRefreshing(true)
      try {
        const result = await fetcher()
        if (current !== requestId.current) return
        setData(result)
        setError(null)
      } catch (err) {
        if (current !== requestId.current) return
        setError(err instanceof Error ? err.message : "Error al cargar la información")
      } finally {
        if (current === requestId.current) {
          setIsLoading(false)
          setIsRefreshing(false)
        }
      }
    },
    [fetcher],
  )

  useFocusEffect(
    useCallback(() => {
      void run("silent")
    }, [run]),
  )

  const reload = useCallback(() => {
    setIsLoading(true)
    void run("silent")
  }, [run])

  const refresh = useCallback(() => {
    void run("refresh")
  }, [run])

  return { data, isLoading, isRefreshing, error, reload, refresh }
}

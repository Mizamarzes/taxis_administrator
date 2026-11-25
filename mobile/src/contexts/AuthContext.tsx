import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { setAuthToken, setUnauthorizedHandler } from "@/lib/api"
import { clearStoredToken, getStoredToken, setStoredToken } from "@/lib/token"
import { getAuthProfileService, loginService } from "@/modules/auth/services/auth.service"
import type { AuthUser } from "@/modules/auth/types/auth.types"
import type { ILogin } from "@/modules/auth/types/login.types"
import type { PermissionAction } from "@/lib/permissions"

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: AuthUser | null
  login: (credentials: ILogin) => Promise<void>
  logout: () => Promise<void>
  can: (permission: PermissionAction) => boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)

  const clearSession = useCallback(async () => {
    setAuthToken(null)
    setUser(null)
    await clearStoredToken()
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void clearSession()
    })

    const restoreSession = async () => {
      try {
        const token = await getStoredToken()
        if (!token) return
        setAuthToken(token)
        const profile = await getAuthProfileService()
        setUser(profile)
      } catch {
        await clearSession()
      } finally {
        setIsLoading(false)
      }
    }

    void restoreSession()

    return () => setUnauthorizedHandler(null)
  }, [clearSession])

  const login = useCallback(async (credentials: ILogin) => {
    const { accessToken } = await loginService(credentials)
    setAuthToken(accessToken)
    await setStoredToken(accessToken)
    try {
      const profile = await getAuthProfileService()
      setUser(profile)
    } catch {
      await clearSession()
      throw new Error("No se pudo obtener el perfil del usuario")
    }
  }, [clearSession])

  const logout = useCallback(async () => {
    await clearSession()
  }, [clearSession])

  const refreshProfile = useCallback(async () => {
    try {
      setUser(await getAuthProfileService())
    } catch {
      await clearSession()
    }
  }, [clearSession])

  const can = useCallback(
    (permission: PermissionAction) => user?.permissions?.includes(permission) ?? false,
    [user],
  )

  const value = useMemo<AuthContextType>(() => ({
    isAuthenticated: user !== null,
    isLoading,
    user,
    login,
    logout,
    can,
    refreshProfile,
  }), [user, isLoading, login, logout, can, refreshProfile])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

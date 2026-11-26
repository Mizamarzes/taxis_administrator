import axios from "axios"

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000"

export interface ApiResponse<T> {
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  items: T[]
  totalItems: number
  currentPage: number
  totalPages: number
  previousPage: number | null
  nextPage: number | null
}

let authToken: string | null = null
let unauthorizedHandler: (() => void) | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

const api = axios.create({
  baseURL: `${apiUrl}/api`,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl: string = error.config?.url ?? ""
    if (error.response?.status === 401 && !requestUrl.includes("auth/login")) {
      unauthorizedHandler?.()
    }
    return Promise.reject(error)
  },
)

export function extractApiMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "No se pudo conectar con el servidor"
    }
    const apiMessage = error.response.data?.message
    if (typeof apiMessage === "string" && apiMessage.length > 0) {
      return apiMessage
    }
    if (Array.isArray(apiMessage) && apiMessage.length > 0) {
      return String(apiMessage[0])
    }
  }
  return fallback
}

export default api

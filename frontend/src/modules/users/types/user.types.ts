export interface User {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "inactive"
  lastLogin: string
  createdAt: string
}

export interface ICreateUserPayload {
  name: string
  email: string
  password: string
  role: string
}

export interface IUpdateUserPayload {
  name?: string
  email?: string
  role?: string
  status?: string
}

export interface IUsersResponse {
  users: User[]
  total: number
}
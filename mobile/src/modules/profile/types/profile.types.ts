export interface ProfileRole {
  id: number
  name: string
}

export interface Profile {
  id: number
  name: string
  email: string
  roles: ProfileRole[]
  isActive: boolean
  lastLogin: string | null
  createdAt: string
  updatedAt: string
}
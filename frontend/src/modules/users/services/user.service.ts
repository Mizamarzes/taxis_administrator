import api from "@/lib/axios"

export async function createUserService(payload: {
  name: string
  email: string
  password: string
  role: string
}) {
  try {
    const response = await api.post("users/create", payload)
    return response.data
  } catch (error) {
    throw new Error("Error creating user")
  }
}

export async function getUsersService(params: {
  page: number
  limit: number
}) {
  try {
    const response = await api.get("users/get-all", { params })
    return response.data
  } catch (error) {
    throw new Error("Error fetching users")
  }
}

export async function getUserByIdService(id: string) {
  try {
    const response = await api.get(`users/get/${id}`)
    return response.data
  } catch (error) {
    throw new Error("Error fetching user")
  }
}

export async function updateUserService(
  id: string,
  payload: { name?: string; email?: string; role?: string; status?: string }
) {
  try {
    const response = await api.patch(`users/update/${id}`, payload)
    return response.data
  } catch (error) {
    throw new Error("Error updating user")
  }
}

export async function deleteUserService(id: string) {
  try {
    const response = await api.delete(`users/delete/${id}`)
    return response.data
  } catch (error) {
    throw new Error("Error deleting user")
  }
}


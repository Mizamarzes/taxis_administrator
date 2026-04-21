import api from "../../../lib/axios";
import type { ILogin } from "../types/login";

export async function loginService(payload: ILogin) {
  try {
    const response = await api.post("auth/login", payload);
    console.log(response.data); 

  } catch (error) {
    throw new Error("Error al iniciar sesión");
  }
}

export async function logoutService() {
    try {
        const response =await api.post("auth/logout");
        console.log(response.data);

    } catch (error) {
        throw new Error("Logout failed");
    }
}

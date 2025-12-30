import axios from "axios";
import type { ILogin } from "../types/login";

export async function loginService(payload: ILogin) {
  try {
    const response = await axios.post("login", payload, {
      withCredentials: true,
    });
    if (response.data.data.accessToken) {
      return true;
    }
    throw new Error("No se recibió token de acceso");
  } catch (error) {
    throw new Error("Error al iniciar sesión");
  }
}

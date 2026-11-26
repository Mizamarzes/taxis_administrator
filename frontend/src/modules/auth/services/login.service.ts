import axios from "axios";
import api from "../../../lib/axios";
import type { ILogin } from "../types/login";

function extractApiMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const apiMessage = error.response?.data?.message;
    if (typeof apiMessage === "string" && apiMessage.length > 0) {
      return apiMessage;
    }
  }
  return fallback;
}

export async function loginService(payload: ILogin) {
  try {
    await api.post("auth/login", payload);
  } catch (error) {
    throw new Error(extractApiMessage(error, "No se pudo iniciar sesión"));
  }
}

export async function logoutService() {
  try {
    await api.post("auth/logout");
  } catch (error) {
    throw new Error(extractApiMessage(error, "No se pudo cerrar sesión"));
  }
}
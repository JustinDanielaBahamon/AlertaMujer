import api from "./api";

/** Ajustes del sistema que la administración define en el panel (GET /api/settings). */
export interface AjustesPublicos {
  minAppVersion: string | null;
  emergencyPhoneNumber: string | null;
  /** Minutos tras los cuales el servidor da por terminada una alerta activa. */
  sosMaxDurationMinutes: number | null;
}

export async function getAjustesPublicos(): Promise<AjustesPublicos> {
  const { data } = await api.get<Partial<AjustesPublicos>>("/api/settings");
  return {
    minAppVersion: data.minAppVersion ?? null,
    emergencyPhoneNumber: data.emergencyPhoneNumber ?? null,
    sosMaxDurationMinutes: data.sosMaxDurationMinutes ?? null,
  };
}

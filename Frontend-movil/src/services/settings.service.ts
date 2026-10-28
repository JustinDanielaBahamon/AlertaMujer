import api from "./api";

/** System settings the administration defines in the panel (GET /api/settings). */
export interface PublicSettings {
  minAppVersion: string | null;
  emergencyPhoneNumber: string | null;
  /** Minutes after which the server considers an active alert finished. */
  sosMaxDurationMinutes: number | null;
}

export async function getPublicSettings(): Promise<PublicSettings> {
  const { data } = await api.get<Partial<PublicSettings>>("/api/settings");
  return {
    minAppVersion: data.minAppVersion ?? null,
    emergencyPhoneNumber: data.emergencyPhoneNumber ?? null,
    sosMaxDurationMinutes: data.sosMaxDurationMinutes ?? null,
  };
}

import api from './api';
import type { AlertRecord, AlertStatus } from '../features/history/models/AlertRecord';

// Estructura real que devuelve el backend (Alert entity, schema alert.alert)
export interface AlertApi {
  id: number;
  userProfileId: number;
  deviceId: number;
  alertType: string;
  activationMethod: string;
  status: string;
  message?: string;
  latitude?: number;
  longitude?: number;
  startedAt: string;
  endedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
}

export const getAlertsByUser = async (userId: number): Promise<AlertApi[]> => {
  const response = await api.get<AlertApi[]>(`/api/alerts/user/${userId}`);
  // Más recientes primero (por fecha de inicio, o por id como respaldo)
  return [...response.data].sort((a, b) => {
    const na = a.startedAt || a.createdAt || '';
    const nb = b.startedAt || b.createdAt || '';
    return nb.localeCompare(na) || b.id - a.id;
  });
};

export interface CreateAlertData {
  userProfileId: number;
  deviceId: number;
  alertType?: string;
  activationMethod?: string;
  status?: string;
  message?: string;
  latitude?: number;
  longitude?: number;
  /** Alerta individual: solo se avisa a estos contactos (sin esto, a todos). */
  contactIds?: number[];
}

/** Alertas de la usuaria en sesión, de la más reciente a la más antigua. */
export const getMyAlerts = async (): Promise<AlertApi[]> => {
  const response = await api.get<AlertApi[]>('/api/alerts/me');
  return response.data;
};

/** La alerta propia que sigue activa (solo puede haber una), o null. */
export const ownActiveAlert = (alerts: AlertApi[]): AlertApi | null =>
  alerts.find((a) => (a.status || '').toLowerCase() === 'active') ?? null;

export const createAlert = async (data: CreateAlertData): Promise<AlertApi> => {
  const response = await api.post<AlertApi>('/api/alerts', {
    alertType: data.alertType ?? 'main',
    activationMethod: data.activationMethod ?? 'panic_button',
    status: data.status ?? 'active',
    message: data.message ?? 'Alerta SOS activada',
    userProfileId: data.userProfileId,
    deviceId: data.deviceId,
    latitude: data.latitude,
    longitude: data.longitude,
    contactIds: data.contactIds,
  });
  return response.data;
};

// Esperas antes de cada intento: cubren una red mala o el servidor de Render despertando (~1 min)
const RETRY_DELAYS_MS = [0, 2000, 5000, 10000, 20000];
// Una alerta activa más reciente que esto puede ser la de un intento que sí llegó al servidor
const PREVIOUS_ATTEMPT_WINDOW_MS = 3 * 60 * 1000;

const isRetryable = (e: any) => {
  const status = e?.response?.status;
  return !status || status >= 500 || status === 408 || status === 429;
};

const aMs = (iso?: string) => (iso ? Date.parse(/[zZ]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`) : NaN);

export type AlertAttempt = { attempt: number; total: number };

/**
 * Crea la alerta y, si no hay red o el servidor no responde, la reintenta varias veces. Antes de
 * cada reintento revisa si el intento anterior sí alcanzó a crearla (se perdió la respuesta), para
 * no avisar dos veces a los contactos.
 */
export async function createAlertWithRetries(
  data: CreateAlertData,
  options: { onAttempt?: (i: AlertAttempt) => void; wait?: (ms: number) => Promise<void> } = {},
): Promise<AlertApi> {
  const wait = options.wait ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const total = RETRY_DELAYS_MS.length;
  let lastError: unknown;
  for (let i = 0; i < total; i++) {
    if (RETRY_DELAYS_MS[i] > 0) await wait(RETRY_DELAYS_MS[i]);
    options.onAttempt?.({ attempt: i + 1, total });
    if (i > 0) {
      const previousValue = await getMyAlerts().then(ownActiveAlert).catch(() => null);
      if (previousValue && Date.now() - aMs(previousValue.startedAt || previousValue.createdAt) < PREVIOUS_ATTEMPT_WINDOW_MS) return previousValue;
    }
    try {
      return await createAlert(data);
    } catch (e) {
      lastError = e;
      if (!isRetryable(e)) throw e;
    }
  }
  throw lastError;
}

/** Una alerta propia (para saber si sigue activa). */
export const getAlert = async (alertId: number): Promise<AlertApi> => {
  const response = await api.get<AlertApi>(`/api/alerts/${alertId}`);
  return response.data;
};

/** Cuántas personas abrieron el seguimiento de la alerta y cuántas la están viendo ahora. */
export const getViews = async (alertId: number): Promise<{ total: number; watchingNow: number }> => {
  const response = await api.get<{ total: number; viendoAhora: number }>(`/api/alerts/${alertId}/views`);
  // The backend still sends this key in Spanish
  return { total: response.data.total, watchingNow: response.data.viendoAhora };
};

export const endAlert = async (alertId: number, status: 'resolved' | 'cancelled'): Promise<AlertApi> => {
  const response = await api.put<AlertApi>(`/api/alerts/${alertId}`, { status: status });
  return response.data;
};

const transformType = (apiType: string, message?: string): string => {
  const t = (apiType || '').toLowerCase();
  if (t.includes('medical') || t.includes('asistencia') || t.includes('salud')) return 'Asistencia';
  const m = (message || '').toLowerCase();
  if (m.includes('médic') || m.includes('salud')) return 'Asistencia';
  return 'Emergencia';
};

const transformStatus = (apiStatus: string): AlertStatus => {
  const e = (apiStatus || '').toLowerCase();
  if (e === 'cancelled' || e === 'cancelada') return 'Cancelada';
  // Expirada = terminó sola por tiempo: no debe seguir apareciendo "En curso"
  if (e === 'resolved' || e === 'expired' || e === 'atendida' || e === 'finalizada') return 'Enviada';
  return 'En curso';
};

// Adapta una alerta real del backend al modelo usado por el historial/inicio
export const transformAlert = (apiAlert: AlertApi): AlertRecord => {
  const isoDate = apiAlert.startedAt || apiAlert.createdAt;
  // El backend devuelve LocalDateTime en UTC sin sufijo 'Z'; si no se marca como UTC, JS lo interpreta
  // como hora local y muestra la fecha/hora corrida.
  const dateObj = isoDate
    ? new Date(isoDate + (isoDate.endsWith('Z') || isoDate.includes('+') ? '' : 'Z'))
    : null;
  const zoneOptions: Intl.DateTimeFormatOptions = { timeZone: 'America/Bogota' };
  return {
    id: String(apiAlert.id),
    type: transformType(apiAlert.alertType, apiAlert.message),
    date: dateObj && !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString('es-CO', zoneOptions)
      : '',
    time: dateObj && !isNaN(dateObj.getTime())
      ? dateObj.toLocaleTimeString('es-CO', { ...zoneOptions, hour: '2-digit', minute: '2-digit' })
      : '',
    location: apiAlert.message || 'Sin ubicación registrada',
    status: transformStatus(apiAlert.status),
    coords:
      apiAlert.latitude != null && apiAlert.longitude != null
        ? { latitude: Number(apiAlert.latitude), longitude: Number(apiAlert.longitude) }
        : undefined,
  };
};

/** Canal por el que se avisó a un contacto y su estado (GET /api/alerts/{id}/contacts). */
export interface NotificationChannel {
  channel: "email" | "push" | string;
  destination?: string | null;
  status: "pending" | "sent" | "delivered" | "failed" | "expired" | string;
  sentAt?: string | null;
  deliveredAt?: string | null;
}

export interface NotifiedContact {
  contactId: number;
  name: string;
  relationship?: string | null;
  channels: NotificationChannel[];
}

export const getNotifiedContacts = async (alertId: number | string): Promise<NotifiedContact[]> => {
  const response = await api.get<NotifiedContact[]>(`/api/alerts/${alertId}/contacts`);
  return response.data;
};

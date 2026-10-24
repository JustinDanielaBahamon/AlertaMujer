import api from './api';
import type { AlertRecord, AlertStatus } from '../features/history/models/AlertRecord';

// Real structure the backend returns (Alert entity, alert.alert schema)
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
  /** Evidence kept as proof: the server does not delete it after the retention days. */
  keepEvidence?: boolean;
}

export const getAlertsByUser = async (userId: number): Promise<AlertApi[]> => {
  const response = await api.get<AlertApi[]>(`/api/alerts/user/${userId}`);
  // Most recent first (by start date, or by id as a fallback)
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
  /** Individual alert: only these contacts are notified (without it, all of them). */
  contactIds?: number[];
}

/** Alerts of the signed-in user, from newest to oldest. */
export const getMyAlerts = async (): Promise<AlertApi[]> => {
  const response = await api.get<AlertApi[]>('/api/alerts/me');
  return response.data;
};

/** Her own alert that is still active (there can only be one), or null. */
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

// Waits before each attempt: they cover a bad network or the Render server waking up (~1 min)
const RETRY_DELAYS_MS = [0, 2000, 5000, 10000, 20000];
// An active alert more recent than this may be one from an attempt that did reach the server
const PREVIOUS_ATTEMPT_WINDOW_MS = 3 * 60 * 1000;

const isRetryable = (e: any) => {
  const status = e?.response?.status;
  return !status || status >= 500 || status === 408 || status === 429;
};

const aMs = (iso?: string) => (iso ? Date.parse(/[zZ]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`) : NaN);

export type AlertAttempt = { attempt: number; total: number };

/**
 * Creates the alert and, if there is no network or the server does not respond, retries several times. Before
 * each retry it checks whether the previous attempt did manage to create it (the response was lost), so
 * the contacts are not notified twice.
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

/** One of her own alerts (to know whether it is still active). */
export const getAlert = async (alertId: number): Promise<AlertApi> => {
  const response = await api.get<AlertApi>(`/api/alerts/${alertId}`);
  return response.data;
};

/** How many people opened the alert tracking and how many are watching it now. */
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
  // Expired = it ended by itself on time: it must not keep showing as "In progress"
  if (e === 'resolved' || e === 'expired' || e === 'atendida' || e === 'finalizada') return 'Enviada';
  return 'En curso';
};

// Adapts a real backend alert to the model used by the history/home
export const transformAlert = (apiAlert: AlertApi): AlertRecord => {
  const isoDate = apiAlert.startedAt || apiAlert.createdAt;
  // The backend returns LocalDateTime in UTC without the 'Z' suffix; if it is not marked as UTC, JS reads it
  // as local time and shows the date/time shifted.
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

/** Channel a contact was notified through and its status (GET /api/alerts/{id}/contacts). */
export interface NotificationChannel {
  channel: "email" | "push" | string;
  destination?: string | null;
  /** delivered: it reached her (push received, email opened); seen: she opened the tracking from it. */
  status: "pending" | "sent" | "delivered" | "seen" | "failed" | "expired" | string;
  sentAt?: string | null;
  deliveredAt?: string | null;
  seenAt?: string | null;
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

/** Keeps (or releases) an alert's evidence so it is not deleted after the retention days. */
export async function keepAlertEvidence(alertId: number, keep: boolean): Promise<AlertApi> {
  const response = await api.patch<AlertApi>(`/api/alerts/${alertId}/keep-evidence`, { keep });
  return response.data;
}

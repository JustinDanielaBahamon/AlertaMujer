import api from './api';
import type { Alerta, EstadoAlerta } from '../features/historial/models/Alerta';

// Estructura real que devuelve el backend (Alert entity, schema alert.alert)
export interface AlertaApi {
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

export const getAlertasByUsuario = async (usuarioId: number): Promise<AlertaApi[]> => {
  const response = await api.get<AlertaApi[]>(`/api/alerts/user/${usuarioId}`);
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
export const getMisAlertas = async (): Promise<AlertaApi[]> => {
  const response = await api.get<AlertaApi[]>('/api/alerts/me');
  return response.data;
};

/** La alerta propia que sigue activa (solo puede haber una), o null. */
export const alertaActivaPropia = (alertas: AlertaApi[]): AlertaApi | null =>
  alertas.find((a) => (a.status || '').toLowerCase() === 'active') ?? null;

export const createAlert = async (data: CreateAlertData): Promise<AlertaApi> => {
  const response = await api.post<AlertaApi>('/api/alerts', {
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
const ESPERAS_REINTENTO_MS = [0, 2000, 5000, 10000, 20000];
// Una alerta activa más reciente que esto puede ser la de un intento que sí llegó al servidor
const VENTANA_INTENTO_PREVIO_MS = 3 * 60 * 1000;

const esReintentable = (e: any) => {
  const estado = e?.response?.status;
  return !estado || estado >= 500 || estado === 408 || estado === 429;
};

const aMs = (iso?: string) => (iso ? Date.parse(/[zZ]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`) : NaN);

export type IntentoAlerta = { intento: number; total: number };

/**
 * Crea la alerta y, si no hay red o el servidor no responde, la reintenta varias veces. Antes de
 * cada reintento revisa si el intento anterior sí alcanzó a crearla (se perdió la respuesta), para
 * no avisar dos veces a los contactos.
 */
export async function crearAlertaConReintentos(
  data: CreateAlertData,
  opciones: { alIntentar?: (i: IntentoAlerta) => void; esperar?: (ms: number) => Promise<void> } = {},
): Promise<AlertaApi> {
  const esperar = opciones.esperar ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const total = ESPERAS_REINTENTO_MS.length;
  let ultimoError: unknown;
  for (let i = 0; i < total; i++) {
    if (ESPERAS_REINTENTO_MS[i] > 0) await esperar(ESPERAS_REINTENTO_MS[i]);
    opciones.alIntentar?.({ intento: i + 1, total });
    if (i > 0) {
      const previa = await getMisAlertas().then(alertaActivaPropia).catch(() => null);
      if (previa && Date.now() - aMs(previa.startedAt || previa.createdAt) < VENTANA_INTENTO_PREVIO_MS) return previa;
    }
    try {
      return await createAlert(data);
    } catch (e) {
      ultimoError = e;
      if (!esReintentable(e)) throw e;
    }
  }
  throw ultimoError;
}

/** Una alerta propia (para saber si sigue activa). */
export const getAlerta = async (alertId: number): Promise<AlertaApi> => {
  const response = await api.get<AlertaApi>(`/api/alerts/${alertId}`);
  return response.data;
};

export const finalizarAlerta = async (alertId: number, estado: 'resolved' | 'cancelled'): Promise<AlertaApi> => {
  const response = await api.put<AlertaApi>(`/api/alerts/${alertId}`, { status: estado });
  return response.data;
};

const transformarTipo = (apiTipo: string, message?: string): string => {
  const t = (apiTipo || '').toLowerCase();
  if (t.includes('medical') || t.includes('asistencia') || t.includes('salud')) return 'Asistencia';
  const m = (message || '').toLowerCase();
  if (m.includes('médic') || m.includes('salud')) return 'Asistencia';
  return 'Emergencia';
};

const transformarEstado = (apiEstado: string): EstadoAlerta => {
  const e = (apiEstado || '').toLowerCase();
  if (e === 'cancelled' || e === 'cancelada') return 'Cancelada';
  // Expirada = terminó sola por tiempo: no debe seguir apareciendo "En curso"
  if (e === 'resolved' || e === 'expired' || e === 'atendida' || e === 'finalizada') return 'Enviada';
  return 'En curso';
};

// Adapta una alerta real del backend al modelo usado por el historial/inicio
export const transformarAlerta = (apiAlerta: AlertaApi): Alerta => {
  const fechaIso = apiAlerta.startedAt || apiAlerta.createdAt;
  // El backend devuelve LocalDateTime en UTC sin sufijo 'Z'; si no se marca como UTC, JS lo interpreta
  // como hora local y muestra la fecha/hora corrida.
  const fechaObj = fechaIso
    ? new Date(fechaIso + (fechaIso.endsWith('Z') || fechaIso.includes('+') ? '' : 'Z'))
    : null;
  const opcionesZona: Intl.DateTimeFormatOptions = { timeZone: 'America/Bogota' };
  return {
    id: String(apiAlerta.id),
    tipo: transformarTipo(apiAlerta.alertType, apiAlerta.message),
    fecha: fechaObj && !isNaN(fechaObj.getTime())
      ? fechaObj.toLocaleDateString('es-CO', opcionesZona)
      : '',
    hora: fechaObj && !isNaN(fechaObj.getTime())
      ? fechaObj.toLocaleTimeString('es-CO', { ...opcionesZona, hour: '2-digit', minute: '2-digit' })
      : '',
    ubicacion: apiAlerta.message || 'Sin ubicación registrada',
    estado: transformarEstado(apiAlerta.status),
    coords:
      apiAlerta.latitude != null && apiAlerta.longitude != null
        ? { latitude: Number(apiAlerta.latitude), longitude: Number(apiAlerta.longitude) }
        : undefined,
  };
};

/** Canal por el que se avisó a un contacto y su estado (GET /api/alerts/{id}/contacts). */
export interface CanalNotificacion {
  channel: "email" | "push" | string;
  destination?: string | null;
  status: "pending" | "sent" | "delivered" | "failed" | "expired" | string;
  sentAt?: string | null;
  deliveredAt?: string | null;
}

export interface ContactoNotificado {
  contactId: number;
  name: string;
  relationship?: string | null;
  channels: CanalNotificacion[];
}

export const getContactosNotificados = async (alertaId: number | string): Promise<ContactoNotificado[]> => {
  const response = await api.get<ContactoNotificado[]>(`/api/alerts/${alertaId}/contacts`);
  return response.data;
};

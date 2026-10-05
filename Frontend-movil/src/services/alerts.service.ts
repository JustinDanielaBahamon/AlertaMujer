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
}

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
  });
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
  if (e === 'resolved' || e === 'atendida' || e === 'finalizada') return 'Enviada';
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

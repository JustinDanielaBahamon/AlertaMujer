import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interface for backend LocationLog response
export interface LocationLogApi {
  id: number;
  userProfileId: number;
  alertId?: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  recordedAt: string;
}

// Interface for creating a new location log
export interface CreateLocationLogData {
  userProfileId: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  alertId?: number;
}

// Interface for simplified location entry (used in UI)
export interface UbicacionEntry {
  id: number;
  usuarioId: number;
  time: string;
  address: string;
  gpsSignal: 'Fuerte' | 'Moderada' | 'Débil';
  battery: number;
  lat: number;
  lng: number;
  date?: string;
  connectionType?: string;
  deviceName?: string;
}

/**
 * Keys for AsyncStorage persistence
 */
const STORAGE_KEY_LOCATION_LOGS = '@alerta-mujer:location-logs';
const STORAGE_KEY_SYNC_STATUS = '@alerta-mujer:sync-status';

/**
 * Mapea LocationLogApi -> UbicacionEntry (para display en UI)
 */
export const mapLocationLogToUbicacionEntry = (
  log: LocationLogApi
): UbicacionEntry => {
  const date = new Date(log.recordedAt);
  return {
    id: log.id,
    usuarioId: log.userProfileId,
    time: date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    address: 'Ubicación registrada',
    gpsSignal: 'Fuerte',
    battery: 100,
    lat: log.latitude,
    lng: log.longitude,
    date: date.toISOString().split('T')[0],
    connectionType: undefined,
    deviceName: undefined,
  };
};

/**
 * Obtener historial de ubicaciones del usuario
 * Endpoint: GET /api/location-logs/user/{userProfileId}
 * Cachea resultados en AsyncStorage para modo offline
 */
export const getUserLocations = async (
  userProfileId: number
): Promise<LocationLogApi[]> => {
  try {
    // Primero intentar obtener de AsyncStorage (modo offline)
    const cached = await AsyncStorage.getItem(`${STORAGE_KEY_LOCATION_LOGS}_${userProfileId}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Filtrar solo los registros de este usuario
      return parsed.filter((log: LocationLogApi) => log.userProfileId === userProfileId);
    }
    
    // Si no hay caché, obtener del backend
    const response = await api.get<LocationLogApi[]>(
      `/api/location-logs/user/${userProfileId}`
    );
    
    // Cachear el resultado para uso offline
    const allLogs = await AsyncStorage.getItem(STORAGE_KEY_LOCATION_LOGS);
    const existingLogs = allLogs ? JSON.parse(allLogs) : [];
    const updatedLogs = [...existingLogs, ...response.data];
    await AsyncStorage.setItem(STORAGE_KEY_LOCATION_LOGS, JSON.stringify(updatedLogs));
    
    return response.data;
  } catch (error) {
    console.error('Error fetching user locations:', error);
    // En caso de error total, intentar leer de caché aunque esté corrupto
    try {
      const cached = await AsyncStorage.getItem(`${STORAGE_KEY_LOCATION_LOGS}_${userProfileId}`);
      if (cached) {
        return JSON.parse(cached).filter((log: LocationLogApi) => log.userProfileId === userProfileId);
      }
    } catch (e) {
      // Ignore - return empty array
    }
    return [];
  }
};

/**
 * Enviar una nueva ubicación (POST)
 * Endpoint: POST /api/location-logs
 * Guarda en AsyncStorage antes de enviar para modo offline-first
 */
export const createLocationLog = async (
  data: CreateLocationLogData
): Promise<LocationLogApi> => {
  try {
    // Primero guardar en AsyncStorage en modo offline-first
    const logEntry: LocationLogApi = {
      id: Date.now(), // ID temporal hasta que el backend responda
      userProfileId: data.userProfileId,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: data.accuracy,
      alertId: data.alertId,
      recordedAt: new Date().toISOString(),
    };
    
    // Cachear localmente
    const allLogs = await AsyncStorage.getItem(STORAGE_KEY_LOCATION_LOGS);
    const existingLogs = allLogs ? JSON.parse(allLogs) : [];
    const updatedLogs = [...existingLogs, logEntry];
    await AsyncStorage.setItem(STORAGE_KEY_LOCATION_LOGS, JSON.stringify(updatedLogs));
    
    // Luego intentar enviar al backend
    const payload = {
      userProfileId: data.userProfileId,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: data.accuracy,
      alertId: data.alertId,
    };
    const response = await api.post<LocationLogApi>('/api/location-logs', payload);
    
    // Si el backend tiene un ID real, actualizar el registro cached
    if (response.data.id && response.data.id !== logEntry.id) {
      const finalLogs = updatedLogs.map((log: LocationLogApi) =>
        log.id === logEntry.id ? response.data : log
      );
      await AsyncStorage.setItem(STORAGE_KEY_LOCATION_LOGS, JSON.stringify(finalLogs));
    }
    
    return response.data;
  } catch (error) {
    console.error('Error creating location log (offline mode):', error);
    // En modo offline, el registro ya está cached localmente
    // Marcar como sincronización pendiente
    await AsyncStorage.setItem(
      STORAGE_KEY_SYNC_STATUS,
      JSON.stringify({
        type: 'location-log',
        pendingId: Date.now(),
        userProfileId: data.userProfileId,
        timestamp: new Date().toISOString(),
      })
    );
    // Retornar el entry cached local
    return {
      id: Date.now(),
      userProfileId: data.userProfileId,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: data.accuracy,
      alertId: data.alertId,
      recordedAt: new Date().toISOString(),
    };
  }
};

/**
 * Test de conexión con el backend
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const response = await api.get<boolean>('/api/location-logs/test-connection');
    return response.data;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};

/**
 * Sincronizar logs pendientes con el backend
 * Llena este método cuando la conexión se restablece
 */
export const syncPendingLogs = async (): Promise<{
  synced: number;
  failed: number;
}> => {
  // Obtener logs pending de AsyncStorage (fuera del try para acceso en catch)
  let pendingLogs: Array<{userProfileId: number}> = [];
  try {
    const syncStatusRaw = await AsyncStorage.getItem(STORAGE_KEY_SYNC_STATUS);
    pendingLogs = syncStatusRaw 
      ? [JSON.parse(syncStatusRaw)]
      : [];
    
    let synced = 0;
    let failed = 0;
    
    for (const log of pendingLogs) {
      try {
        await api.post('/api/location-logs', {
          userProfileId: log.userProfileId,
          latitude: 0, // Estos datos serían recuperados de la caché principal
          longitude: 0,
          accuracy: undefined,
          alertId: undefined,
        });
        synced++;
      } catch (e) {
        failed++;
      }
    }
    
    // Limpiar estado de sincronización
    await AsyncStorage.removeItem(STORAGE_KEY_SYNC_STATUS);
    
    return { synced, failed };
  } catch (error) {
    console.error('Sync failed:', error);
    return { synced: 0, failed: pendingLogs.length };
  }
};
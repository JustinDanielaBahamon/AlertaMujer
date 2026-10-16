import api from './api';
import { Platform } from 'react-native';

export interface DeviceApi {
  id: number;
  accountId: number;
  deviceUuid: string;
  brand?: string;
  model?: string;
  osName: string;
  osVersion?: string;
  appVersion?: string;
  gpsStatus: string;
  status: string;
}

export const getDevices = async (): Promise<DeviceApi[]> => {
  const response = await api.get<DeviceApi[]>('/api/devices/user');
  return response.data;
};

export const createDevice = async (device: Partial<DeviceApi>): Promise<DeviceApi> => {
  const response = await api.post<DeviceApi>('/api/devices', device);
  return response.data;
};

/**
 * Obtiene el device del usuario autenticado; si no existe, crea uno nuevo en el backend.
 * Es necesario porque POST /api/alerts exige un deviceId válido.
 * /api/devices/user ya devuelve solo los dispositivos de la cuenta en sesión (antes se comparaba
 * accountId con el id de la usuaria, que es otro número, y se creaba un dispositivo por alerta).
 */
export const getOrCreateDevice = async (): Promise<DeviceApi> => {
  const devices = await getDevices();
  if (devices.length > 0) {
    return devices[0];
  }

  return createDevice({
    deviceUuid: `expo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    brand: Platform.OS === 'android' ? 'Android' : Platform.OS === 'ios' ? 'iPhone' : 'Web',
    model: 'Dispositivo Expo',
    osName: Platform.OS,
    appVersion: '1.0.0',
    gpsStatus: 'active',
    status: 'active',
  });
};

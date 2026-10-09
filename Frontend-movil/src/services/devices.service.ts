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
 */
export const getOrCreateDevice = async (accountId: number): Promise<DeviceApi> => {
  const devices = await getDevices();
  const existente = devices.find((d) => d.accountId === accountId);
  if (existente) {
    return existente;
  }

  return createDevice({
    accountId,
    deviceUuid: `expo-${accountId}-${Date.now()}`,
    brand: Platform.OS === 'android' ? 'Android' : Platform.OS === 'ios' ? 'iPhone' : 'Web',
    model: 'Dispositivo Expo',
    osName: Platform.OS,
    appVersion: '1.0.0',
    gpsStatus: 'active',
    status: 'active',
  });
};

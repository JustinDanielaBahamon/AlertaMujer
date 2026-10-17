import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';

export interface DeviceApi {
  id: number;
  accountId: number;
  deviceUuid: string;
  brand?: string;
  model?: string;
  deviceName?: string;
  osName: string;
  osVersion?: string;
  appVersion?: string;
  gpsStatus: string;
  status: string;
}

// Identificador de esta instalación de la app para cada cuenta: distingue los celulares de una
// cuenta y, como device_uuid es único en la base, cada cuenta que entre en el celular tiene el suyo.
const CLAVE_UUID = '@alerta_mujer:device_uuid';
const CLAVE_SESION = '@alerta_mujer:auth'; // la misma de AuthContext

async function claveUuid(): Promise<string> {
  try {
    const raw = await AsyncStorage.getItem(CLAVE_SESION);
    const id = raw ? JSON.parse(raw)?.user?.id : null;
    return id != null ? `${CLAVE_UUID}:${id}` : CLAVE_UUID;
  } catch {
    return CLAVE_UUID;
  }
}
// Así registraban el celular las versiones anteriores (sin datos reales)
const MODELO_ANTIGUO = 'Dispositivo Expo';

export const getDevices = async (): Promise<DeviceApi[]> => {
  const response = await api.get<DeviceApi[]>('/api/devices/user');
  return response.data;
};

export const createDevice = async (device: Partial<DeviceApi>): Promise<DeviceApi> => {
  const response = await api.post<DeviceApi>('/api/devices', device);
  return response.data;
};

/** Datos reales del celular (marca, modelo, nombre que le puso la usuaria, versiones). */
export function datosDelCelular(): Partial<DeviceApi> {
  return {
    brand: Device.brand ?? Device.manufacturer ?? undefined,
    model: Device.modelName ?? undefined,
    deviceName: Device.deviceName ?? undefined,
    osName: Platform.OS,
    osVersion: Device.osVersion ?? undefined,
    appVersion: Application.nativeApplicationVersion ?? undefined,
  };
}

const nuevoUuid = () => `${Platform.OS}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

let enCurso: Promise<DeviceApi> | null = null;
let actualizadoEnEstaSesion = false;

/**
 * El dispositivo de esta instalación; si no existe en el backend, lo crea. Una vez por sesión le
 * envía los datos actuales del celular y la hora de conexión.
 * Necesario porque POST /api/alerts exige un deviceId válido y el push se guarda por dispositivo.
 */
export const getOrCreateDevice = (): Promise<DeviceApi> => {
  enCurso ??= obtener().finally(() => {
    enCurso = null;
  });
  return enCurso;
};

async function obtener(): Promise<DeviceApi> {
  const clave = await claveUuid();
  const [devices, guardado] = await Promise.all([getDevices(), AsyncStorage.getItem(clave)]);
  const datos = datosDelCelular();

  let device = guardado ? devices.find((d) => d.deviceUuid === guardado) : undefined;
  if (!device && !guardado) {
    // Instalación anterior a este cambio: se queda con el registro antiguo en vez de duplicarlo
    device = devices.find((d) => d.model === MODELO_ANTIGUO);
  }

  if (!device) {
    device = await createDevice({
      ...datos,
      deviceUuid: guardado ?? nuevoUuid(),
      gpsStatus: 'unknown',
      status: 'active',
    });
    actualizadoEnEstaSesion = true;
  }
  if (device.deviceUuid !== guardado) await AsyncStorage.setItem(clave, device.deviceUuid);

  if (!actualizadoEnEstaSesion) {
    actualizadoEnEstaSesion = true;
    try {
      device = (await api.put<DeviceApi>(`/api/devices/${device.id}/info`, datos)).data;
    } catch {
      // Si falla, el dispositivo sigue sirviendo para las alertas
    }
  }
  return device;
}

/** Al cerrar sesión: la próxima cuenta vuelve a informar los datos del celular. */
export function olvidarSesionDispositivo(): void {
  actualizadoEnEstaSesion = false;
}

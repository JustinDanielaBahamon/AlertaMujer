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
const UUID_KEY = '@alerta_mujer:device_uuid';
const SESSION_KEY = '@alerta_mujer:auth'; // la misma de AuthContext

async function signedInUser(): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw)?.user?.id ?? null) : null;
  } catch {
    return null;
  }
}

async function uuidKey(): Promise<string> {
  const id = await signedInUser();
  return id != null ? `${UUID_KEY}:${id}` : UUID_KEY;
}
// Así registraban el celular las versiones anteriores (sin datos reales)
const OLD_MODEL = 'Dispositivo Expo';

export const getDevices = async (): Promise<DeviceApi[]> => {
  const response = await api.get<DeviceApi[]>('/api/devices/user');
  return response.data;
};

export const createDevice = async (device: Partial<DeviceApi>): Promise<DeviceApi> => {
  const response = await api.post<DeviceApi>('/api/devices', device);
  return response.data;
};

/** Datos reales del celular (marca, modelo, nombre que le puso la usuaria, versiones). */
export function phoneData(): Partial<DeviceApi> {
  return {
    brand: Device.brand ?? Device.manufacturer ?? undefined,
    model: Device.modelName ?? undefined,
    deviceName: Device.deviceName ?? undefined,
    osName: Platform.OS,
    osVersion: Device.osVersion ?? undefined,
    appVersion: Application.nativeApplicationVersion ?? undefined,
  };
}

/**
 * Identificador de este celular para esta cuenta. En Android se basa en el ANDROID_ID, que no cambia
 * al reinstalar la app ni al borrar sus datos: así el mismo celular no se registra dos veces. Lleva
 * el id de la cuenta porque device_uuid es único en la base y varias cuentas pueden usar el celular.
 */
function stableUuid(userId: number | null): string {
  let base: string | null = null;
  try {
    base = Platform.OS === "android" ? Application.getAndroidId() : null;
  } catch {
    base = null;
  }
  if (!base) return `${Platform.OS}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${Platform.OS}-${base}${userId != null ? `-${userId}` : ""}`;
}

let inProgress: Promise<DeviceApi> | null = null;
// Id del dispositivo de esta instalación, una vez conocido (va con cada ubicación que se envía)
let currentId: number | null = null;

/** Id de este celular en el backend, si ya se obtuvo en esta sesión. */
export function currentDeviceId(): number | null {
  return currentId;
}
let updatedThisSession = false;

/**
 * El dispositivo de esta instalación; si no existe en el backend, lo crea. Una vez por sesión le
 * envía los datos actuales del celular y la hora de conexión.
 * Necesario porque POST /api/alerts exige un deviceId válido y el push se guarda por dispositivo.
 */
export const getOrCreateDevice = (): Promise<DeviceApi> => {
  inProgress ??= get().finally(() => {
    inProgress = null;
  });
  return inProgress;
};

async function get(): Promise<DeviceApi> {
  const key = await uuidKey();
  const [devices, savedItem] = await Promise.all([getDevices(), AsyncStorage.getItem(key)]);
  const data = phoneData();

  const stable = stableUuid(await signedInUser());
  let device =
    (savedItem ? devices.find((d) => d.deviceUuid === savedItem) : undefined) ??
    devices.find((d) => d.deviceUuid === stable);
  if (!device && !savedItem) {
    // Instalación anterior a este cambio: se queda con el registro antiguo en vez de duplicarlo
    device = devices.find((d) => d.model === OLD_MODEL);
  }

  if (!device) {
    device = await createDevice({
      ...data,
      deviceUuid: stable,
      gpsStatus: 'unknown',
      status: 'active',
    });
    updatedThisSession = true;
  }
  if (device.deviceUuid !== savedItem) await AsyncStorage.setItem(key, device.deviceUuid);

  if (!updatedThisSession) {
    updatedThisSession = true;
    try {
      device = (await api.put<DeviceApi>(`/api/devices/${device.id}/info`, data)).data;
    } catch {
      // Si falla, el dispositivo sigue sirviendo para las alertas
    }
  }
  currentId = device.id;
  return device;
}

let lastPermissions: string | null = null;

/**
 * Informa al backend qué permisos tiene el celular (true/false por permiso) para que la usuaria
 * los vea en la web. Solo envía cuando algo cambió; un fallo no afecta a la app.
 */
export async function reportPermissions(permissions: Record<string, boolean>): Promise<void> {
  const json = JSON.stringify(permissions);
  if (json === lastPermissions) return;
  try {
    const device = await getOrCreateDevice();
    await api.put(`/api/devices/${device.id}/info`, { permissions: json });
    lastPermissions = json;
  } catch {
    // Se reintenta en la próxima revisión de permisos
  }
}

/** Al cerrar sesión: la próxima cuenta vuelve a informar los datos del celular. */
export function forgetDeviceSession(): void {
  updatedThisSession = false;
  currentId = null;
  lastPermissions = null;
}

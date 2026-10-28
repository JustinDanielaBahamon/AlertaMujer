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

// Identifier of this app installation for each account: tells apart the phones of an
// account and, since device_uuid is unique in the database, each account signed in on the phone has its own.
const UUID_KEY = '@alerta_mujer:device_uuid';
const SESSION_KEY = '@alerta_mujer:auth'; // the same as AuthContext

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
// This is how previous versions registered the phone (without real data)
const OLD_MODEL = 'Dispositivo Expo';

export const getDevices = async (): Promise<DeviceApi[]> => {
  const response = await api.get<DeviceApi[]>('/api/devices/user');
  return response.data;
};

export const createDevice = async (device: Partial<DeviceApi>): Promise<DeviceApi> => {
  const response = await api.post<DeviceApi>('/api/devices', device);
  return response.data;
};

/** Real phone data (brand, model, the name the user gave it, versions). */
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
 * Identifier of this phone for this account. On Android it is based on ANDROID_ID, which does not change
 * when the app is reinstalled or its data is cleared: so the same phone is not registered twice. It includes
 * the account id because device_uuid is unique in the database and several accounts can use the phone.
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
// Device id of this installation, once known (sent with each location)
let currentId: number | null = null;

/** Id of this phone in the backend, if already obtained in this session. */
export function currentDeviceId(): number | null {
  return currentId;
}
let updatedThisSession = false;

/**
 * The device of this installation; if it does not exist in the backend, it is created. Once per session it
 * sends the current phone data and the connection time.
 * Needed because POST /api/alerts requires a valid deviceId and the push token is stored per device.
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
    // Installation from before this change: it keeps the old record instead of duplicating it
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
      // If it fails, the device still works for alerts
    }
  }
  currentId = device.id;
  return device;
}

let lastPermissions: string | null = null;

/**
 * Tells the backend which permissions the phone has (true/false per permission) so the user
 * sees them on the web. It only sends when something changed; a failure does not affect the app.
 */
export async function reportPermissions(permissions: Record<string, boolean>): Promise<void> {
  const json = JSON.stringify(permissions);
  if (json === lastPermissions) return;
  try {
    const device = await getOrCreateDevice();
    await api.put(`/api/devices/${device.id}/info`, { permissions: json });
    lastPermissions = json;
  } catch {
    // Retried on the next permission check
  }
}

/** On sign-out: the next account reports the phone data again. */
export function forgetDeviceSession(): void {
  updatedThisSession = false;
  currentId = null;
  lastPermissions = null;
}

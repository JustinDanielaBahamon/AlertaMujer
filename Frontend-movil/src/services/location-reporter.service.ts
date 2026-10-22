import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";
import { currentDeviceId } from "./devices.service";

// Envía la ubicación del celular al backend para que la usuaria (y solo ella) la vea en la web.
// Si no hay conexión, los puntos quedan en una cola corta y se suben en el siguiente envío.

export type ReportPoint = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  alertaId?: number | null;
};

type QueuedPoint = ReportPoint & { recordedAt: string };

const COLA_KEY = "@alerta-mujer:location-queue";
const MAX_EN_COLA = 100;

// El backend guarda LocalDateTime en UTC sin zona
const nowUtc = () => new Date().toISOString().slice(0, 23);

const round = (n: number | null | undefined, decimals: number) =>
  n == null ? null : Math.round(n * 10 ** decimals) / 10 ** decimals;

const send = (p: ReportPoint & { recordedAt?: string }) =>
  api.post("/api/location-logs", {
    latitude: round(p.latitude, 6),
    longitude: round(p.longitude, 6),
    accuracy: round(p.accuracy, 2),
    alertId: p.alertaId ?? null,
    recordedAt: p.recordedAt,
    // Con la cuenta en varios celulares, el backend guarda la ubicación diaria solo del más reciente
    deviceId: currentDeviceId(),
  });

async function leerCola(): Promise<QueuedPoint[]> {
  try {
    const raw = await AsyncStorage.getItem(COLA_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveToQueue(point: QueuedPoint): Promise<void> {
  const cola = await leerCola();
  const newOne = [...cola, point].slice(-MAX_EN_COLA);
  await AsyncStorage.setItem(COLA_KEY, JSON.stringify(newOne));
}

async function emptyQueue(): Promise<void> {
  const cola = await leerCola();
  if (cola.length === 0) return;
  const pendingItems: QueuedPoint[] = [];
  for (const point of cola) {
    try {
      await send(point);
    } catch (error: any) {
      // Sin conexión: se deja para el próximo intento. Rechazo del servidor (4xx): se descarta.
      if (!error?.response) pendingItems.push(point);
    }
  }
  await AsyncStorage.setItem(COLA_KEY, JSON.stringify(pendingItems));
}

export async function reportLocation(point: ReportPoint): Promise<void> {
  const recordedAt = nowUtc();
  try {
    await send({ ...point, recordedAt });
    await emptyQueue();
  } catch (error: any) {
    if (!error?.response) await saveToQueue({ ...point, recordedAt });
  }
}

export async function clearLocationQueue(): Promise<void> {
  await AsyncStorage.removeItem(COLA_KEY);
}

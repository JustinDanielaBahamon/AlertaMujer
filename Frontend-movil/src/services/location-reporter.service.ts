import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";
import { idDispositivoActual } from "./devices.service";

// Envía la ubicación del celular al backend para que la usuaria (y solo ella) la vea en la web.
// Si no hay conexión, los puntos quedan en una cola corta y se suben en el siguiente envío.

export type PuntoReporte = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  alertId?: number | null;
};

type PuntoEnCola = PuntoReporte & { recordedAt: string };

const COLA_KEY = "@alerta-mujer:location-queue";
const MAX_EN_COLA = 100;

// El backend guarda LocalDateTime en UTC sin zona
const ahoraUtc = () => new Date().toISOString().slice(0, 23);

const redondear = (n: number | null | undefined, decimales: number) =>
  n == null ? null : Math.round(n * 10 ** decimales) / 10 ** decimales;

const enviar = (p: PuntoReporte & { recordedAt?: string }) =>
  api.post("/api/location-logs", {
    latitude: redondear(p.latitude, 6),
    longitude: redondear(p.longitude, 6),
    accuracy: redondear(p.accuracy, 2),
    alertId: p.alertId ?? null,
    recordedAt: p.recordedAt,
    // Con la cuenta en varios celulares, el backend guarda la ubicación diaria solo del más reciente
    deviceId: idDispositivoActual(),
  });

async function leerCola(): Promise<PuntoEnCola[]> {
  try {
    const raw = await AsyncStorage.getItem(COLA_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function guardarEnCola(punto: PuntoEnCola): Promise<void> {
  const cola = await leerCola();
  const nueva = [...cola, punto].slice(-MAX_EN_COLA);
  await AsyncStorage.setItem(COLA_KEY, JSON.stringify(nueva));
}

async function vaciarCola(): Promise<void> {
  const cola = await leerCola();
  if (cola.length === 0) return;
  const pendientes: PuntoEnCola[] = [];
  for (const punto of cola) {
    try {
      await enviar(punto);
    } catch (error: any) {
      // Sin conexión: se deja para el próximo intento. Rechazo del servidor (4xx): se descarta.
      if (!error?.response) pendientes.push(punto);
    }
  }
  await AsyncStorage.setItem(COLA_KEY, JSON.stringify(pendientes));
}

export async function reportarUbicacion(punto: PuntoReporte): Promise<void> {
  const recordedAt = ahoraUtc();
  try {
    await enviar({ ...punto, recordedAt });
    await vaciarCola();
  } catch (error: any) {
    if (!error?.response) await guardarEnCola({ ...punto, recordedAt });
  }
}

export async function limpiarColaUbicaciones(): Promise<void> {
  await AsyncStorage.removeItem(COLA_KEY);
}

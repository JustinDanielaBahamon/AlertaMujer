import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { createAlertWithRetries, getAlert } from "../../services/alerts.service";
import { getOrCreateDevice } from "../../services/devices.service";
import { reportLocation } from "../../services/location-reporter.service";
import ShakeSensor from "../../../modules/shake-sensor";

/**
 * Alerta activada al agitar el teléfono sin tener la app en pantalla: se crea directamente en el
 * backend (que avisa a los contactos) y la ubicación se sigue enviando cada 30 s hasta que la
 * usuaria abra la app y la pantalla de alerta activa tome el control. Las esperas son nativas: los
 * setTimeout de JS pueden quedarse quietos con la pantalla apagada.
 */

// Debe coincidir con la clave de AuthContext (no se importa para no cargar React en el servicio)
const SESSION_KEY = "@alerta_mujer:auth";
const INTERVAL_MS = 30 * 1000;
const MAX_MS = 3 * 60 * 60 * 1000; // el backend expira la alerta antes; esto solo evita un bucle eterno

let alertInProgress: number | null = null;

async function currentLocation(): Promise<Location.LocationObject | null> {
  try {
    return await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      ShakeSensor.wait(10000).then(() => null),
    ]);
  } catch {
    return null;
  }
}

async function locationForAlert(): Promise<Location.LocationObject | null> {
  return (await currentLocation()) ?? (await Location.getLastKnownPositionAsync().catch(() => null));
}

const METHODS = {
  agitar: { activationMethod: "suspicious_movement", message: "Alerta SOS activada al agitar el teléfono" },
  encendido: { activationMethod: "power_button", message: "Alerta SOS activada con el botón de encendido" },
} as const;

export async function createShakeAlert(method: keyof typeof METHODS = "agitar"): Promise<number> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  const user = raw ? JSON.parse(raw).user : null;
  if (!user) throw new Error("No hay sesión iniciada");

  const [device, location] = await Promise.all([getOrCreateDevice(), locationForAlert()]);
  // Con reintentos: si la red falla o el servidor está despertando, no se pierde la alerta
  const alert = await createAlertWithRetries({
    userProfileId: user.id,
    deviceId: device.id,
    alertType: "main",
    activationMethod: METHODS[method].activationMethod,
    status: "active",
    message: METHODS[method].message,
    latitude: location?.coords.latitude,
    longitude: location?.coords.longitude,
  });

  alertInProgress = alert.id;
  followLocation(alert.id, Date.now());
  return alert.id;
}

async function followLocation(alertId: number, startTime: number) {
  while (alertInProgress === alertId && Date.now() - startTime <= MAX_MS) {
    await ShakeSensor.wait(INTERVAL_MS);
    if (alertInProgress !== alertId) return;
    // Si la alerta ya terminó (la cerró un contacto o la administración, o venció), se suelta: si no,
    // el servicio la seguiría dando por "en curso" e ignoraría las sacudidas siguientes
    if (!(await stillActive(alertId))) break;
    const u = await currentLocation();
    if (u && alertInProgress === alertId) {
      reportLocation({
        latitude: u.coords.latitude,
        longitude: u.coords.longitude,
        accuracy: u.coords.accuracy,
        alertaId: alertId,
      }).catch(() => {});
    }
  }
  if (alertInProgress === alertId) alertInProgress = null;
}

/** Sin conexión no se sabe: se asume que sigue activa para no dejar de enviar la ubicación. */
async function stillActive(alertId: number): Promise<boolean> {
  try {
    return (await getAlert(alertId)).status === "active";
  } catch {
    return true;
  }
}

/** La pantalla de alerta activa se encarga desde ahora (o la alerta terminó): deja de enviar ubicación. */
export function takeOverAlert(): void {
  alertInProgress = null;
}

export function backgroundAlert(): number | null {
  return alertInProgress;
}

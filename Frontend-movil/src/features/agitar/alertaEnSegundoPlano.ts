import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { createAlert } from "../../services/alerts.service";
import { getOrCreateDevice } from "../../services/devices.service";
import { reportarUbicacion } from "../../services/location-reporter.service";
import SensorSacudidas from "../../../modules/sensor-sacudidas";

/**
 * Alerta activada al agitar el teléfono sin tener la app en pantalla: se crea directamente en el
 * backend (que avisa a los contactos) y la ubicación se sigue enviando cada 30 s hasta que la
 * usuaria abra la app y la pantalla de alerta activa tome el control. Las esperas son nativas: los
 * setTimeout de JS pueden quedarse quietos con la pantalla apagada.
 */

// Debe coincidir con la clave de AuthContext (no se importa para no cargar React en el servicio)
const CLAVE_SESION = "@alerta_mujer:auth";
const INTERVALO_MS = 30 * 1000;
const MAXIMO_MS = 3 * 60 * 60 * 1000; // el backend expira la alerta antes; esto solo evita un bucle eterno

let alertaEnCurso: number | null = null;

async function ubicacionActual(): Promise<Location.LocationObject | null> {
  try {
    return await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      SensorSacudidas.esperar(10000).then(() => null),
    ]);
  } catch {
    return null;
  }
}

async function ubicacionParaLaAlerta(): Promise<Location.LocationObject | null> {
  return (await ubicacionActual()) ?? (await Location.getLastKnownPositionAsync().catch(() => null));
}

export async function crearAlertaPorSacudida(): Promise<number> {
  const raw = await AsyncStorage.getItem(CLAVE_SESION);
  const usuario = raw ? JSON.parse(raw).user : null;
  if (!usuario) throw new Error("No hay sesión iniciada");

  const [device, ubicacion] = await Promise.all([getOrCreateDevice(), ubicacionParaLaAlerta()]);
  const alerta = await createAlert({
    userProfileId: usuario.id,
    deviceId: device.id,
    alertType: "main",
    activationMethod: "suspicious_movement",
    status: "active",
    message: "Alerta SOS activada al agitar el teléfono",
    latitude: ubicacion?.coords.latitude,
    longitude: ubicacion?.coords.longitude,
  });

  alertaEnCurso = alerta.id;
  seguirUbicacion(alerta.id, Date.now());
  return alerta.id;
}

async function seguirUbicacion(alertaId: number, inicio: number) {
  while (alertaEnCurso === alertaId && Date.now() - inicio <= MAXIMO_MS) {
    await SensorSacudidas.esperar(INTERVALO_MS);
    if (alertaEnCurso !== alertaId) return;
    const u = await ubicacionActual();
    if (u && alertaEnCurso === alertaId) {
      reportarUbicacion({
        latitude: u.coords.latitude,
        longitude: u.coords.longitude,
        accuracy: u.coords.accuracy,
        alertId: alertaId,
      }).catch(() => {});
    }
  }
}

/** La pantalla de alerta activa se encarga desde ahora (o la alerta terminó): deja de enviar ubicación. */
export function tomarControlDeLaAlerta(): void {
  alertaEnCurso = null;
}

export function alertaEnSegundoPlano(): number | null {
  return alertaEnCurso;
}

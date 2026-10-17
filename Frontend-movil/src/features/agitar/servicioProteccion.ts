import notifee, {
  AndroidCategory,
  AndroidForegroundServiceType,
  AndroidImportance,
  AndroidVisibility,
  EventType,
  type Event,
} from "@notifee/react-native";
import { AppState, Vibration } from "react-native";
import * as Location from "expo-location";
import SensorSacudidas from "../../../modules/sensor-sacudidas";
import { crearDetectorSacudidas } from "./detectorSacudidas";
import { alertaEnSegundoPlano, crearAlertaPorSacudida } from "./alertaEnSegundoPlano";

/**
 * "Agitar el teléfono": un servicio en primer plano de Android (notificación fija "Protección
 * activa") escucha el acelerómetro aunque la app esté minimizada o la pantalla bloqueada.
 *
 * - App en pantalla: se abre la cuenta regresiva de la app, igual que con el botón SOS.
 * - App en segundo plano: cuenta regresiva de 5 s en una notificación con "Cancelar"; si no se
 *   cancela, la alerta se crea sin desbloquear el teléfono.
 *
 * El acelerómetro es el del módulo nativo sensor-sacudidas: expo-sensors deja de leer en cuanto la
 * app sale de la pantalla. Por lo mismo las esperas son nativas y no setTimeout.
 */

const CANAL_PROTECCION = "proteccion_activa";
const CANAL_AVISO = "agitar_aviso";
const ID_SERVICIO = "proteccion-agitar";
const ID_CUENTA = "agitar-cuenta";
const ID_ENVIADA = "agitar-enviada";
const ACCION_CANCELAR = "cancelar_agitar";
const ACCION_ABRIR = "abrir_alerta_agitar";
const SEGUNDOS_CUENTA = 5;
const INTERVALO_SENSOR_MS = 80;

export type EstadoProteccion = "activa" | "sin_ubicacion" | "sin_sensor";

let activa = false;
let detenerSensor: (() => void) | null = null;
let terminarTarea: (() => void) | null = null;
let cuentaEnCurso: { cancelada: boolean } | null = null;

// --- Sacudida con la app en pantalla: la navegación se suscribe y abre la cuenta regresiva ---
const oyentesEnPantalla = new Set<() => void>();

export function alSacudirEnPantalla(oyente: () => void): () => void {
  oyentesEnPantalla.add(oyente);
  return () => {
    oyentesEnPantalla.delete(oyente);
  };
}

// --- Alerta creada en segundo plano: al tocar la notificación se abre su pantalla ---
let alertaPorAbrir: number | null = null;
const oyentesAbrir = new Set<(alertaId: number) => void>();

export function alAbrirAlertaPorSacudida(oyente: (alertaId: number) => void): () => void {
  oyentesAbrir.add(oyente);
  if (alertaPorAbrir !== null) {
    const id = alertaPorAbrir;
    alertaPorAbrir = null;
    oyente(id);
  }
  return () => {
    oyentesAbrir.delete(oyente);
  };
}

function abrirAlerta(alertaId: number) {
  if (oyentesAbrir.size === 0) {
    alertaPorAbrir = alertaId;
    return;
  }
  oyentesAbrir.forEach((o) => o(alertaId));
}

/** Se registra una sola vez al arrancar (index.ts), antes de montar la app. */
export function registrarServicioProteccion(): void {
  notifee.registerForegroundService(
    () =>
      new Promise<void>((resolver) => {
        terminarTarea = resolver;
        escucharSensor();
      }),
  );
}

function escucharSensor() {
  detenerSensor?.();
  const detectar = crearDetectorSacudidas();
  const sub = SensorSacudidas.addListener("onLectura", ({ x, y, z }) => {
    if (detectar(x, y, z, Date.now())) alSacudir();
  });
  SensorSacudidas.iniciar(INTERVALO_SENSOR_MS);
  detenerSensor = () => {
    SensorSacudidas.detener();
    sub.remove();
  };
}

function alSacudir() {
  if (cuentaEnCurso || alertaEnSegundoPlano() !== null) return;
  if (AppState.currentState === "active" && oyentesEnPantalla.size > 0) {
    oyentesEnPantalla.forEach((o) => o());
    return;
  }
  cuentaRegresiva();
}

async function crearCanales() {
  await notifee.createChannel({
    id: CANAL_PROTECCION,
    name: "Protección activa",
    description: "Aviso fijo mientras la activación por sacudida está encendida",
    importance: AndroidImportance.LOW,
  });
  await notifee.createChannel({
    id: CANAL_AVISO,
    name: "Alerta por sacudida",
    description: "Cuenta regresiva y confirmación cuando agitas el teléfono",
    importance: AndroidImportance.HIGH,
    vibration: true,
    visibility: AndroidVisibility.PUBLIC,
  });
}

async function cuentaRegresiva() {
  const cuenta = { cancelada: false };
  cuentaEnCurso = cuenta;
  try {
    for (let s = SEGUNDOS_CUENTA; s > 0; s--) {
      if (cuenta.cancelada) return;
      Vibration.vibrate(300);
      await notifee.displayNotification({
        id: ID_CUENTA,
        title: `🚨 Se enviará una alerta en ${s} s`,
        body: "Agitaste el teléfono. Toca Cancelar si fue un error.",
        android: {
          channelId: CANAL_AVISO,
          category: AndroidCategory.ALARM,
          importance: AndroidImportance.HIGH,
          visibility: AndroidVisibility.PUBLIC,
          onlyAlertOnce: true,
          ongoing: true,
          autoCancel: false,
          actions: [{ title: "Cancelar", pressAction: { id: ACCION_CANCELAR } }],
        },
      });
      await SensorSacudidas.esperar(1000);
    }
    if (cuenta.cancelada) return;
    await notifee.cancelNotification(ID_CUENTA);

    try {
      const alertaId = await crearAlertaPorSacudida();
      Vibration.vibrate([0, 600, 200, 600]);
      await notifee.displayNotification({
        id: ID_ENVIADA,
        title: "🚨 Alerta enviada",
        body: "Tus contactos recibieron tu ubicación. Toca para ver la alerta.",
        data: { alertaId: String(alertaId) },
        android: {
          channelId: CANAL_AVISO,
          visibility: AndroidVisibility.PUBLIC,
          pressAction: { id: ACCION_ABRIR, launchActivity: "default" },
        },
      });
    } catch {
      await notifee.displayNotification({
        id: ID_ENVIADA,
        title: "No se pudo enviar la alerta",
        body: "Abre la app y usa el botón SOS, o llama a la línea de emergencias.",
        android: { channelId: CANAL_AVISO, pressAction: { id: "default", launchActivity: "default" } },
      });
    }
  } finally {
    if (cuentaEnCurso === cuenta) cuentaEnCurso = null;
  }
}

/**
 * Atiende los toques en las notificaciones de este servicio (Cancelar y "Alerta enviada").
 * Devuelve true si el evento era suyo. Se llama desde los manejadores de Notifee de primer y
 * segundo plano.
 */
export function manejarEventoProteccion({ type, detail }: Event): boolean {
  if (type !== EventType.ACTION_PRESS && type !== EventType.PRESS) return false;
  const accion = detail.pressAction?.id;
  if (accion === ACCION_CANCELAR) {
    if (cuentaEnCurso) cuentaEnCurso.cancelada = true;
    notifee.cancelNotification(ID_CUENTA);
    return true;
  }
  if (accion === ACCION_ABRIR || detail.notification?.id === ID_ENVIADA) {
    const id = Number(detail.notification?.data?.alertaId);
    if (id) abrirAlerta(id);
    notifee.cancelNotification(ID_ENVIADA);
    return true;
  }
  return false;
}

export async function iniciarProteccion(): Promise<EstadoProteccion> {
  if (!SensorSacudidas.disponible()) return "sin_sensor";
  // El servicio es de tipo ubicación (para poder enviarla con la pantalla bloqueada) y Android
  // exige el permiso antes de iniciarlo
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") return "sin_ubicacion";
  if (activa) return "activa";

  await notifee.requestPermission();
  await crearCanales();
  await notifee.displayNotification({
    id: ID_SERVICIO,
    title: "Protección activa",
    body: "Agita el teléfono con fuerza para enviar una alerta a tus contactos.",
    android: {
      channelId: CANAL_PROTECCION,
      asForegroundService: true,
      foregroundServiceTypes: [AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_LOCATION],
      ongoing: true,
      pressAction: { id: "default", launchActivity: "default" },
    },
  });
  activa = true;
  return "activa";
}

export async function detenerProteccion(): Promise<void> {
  if (!activa) return;
  activa = false;
  detenerSensor?.();
  detenerSensor = null;
  if (cuentaEnCurso) cuentaEnCurso.cancelada = true;
  await notifee.cancelNotification(ID_CUENTA);
  await notifee.stopForegroundService();
  terminarTarea?.();
  terminarTarea = null;
}

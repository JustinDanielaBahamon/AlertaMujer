import notifee, {
  AndroidCategory,
  AndroidForegroundServiceType,
  AndroidImportance,
  AndroidVisibility,
  EventType,
  type Event,
} from "@notifee/react-native";
import { AppState, Vibration } from "react-native";
import { estiloGrande } from "../../notifications/estiloNotificacion";
import SensorSacudidas from "../../../modules/sensor-sacudidas";
import { crearDetectorSacudidas } from "./detectorSacudidas";
import { crearDetectorBotonEncendido } from "./detectorBotonEncendido";
import { alertaEnSegundoPlano, crearAlertaPorSacudida } from "./alertaEnSegundoPlano";
import { permisoNotificaciones, permisoUbicacion } from "../../services/permisosSeguros";

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
 *
 * El mismo servicio atiende el botón de encendido (4 pulsaciones rápidas, también con la pantalla
 * apagada) si la usuaria activó ese método.
 */

/** Método con el que se pidió la alerta. */
export type MetodoProteccion = "agitar" | "encendido";
export type OpcionesProteccion = { agitar: boolean; encendido: boolean };

const CANAL_PROTECCION = "proteccion_activa";
const CANAL_AVISO = "agitar_aviso";
const ID_SERVICIO = "proteccion-agitar";
const ID_CUENTA = "agitar-cuenta";
const ID_ENVIADA = "agitar-enviada";
const ACCION_CANCELAR = "cancelar_agitar";
const ACCION_ABRIR = "abrir_alerta_agitar";
const SEGUNDOS_CUENTA = 5;
// Cada 40 ms: con menos lecturas un hachazo se confunde con varios picos sueltos
const INTERVALO_SENSOR_MS = 40;

export type EstadoProteccion = "activa" | "sin_ubicacion" | "sin_sensor";

let activa = false;
let detenerSensor: (() => void) | null = null;
let detenerBoton: (() => void) | null = null;
let opciones: OpcionesProteccion = { agitar: true, encendido: false };
let terminarTarea: (() => void) | null = null;
let cuentaEnCurso: { cancelada: boolean } | null = null;

// --- Sacudida con la app en pantalla: la navegación se suscribe y abre la cuenta regresiva ---
const oyentesEnPantalla = new Set<(metodo: MetodoProteccion) => void>();

export function alSacudirEnPantalla(oyente: (metodo: MetodoProteccion) => void): () => void {
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
        configurarDetectores();
      }),
  );
}

/** Enciende solo lo que la usuaria activó: acelerómetro, botón de encendido o ambos. */
function configurarDetectores() {
  detenerSensor?.();
  detenerSensor = null;
  detenerBoton?.();
  detenerBoton = null;
  if (opciones.agitar) escucharSensor();
  if (opciones.encendido) escucharBotonEncendido();
}

function escucharBotonEncendido() {
  const detectar = crearDetectorBotonEncendido();
  const sub = SensorSacudidas.addListener("onPantalla", () => {
    if (detectar(Date.now())) alActivar("encendido");
  });
  SensorSacudidas.iniciarBotonEncendido();
  detenerBoton = () => {
    SensorSacudidas.detenerBotonEncendido();
    sub.remove();
  };
}

function escucharSensor() {
  const detectar = crearDetectorSacudidas();
  const sub = SensorSacudidas.addListener("onLectura", ({ x, y, z }) => {
    if (detectar(x, y, z, Date.now())) alActivar("agitar");
  });
  SensorSacudidas.iniciar(INTERVALO_SENSOR_MS);
  detenerSensor = () => {
    SensorSacudidas.detener();
    sub.remove();
  };
}

function alActivar(metodo: MetodoProteccion) {
  if (cuentaEnCurso || alertaEnSegundoPlano() !== null) return;
  if (AppState.currentState === "active" && oyentesEnPantalla.size > 0) {
    oyentesEnPantalla.forEach((o) => o(metodo));
    return;
  }
  cuentaRegresiva(metodo);
}

const MOTIVO: Record<MetodoProteccion, string> = {
  agitar: "Agitaste el teléfono",
  encendido: "Presionaste 4 veces el botón de encendido",
};

async function crearCanales() {
  await notifee.createChannel({
    id: CANAL_PROTECCION,
    name: "Protección activa",
    description: "Aviso fijo mientras la activación por sacudida está encendida",
    importance: AndroidImportance.LOW,
  });
  await notifee.createChannel({
    id: CANAL_AVISO,
    name: "Alerta rápida",
    description: "Cuenta regresiva y confirmación al agitar el teléfono o presionar el botón de encendido",
    importance: AndroidImportance.HIGH,
    vibration: true,
    visibility: AndroidVisibility.PUBLIC,
  });
}

async function cuentaRegresiva(metodo: MetodoProteccion) {
  const cuenta = { cancelada: false };
  cuentaEnCurso = cuenta;
  try {
    for (let s = SEGUNDOS_CUENTA; s > 0; s--) {
      if (cuenta.cancelada) return;
      Vibration.vibrate(300);
      await notifee.displayNotification({
        id: ID_CUENTA,
        title: `🚨 Se enviará una alerta en ${s} s`,
        body: `${MOTIVO[metodo]}. Toca Cancelar si fue un error.`,
        android: {
          channelId: CANAL_AVISO,
          ...estiloGrande(`${MOTIVO[metodo]}. Toca Cancelar si fue un error.`),
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
      const alertaId = await crearAlertaPorSacudida(metodo);
      Vibration.vibrate([0, 600, 200, 600]);
      await notifee.displayNotification({
        id: ID_ENVIADA,
        title: "🚨 Alerta enviada",
        body: "Tus contactos recibieron tu ubicación. Toca para ver la alerta.",
        data: { alertaId: String(alertaId) },
        android: {
          channelId: CANAL_AVISO,
          ...estiloGrande("Tus contactos recibieron tu ubicación. Toca para ver la alerta, escribirles y ver lo que se graba."),
          visibility: AndroidVisibility.PUBLIC,
          pressAction: { id: ACCION_ABRIR, launchActivity: "default" },
        },
      });
    } catch {
      await notifee.displayNotification({
        id: ID_ENVIADA,
        title: "No se pudo enviar la alerta",
        body: "Abre la app y usa el botón SOS, o llama a la línea de emergencias.",
        android: {
          channelId: CANAL_AVISO,
          ...estiloGrande("Abre la app y usa el botón SOS, o llama a la línea de emergencias."),
          pressAction: { id: "default", launchActivity: "default" },
        },
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

function textoProteccion(): string {
  if (opciones.agitar && opciones.encendido) {
    return "Agita el teléfono con fuerza o presiona 4 veces el botón de encendido para enviar una alerta a tus contactos.";
  }
  if (opciones.encendido) return "Presiona 4 veces rápido el botón de encendido para enviar una alerta a tus contactos.";
  return "Agita el teléfono con fuerza para enviar una alerta a tus contactos.";
}

/**
 * pedirPermisos = true solo cuando la usuaria enciende un método (no al abrir la app). Si ya
 * estaba activa con otros métodos, solo cambia lo que se escucha.
 */
export async function iniciarProteccion(
  pedirPermisos = false,
  nuevas: OpcionesProteccion = { agitar: true, encendido: false },
): Promise<EstadoProteccion> {
  if (nuevas.agitar && !SensorSacudidas.disponible()) return "sin_sensor";
  // El servicio es de tipo ubicación (para poder enviarla con la pantalla bloqueada) y Android
  // exige el permiso antes de iniciarlo
  if (!(await permisoUbicacion(pedirPermisos))) return "sin_ubicacion";
  const cambiaron = opciones.agitar !== nuevas.agitar || opciones.encendido !== nuevas.encendido;
  opciones = nuevas;
  if (activa && !cambiaron) return "activa";
  if (activa) configurarDetectores();

  await permisoNotificaciones(pedirPermisos);
  await crearCanales();
  // Mostrar la notificación del servicio otra vez la actualiza (y la primera vez lo arranca)
  await notifee.displayNotification({
    id: ID_SERVICIO,
    title: "Protección activa",
    body: textoProteccion(),
    android: {
      channelId: CANAL_PROTECCION,
      ...estiloGrande(textoProteccion()),
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
  detenerBoton?.();
  detenerBoton = null;
  if (cuentaEnCurso) cuentaEnCurso.cancelada = true;
  await notifee.cancelNotification(ID_CUENTA);
  await notifee.stopForegroundService();
  terminarTarea?.();
  terminarTarea = null;
}

import AsyncStorage from "@react-native-async-storage/async-storage";

import SensorSacudidas from "../../../modules/sensor-sacudidas";
import { subirEvidencia, type TipoGrabacion } from "../../services/evidencias.service";

/**
 * Cola de trozos grabados por subir. Se guarda en el teléfono para que, si no hay señal o la app
 * se cierra, los archivos se suban después en vez de perderse. Sube de a uno y reintenta.
 */
export type TrozoPendiente = {
  uri: string;
  alertaId: number;
  tipo: TipoGrabacion;
};
export type EstadoSubidas = {
  subidos: number;
  pendientes: number;
  subiendo: boolean;
};

const CLAVE = "alertamujer_evidencias_pendientes";
const REINTENTO_MS = 15000;

let cola: TrozoPendiente[] | null = null;
let subidos = 0;
let subiendo = false;
let reintento: ReturnType<typeof setTimeout> | null = null;
const oyentes = new Set<(e: EstadoSubidas) => void>();

let cargando: Promise<TrozoPendiente[]> | null = null;

// Una sola lectura compartida: dos trozos que llegan juntos no deben crear dos colas distintas
function cargar(): Promise<TrozoPendiente[]> {
  if (cola) return Promise.resolve(cola);
  cargando ??= AsyncStorage.getItem(CLAVE)
    .then((crudo) => (crudo ? (JSON.parse(crudo) as TrozoPendiente[]) : []))
    .catch(() => [] as TrozoPendiente[])
    .then((leida) => (cola ??= leida));
  return cargando;
}

async function guardar() {
  try {
    await AsyncStorage.setItem(CLAVE, JSON.stringify(cola ?? []));
  } catch (e) {
    console.warn("No se pudo guardar la cola de evidencias:", e);
  }
}

function avisar() {
  const estado = estadoSubidas();
  oyentes.forEach((o) => o(estado));
}

export function estadoSubidas(): EstadoSubidas {
  return { subidos, pendientes: cola?.length ?? 0, subiendo };
}

export function escucharSubidas(oyente: (e: EstadoSubidas) => void): () => void {
  oyentes.add(oyente);
  oyente(estadoSubidas());
  return () => {
    oyentes.delete(oyente);
  };
}

/** Agrega un archivo terminado y empieza a subirlo. */
export async function encolarTrozo(trozo: TrozoPendiente): Promise<void> {
  const actual = await cargar();
  if (!actual.some((t) => t.uri === trozo.uri)) {
    actual.push(trozo);
    await guardar();
  }
  avisar();
  void procesarCola();
}

/** Errores que no se arreglan reintentando (archivo rechazado, alerta ajena o borrada). */
function esDefinitivo(error: any): boolean {
  const estado = error?.response?.status;
  return typeof estado === "number" && estado >= 400 && estado < 500 && ![401, 408, 429].includes(estado);
}

export async function procesarCola(): Promise<void> {
  // La marca va antes de cualquier await: dos llamadas a la vez subirían el mismo archivo
  if (subiendo) return;
  subiendo = true;
  try {
    const actual = await cargar();
    if (actual.length === 0) return;
    if (reintento) {
      clearTimeout(reintento);
      reintento = null;
    }
    avisar();
    while (actual.length > 0) {
      const trozo = actual[0];
      try {
        await subirEvidencia(trozo.alertaId, trozo.uri, trozo.tipo);
        subidos++;
      } catch (e) {
        if (!esDefinitivo(e)) {
          // Sin señal o servidor dormido: se reintenta en un rato sin perder el archivo
          reintento = setTimeout(() => void procesarCola(), REINTENTO_MS);
          return;
        }
        console.warn("Evidencia rechazada por el servidor, se descarta:", (e as any)?.response?.status);
      }
      actual.shift();
      await guardar();
      try {
        SensorSacudidas.borrarArchivo(trozo.uri);
      } catch {
        // Si no se puede borrar, Android limpia el caché por su cuenta
      }
      avisar();
    }
  } finally {
    subiendo = false;
    avisar();
  }
}

// Los trozos de audio llegan del servicio nativo, también después de salir de la pantalla de la
// alerta (el último trozo se cierra al detener): por eso se escuchan aquí y no en la pantalla.
let alertaDelAudio: number | null = null;
let escuchaAudio: { remove: () => void } | null = null;

/** Los próximos trozos de audio (y los que quedaron sin subir) son de esta alerta. */
export function asignarAlertaDelAudio(alertaId: number): void {
  alertaDelAudio = alertaId;
  escuchaAudio ??= SensorSacudidas.addListener("onTrozoAudio", ({ uri }) => {
    if (alertaDelAudio !== null) void encolarTrozo({ uri, alertaId: alertaDelAudio, tipo: "audio" });
  });
  // Audios que se grabaron pero no llegaron a la cola (la app se cerró a mitad de la alerta)
  for (const uri of SensorSacudidas.audiosPendientes()) {
    void encolarTrozo({ uri, alertaId, tipo: "audio" });
  }
}

/** Solo para pruebas. */
export function _reiniciarCola() {
  cola = null;
  cargando = null;
  subidos = 0;
  subiendo = false;
  if (reintento) clearTimeout(reintento);
  reintento = null;
  oyentes.clear();
  escuchaAudio?.remove();
  escuchaAudio = null;
  alertaDelAudio = null;
}

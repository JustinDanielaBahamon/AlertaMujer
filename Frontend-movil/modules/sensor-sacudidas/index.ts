import { NativeModule, requireNativeModule } from "expo";

export type Reading = { x: number; y: number; z: number };

/** ApplicationExitInfo: motivo (REASON_*), importancia del proceso al morir y descripción. */
export type CierreApp = { timestamp: number; motivo: number; importancia: number; descripcion: string };

type Eventos = {
  onLectura: (reading: Reading) => void;
  /** Terminó un trozo de audio de la evidencia (archivo listo para subir). */
  onTrozoAudio: (chunk: { uri: string; duracionMs: number }) => void;
  onErrorGrabacion: (error: { mensaje: string }) => void;
  /** La pantalla se prendió o se apagó (cada pulsación del botón de encendido). No llega en llamadas. */
  onPantalla: (change: { encendida: boolean }) => void;
};

declare class SensorSacudidasModule extends NativeModule<Eventos> {
  /** El teléfono tiene acelerómetro. */
  disponible(): boolean;
  /** Empieza a emitir onLectura (en g) cada intervaloMs, también en segundo plano. */
  iniciar(intervalMs: number): boolean;
  detener(): void;
  /** Empieza a emitir onPantalla con cada pulsación del botón de encendido. */
  iniciarBotonEncendido(): void;
  detenerBotonEncendido(): void;
  /** Espera con un temporizador nativo (sigue corriendo con la pantalla apagada). */
  esperar(ms: number): Promise<void>;
  ignoraOptimizacionBateria(): boolean;
  /** false si ya tenía el permiso o no se pudo: se abrió la página de la app en Ajustes. */
  pedirIgnorarOptimizacionBateria(): boolean;
  fabricante(): string;
  /** Cierres de la app registrados por Android (11+) desde desdeMs. */
  motivosDeCierre(sinceMs: number): CierreApp[];
  puedePantallaCompleta(): boolean;
  pedirPantallaCompleta(): void;
  tieneAjusteInicioAutomatico(): boolean;
  /** Abre el "inicio automático" de la marca; false si no existe y se abrió la info de la app. */
  abrirInicioAutomatico(): boolean;
  /**
   * Servicio de micrófono para la evidencia de una alerta: graba en trozos y sigue con la pantalla
   * apagada. Solo se puede encender con la app abierta; false si falta el permiso de micrófono.
   * grabar=false lo deja encendido sin usar el micrófono (mientras la cámara graba video).
   */
  iniciarGrabacionAudio(secondsPerChunk: number, record: boolean): boolean;
  pausarGrabacionAudio(): void;
  reanudarGrabacionAudio(): void;
  detenerGrabacionAudio(): void;
  grabacionAudioActiva(): boolean;
  /** Trozos de audio terminados que siguen en el teléfono. */
  audiosPendientes(): string[];
  /** Borra un archivo de evidencia del caché de la app (ya subido). */
  borrarArchivo(uri: string): boolean;
}

/** Acelerómetro para "agitar el teléfono" que no se apaga al minimizar la app (solo Android). */
export default requireNativeModule<SensorSacudidasModule>("SensorSacudidas");

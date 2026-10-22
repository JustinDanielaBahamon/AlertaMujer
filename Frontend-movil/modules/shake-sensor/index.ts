import { NativeModule, requireNativeModule } from "expo";

export type Reading = { x: number; y: number; z: number };

/** ApplicationExitInfo: motivo (REASON_*), importancia del proceso al morir y descripción. */
export type AppExit = { timestamp: number; reason: number; importance: number; description: string };

type Events = {
  onReading: (reading: Reading) => void;
  /** Terminó un trozo de audio de la evidencia (archivo listo para subir). */
  onAudioChunk: (chunk: { uri: string; durationMs: number }) => void;
  onRecordingError: (error: { message: string }) => void;
  /** La pantalla se prendió o se apagó (cada pulsación del botón de encendido). No llega en llamadas. */
  onScreenChange: (change: { screenOn: boolean }) => void;
};

declare class ShakeSensorModule extends NativeModule<Events> {
  /** El teléfono tiene acelerómetro. */
  available(): boolean;
  /** Empieza a emitir onLectura (en g) cada intervaloMs, también en segundo plano. */
  start(intervalMs: number): boolean;
  stop(): void;
  /** Empieza a emitir onPantalla con cada pulsación del botón de encendido. */
  startPowerButton(): void;
  stopPowerButton(): void;
  /** Espera con un temporizador nativo (sigue corriendo con la pantalla apagada). */
  wait(ms: number): Promise<void>;
  ignoresBatteryOptimization(): boolean;
  /** false si ya tenía el permiso o no se pudo: se abrió la página de la app en Ajustes. */
  requestIgnoreBatteryOptimization(): boolean;
  manufacturer(): string;
  /** Cierres de la app registrados por Android (11+) desde desdeMs. */
  exitReasons(sinceMs: number): AppExit[];
  canUseFullScreen(): boolean;
  requestFullScreen(): void;
  hasAutoStartSetting(): boolean;
  /** Abre el "inicio automático" de la marca; false si no existe y se abrió la info de la app. */
  openAutoStart(): boolean;
  /**
   * Servicio de micrófono para la evidencia de una alerta: graba en trozos y sigue con la pantalla
   * apagada. Solo se puede encender con la app abierta; false si falta el permiso de micrófono.
   * grabar=false lo deja encendido sin usar el micrófono (mientras la cámara graba video).
   */
  startAudioRecording(secondsPerChunk: number, record: boolean): boolean;
  pauseAudioRecording(): void;
  resumeAudioRecording(): void;
  stopAudioRecording(): void;
  isAudioRecording(): boolean;
  /** Trozos de audio terminados que siguen en el teléfono. */
  pendingAudios(): string[];
  /** Borra un archivo de evidencia del caché de la app (ya subido). */
  deleteFile(uri: string): boolean;
}

/** Acelerómetro para "agitar el teléfono" que no se apaga al minimizar la app (solo Android). */
export default requireNativeModule<ShakeSensorModule>("ShakeSensor");

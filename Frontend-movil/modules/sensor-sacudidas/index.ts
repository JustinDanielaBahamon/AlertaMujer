import { NativeModule, requireNativeModule } from "expo";

export type Lectura = { x: number; y: number; z: number };

/** ApplicationExitInfo: motivo (REASON_*), importancia del proceso al morir y descripción. */
export type CierreApp = { timestamp: number; motivo: number; importancia: number; descripcion: string };

type Eventos = {
  onLectura: (lectura: Lectura) => void;
};

declare class SensorSacudidasModule extends NativeModule<Eventos> {
  /** El teléfono tiene acelerómetro. */
  disponible(): boolean;
  /** Empieza a emitir onLectura (en g) cada intervaloMs, también en segundo plano. */
  iniciar(intervaloMs: number): boolean;
  detener(): void;
  /** Espera con un temporizador nativo (sigue corriendo con la pantalla apagada). */
  esperar(ms: number): Promise<void>;
  ignoraOptimizacionBateria(): boolean;
  pedirIgnorarOptimizacionBateria(): void;
  fabricante(): string;
  /** Cierres de la app registrados por Android (11+) desde desdeMs. */
  motivosDeCierre(desdeMs: number): CierreApp[];
  puedePantallaCompleta(): boolean;
  pedirPantallaCompleta(): void;
  tieneAjusteInicioAutomatico(): boolean;
  /** Abre el "inicio automático" de la marca; false si no existe y se abrió la info de la app. */
  abrirInicioAutomatico(): boolean;
}

/** Acelerómetro para "agitar el teléfono" que no se apaga al minimizar la app (solo Android). */
export default requireNativeModule<SensorSacudidasModule>("SensorSacudidas");

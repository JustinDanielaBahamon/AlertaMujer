import { NativeModule, requireNativeModule } from "expo";

export type Lectura = { x: number; y: number; z: number };

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
}

/** Acelerómetro para "agitar el teléfono" que no se apaga al minimizar la app (solo Android). */
export default requireNativeModule<SensorSacudidasModule>("SensorSacudidas");

/**
 * Detecta una sacudida fuerte a partir de las lecturas del acelerómetro (en g, incluida la gravedad).
 *
 * Un golpe aislado (dejar el teléfono en la mesa, un bache) no basta: se necesitan varios picos de
 * fuerza seguidos en poco tiempo, como al agitar el teléfono con decisión. Tras una detección hay
 * una pausa para que la misma sacudida no dispare dos alertas.
 */

export type OpcionesDetector = {
  /** Fuerza mínima de un pico, en g (en reposo el teléfono marca ~1 g). */
  umbralG: number;
  /** Picos necesarios dentro de la ventana para contar como sacudida. */
  picosNecesarios: number;
  /** Ventana en la que deben ocurrir los picos (ms). */
  ventanaMs: number;
  /** Tiempo mínimo entre dos picos para contarlos por separado (ms). */
  separacionMinimaMs: number;
  /** Pausa después de una detección (ms). */
  pausaMs: number;
};

export const OPCIONES_POR_DEFECTO: OpcionesDetector = {
  umbralG: 2.5,
  picosNecesarios: 4,
  ventanaMs: 1500,
  separacionMinimaMs: 120,
  pausaMs: 8000,
};

export type DetectorSacudidas = (x: number, y: number, z: number, tiempoMs: number) => boolean;

export function crearDetectorSacudidas(opciones: Partial<OpcionesDetector> = {}): DetectorSacudidas {
  const o = { ...OPCIONES_POR_DEFECTO, ...opciones };
  let picos: number[] = [];
  let pausaHasta = 0;

  return (x, y, z, t) => {
    if (t < pausaHasta) return false;
    if (Math.sqrt(x * x + y * y + z * z) < o.umbralG) return false;

    const ultimo = picos[picos.length - 1];
    if (ultimo !== undefined && t - ultimo < o.separacionMinimaMs) return false;

    picos = [...picos.filter((p) => t - p <= o.ventanaMs), t];
    if (picos.length < o.picosNecesarios) return false;

    picos = [];
    pausaHasta = t + o.pausaMs;
    return true;
  };
}

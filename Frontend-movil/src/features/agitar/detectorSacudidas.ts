/**
 * Detecta la activación por movimiento: 4 hachazos rápidos y fuertes, a partir de las lecturas del
 * acelerómetro (en g, incluida la gravedad; en reposo el teléfono marca ~1 g).
 *
 * - Un hachazo cuenta como UN golpe aunque deje varias lecturas fuertes (el impulso, el frenazo y el
 *   rebote): el golpe termina cuando el teléfono queda por debajo de `reposoG` un momento.
 * - Trotar o correr también da golpes rítmicos. Para no confundirlos:
 *   1) antes del primer hachazo tiene que haber calma (corriendo los golpes no paran) y
 *   2) después del cuarto también: quien corre sigue moviéndose; quien pide ayuda se detiene.
 * - Tras una detección hay una pausa para que la misma secuencia no dispare dos alertas.
 */

export type OpcionesDetector = {
  /** Fuerza mínima del pico de un hachazo, en g. */
  umbralG: number;
  /** Por debajo de esta fuerza el teléfono se considera quieto entre golpes. */
  reposoG: number;
  /** Tiempo por debajo de `reposoG` para dar por terminado un golpe (ms). */
  reposoMinimoMs: number;
  /** Golpes necesarios. */
  golpesNecesarios: number;
  /** Los golpes deben ocurrir dentro de esta ventana, contada desde el primero (ms). */
  ventanaMs: number;
  /** Separación mínima entre el inicio de dos golpes: lo que llega antes es parte del mismo (ms). */
  separacionMinimaMs: number;
  /** Separación máxima entre dos golpes seguidos (ms). */
  separacionMaximaMs: number;
  /** Tiempo sin golpes antes del primero (ms). */
  calmaPreviaMs: number;
  /** Tiempo sin golpes después del último para confirmar (ms). */
  calmaPosteriorMs: number;
  /** Pausa después de una detección (ms). */
  pausaMs: number;
};

export const OPCIONES_POR_DEFECTO: OpcionesDetector = {
  umbralG: 3.5,
  reposoG: 1.6,
  reposoMinimoMs: 120,
  golpesNecesarios: 4,
  ventanaMs: 3000,
  separacionMinimaMs: 250,
  separacionMaximaMs: 1000,
  calmaPreviaMs: 1000,
  calmaPosteriorMs: 600,
  pausaMs: 8000,
};

export type DetectorSacudidas = (x: number, y: number, z: number, tiempoMs: number) => boolean;

export function crearDetectorSacudidas(opciones: Partial<OpcionesDetector> = {}): DetectorSacudidas {
  const o = { ...OPCIONES_POR_DEFECTO, ...opciones };

  let enGolpe = false;
  let quietoDesde: number | null = null;
  let ultimoInicio = Number.NEGATIVE_INFINITY;
  let ultimoFin = Number.NEGATIVE_INFINITY;
  let golpes: number[] = [];
  let pausaHasta = 0;

  const reiniciar = () => {
    golpes = [];
  };

  return (x, y, z, t) => {
    if (t < pausaHasta) return false;
    const fuerza = Math.sqrt(x * x + y * y + z * z);

    // Dentro de un golpe: termina cuando el teléfono se queda quieto un momento
    if (enGolpe) {
      if (fuerza < o.reposoG) {
        quietoDesde ??= t;
        if (t - quietoDesde >= o.reposoMinimoMs) {
          enGolpe = false;
          ultimoFin = t;
        }
      } else {
        quietoDesde = null;
      }
      return false;
    }

    if (fuerza >= o.umbralG) {
      // Un pico que llega enseguida es el rebote del mismo hachazo
      if (t - ultimoInicio < o.separacionMinimaMs) return false;
      enGolpe = true;
      quietoDesde = null;
      const huboCalma = t - ultimoFin >= o.calmaPreviaMs;
      ultimoInicio = t;

      const ultimo = golpes[golpes.length - 1];
      const rota = ultimo !== undefined && (t - ultimo > o.separacionMaximaMs || t - golpes[0] > o.ventanaMs);
      if (rota) reiniciar();

      if (golpes.length >= o.golpesNecesarios) {
        // Siguió golpeando después del cuarto: es actividad continua (correr), no una petición de ayuda
        reiniciar();
      } else if (golpes.length === 0) {
        if (huboCalma) golpes = [t];
      } else {
        golpes = [...golpes, t];
      }
      return false;
    }

    // Cuarto golpe ya dado: se confirma cuando pasa la calma posterior sin otro golpe
    if (golpes.length >= o.golpesNecesarios && !enGolpe && t - ultimoFin >= o.calmaPosteriorMs) {
      reiniciar();
      pausaHasta = t + o.pausaMs;
      return true;
    }
    return false;
  };
}

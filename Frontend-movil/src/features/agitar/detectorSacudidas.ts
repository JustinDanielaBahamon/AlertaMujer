/**
 * Detecta la activación por movimiento: 4 o más hachazos rápidos y fuertes, a partir de las lecturas
 * del acelerómetro (en g, incluida la gravedad; en reposo el teléfono marca ~1 g).
 *
 * Medido en un celular real (Infinix X678B): unos hachazos fuertes no se detienen entre golpe y golpe.
 * La fuerza se queda en 6-8 g con picos de 11-13 g cada 0,3-0,4 s durante 1-5 s. Por eso se cuentan
 * PICOS (máximos locales por encima de `umbralG`), no golpes separados por reposo.
 *
 * Para no confundirlo con trotar o correr (pasos de ~3-4 g, a veces más):
 *   1) antes del primer pico tiene que haber un rato sin picos (corriendo, los pasos no paran) y
 *   2) después del último también, con el teléfono ya quieto: quien corre sigue moviéndose; quien
 *      pide ayuda se detiene.
 * Dar más de 4 hachazos también cuenta. Tras una detección hay una pausa para no disparar dos veces.
 */

export type OpcionesDetector = {
  /** Fuerza mínima de un pico (hachazo), en g. */
  umbralG: number;
  /** Por debajo de esta fuerza el teléfono se considera quieto. */
  reposoG: number;
  /** Tiempo quieto (bajo `reposoG`) para dar por terminada la secuencia (ms). */
  reposoMinimoMs: number;
  /** Picos necesarios. */
  golpesNecesarios: number;
  /** Duración máxima de la secuencia de picos, contada desde el primero (ms). */
  ventanaMs: number;
  /** Separación mínima entre dos picos: lo que llega antes es el rebote del mismo hachazo (ms). */
  separacionMinimaMs: number;
  /** Separación máxima entre dos picos seguidos de la misma secuencia (ms). */
  separacionMaximaMs: number;
  /** Tiempo sin picos antes del primero (ms). */
  calmaPreviaMs: number;
  /** Tiempo sin picos después del último para confirmar (ms). */
  calmaPosteriorMs: number;
  /** Pausa después de una detección (ms). */
  pausaMs: number;
};

export const OPCIONES_POR_DEFECTO: OpcionesDetector = {
  umbralG: 4.5,
  reposoG: 2.0,
  reposoMinimoMs: 200,
  golpesNecesarios: 4,
  ventanaMs: 8000,
  separacionMinimaMs: 200,
  separacionMaximaMs: 1000,
  calmaPreviaMs: 400,
  calmaPosteriorMs: 600,
  pausaMs: 8000,
};

export type DetectorSacudidas = (x: number, y: number, z: number, tiempoMs: number) => boolean;

export function crearDetectorSacudidas(opciones: Partial<OpcionesDetector> = {}): DetectorSacudidas {
  const o = { ...OPCIONES_POR_DEFECTO, ...opciones };

  // Las dos lecturas anteriores: un pico se confirma cuando la siguiente lectura ya es menor
  let anterior: { g: number; t: number } | null = null;
  let antepenultima = 0;
  let ultimoPico = Number.NEGATIVE_INFINITY;
  let picos: number[] = [];
  let quietoDesde: number | null = null;
  let pausaHasta = 0;

  const registrarPico = (t: number) => {
    if (t - ultimoPico < o.separacionMinimaMs) return; // rebote del mismo hachazo
    const huboCalma = t - ultimoPico >= o.calmaPreviaMs;
    const sigue = picos.length > 0 && t - ultimoPico <= o.separacionMaximaMs && t - picos[0] <= o.ventanaMs;
    if (sigue) picos.push(t);
    else picos = huboCalma ? [t] : []; // sin calma previa es actividad continua (p. ej. correr)
    ultimoPico = t;
  };

  return (x, y, z, t) => {
    const fuerza = Math.sqrt(x * x + y * y + z * z);
    if (t < pausaHasta) {
      anterior = null;
      return false;
    }

    // ¿La lectura anterior fue un máximo local fuerte?
    if (anterior && anterior.g >= o.umbralG && anterior.g >= antepenultima && anterior.g > fuerza) {
      registrarPico(anterior.t);
    }
    antepenultima = anterior?.g ?? fuerza;
    anterior = { g: fuerza, t };

    quietoDesde = fuerza < o.reposoG ? (quietoDesde ?? t) : null;

    // Secuencia completa: sin picos nuevos durante la calma posterior y el teléfono ya quieto
    const quieto = quietoDesde !== null && t - quietoDesde >= o.reposoMinimoMs;
    if (picos.length >= o.golpesNecesarios && t - ultimoPico >= o.calmaPosteriorMs && quieto) {
      picos = [];
      pausaHasta = t + o.pausaMs;
      return true;
    }
    // Pasó demasiado tiempo sin completar la secuencia: se descarta
    if (picos.length > 0 && t - ultimoPico > o.separacionMaximaMs && picos.length < o.golpesNecesarios) {
      picos = [];
    }
    return false;
  };
}

/**
 * Activación con el botón de encendido: 4 pulsaciones rápidas (en 3 s). Cada pulsación prende o
 * apaga la pantalla, que es lo que la app puede ver.
 *
 * Mirar la hora son 1 o 2 pulsaciones y el "SOS de emergencia" de Android usa 5: con 4 no se
 * confunde con ninguno de los dos. Tras una detección hay una pausa para no disparar dos veces.
 */
export type OpcionesBotonEncendido = {
  pulsaciones: number;
  ventanaMs: number;
  /** Dos cambios de pantalla más juntos que esto son el mismo evento repetido por el sistema. */
  separacionMinimaMs: number;
  pausaMs: number;
};

export const OPCIONES_BOTON_ENCENDIDO: OpcionesBotonEncendido = {
  pulsaciones: 4,
  ventanaMs: 3000,
  separacionMinimaMs: 80,
  pausaMs: 8000,
};

export type DetectorBotonEncendido = (tiempoMs: number) => boolean;

export function crearDetectorBotonEncendido(opciones: Partial<OpcionesBotonEncendido> = {}): DetectorBotonEncendido {
  const o = { ...OPCIONES_BOTON_ENCENDIDO, ...opciones };
  let pulsaciones: number[] = [];
  let pausaHasta = 0;

  return (t) => {
    if (t < pausaHasta) return false;
    const ultima = pulsaciones[pulsaciones.length - 1];
    if (ultima !== undefined && t - ultima < o.separacionMinimaMs) return false;

    pulsaciones = [...pulsaciones.filter((p) => t - p <= o.ventanaMs), t];
    if (pulsaciones.length < o.pulsaciones) return false;

    pulsaciones = [];
    pausaHasta = t + o.pausaMs;
    return true;
  };
}

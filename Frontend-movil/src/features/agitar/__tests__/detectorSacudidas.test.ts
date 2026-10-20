import { crearDetectorSacudidas } from "../detectorSacudidas";

// Lecturas cada 40 ms (frecuencia que usa el servicio)
const PASO_MS = 40;

function simular(lecturas: number[]) {
  const detectar = crearDetectorSacudidas();
  return lecturas.map((g, i) => detectar(g, 0, 0, i * PASO_MS));
}

const quieto = (ms: number) => Array(Math.round(ms / PASO_MS)).fill(1);
// Un hachazo: impulso, frenazo y rebote (varias lecturas fuertes) y luego el teléfono se detiene
const HACHAZO = [1.3, 4.6, 5.8, 3.1, 4.2, 2.2, 1.1, 1.0, 1.0, 1.0];
const hachazos = (n: number, entre = 120) => Array.from({ length: n }, () => [...HACHAZO, ...quieto(entre)]).flat();
// Paso de carrera: golpe de ~4 g y ~360 ms por paso (cadencia de 165 pasos por minuto)
const PASO_CARRERA = [1.4, 3.8, 4.1, 2.0, 0.9, 0.7, 0.8, 1.0, 1.1];
const correr = (pasos: number) => Array(pasos).fill(PASO_CARRERA).flat();

describe("detectorSacudidas", () => {
  it("no detecta nada con el teléfono en reposo", () => {
    expect(simular(quieto(4000)).some(Boolean)).toBe(false);
  });

  it("un solo hachazo no dispara la alerta, aunque deje varias lecturas fuertes", () => {
    expect(simular([...quieto(1500), ...HACHAZO, ...quieto(3000)]).some(Boolean)).toBe(false);
  });

  it("dos o tres hachazos tampoco", () => {
    expect(simular([...quieto(1500), ...hachazos(2), ...quieto(3000)]).some(Boolean)).toBe(false);
    expect(simular([...quieto(1500), ...hachazos(3), ...quieto(3000)]).some(Boolean)).toBe(false);
  });

  it("cuatro hachazos rápidos y fuertes disparan la alerta cuando la usuaria se detiene", () => {
    const r = simular([...quieto(1500), ...hachazos(4), ...quieto(2000)]);
    expect(r.filter(Boolean)).toHaveLength(1);
  });

  it("hachazos suaves no cuentan", () => {
    const suave = HACHAZO.map((g) => Math.min(g, 3));
    const lecturas = [...quieto(1500), ...Array(4).fill([...suave, ...quieto(120)]).flat(), ...quieto(2000)];
    expect(simular(lecturas).some(Boolean)).toBe(false);
  });

  it("hachazos demasiado separados no cuentan", () => {
    const lento = Array(4).fill([...HACHAZO, ...quieto(1500)]).flat();
    expect(simular([...quieto(1500), ...lento]).some(Boolean)).toBe(false);
  });

  it("trotar o correr no dispara la alerta", () => {
    expect(simular([...quieto(1500), ...correr(60), ...quieto(2000)]).some(Boolean)).toBe(false);
  });

  it("empezar a correr justo después de estar quieta tampoco", () => {
    // Los primeros pasos parecen hachazos, pero los siguientes llegan antes de la calma posterior
    expect(simular([...quieto(2000), ...correr(8)]).some(Boolean)).toBe(false);
  });

  it("cuatro hachazos fuertes en medio de una carrera sí se detectan (es una emergencia)", () => {
    // Si alguien está corriendo y hace 4 hachazos intencionalmente fuertes, es una petición de ayuda
    expect(simular([...correr(20), ...hachazos(4), ...quieto(700)]).some(Boolean)).toBe(true);
  });

  it("después de detectar espera antes de volver a disparar", () => {
    const r = simular([...quieto(1500), ...hachazos(4), ...quieto(1000), ...hachazos(4), ...quieto(2000)]);
    expect(r.filter(Boolean)).toHaveLength(1);
  });
});

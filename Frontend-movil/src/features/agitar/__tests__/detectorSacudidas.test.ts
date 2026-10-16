import { crearDetectorSacudidas } from "../detectorSacudidas";

// Lecturas cada 80 ms (frecuencia que usa el servicio)
function simular(lecturas: number[], inicio = 0) {
  const detectar = crearDetectorSacudidas();
  return lecturas.map((g, i) => detectar(g, 0, 0, inicio + i * 80));
}

describe("detectorSacudidas", () => {
  it("no detecta nada con el teléfono en reposo", () => {
    expect(simular(Array(50).fill(1)).some(Boolean)).toBe(false);
  });

  it("un golpe aislado no dispara la alerta", () => {
    expect(simular([1, 1, 4, 1, 1, 1, 1, 1, 1, 1]).some(Boolean)).toBe(false);
  });

  it("detecta varias sacudidas fuertes seguidas", () => {
    const r = simular([1, 3, 1, 3, 1, 3, 1, 3, 1]);
    expect(r.indexOf(true)).toBe(7); // al cuarto pico
  });

  it("picos demasiado separados no cuentan", () => {
    const lento = [3, ...Array(9).fill(1), 3, ...Array(9).fill(1), 3, ...Array(9).fill(1), 3];
    expect(simular(lento).some(Boolean)).toBe(false);
  });

  it("después de detectar espera antes de volver a disparar", () => {
    const sacudida = [3, 1, 3, 1, 3, 1, 3, 1];
    const r = simular([...sacudida, ...sacudida]);
    expect(r.filter(Boolean)).toHaveLength(1);
  });
});

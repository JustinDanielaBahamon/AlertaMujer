import { createPowerButtonDetector } from "../powerButtonDetector";

const simulate = (times: number[]) => {
  const detect = createPowerButtonDetector();
  return times.map((t) => detect(t));
};

describe("detectorBotonEncendido", () => {
  it("4 pulsaciones rápidas activan la alerta", () => {
    expect(simulate([0, 400, 800, 1200])).toEqual([false, false, false, true]);
  });

  it("mirar la hora (prender y apagar) no la activa", () => {
    expect(simulate([0, 5000, 9000, 15000]).some(Boolean)).toBe(false);
  });

  it("4 pulsaciones demasiado lentas no cuentan", () => {
    expect(simulate([0, 1200, 2400, 3600]).some(Boolean)).toBe(false);
  });

  it("un cambio repetido por el sistema en pocos milisegundos cuenta una sola vez", () => {
    expect(simulate([0, 20, 400, 420, 800]).some(Boolean)).toBe(false);
  });

  it("después de activar espera antes de volver a hacerlo", () => {
    expect(simulate([0, 300, 600, 900, 1200, 1500, 1800, 2100]).filter(Boolean)).toHaveLength(1);
  });
});

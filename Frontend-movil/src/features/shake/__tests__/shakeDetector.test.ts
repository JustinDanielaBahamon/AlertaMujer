import { createShakeDetector } from "../shakeDetector";

// Readings every 40 ms (the rate the service uses)
const STEP_MS = 40;

function simulate(readings: number[]) {
  const detect = createShakeDetector();
  return readings.map((g, i) => detect(g, 0, 0, i * STEP_MS));
}

const still = (ms: number) => Array(Math.round(ms / STEP_MS)).fill(1);
// One chop: push, sudden stop and rebound (several strong readings) and then the phone stops
const CHOP = [1.3, 4.6, 5.8, 3.1, 4.2, 2.2, 1.1, 1.0, 1.0, 1.0];
const chops = (n: number, between = 120) => Array.from({ length: n }, () => [...CHOP, ...still(between)]).flat();
// Running step: ~4 g hit and ~360 ms per step (cadence of 165 steps per minute)
const RUNNING_STEP = [1.4, 3.8, 4.1, 2.0, 0.9, 0.7, 0.8, 1.0, 1.1];
const run = (steps: number) => Array(steps).fill(RUNNING_STEP).flat();

describe("detectorSacudidas", () => {
  it("no detecta nada con el teléfono en reposo", () => {
    expect(simulate(still(4000)).some(Boolean)).toBe(false);
  });

  it("un solo hachazo no dispara la alerta, aunque deje varias lecturas fuertes", () => {
    expect(simulate([...still(1500), ...CHOP, ...still(3000)]).some(Boolean)).toBe(false);
  });

  it("dos o tres hachazos tampoco", () => {
    expect(simulate([...still(1500), ...chops(2), ...still(3000)]).some(Boolean)).toBe(false);
    expect(simulate([...still(1500), ...chops(3), ...still(3000)]).some(Boolean)).toBe(false);
  });

  it("cuatro hachazos rápidos y fuertes disparan la alerta cuando la usuaria se detiene", () => {
    const r = simulate([...still(1500), ...chops(4), ...still(2000)]);
    expect(r.filter(Boolean)).toHaveLength(1);
  });

  it("hachazos suaves no cuentan", () => {
    const suave = CHOP.map((g) => Math.min(g, 3));
    const readings = [...still(1500), ...Array(4).fill([...suave, ...still(120)]).flat(), ...still(2000)];
    expect(simulate(readings).some(Boolean)).toBe(false);
  });

  it("hachazos demasiado separados no cuentan", () => {
    const slow = Array(4).fill([...CHOP, ...still(1500)]).flat();
    expect(simulate([...still(1500), ...slow]).some(Boolean)).toBe(false);
  });

  it("trotar o correr no dispara la alerta", () => {
    expect(simulate([...still(1500), ...run(60), ...still(2000)]).some(Boolean)).toBe(false);
  });

  it("empezar a correr justo después de estar quieta tampoco", () => {
    // The first steps look like chops, but the next ones arrive before the calm afterwards
    expect(simulate([...still(2000), ...run(8)]).some(Boolean)).toBe(false);
  });

  it("cuatro hachazos fuertes en medio de una carrera sí se detectan (es una emergencia)", () => {
    // If someone is running and makes 4 deliberately strong chops, it is a request for help
    expect(simulate([...run(20), ...chops(4), ...still(700)]).some(Boolean)).toBe(true);
  });

  it("después de detectar espera antes de volver a disparar", () => {
    const r = simulate([...still(1500), ...chops(4), ...still(1000), ...chops(4), ...still(2000)]);
    expect(r.filter(Boolean)).toHaveLength(1);
  });

  describe("con datos reales de un celular (Infinix X678B, 2 minutos)", () => {
    // Measured with ADB: at rest, then several rounds of strong chops without stopping between hits
    // (peaks of 11-13 g over 6-8 g) separated by short pauses. Time in ms and strength in g.
    const series: [number, number][] = require("./data/chops-infinix.json");
    const triggers = (() => {
      const detect = createShakeDetector();
      return series.filter(([t, g]) => detect(g, 0, 0, t)).map(([t]) => t / 1000);
    })();

    it("detecta los hachazos aunque el celular no se detenga entre golpe y golpe", () => {
      expect(triggers.length).toBeGreaterThanOrEqual(2);
      // The first round ends at ~59.3 s: the alert goes out when the phone stays still
      expect(triggers[0]).toBeGreaterThan(59);
      expect(triggers[0]).toBeLessThan(61);
    });

    it("no dispara mientras el celular está quieto o se manipula suave", () => {
      expect(triggers.every((s) => s > 54)).toBe(true);
    });
  });
});

jest.mock("../../../../modules/sensor-sacudidas", () => ({ __esModule: true, default: {} }));

import { classifyExit } from "../saludProteccion";

// Casos reales registrados en un Infinix X678B (Android 14)
const exit = (reason: number, importance: number, description = "") => ({
  timestamp: 1, motivo: reason, importancia: importance, descripcion: description,
});

describe("clasificarCierre", () => {
  it("deslizar en Recientes con la protección activa la interrumpe", () => {
    expect(classifyExit(exit(10, 125, "remove task: due to 2098, cleanType:SwipeUpClean"))?.cause).toBe("recientes");
  });

  it("si la protección no corría, el cierre no cuenta", () => {
    expect(classifyExit(exit(10, 400, "remove task: SwipeUpClean"))).toBeNull();
    expect(classifyExit(exit(13, 400, "too many empty"))).toBeNull();
  });

  it("el sistema matando el servicio cuenta como ahorro de energía", () => {
    expect(classifyExit(exit(13, 125, "too many empty"))?.cause).toBe("sistema");
    expect(classifyExit(exit(3, 125))?.cause).toBe("sistema");
  });

  it("forzar detención, errores y actualizaciones", () => {
    expect(classifyExit(exit(10, 125, "force-stop"))?.cause).toBe("detenida");
    expect(classifyExit(exit(4, 125))?.cause).toBe("error");
    expect(classifyExit(exit(16, 125))).toBeNull();
  });
});

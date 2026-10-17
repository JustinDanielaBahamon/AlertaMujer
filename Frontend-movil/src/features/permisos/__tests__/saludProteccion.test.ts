jest.mock("../../../../modules/sensor-sacudidas", () => ({ __esModule: true, default: {} }));

import { clasificarCierre } from "../saludProteccion";

// Casos reales registrados en un Infinix X678B (Android 14)
const cierre = (motivo: number, importancia: number, descripcion = "") => ({
  timestamp: 1, motivo, importancia, descripcion,
});

describe("clasificarCierre", () => {
  it("deslizar en Recientes con la protección activa la interrumpe", () => {
    expect(clasificarCierre(cierre(10, 125, "remove task: due to 2098, cleanType:SwipeUpClean"))?.causa).toBe("recientes");
  });

  it("si la protección no corría, el cierre no cuenta", () => {
    expect(clasificarCierre(cierre(10, 400, "remove task: SwipeUpClean"))).toBeNull();
    expect(clasificarCierre(cierre(13, 400, "too many empty"))).toBeNull();
  });

  it("el sistema matando el servicio cuenta como ahorro de energía", () => {
    expect(clasificarCierre(cierre(13, 125, "too many empty"))?.causa).toBe("sistema");
    expect(clasificarCierre(cierre(3, 125))?.causa).toBe("sistema");
  });

  it("forzar detención, errores y actualizaciones", () => {
    expect(clasificarCierre(cierre(10, 125, "force-stop"))?.causa).toBe("detenida");
    expect(clasificarCierre(cierre(4, 125))?.causa).toBe("error");
    expect(clasificarCierre(cierre(16, 125))).toBeNull();
  });
});

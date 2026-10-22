import { gestureConflict } from "../manufacturerGestures";

describe("gestosDelFabricante", () => {
  it("reconoce Motorola y Lenovo sin importar mayúsculas", () => {
    expect(gestureConflict("motorola")).toBe("motorola");
    expect(gestureConflict("Motorola ")).toBe("motorola");
    expect(gestureConflict("unknown", "lenovo")).toBe("motorola");
  });

  it("otras marcas no tienen aviso específico", () => {
    expect(gestureConflict("samsung", "samsung")).toBeNull();
    expect(gestureConflict(undefined)).toBeNull();
  });
});

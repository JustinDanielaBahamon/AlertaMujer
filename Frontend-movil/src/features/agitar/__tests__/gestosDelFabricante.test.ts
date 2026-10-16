import { conflictoDeGestos } from "../gestosDelFabricante";

describe("gestosDelFabricante", () => {
  it("reconoce Motorola y Lenovo sin importar mayúsculas", () => {
    expect(conflictoDeGestos("motorola")).toBe("motorola");
    expect(conflictoDeGestos("Motorola ")).toBe("motorola");
    expect(conflictoDeGestos("unknown", "lenovo")).toBe("motorola");
  });

  it("otras marcas no tienen aviso específico", () => {
    expect(conflictoDeGestos("samsung", "samsung")).toBeNull();
    expect(conflictoDeGestos(undefined)).toBeNull();
  });
});

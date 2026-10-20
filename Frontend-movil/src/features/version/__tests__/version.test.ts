import { esVersionAnterior } from "../version";

describe("esVersionAnterior", () => {
  it("compara número por número, no como texto", () => {
    expect(esVersionAnterior("1.2.0", "1.10.0")).toBe(true);
    expect(esVersionAnterior("1.10.0", "1.2.0")).toBe(false);
    expect(esVersionAnterior("1.0.0", "1.0.1")).toBe(true);
  });

  it("la misma versión o una más nueva no pide actualizar", () => {
    expect(esVersionAnterior("1.2.0", "1.2")).toBe(false);
    expect(esVersionAnterior("2.0.0", "1.9.9")).toBe(false);
  });

  it("sin versión mínima configurada nunca avisa", () => {
    expect(esVersionAnterior("1.0.0", null)).toBe(false);
    expect(esVersionAnterior("1.0.0", "  ")).toBe(false);
  });
});

jest.mock("@maplibre/maplibre-react-native", () => ({}));

import { withMinWidth } from "../MapaLibre";

describe("encuadre mínimo del mapa", () => {
  it("agranda puntos a pocos metros hasta ~300 m, sin mover el centro", () => {
    const [a, b] = withMinWidth(-75.29931, -75.29925);
    expect(b - a).toBeCloseTo(0.003, 6);
    expect((a + b) / 2).toBeCloseTo(-75.29928, 6);
  });

  it("deja igual un recorrido que ya es amplio", () => {
    expect(withMinWidth(2.92, 2.94)).toEqual([2.92, 2.94]);
  });
});

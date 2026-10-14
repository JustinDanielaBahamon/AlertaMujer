import { descripcionLugar } from "../geocoding.service";

jest.mock("expo-location", () => ({ reverseGeocodeAsync: jest.fn() }));

describe("geocoding.service · descripcionLugar", () => {
  it("une el lugar y el barrio", () => {
    expect(descripcionLugar({ lugar: "Carrera 7", barrio: "Quirinal" })).toBe("Carrera 7 · Quirinal");
  });

  it("muestra solo lo que exista", () => {
    expect(descripcionLugar({ lugar: null, barrio: "Quirinal" })).toBe("Quirinal");
    expect(descripcionLugar({ lugar: "Carrera 7", barrio: null })).toBe("Carrera 7");
  });

  it("devuelve texto vacío si no hay datos", () => {
    expect(descripcionLugar({ lugar: null, barrio: null })).toBe("");
  });
});

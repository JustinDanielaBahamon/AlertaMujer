import { placeDescription } from "../geocoding.service";

jest.mock("expo-location", () => ({ reverseGeocodeAsync: jest.fn() }));

describe("geocoding.service · descripcionLugar", () => {
  it("une el lugar y el barrio", () => {
    expect(placeDescription({ place: "Carrera 7", neighborhood: "Quirinal" })).toBe("Carrera 7 · Quirinal");
  });

  it("muestra solo lo que exista", () => {
    expect(placeDescription({ place: null, neighborhood: "Quirinal" })).toBe("Quirinal");
    expect(placeDescription({ place: "Carrera 7", neighborhood: null })).toBe("Carrera 7");
  });

  it("devuelve texto vacío si no hay datos", () => {
    expect(placeDescription({ place: null, neighborhood: null })).toBe("");
  });
});

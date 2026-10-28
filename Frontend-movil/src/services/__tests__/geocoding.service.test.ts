import { placeDescription, searchPlaces } from "../geocoding.service";

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

describe("geocoding.service · searchPlaces", () => {
  const fetchMock = jest.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    (global as any).fetch = fetchMock;
  });

  it("does not search very short texts", async () => {
    await expect(searchPlaces("ca")).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("searches in Colombia near her and reads name, detail and point", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          name: "Colegio Claretiano",
          lat: "2.95",
          lon: "-75.29",
          address: { road: "Calle 48", neighbourhood: "Acrópolis", city: "Neiva" },
        },
      ],
    });

    const found = await searchPlaces("claretiano", { latitude: 2.93, longitude: -75.28 });

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("countrycodes=co");
    expect(url).toContain("q=claretiano");
    expect(url).toContain("viewbox=");
    expect(found).toEqual([
      { name: "Colegio Claretiano", detail: "Calle 48 · Acrópolis · Neiva", latitude: 2.95, longitude: -75.29 },
    ]);
  });

  it("puts the closest place first", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { name: "Estadio lejos", lat: "4.6", lon: "-74.1", address: {} },
        { name: "Estadio cerca", lat: "2.94", lon: "-75.29", address: {} },
      ],
    });

    const found = await searchPlaces("estadio", { latitude: 2.93, longitude: -75.28 });

    expect(found.map((f) => f.name)).toEqual(["Estadio cerca", "Estadio lejos"]);
  });

  it("returns an empty list without internet", async () => {
    fetchMock.mockRejectedValueOnce(new Error("offline"));
    await expect(searchPlaces("claretiano")).resolves.toEqual([]);
  });
});

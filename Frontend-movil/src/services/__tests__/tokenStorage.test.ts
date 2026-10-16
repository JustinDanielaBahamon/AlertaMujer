import AsyncStorage from "@react-native-async-storage/async-storage";

const mockAlmacen = new Map<string, string>();
jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(async (k: string, v: string) => void mockAlmacen.set(k, v)),
  getItemAsync: jest.fn(async (k: string) => mockAlmacen.get(k) ?? null),
  deleteItemAsync: jest.fn(async (k: string) => void mockAlmacen.delete(k)),
}));

import { borrarTokens, guardarTokens, leerTokens } from "../tokenStorage";

describe("tokenStorage", () => {
  beforeEach(async () => {
    mockAlmacen.clear();
    await AsyncStorage.clear();
  });

  it("guarda los tokens en el almacén cifrado y no en AsyncStorage", async () => {
    await guardarTokens({ token: "acceso", refreshToken: "renovar" });

    expect(await leerTokens()).toEqual({ token: "acceso", refreshToken: "renovar" });
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });

  it("al cerrar sesión no queda ningún token", async () => {
    await guardarTokens({ token: "acceso", refreshToken: "renovar" });
    await borrarTokens();

    expect(await leerTokens()).toBeNull();
    expect(mockAlmacen.size).toBe(0);
  });
});

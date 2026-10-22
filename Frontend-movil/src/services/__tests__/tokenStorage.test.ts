import AsyncStorage from "@react-native-async-storage/async-storage";

const mockStorage = new Map<string, string>();
jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(async (k: string, v: string) => void mockStorage.set(k, v)),
  getItemAsync: jest.fn(async (k: string) => mockStorage.get(k) ?? null),
  deleteItemAsync: jest.fn(async (k: string) => void mockStorage.delete(k)),
}));

import { clearTokens, saveTokens, leerTokens } from "../tokenStorage";

describe("tokenStorage", () => {
  beforeEach(async () => {
    mockStorage.clear();
    await AsyncStorage.clear();
  });

  it("guarda los tokens en el almacén cifrado y no en AsyncStorage", async () => {
    await saveTokens({ token: "acceso", refreshToken: "renovar" });

    expect(await leerTokens()).toEqual({ token: "acceso", refreshToken: "renovar" });
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });

  it("al cerrar sesión no queda ningún token", async () => {
    await saveTokens({ token: "acceso", refreshToken: "renovar" });
    await clearTokens();

    expect(await leerTokens()).toBeNull();
    expect(mockStorage.size).toBe(0);
  });
});

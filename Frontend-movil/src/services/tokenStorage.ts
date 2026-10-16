import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Tokens de la sesión en el almacén cifrado del sistema (Android Keystore) con expo-secure-store.
 * Si el módulo nativo no está en el build (dev client anterior), se usa AsyncStorage como antes.
 */

export type Tokens = { token: string; refreshToken: string | null };

const CLAVE_TOKEN = "alerta_mujer.token";
const CLAVE_REFRESH = "alerta_mujer.refresh_token";
const CLAVE_RESPALDO = "@alerta_mujer:tokens";

type SecureStore = typeof import("expo-secure-store");

let modulo: SecureStore | null | undefined;
function secureStore(): SecureStore | null {
  if (modulo === undefined) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      modulo = require("expo-secure-store") as SecureStore;
    } catch {
      modulo = null;
    }
  }
  return modulo;
}

export async function guardarTokens({ token, refreshToken }: Tokens): Promise<void> {
  const ss = secureStore();
  if (ss) {
    await ss.setItemAsync(CLAVE_TOKEN, token);
    if (refreshToken) await ss.setItemAsync(CLAVE_REFRESH, refreshToken);
    else await ss.deleteItemAsync(CLAVE_REFRESH);
    return;
  }
  await AsyncStorage.setItem(CLAVE_RESPALDO, JSON.stringify({ token, refreshToken }));
}

export async function leerTokens(): Promise<Tokens | null> {
  const ss = secureStore();
  if (ss) {
    const token = await ss.getItemAsync(CLAVE_TOKEN);
    return token ? { token, refreshToken: await ss.getItemAsync(CLAVE_REFRESH) } : null;
  }
  const raw = await AsyncStorage.getItem(CLAVE_RESPALDO);
  return raw ? (JSON.parse(raw) as Tokens) : null;
}

export async function borrarTokens(): Promise<void> {
  const ss = secureStore();
  if (ss) {
    await ss.deleteItemAsync(CLAVE_TOKEN);
    await ss.deleteItemAsync(CLAVE_REFRESH);
  }
  await AsyncStorage.removeItem(CLAVE_RESPALDO);
}

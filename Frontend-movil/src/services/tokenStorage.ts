import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Session tokens in the system's encrypted storage (Android Keystore) with expo-secure-store.
 * If the native module is not in the build (older dev client), AsyncStorage is used as before.
 */

export type Tokens = { token: string; refreshToken: string | null };

const TOKEN_KEY = "alerta_mujer.token";
const REFRESH_KEY = "alerta_mujer.refresh_token";
const BACKUP_KEY = "@alerta_mujer:tokens";

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

export async function saveTokens({ token, refreshToken }: Tokens): Promise<void> {
  const ss = secureStore();
  if (ss) {
    await ss.setItemAsync(TOKEN_KEY, token);
    if (refreshToken) await ss.setItemAsync(REFRESH_KEY, refreshToken);
    else await ss.deleteItemAsync(REFRESH_KEY);
    return;
  }
  await AsyncStorage.setItem(BACKUP_KEY, JSON.stringify({ token, refreshToken }));
}

export async function leerTokens(): Promise<Tokens | null> {
  const ss = secureStore();
  if (ss) {
    const token = await ss.getItemAsync(TOKEN_KEY);
    return token ? { token, refreshToken: await ss.getItemAsync(REFRESH_KEY) } : null;
  }
  const raw = await AsyncStorage.getItem(BACKUP_KEY);
  return raw ? (JSON.parse(raw) as Tokens) : null;
}

export async function clearTokens(): Promise<void> {
  const ss = secureStore();
  if (ss) {
    await ss.deleteItemAsync(TOKEN_KEY);
    await ss.deleteItemAsync(REFRESH_KEY);
  }
  await AsyncStorage.removeItem(BACKUP_KEY);
}

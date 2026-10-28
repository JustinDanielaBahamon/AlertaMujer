import axios from "axios";
import Constants from "expo-constants";
import { serviceFor } from "./serviceRoutes";

// The backend URL is not secret, but the log only matters in development
const logStart = (...parts: unknown[]) => {
  if (__DEV__) console.log(...parts);
};

function getApiBaseUrl(): string {
  // 1) Explicit environment variable (set by update-env.js on npm start)
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envApiUrl) {
    logStart(" [api.ts] Usando EXPO_PUBLIC_API_URL:", envApiUrl);
    return envApiUrl;
  }

  // 2) Physical device / Expo Go: derive the IP from the Expo hostUri
  // Constants.expoConfig.hostUri has the format "192.168.x.x:8081"
  // manifest.debuggerHost is the equivalent in old SDKs
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as any).manifest?.debuggerHost ??
    (Constants as any).manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    const host = hostUri.split(":")[0];
    const url = `http://${host}:8080`;
    logStart(" [api.ts] Usando hostUri detectado:", url);
    return url;
  }

  // 3) Final fallback (only works on web or the Android emulator with 10.0.2.2)
  console.warn(" [api.ts] No se detectó IP — usando localhost");
  return "http://localhost:8080";
}

const API_BASE_URL = getApiBaseUrl();
logStart(" [api.ts] API_BASE_URL:", API_BASE_URL);

// Without a timeout, if the backend does not respond (e.g. asleep on Render) the app kept
// waiting forever. 20 s is enough for the server to wake up in most cases.
export const WAIT_TIME_MS = 20000;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: WAIT_TIME_MS,
});

// Request logging only in development, and never the content: the body has passwords
// (sign-in) and the responses have tokens; in an APK it would end up in the Android log.
const registrar = (...parts: unknown[]) => {
  if (__DEV__) console.log(...parts);
};

// Session tokens (updated by AuthContext)
let authToken: string | null = null;
let refreshToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  registrar(" [api.ts] Token actualizado:", token ? "***" : "null");
};

export const setRefreshToken = (token: string | null) => {
  refreshToken = token;
};

// AuthContext subscribes to store the renewed token and to sign out when it is no longer valid
let onTokenRenewed: ((token: string) => void) | null = null;
let onSessionExpired: (() => void) | null = null;

export const listenSession = (listeners: { renewed: (token: string) => void; expired: () => void }) => {
  onTokenRenewed = listeners.renewed;
  onSessionExpired = listeners.expired;
  return () => {
    onTokenRenewed = null;
    onSessionExpired = null;
  };
};

// Interceptor that adds the token to the requests
api.interceptors.request.use((config) => {
  registrar(" [api] Request:", config.method?.toUpperCase(), config.url);

  // Each route goes to its microservice (Alert or Evidence); the rest, to the main URL (Auth)
  const service = config.url ? serviceFor(config.url) : null;
  if (service) config.baseURL = service;

  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  
  return config;
});

/**
 * URL and session header so a player (video, audio, image) loads a protected file
 * directly, without downloading it first.
 */
/**
 * URL for a player when the route is public (contact tracking). No session header: with cloud storage
 * the backend redirects to a signed link, and Android's player sends the same headers to it, so the
 * storage rejected the request (two ways of authenticating) and the contact could not play anything.
 */
export const publicSource = (route: string): { uri: string } => ({
  uri: `${serviceFor(route) ?? API_BASE_URL}${route}`,
});

export const sourceWithToken = (route: string): { uri: string; headers: Record<string, string> } => ({
  uri: `${serviceFor(route) ?? API_BASE_URL}${route}`,
  headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
});

/** Base URL of the microservice that handles the route (for native code that calls it directly). */
export const baseUrlFor = (route: string): string => serviceFor(route) ?? API_BASE_URL;

// A single renewal at a time even if several requests fail together
let renewing: Promise<string | null> | null = null;

async function renewToken(): Promise<string | null> {
  if (!refreshToken) return null;
  renewing ??= axios
    .post<{ token: string }>(`${API_BASE_URL}/api/auth/refresh`, { refreshToken }, { timeout: WAIT_TIME_MS })
    .then((r) => r.data.token ?? null)
    .catch((e) => {
      // Offline or server down: not a reason to sign out
      if (!e?.response) throw e;
      return null;
    })
    .finally(() => {
      renewing = null;
    });
  return renewing;
}

/** Milliseconds left before the session token expires (0 if unknown or already expired). */
export function tokenTimeLeftMs(token: string | null = authToken, now = Date.now()): number {
  try {
    const payload = token?.split(".")[1];
    if (!payload) return 0;
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof json.exp === "number" ? Math.max(0, json.exp * 1000 - now) : 0;
  } catch {
    return 0;
  }
}

/**
 * The current session token, renewed first if it expires within minMs. For native services that
 * keep using it for hours without the app (they cannot renew it themselves). null without session.
 */
export async function freshToken(minMs: number): Promise<string | null> {
  if (!authToken) return null;
  if (tokenTimeLeftMs() >= minMs) return authToken;
  try {
    const renewed = await renewToken();
    if (renewed) {
      setAuthToken(renewed);
      onTokenRenewed?.(renewed);
    }
  } catch {
    // Offline: the current one is used and the service asks again when it expires
  }
  return authToken;
}

api.interceptors.response.use(
  (response) => {
    registrar("✅ [api] Response:", response.config.url, "Status:", response.status);
    return response;
  },
  async (error) => {
    registrar("❌ [api] Error:", error.config?.url, error.response?.status ?? error.message);
    const original = error.config;
    const isAuthRequest = String(original?.url ?? "").startsWith("/api/auth/");

    // Expired token: renewed with the refresh token and the request is repeated once
    if (error.response?.status === 401 && authToken && original && !original._retry && !isAuthRequest) {
      original._retry = true;
      let newItem: string | null = null;
      try {
        newItem = await renewToken();
      } catch {
        return Promise.reject(error);
      }
      if (newItem) {
        setAuthToken(newItem);
        onTokenRenewed?.(newItem);
        original.headers.Authorization = `Bearer ${newItem}`;
        return api(original);
      }
      onSessionExpired?.();
    }
    return Promise.reject(error);
  }
);

export default api;
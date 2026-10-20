import axios from "axios";
import Constants from "expo-constants";
import { servicioPara } from "./servicios";

// La URL del backend no es secreta, pero el log solo interesa en desarrollo
const registrarInicio = (...partes: unknown[]) => {
  if (__DEV__) console.log(...partes);
};

function getApiBaseUrl(): string {
  // 1) Variable de entorno explícita (seteada por update-env.js al hacer npm start)
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envApiUrl) {
    registrarInicio(" [api.ts] Usando EXPO_PUBLIC_API_URL:", envApiUrl);
    return envApiUrl;
  }

  // 2) Dispositivo físico / Expo Go: derivar la IP del hostUri de Expo
  //    Constants.expoConfig.hostUri tiene el formato "192.168.x.x:8081"
  //    manifest.debuggerHost es el equivalente en SDK antiguo
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as any).manifest?.debuggerHost ??
    (Constants as any).manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    const host = hostUri.split(":")[0];
    const url = `http://${host}:8080`;
    registrarInicio(" [api.ts] Usando hostUri detectado:", url);
    return url;
  }

  // 3) Fallback final (solo funciona en web o emulador Android con 10.0.2.2)
  console.warn(" [api.ts] No se detectó IP — usando localhost");
  return "http://localhost:8080";
}

const API_BASE_URL = getApiBaseUrl();
registrarInicio(" [api.ts] API_BASE_URL:", API_BASE_URL);

// Sin tiempo de espera, si el backend no responde (p. ej. dormido en Render) la app se quedaba
// esperando indefinidamente. 20 s alcanzan para que el servidor despierte en la mayoría de los casos.
export const TIEMPO_ESPERA_MS = 20000;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIEMPO_ESPERA_MS,
});

// Registro de peticiones solo en desarrollo, y nunca el contenido: el cuerpo trae contraseñas
// (inicio de sesión) y las respuestas traen tokens; en un APK quedaría en el log de Android.
const registrar = (...partes: unknown[]) => {
  if (__DEV__) console.log(...partes);
};

// Tokens de la sesión (los actualiza AuthContext)
let authToken: string | null = null;
let refreshToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  registrar(" [api.ts] Token actualizado:", token ? "***" : "null");
};

export const setRefreshToken = (token: string | null) => {
  refreshToken = token;
};

// AuthContext se suscribe para guardar el token renovado y para cerrar la sesión cuando ya no es válida
let alRenovarToken: ((token: string) => void) | null = null;
let alExpirarSesion: (() => void) | null = null;

export const escucharSesion = (oyentes: { renovado: (token: string) => void; expirada: () => void }) => {
  alRenovarToken = oyentes.renovado;
  alExpirarSesion = oyentes.expirada;
  return () => {
    alRenovarToken = null;
    alExpirarSesion = null;
  };
};

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use((config) => {
  registrar(" [api] Request:", config.method?.toUpperCase(), config.url);

  // Cada ruta va a su microservicio (Alert o Evidence); el resto, a la URL principal (Auth)
  const servicio = config.url ? servicioPara(config.url) : null;
  if (servicio) config.baseURL = servicio;

  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  
  return config;
});

/**
 * URL y cabecera de sesión para que un reproductor (video, audio, imagen) cargue un archivo
 * protegido directamente, sin descargarlo antes.
 */
export const fuenteConToken = (ruta: string): { uri: string; headers: Record<string, string> } => ({
  uri: `${servicioPara(ruta) ?? API_BASE_URL}${ruta}`,
  headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
});

// Una sola renovación a la vez aunque fallen varias peticiones juntas
let renovando: Promise<string | null> | null = null;

async function renovarToken(): Promise<string | null> {
  if (!refreshToken) return null;
  renovando ??= axios
    .post<{ token: string }>(`${API_BASE_URL}/api/auth/refresh`, { refreshToken }, { timeout: TIEMPO_ESPERA_MS })
    .then((r) => r.data.token ?? null)
    .catch((e) => {
      // Sin conexión o servidor caído: no es motivo para cerrar la sesión
      if (!e?.response) throw e;
      return null;
    })
    .finally(() => {
      renovando = null;
    });
  return renovando;
}

api.interceptors.response.use(
  (response) => {
    registrar("✅ [api] Response:", response.config.url, "Status:", response.status);
    return response;
  },
  async (error) => {
    registrar("❌ [api] Error:", error.config?.url, error.response?.status ?? error.message);
    const original = error.config;
    const esDeAutenticacion = String(original?.url ?? "").startsWith("/api/auth/");

    // Token vencido: se renueva con el refresh token y se repite la petición una vez
    if (error.response?.status === 401 && authToken && original && !original._reintento && !esDeAutenticacion) {
      original._reintento = true;
      let nuevo: string | null = null;
      try {
        nuevo = await renovarToken();
      } catch {
        return Promise.reject(error);
      }
      if (nuevo) {
        setAuthToken(nuevo);
        alRenovarToken?.(nuevo);
        original.headers.Authorization = `Bearer ${nuevo}`;
        return api(original);
      }
      alExpirarSesion?.();
    }
    return Promise.reject(error);
  }
);

export default api;
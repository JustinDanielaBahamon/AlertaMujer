import axios from "axios";
import Constants from "expo-constants";

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

// Variable para almacenar el token (se puede actualizar desde AuthContext)
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  registrar(" [api.ts] Token actualizado:", token ? "***" : "null");
};

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use((config) => {
  registrar(" [api] Request:", config.method?.toUpperCase(), config.url);

  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => {
    registrar("✅ [api] Response:", response.config.url, "Status:", response.status);
    return response;
  },
  (error) => {
    registrar("❌ [api] Error:", error.config?.url, error.response?.status ?? error.message);
    return Promise.reject(error);
  }
);

export default api;
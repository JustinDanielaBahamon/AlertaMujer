import axios from "axios";
import Constants from "expo-constants";

function getApiBaseUrl(): string {
  // 1) Variable de entorno explícita (seteada por update-env.js al hacer npm start)
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envApiUrl) {
    console.log(" [api.ts] Usando EXPO_PUBLIC_API_URL:", envApiUrl);
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
    console.log(" [api.ts] Usando hostUri detectado:", url);
    return url;
  }

  // 3) Fallback final (solo funciona en web o emulador Android con 10.0.2.2)
  console.warn(" [api.ts] No se detectó IP — usando localhost");
  return "http://localhost:8080";
}

const API_BASE_URL = getApiBaseUrl();
console.log(" [api.ts] API_BASE_URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Variable para almacenar el token (se puede actualizar desde AuthContext)
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  console.log(" [api.ts] Token actualizado:", token ? "***" : "null");
};

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use((config) => {
  console.log(" [api] Request:", config.method?.toUpperCase(), config.url);
  console.log(" [api] Request params:", config.params);
  console.log(" [api] Request data:", config.data);
  
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log("✅ [api] Response:", response.config.url, "Status:", response.status);
    console.log("✅ [api] Response data:", response.data);
    return response;
  },
  (error) => {
    console.error("❌ [api] Error:", error.config?.url, error.message);
    console.error("❌ [api] Error response:", error.response?.data);
    return Promise.reject(error);
  }
);

export default api;
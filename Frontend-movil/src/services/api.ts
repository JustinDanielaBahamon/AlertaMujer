import axios from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";

function getApiBaseUrl(): string {
  // Emulador Android: 10.0.2.2 apunta al localhost del PC anfitrión
  if (Platform.OS === "android" && __DEV__ && Constants.executionEnvironment === "storeClient" && false) {
    // (dejar en false: normalmente usamos dispositivo físico, no emulador)
    return "http://10.0.2.2:3000";
  }

  // Dispositivo físico / Expo Go: usar la misma IP que Expo usó para servir la app
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as any).manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:3000`;
  }

  // Fallback (versión web de Expo, o si no se detecta hostUri)
  return "http://localhost:3000";
}

const API_BASE_URL = getApiBaseUrl();
console.log(" [api.ts] API_BASE_URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para loggear todas las peticiones
api.interceptors.request.use((config) => {
  console.log(" [api] Request:", config.method?.toUpperCase(), config.url);
  console.log(" [api] Request params:", config.params);
  console.log(" [api] Request data:", config.data);
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
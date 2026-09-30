import axios from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GATEWAY_PORT = 8080;

// ⚠️ CAMBIA ESTA URL SI TIENES PROBLEMAS DE CONEXIÓN
// Opciones:
// - Emulador Android: "http://10.0.2.2:8080"
// - Con adb reverse: "http://localhost:8080"
// - IP local de tu PC: "http://192.168.1.6:8080"
const MANUAL_API_URL = ""; // Déjalo vacío para detección automática

function getApiBaseUrl(): string {
  // Si hay una URL manual configurada, usarla
  if (MANUAL_API_URL) {
    return MANUAL_API_URL;
  }

  if (Platform.OS === "android" && __DEV__) {
    return `http://10.0.2.2:${GATEWAY_PORT}`;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as any).manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:${GATEWAY_PORT}`;
  }

  return `http://localhost:${GATEWAY_PORT}`;
}

const API_BASE_URL = getApiBaseUrl();
console.log(" [api.ts] API_BASE_URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("alerta_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(" [api] Request:", config.method?.toUpperCase(), config.url);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(" [api] Response:", response.config.url, "Status:", response.status);
    return response;
  },
  (error) => {
    console.error(" [api] Error:", error.config?.url, error.message);
    return Promise.reject(error);
  }
);

export default api;

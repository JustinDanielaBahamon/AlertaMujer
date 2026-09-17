import axios from "axios";
import { Platform } from "react-native";

// Detectar si estamos en emulador Android o dispositivo físico
// En web o dispositivo físico, usar la IP del PC. Solo usar 10.0.2.2 si estamos explícitamente en emulador Android.
const isAndroidEmulator = Platform.OS === 'android' && __DEV__ &&
  // Detectar si estamos en emulador verificando si podemos resolver el hostname del emulador
  // Por defecto en desarrollo móvil usaremos la IP del PC
  false; // Forzamos a usar la IP del PC por defecto

// Para emulador Android: 10.0.2.2
// Para dispositivo físico: usar la IP del PC
const API_BASE_URL = isAndroidEmulator
  ? "http://10.0.2.2:3000"
  : "http://10.3.234.163:3000"; // IP del PC para dispositivo físico y web

console.log('🌐 [api.ts] API_BASE_URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Agregar interceptor para loggear todas las peticiones
api.interceptors.request.use(config => {
  console.log('📡 [api] Request:', config.method?.toUpperCase(), config.url);
  console.log('📡 [api] Request params:', config.params);
  console.log('📡 [api] Request data:', config.data);
  return config;
});

api.interceptors.response.use(response => {
  console.log('✅ [api] Response:', response.config.url, 'Status:', response.status);
  console.log('✅ [api] Response data:', response.data);
  return response;
}, error => {
  console.error('❌ [api] Error:', error.config?.url, error.message);
  console.error('❌ [api] Error response:', error.response?.data);
  return Promise.reject(error);
});

export default api;
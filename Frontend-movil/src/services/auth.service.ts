import api from './api';
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  correo: string;
  telefono: string;
  rol: string;
  estado: string;
  avatarColor?: string;
  role_id?: number;
  first_name?: string;
  last_name?: string;
  password?: string;
}

export interface RegisterData {
  nombre: string;
  correo: string;
  email?: string;
  password: string;
  telefono?: string;
  fechaNacimiento?: string;
  municipio?: string;
}

export const authService = {
  async login(correo: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/identity/auth/login', {
      email: correo,
      password,
    });

    const { token, usuario } = response.data;
    await AsyncStorage.setItem("alerta_token", token);
    await AsyncStorage.setItem("alerta_user", JSON.stringify(usuario));

    return { token, usuario };
  },

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/identity/auth/register', {
      nombre: data.nombre,
      email: data.correo,
      password: data.password,
      telefono: data.telefono,
    });

    const { token, usuario } = response.data;
    await AsyncStorage.setItem("alerta_token", token);
    await AsyncStorage.setItem("alerta_user", JSON.stringify(usuario));

    return { token, usuario };
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem("alerta_token");
    await AsyncStorage.removeItem("alerta_user");
  },

  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem("alerta_token");
  },

  async getCurrentUser(): Promise<Usuario | null> {
    const raw = await AsyncStorage.getItem("alerta_user");
    return raw ? JSON.parse(raw) : null;
  },
};

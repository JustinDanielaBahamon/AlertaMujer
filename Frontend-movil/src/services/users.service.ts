import api from './api';

// Estructura real que devuelve el backend (User entity)
export interface UserApi {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  telephone?: string;
  roleId: number;
  documentNumber?: string;
  documentType?: string;
  birthdate?: string;
  createdAt: string;
}

export interface UpdateMePayload {
  firstName?: string;
  lastName?: string;
  telephone?: string;
  documentNumber?: string;
  documentType?: string;
  birthdate?: string; // formato yyyy-MM-dd
}

export const getMe = async (): Promise<UserApi> => {
  const response = await api.get<UserApi>('/api/users/me');
  return response.data;
};

export const updateMe = async (updates: UpdateMePayload): Promise<UserApi> => {
  const response = await api.put<UserApi>('/api/users/me', updates);
  return response.data;
};

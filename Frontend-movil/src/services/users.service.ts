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
  profilePhoto?: string | null; // data URI de la foto de perfil
  createdAt: string;
}

export interface UpdateMePayload {
  firstName?: string;
  lastName?: string;
  telephone?: string;
  documentNumber?: string;
  documentType?: string;
  birthdate?: string; // formato yyyy-MM-dd
  profilePhoto?: string; // data URI; "" la quita
}

export const getMe = async (): Promise<UserApi> => {
  const response = await api.get<UserApi>('/api/users/me');
  return response.data;
};

export const updateMe = async (updates: UpdateMePayload): Promise<UserApi> => {
  const response = await api.put<UserApi>('/api/users/me', updates);
  return response.data;
};

/** Palabra que la usuaria escribe para confirmar que quiere eliminar su cuenta. */
export const CONFIRMACION_ELIMINAR = 'ELIMINAR';

/**
 * Elimina la cuenta de la usuaria en sesión: se borran sus datos personales, contactos, ubicaciones
 * y grabaciones. No se puede deshacer.
 */
export const eliminarMiCuenta = async (confirmacion: string): Promise<void> => {
  await api.delete('/api/users/me', { data: { confirmation: confirmacion } });
};

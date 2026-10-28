import api from './api';

// Real structure the backend returns (User entity)
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
  profilePhoto?: string | null; // data URI of the profile photo
  createdAt: string;
}

export interface UpdateMePayload {
  firstName?: string;
  lastName?: string;
  telephone?: string;
  documentNumber?: string;
  documentType?: string;
  birthdate?: string; // yyyy-MM-dd format
  profilePhoto?: string; // data URI; "" removes it
}

export const getMe = async (): Promise<UserApi> => {
  const response = await api.get<UserApi>('/api/users/me');
  return response.data;
};

export const updateMe = async (updates: UpdateMePayload): Promise<UserApi> => {
  const response = await api.put<UserApi>('/api/users/me', updates);
  return response.data;
};

/** Word the user types to confirm she wants to delete her account. */
export const DELETE_CONFIRMATION = 'ELIMINAR';

/**
 * Deletes the signed-in user's account: her personal data, contacts, locations
 * and recordings are deleted. It cannot be undone.
 */
export const deleteMyAccount = async (confirmation: string): Promise<void> => {
  await api.delete('/api/users/me', { data: { confirmation: confirmation } });
};

import api from './api';

export interface EmergencyContact {
  id: number | string;
  user_profile_id: number | string;
  contact_name: string;
  telephone: string;
  email?: string;
  relationship?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateContactData {
  user_profile_id: number | string;
  contact_name: string;
  telephone: string;
  email?: string;
  relationship?: string;
}

export const contactosService = {
  async getContactos(userProfileId: number | string): Promise<EmergencyContact[]> {
    const response = await api.get<EmergencyContact[]>(`/api/identity/users/me/contacts`);
    return response.data;
  },

  async addContacto(data: CreateContactData): Promise<EmergencyContact> {
    const response = await api.post<EmergencyContact>(`/api/identity/users/me/contacts`, data);
    return response.data;
  },

  async updateContacto(id: number | string, data: Partial<CreateContactData>): Promise<EmergencyContact> {
    const response = await api.put<EmergencyContact>(`/api/identity/users/me/contacts/${id}`, data);
    return response.data;
  },

  async deleteContacto(id: number | string): Promise<void> {
    await api.delete(`/api/identity/users/me/contacts/${id}`);
  },
};

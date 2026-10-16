import api from './api';

export interface EmergencyContact {
  id: number | string;
  userProfileId: number | string;
  contactName: string;
  telephone: string;
  email?: string;
  relationship?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateContactData {
  userProfileId?: number | string;
  contactName: string;
  telephone: string;
  email?: string;
  relationship?: string;
}

export const contactosService = {
  async getContactos(userProfileId: number | string): Promise<EmergencyContact[]> {

    // Conectar al backend Spring Boot usando el nuevo endpoint
    const url = `/api/contacts/user/${userProfileId}`;

    const response = await api.get<EmergencyContact[]>(url);

    return response.data;
  },

  async addContacto(data: CreateContactData): Promise<EmergencyContact> {

    // Conectar al backend Spring Boot (NO enviamos userProfileId, el backend lo establece automáticamente)
    const nuevoContacto = {
      contactName: data.contactName,
      telephone: data.telephone,
      email: data.email,
      relationship: data.relationship,
    };

    const postResponse = await api.post<EmergencyContact>('/api/contacts', nuevoContacto);
    return postResponse.data;
  },

  async updateContacto(id: number | string, data: Partial<CreateContactData>): Promise<EmergencyContact> {

    const response = await api.put<EmergencyContact>(`/api/contacts/${id}`, data);
    return response.data;
  },

  async deleteContacto(id: number | string): Promise<void> {

    await api.delete(`/api/contacts/${id}`);
  },
};
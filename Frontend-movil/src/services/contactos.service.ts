import api from './api';

export interface EmergencyContact {
  id: number | string;
  userProfileId: number | string;
  contactName: string;
  telephone: string;
  email?: string;
  relationship?: string;
  photo?: string | null; // data URI de la foto (ver fotos.service)
  createdAt: string;
  updatedAt?: string;
}

export interface CreateContactData {
  userProfileId?: number | string;
  contactName: string;
  telephone: string;
  email?: string;
  relationship?: string;
  photo?: string; // "" la quita al actualizar
}

/** Si al contacto le llega el aviso en el celular: app con avisos, cuenta sin celular o solo correo. */
export type ContactAppStatus = 'app' | 'account' | 'none';

export const contactsService = {
  async getAppStatus(): Promise<Record<string, ContactAppStatus>> {
    const response = await api.get<Record<string, ContactAppStatus>>('/api/contacts/app-status');
    return response.data;
  },

  async getContacts(userProfileId: number | string): Promise<EmergencyContact[]> {

    // Conectar al backend Spring Boot usando el nuevo endpoint
    const url = `/api/contacts/user/${userProfileId}`;

    const response = await api.get<EmergencyContact[]>(url);

    return response.data;
  },

  async addContact(data: CreateContactData): Promise<EmergencyContact> {

    // Conectar al backend Spring Boot (NO enviamos userProfileId, el backend lo establece automáticamente)
    const newContact = {
      contactName: data.contactName,
      telephone: data.telephone,
      email: data.email,
      relationship: data.relationship,
      photo: data.photo || undefined,
    };

    const postResponse = await api.post<EmergencyContact>('/api/contacts', newContact);
    return postResponse.data;
  },

  async updateContact(id: number | string, data: Partial<CreateContactData>): Promise<EmergencyContact> {

    const response = await api.put<EmergencyContact>(`/api/contacts/${id}`, data);
    return response.data;
  },

  async deleteContact(id: number | string): Promise<void> {

    await api.delete(`/api/contacts/${id}`);
  },
};
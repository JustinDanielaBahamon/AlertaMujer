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
    console.log('[contactos.service] getContactos INICIADO');
    console.log('[contactos.service] userProfileId recibido:', userProfileId);

    // Conectar al backend Spring Boot usando el nuevo endpoint
    const url = `/api/contacts/user/${userProfileId}`;
    console.log('[contactos.service] URL del GET:', url);

    const response = await api.get<EmergencyContact[]>(url);
    console.log('✅ [contactos.service] Respuesta del servidor:', response.data);

    return response.data;
  },

  async addContacto(data: CreateContactData): Promise<EmergencyContact> {
    console.log('[contactos.service] addContacto INICIADO');
    console.log('[contactos.service] data:', data);

    // Conectar al backend Spring Boot (NO enviamos userProfileId, el backend lo establece automáticamente)
    const nuevoContacto = {
      contactName: data.contactName,
      telephone: data.telephone,
      email: data.email,
      relationship: data.relationship,
    };
    console.log('[contactos.service] nuevoContacto a enviar:', nuevoContacto);

    const postResponse = await api.post<EmergencyContact>('/api/contacts', nuevoContacto);
    console.log('✅[contactos.service] Respuesta POST:', postResponse.data);
    return postResponse.data;
  },

  async updateContacto(id: number | string, data: Partial<CreateContactData>): Promise<EmergencyContact> {
    console.log('[contactos.service] updateContacto INICIADO');
    console.log('[contactos.service] id:', id);
    console.log('[contactos.service] data:', data);

    const response = await api.put<EmergencyContact>(`/api/contacts/${id}`, data);
    console.log('✅[contactos.service] Respuesta PUT:', response.data);
    return response.data;
  },

  async deleteContacto(id: number | string): Promise<void> {
    console.log('[contactos.service] deleteContacto INICIADO');
    console.log('[contactos.service] id:', id);

    await api.delete(`/api/contacts/${id}`);
    console.log('✅[contactos.service] Contacto eliminado');
  },
};
import api from './api';

export interface EmergencyContact {
  id: number;
  user_profile_id: number;
  contact_name: string;
  telephone: string;
  email?: string;
  relationship?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateContactData {
  user_profile_id: number;
  contact_name: string;
  telephone: string;
  email?: string;
  relationship?: string;
}

export const contactosService = {
  async getContactos(userProfileId: number | string): Promise<EmergencyContact[]> {
    console.log('🔍 [contactos.service] getContactos INICIADO');
    console.log('🔍 [contactos.service] userProfileId recibido:', userProfileId);
    console.log('🔍 [contactos.service] typeof userProfileId:', typeof userProfileId);

    // Asegurar que el ID sea numérico para que JSON Server filtre correctamente
    const numericId = typeof userProfileId === 'string' ? parseInt(userProfileId, 10) : userProfileId;
    console.log('🔢 [contactos.service] numericId después de conversión:', numericId);
    console.log('🔢 [contactos.service] typeof numericId:', typeof numericId);

    const url = `/emergency_contact?user_profile_id=${numericId}`;
    console.log('📡 [contactos.service] URL del GET:', url);

    const response = await api.get<EmergencyContact[]>(url);
    console.log('✅ [contactos.service] Respuesta del servidor:', response.data);
    console.log('📊 [contactos.service] Cantidad de contactos en respuesta:', response.data.length);

    return response.data;
  },

  async addContacto(data: CreateContactData): Promise<EmergencyContact> {
    console.log('➕ [contactos.service] addContacto INICIADO');
    console.log('➕ [contactos.service] data:', data);

    // Obtener el ID numérico más alto actual
    const response = await api.get<EmergencyContact[]>('/emergency_contact');
    const existingContacts = response.data;
    console.log('📊 [contactos.service] Contactos existentes:', existingContacts.length);

    const maxId = existingContacts.length > 0
      ? Math.max(...existingContacts.map(c => typeof c.id === 'number' ? c.id : 0))
      : 0;
    console.log('🔢 [contactos.service] maxId actual:', maxId);

    // Crear el nuevo contacto con ID numérico
    const nuevoContacto = {
      ...data,
      id: maxId + 1,
      created_at: new Date().toISOString(),
    };
    console.log('➕ [contactos.service] nuevoContacto a enviar:', nuevoContacto);

    const postResponse = await api.post<EmergencyContact>('/emergency_contact', nuevoContacto);
    console.log('✅ [contactos.service] Respuesta POST:', postResponse.data);
    return postResponse.data;
  },

  async updateContacto(id: number, data: Partial<CreateContactData>): Promise<EmergencyContact> {
    console.log('🔄 [contactos.service] updateContacto INICIADO');
    console.log('🔄 [contactos.service] id:', id);
    console.log('🔄 [contactos.service] data:', data);

    const response = await api.put<EmergencyContact>(`/emergency_contact/${id}`, data);
    console.log('✅ [contactos.service] Respuesta PUT:', response.data);
    return response.data;
  },

  async deleteContacto(id: number): Promise<void> {
    console.log('🗑️ [contactos.service] deleteContacto INICIADO');
    console.log('🗑️ [contactos.service] id:', id);

    await api.delete(`/emergency_contact/${id}`);
    console.log('✅ [contactos.service] Contacto eliminado');
  },
};

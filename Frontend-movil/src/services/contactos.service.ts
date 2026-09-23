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
    console.log('[contactos.service] getContactos INICIADO');
    console.log('[contactos.service] userProfileId recibido:', userProfileId);
    console.log('[contactos.service] typeof userProfileId:', typeof userProfileId);

    // YA NO filtramos con "?user_profile_id=" en la URL.
    // En la base de datos falsa (json-server), el campo "user_profile_id"
    // a veces quedó guardado como número (9) y a veces como texto ("9").
    // El filtro por query string del servidor solo encuentra un tipo a la vez,
    // así que los contactos nuevos (guardados como texto) "desaparecían" al
    // recargar. Trayendo todos y comparando como texto acá en el cliente,
    // siempre los encontramos sin importar cómo hayan quedado guardados.
    const url = '/emergency_contact';
    console.log('[contactos.service] URL del GET:', url);

    const response = await api.get<EmergencyContact[]>(url);
    const targetId = String(userProfileId);
    const contactosDelUsuario = response.data.filter(
      (ec) => String(ec.user_profile_id) === targetId
    );

    console.log('✅ [contactos.service] Respuesta del servidor (todos):', response.data);
    console.log('[contactos.service] Cantidad total en servidor:', response.data.length);
    console.log('[contactos.service] Cantidad filtrada para este usuario:', contactosDelUsuario.length);

    return contactosDelUsuario;
  },

  async addContacto(data: CreateContactData): Promise<EmergencyContact> {
    console.log('[contactos.service] addContacto INICIADO');
    console.log('[contactos.service] data:', data);

    // Ya NO calculamos ni mandamos "id" a mano. json-server siempre guarda
    // los ids como texto (ej: "1", "2"...) y los genera él solo. El cálculo
    // anterior (maxId) comparaba "typeof id === 'number'", pero TODOS los
    // ids en la base falsa son texto, así que maxId siempre daba 0 y
    // siempre se mandaba id:1 — que ya existía (Juan Pérez). El servidor lo
    // ignoraba y ponía un id aleatorio raro por su cuenta. Dejamos que el
    // servidor genere el id siempre, así no hay choques.
    const nuevoContacto = {
      ...data,
      created_at: new Date().toISOString(),
    };
    console.log('[contactos.service] nuevoContacto a enviar:', nuevoContacto);

    const postResponse = await api.post<EmergencyContact>('/emergency_contact', nuevoContacto);
    console.log('✅[contactos.service] Respuesta POST:', postResponse.data);
    return postResponse.data;
  },

  async updateContacto(id: number | string, data: Partial<CreateContactData>): Promise<EmergencyContact> {
    console.log('[contactos.service] updateContacto INICIADO');
    console.log('[contactos.service] id:', id);
    console.log('[contactos.service] data:', data);

    const response = await api.put<EmergencyContact>(`/emergency_contact/${id}`, data);
    console.log('✅[contactos.service] Respuesta PUT:', response.data);
    return response.data;
  },

  async deleteContacto(id: number | string): Promise<void> {
    console.log('[contactos.service] deleteContacto INICIADO');
    console.log('[contactos.service] id:', id);

    await api.delete(`/emergency_contact/${id}`);
    console.log('✅[contactos.service] Contacto eliminado');
  },
};
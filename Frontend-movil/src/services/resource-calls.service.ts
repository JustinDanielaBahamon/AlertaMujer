import api from './api';

// Tipos del backend para ResourceCall
export interface ResourceCallApi {
  id: number;
  userProfileId: number;
  emergencyResourceId: number;
  resourceName: string;
  phone: string;
  callType?: string;
  durationSeconds?: number;
  status?: 'completada' | 'no_respondida' | 'fallida';
  createdAt?: string;
}

// Datos para crear una nueva llamada
export interface CreateResourceCallData {
  userProfileId: number;
  emergencyResourceId: number;
  resourceName: string;
  phone: string;
  callType?: string;
}

// Servicios de resource-calls

/**
 * Obtener todas las llamadas a recursos (admin)
 */
export const getAllResourceCalls = async (): Promise<ResourceCallApi[]> => {
  const response = await api.get<ResourceCallApi[]>('/api/resource-calls');
  return response.data;
};

/**
 * Obtener llamadas por usuario perfil
 */
export const getResourceCallsByUser = async (userProfileId: number): Promise<ResourceCallApi[]> => {
  const response = await api.get<ResourceCallApi[]>(`/api/resource-calls/user/${userProfileId}`);
  return response.data;
};

/**
 * Obtener llamadas del usuario actual
 */
export const getMyResourceCalls = async (currentUserId?: number): Promise<ResourceCallApi[]> => {
  if (currentUserId) {
    const response = await api.get<ResourceCallApi[]>(`/api/resource-calls/me`);
    return response.data;
  }
  // Si no hay userId, intentar obtener las del usuario autenticado
  // (el backend lo inferirá del token)
  const response = await api.get<ResourceCallApi[]>('/api/resource-calls/me');
  return response.data;
};

/**
 * Obtener llamadas por recurso de emergencia
 */
export const getResourceCallsByResource = async (emergencyResourceId: number): Promise<ResourceCallApi[]> => {
  const response = await api.get<ResourceCallApi[]>(
    `/api/resource-calls/resource/${emergencyResourceId}`
  );
  return response.data;
};

/**
 * Obtener llamadas por alerta
 */
export const getResourceCallsByAlert = async (alertId: number): Promise<ResourceCallApi[]> => {
  const response = await api.get<ResourceCallApi[]>(
    `/api/resource-calls/alert/${alertId}`
  );
  return response.data;
};

/**
 * Crear nueva llamada a recurso
 */
export const createResourceCall = async (
  data: CreateResourceCallData
): Promise<ResourceCallApi> => {
  const response = await api.post<ResourceCallApi>('/api/resource-calls', data);
  return response.data;
};

/**
 * Actualizar llamada existente
 */
export const updateResourceCall = async (
  id: number,
  data: Partial<CreateResourceCallData>
): Promise<ResourceCallApi> => {
  const response = await api.put<ResourceCallApi>(
    `/api/resource-calls/${id}`,
    data
  );
  return response.data;
};

/**
 * Eliminar llamada
 */
export const deleteResourceCall = async (id: number): Promise<void> => {
  await api.delete<void>(`/api/resource-calls/${id}`);
};
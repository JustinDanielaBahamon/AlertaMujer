import api from './api';

// Estructura real que devuelve el backend (EmergencyResource entity)
export interface EmergencyResourceApi {
  id: number;
  name: string;
  resourceType: string;
  telephone?: string;
  secondaryTelephone?: string;
  email?: string;
  address?: string;
  city: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  isActive: boolean;
}

export const getRecursosEmergencia = async (): Promise<EmergencyResourceApi[]> => {
  const response = await api.get<EmergencyResourceApi[]>('/api/resources');
  return response.data;
};

import api from './api';

// Estructura real que devuelve el backend (Zone entity)
export interface ZoneApi {
  id: number;
  name: string;
  zoneType: string;
  riskLevel: string;
  description?: string;
  address?: string;
  city: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isActive: boolean;
  createdAt: string;
}

export const getZonas = async (): Promise<ZoneApi[]> => {
  const response = await api.get<ZoneApi[]>('/api/zones');
  return response.data;
};

export const getZonasByCity = async (city: string): Promise<ZoneApi[]> => {
  const response = await api.get<ZoneApi[]>(`/api/zones/city/${city}`);
  return response.data;
};

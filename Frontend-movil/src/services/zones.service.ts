import api from './api';

// Real structure the backend returns (Zone entity)
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

export const getZones = async (): Promise<ZoneApi[]> => {
  const response = await api.get<ZoneApi[]>('/api/zones');
  return response.data;
};

export const getZonesByCity = async (city: string): Promise<ZoneApi[]> => {
  const response = await api.get<ZoneApi[]>(`/api/zones/city/${city}`);
  return response.data;
};

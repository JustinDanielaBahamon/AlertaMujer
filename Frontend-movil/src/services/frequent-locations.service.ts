import api from './api';

// Estructura real que devuelve el backend (FrequentLocation entity)
export interface FrequentLocationApi {
  id: number;
  userProfileId: number;
  name: string;
  address?: string;
  city?: string;
  latitude: number;
  longitude: number;
  notes?: string;
  riskLevel?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateFrequentLocationData {
  user_profile_id: number | string;
  name: string;
  address?: string;
  city?: string;
  latitude: number;
  longitude: number;
  notes?: string;
  risk_level?: string;
}

export const frequentLocationsService = {
  async getByUser(userProfileId: number | string): Promise<FrequentLocationApi[]> {
    const response = await api.get<FrequentLocationApi[]>(`/api/frequent-locations/user/${userProfileId}`);
    return response.data;
  },

  async create(data: CreateFrequentLocationData): Promise<FrequentLocationApi> {
    const payload = {
      userProfileId: Number(data.user_profile_id),
      name: data.name,
      address: data.address,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      notes: data.notes,
      riskLevel: data.risk_level ?? 'moderada',
      isActive: true,
    };
    const response = await api.post<FrequentLocationApi>('/api/frequent-locations', payload);
    return response.data;
  },

  async update(id: number | string, data: Partial<CreateFrequentLocationData>): Promise<FrequentLocationApi> {
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.address !== undefined) payload.address = data.address;
    if (data.city !== undefined) payload.city = data.city;
    if (data.latitude !== undefined) payload.latitude = data.latitude;
    if (data.longitude !== undefined) payload.longitude = data.longitude;
    if (data.notes !== undefined) payload.notes = data.notes;
    if (data.risk_level !== undefined) payload.riskLevel = data.risk_level;
    if (data.user_profile_id !== undefined) payload.userProfileId = Number(data.user_profile_id);
    const response = await api.put<FrequentLocationApi>(`/api/frequent-locations/${id}`, payload);
    return response.data;
  },

  async remove(id: number | string): Promise<void> {
    await api.delete(`/api/frequent-locations/${id}`);
  },
};

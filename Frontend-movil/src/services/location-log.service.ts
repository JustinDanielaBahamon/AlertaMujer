import api from './api';

export interface LocationLogApi {
  id: number;
  userProfileId: number;
  alertId?: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  recordedAt: string;
}

export interface CreateLocationLogData {
  userProfileId: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  alertId?: number;
}

export const locationLogService = {
  async getByUser(userProfileId: number): Promise<LocationLogApi[]> {
    const response = await api.get<LocationLogApi[]>(`/api/location-logs/user-id/${userProfileId}`);
    return response.data;
  },

  async create(data: CreateLocationLogData): Promise<LocationLogApi> {
    const payload = {
      // No enviamos userProfileId, el backend lo establece automáticamente
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: data.accuracy,
      alertId: data.alertId,
    };
    const response = await api.post<LocationLogApi>('/api/location-logs', payload);
    return response.data;
  },
};

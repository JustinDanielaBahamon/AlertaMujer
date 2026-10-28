import api from './api';

// Routes saved in the backend (shared with the web)
export interface SavedRoutePoint {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface SavedRouteApi {
  id: number;
  name: string;
  startLabel?: string;
  endLabel?: string;
  city?: string;
  department?: string;
  country?: string;
  distanceKm?: number;
  estimatedMinutes?: number;
  points: SavedRoutePoint[];
  isStarred: boolean;
  isManual: boolean;
  createdAt: string;
}

export interface CreateSavedRouteData {
  name: string;
  startLabel?: string;
  endLabel?: string;
  city?: string;
  department?: string;
  country?: string;
  distanceKm?: number | null;
  estimatedMinutes?: number | null;
  points: SavedRoutePoint[];
  isManual?: boolean;
}

export const savedRoutesService = {
  async getMine(): Promise<SavedRouteApi[]> {
    const response = await api.get<SavedRouteApi[]>('/api/saved-routes/me');
    return response.data;
  },

  // The backend decides the star (starred while there is room) and validates the maximum of 4
  async create(data: CreateSavedRouteData): Promise<SavedRouteApi> {
    const response = await api.post<SavedRouteApi>('/api/saved-routes', data);
    return response.data;
  },

  async update(id: number | string, changes: { name?: string; isStarred?: boolean }): Promise<SavedRouteApi> {
    const response = await api.patch<SavedRouteApi>(`/api/saved-routes/${id}`, changes);
    return response.data;
  },

  async remove(id: number | string): Promise<void> {
    await api.delete(`/api/saved-routes/${id}`);
  },
};

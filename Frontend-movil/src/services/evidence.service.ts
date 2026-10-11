import api from './api';

/**
 * Evidence entity structure from backend
 */
export interface EvidenceApi {
  id: number;
  alertId: number;
  mediaType: string; // 'photo', 'video', 'audio'
  fileUrl: string;
  createdAt: string;
}

/**
 * Data structure for creating new evidence
 */
export interface CreateEvidenceData {
  alertId: number;
  mediaType: string;
  fileUrl: string;
}

/**
 * Evidence Service for managing alert evidence (photos, videos, audio)
 * Connects to Spring Boot backend endpoint /api/evidences
 */
export const evidenceService = {
  /**
   * Get all evidence records for a specific user
   * Note: Backend uses user_profile_id, but endpoint might need adjustment
   */
  async getByUser(userProfileId: number): Promise<EvidenceApi[]> {
    console.log('[evidence.service] getByUser INICIADO');
    console.log('[evidence.service] userProfileId:', userProfileId);

    // TODO: Confirm with backend if endpoint is /user/{id} or /user-profile/{id}
    // Assuming /api/evidences returns all and backend filters by user
    const response = await api.get<EvidenceApi[]>('/api/evidences');
    console.log('✅ [evidence.service] Respuesta del servidor:', response.data);
    
    return response.data;
  },

  /**
   * Get all evidence for a specific alert
   */
  async getByAlert(alertId: number): Promise<EvidenceApi[]> {
    console.log('[evidence.service] getByAlert INICIADO');
    console.log('[evidence.service] alertId:', alertId);

    const response = await api.get<EvidenceApi[]>(`/api/evidences/alert/${alertId}`);
    console.log('✅ [evidence.service] Respuesta del servidor:', response.data);
    
    return response.data;
  },

  /**
   * Create new evidence record
   * Important: File upload should happen separately to a file storage service
   * This endpoint just saves the metadata with the file URL
   */
  async create(data: CreateEvidenceData): Promise<EvidenceApi> {
    console.log('[evidence.service] create INICIADO');
    console.log('[evidence.service] data:', data);

    const evidencePayload = {
      alertId: data.alertId,
      mediaType: data.mediaType,
      fileUrl: data.fileUrl,
    };
    console.log('[evidence.service] payload a enviar:', evidencePayload);

    const response = await api.post<EvidenceApi>('/api/evidences', evidencePayload);
    console.log('✅ [evidence.service] Respuesta POST:', response.data);
    
    return response.data;
  },

  /**
   * Delete evidence record
   */
  async delete(id: number): Promise<void> {
    console.log('[evidence.service] delete INICIADO');
    console.log('[evidence.service] id:', id);

    await api.delete(`/api/evidences/${id}`);
    console.log('✅ [evidence.service] Evidencia eliminada');
  },
};

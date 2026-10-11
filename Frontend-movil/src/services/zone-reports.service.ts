import api from './api';

// Tipos del backend para ZoneReport
export interface ZoneReportApi {
  id: number;
  zoneId: number;
  userProfileId: number;
  zoneName: string;
  zoneType?: string;
  status: 'active' | 'inactive' | 'approved' | 'pending';
  reportedAt: string;
  resolvedAt?: string;
  description?: string;
}

// Datos para crear un nuevo reporte de zona
export interface CreateZoneReportData {
  userProfileId: number;
  zoneId: number;
  zoneName: string;
  zoneType?: string;
  description?: string;
}

// Servicios de zone-reports

/**
 * Obtener todos los reportes de zonas (admin)
 */
export const getAllZoneReports = async (): Promise<ZoneReportApi[]> => {
  const response = await api.get<ZoneReportApi[]>('/api/zone-reports');
  return response.data;
};

/**
 * Obtener reporte por ID
 */
export const getZoneReportById = async (id: number): Promise<ZoneReportApi> => {
  const response = await api.get<ZoneReportApi>(`/api/zone-reports/${id}`);
  return response.data;
};

/**
 * Obtener reportes por usuario perfil
 */
export const getZoneReportsByUser = async (userProfileId: number): Promise<ZoneReportApi[]> => {
  const response = await api.get<ZoneReportApi[]>(
    `/api/zone-reports/user/${userProfileId}`
  );
  return response.data;
};

/**
 * Obtener reportes por zona
 */
export const getZoneReportsByZone = async (zoneId: number): Promise<ZoneReportApi[]> => {
  const response = await api.get<ZoneReportApi[]>(
    `/api/zone-reports/zone/${zoneId}`
  );
  return response.data;
};

/**
 * Obtener reportes por estado
 */
export const getZoneReportsByStatus = async (
  status: ZoneReportApi['status']
): Promise<ZoneReportApi[]> => {
  const response = await api.get<ZoneReportApi[]>(
    `/api/zone-reports/status/${status}`
  );
  return response.data;
};

/**
 * Crear nuevo reporte de zona
 */
export const createZoneReport = async (
  data: CreateZoneReportData
): Promise<ZoneReportApi> => {
  const response = await api.post<ZoneReportApi>('/api/zone-reports', data);
  return response.data;
};

/**
 * Actualizar reporte existente
 */
export const updateZoneReport = async (
  id: number,
  data: Partial<ZoneReportApi>
): Promise<ZoneReportApi> => {
  const response = await api.put<ZoneReportApi>(
    `/api/zone-reports/${id}`,
    data
  );
  return response.data;
};

/**
 * Aprobar reporte (solo admin)
 */
export const approveZoneReport = async (
  id: number,
  adminId: number
): Promise<ZoneReportApi> => {
  const response = await api.put<ZoneReportApi>(
    `/api/zone-reports/${id}/approve`,
    { adminId }
  );
  return response.data;
};

/**
 * Rechazar reporte (solo admin)
 */
export const rejectZoneReport = async (
  id: number,
  adminId: number
): Promise<ZoneReportApi> => {
  const response = await api.put<ZoneReportApi>(
    `/api/zone-reports/${id}/reject`,
    { adminId }
  );
  return response.data;
};

/**
 * Eliminar reporte
 */
export const deleteZoneReport = async (id: number): Promise<void> => {
  await api.delete<void>(`/api/zone-reports/${id}`);
};
import api from './api';

export const getAlertasByUsuario = async (usuarioId: number) => {
  const response = await api.get(`/api/alerts/user/${usuarioId}`);
  return response.data;
};
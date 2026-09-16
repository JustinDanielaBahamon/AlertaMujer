import api from './api';

export const getAlertasByUsuario = async (usuarioId: number) => {
  const response = await api.get(`/alertas?usuarioId=${usuarioId}`);
  return response.data;
};
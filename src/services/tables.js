import api from './api';

export const tablesService = {
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/tables${params ? `?${params}` : ''}`);
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/tables/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/tables', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/tables/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/tables/${id}`);
    return response.data;
  },

  async changeStatus(id, estado) {
    const response = await api.patch(`/tables/${id}/estado`, { sEstado: estado });
    return response.data;
  },

  async llamarMesero(id, contexto) {
    const response = await api.post(`/tables/${id}/llamar`, { contexto });
    return response.data;
  },

  async atenderLlamada(id) {
    const response = await api.post(`/tables/${id}/atender`);
    return response.data;
  }
};
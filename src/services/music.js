import api from './api';

/* ══════════════════════════════════════════════════════════════
   musicService — Servicio para la Rockola Digital
══════════════════════════════════════════════════════════════ */
export const musicService = {

  /* Buscar canciones en Spotify */
  searchTracks: async (query) => {
    const { data } = await api.get('/music/search', { params: { q: query } });
    return data;
  },

  /* Obtener recomendaciones */
  getRecommendations: async () => {
    const { data } = await api.get('/music/recommendations');
    return data;
  },

  /* Solicitar una canción (cliente) */
  requestSong: async (trackData) => {
    const { data } = await api.post('/music/request', trackData);
    return data;
  },

  /* Ver la cola activa */
  getQueue: async () => {
    const { data } = await api.get('/music/queue');
    return data;
  },

  /* Ver mis solicitudes de la sesión */
  getMyRequests: async () => {
    const { data } = await api.get('/music/my-requests');
    return data;
  },

  /* Cambiar estado de una canción (staff) */
  changeStatus: async (id, sEstado) => {
    const { data } = await api.patch(`/music/queue/${id}/status`, { sEstado });
    return data;
  },

  /* Staff agrega canción manualmente */
  staffAddSong: async (trackData) => {
    const { data } = await api.post('/music/queue/staff-add', trackData);
    return data;
  },

  /* Eliminar canción de la cola (staff) */
  removeSong: async (id) => {
    const { data } = await api.delete(`/music/queue/${id}`);
    return data;
  },

  /* Cliente cancela su propia canción (recupera 1 crédito) */
  cancelMySong: async (id) => {
    const { data } = await api.patch(`/music/my-requests/${id}/cancel`);
    return data;
  },
};

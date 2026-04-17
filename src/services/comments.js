import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://itaquitobackend-production.up.railway.app/api';
const api = axios.create({ baseURL: API_URL });

/* ══════════════════════════════════════════════════════════════
   commentsService
══════════════════════════════════════════════════════════════ */
export const commentsService = {

  /*
    Guardar calificación / comentario
    { iMesaId, sEmoji, sCalificacion, sComentario }
  */
  create: async (data) => {
    const response = await api.post('/comments', data);
    return response.data;
  },

  /* Obtener todos (solo admin) */
  getAll: async () => {
    const token = localStorage.getItem('token');
    const response = await api.get('/comments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
};

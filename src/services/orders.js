import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://itaquitobackend-production.up.railway.app/api';
const api = axios.create({ baseURL: API_URL });

// Inyectar token en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ══════════════════════════════════════════════════════════════
   ordersService
══════════════════════════════════════════════════════════════ */
export const ordersService = {

  /*
    Crear pedido
    items: [{ iProductoId, iCantidad, sNotas? }]
  */
  create: async ({ iMesaId, items, sNotas = null, sTokenSesion = null }) => {
    const { data } = await api.post('/orders', { iMesaId, items, sNotas, sTokenSesion });
    return data;
  },

  /* Obtener todos (admin/staff) — filtros opcionales */
  getAll: async (filters = {}) => {
    const params = {};
    if (filters.sEstado) params.sEstado = filters.sEstado;
    if (filters.iMesaId) params.iMesaId = filters.iMesaId;
    if (filters.fecha)   params.fecha   = filters.fecha;
    if (filters.sTokenSesion) params.sTokenSesion = filters.sTokenSesion;
    const { data } = await api.get('/orders', { params });
    return data;
  },

  /* Detalle de un pedido */
  getById: async (id) => {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },

  /* Cambiar estado */
  changeStatus: async (id, sEstado) => {
    const { data } = await api.patch(`/orders/${id}/status`, { sEstado });
    return data;
  },

  /* Cancelar */
  cancel: async (id) => {
    const { data } = await api.delete(`/orders/${id}`);
    return data;
  },

  /* Enviar ticket por email */
  sendTicketEmail: async ({ email, tableName, items, total, sessionToken }) => {
    const { data } = await api.post('/orders/send-ticket-email', { email, tableName, items, total, sessionToken });
    return data;
  },

  /* Enviar ticket por WhatsApp automático */
  sendTicketWhatsApp: async ({ phone, tableName, items, total }) => {
    const { data } = await api.post('/orders/send-ticket-whatsapp', { phone, tableName, items, total });
    return data;
  },
};
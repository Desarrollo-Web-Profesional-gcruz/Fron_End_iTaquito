import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://itaquitobackend-production.up.railway.app/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authService = {

  // Login con soporte para 2FA
  login: async (email, password, twoFactorCode = null) => {
    try {
      const payload = { email, password };
      if (twoFactorCode) {
        payload.twoFactorCode = twoFactorCode;
      }
      
      const { data } = await api.post('/auth/login', payload);
      
      // Si el login fue exitoso (con token)
      if (data.token) {
        localStorage.setItem('token',   data.token);
        localStorage.setItem('user',    JSON.stringify(data.user));
        localStorage.setItem('loginAt', new Date().toISOString());
      }
      
      return data;
    } catch (error) {
      // Si el error es por requerir 2FA, propagamos la información
      if (error.response?.data?.requires2FA) {
        return error.response.data;
      }
      throw error;
    }
  },

  // Verificar 2FA con endpoint específico
  verify2FA: async (userId, twoFactorCode) => {
    const { data } = await api.post('/auth/verify-2fa', { userId, twoFactorCode });
    
    if (data.token) {
      localStorage.setItem('token',   data.token);
      localStorage.setItem('user',    JSON.stringify(data.user));
      localStorage.setItem('loginAt', new Date().toISOString());
    }
    
    return data;
  },

  // Logout
  logout: async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Notifica al backend ANTES de borrar el token
        await api.post('/auth/logout');
      }
    } catch (e) {
      console.warn('Error al notificar logout al backend:', e.message);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('loginAt');
      localStorage.removeItem('mesaSessionToken');
      localStorage.removeItem('meseroMesaId');
      localStorage.removeItem('meseroMesaNombre');
    }
  },

  // Registro de usuario
  register: async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },

  // ========== RECUPERACIÓN DE CONTRASEÑA ==========
  
  // Solicitar reset de contraseña (envía email)
  requestPasswordReset: async (email) => {
    const { data } = await api.post('/auth/request-reset', { email });
    return data;
  },

  // Verificar token de recuperación (válido/no expirado)
  verifyResetToken: async (token) => {
    const { data } = await api.get(`/auth/verify-reset-token/${token}`);
    return data;
  },

  // Restablecer contraseña con token
  resetPassword: async (token, newPassword) => {
    const { data } = await api.post('/auth/reset-password', { token, newPassword });
    return data;
  },

  // ========== ADMIN: Gestión de usuarios ==========

  // Admin: Resetear contraseña de usuario
  adminResetPassword: async (userId, newPassword) => {
    const { data } = await api.post(`/auth/admin/reset-password/${userId}`, { newPassword });
    return data;
  },

  // Admin: Generar contraseña temporal para usuario
  generateTempPassword: async (userId) => {
    const { data } = await api.post(`/auth/admin/generate-temp-password/${userId}`);
    return data;
  },

  // Admin: Activar 2FA para un usuario
  enable2FAForUser: async (userId) => {
    const { data } = await api.post(`/auth/admin/enable-2fa/${userId}`);
    return data;
  },

  // Admin: Desactivar 2FA para un usuario
  disable2FAForUser: async (userId) => {
    const { data } = await api.post(`/auth/admin/disable-2fa/${userId}`);
    return data;
  },

  // Usuario: Obtener códigos de respaldo
  getBackupCodes: async () => {
    const { data } = await api.get('/auth/my-backup-codes');
    return data;
  },

  // ========== UTILIDADES ==========

  // Obtener usuario actual del localStorage
  getCurrentUser: () => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  // Obtener fecha de login
  getLoginAt: () => localStorage.getItem('loginAt') || null,

  // Obtener token
  getToken: () => localStorage.getItem('token') || null,
};
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};

const HOME_BY_ROL = {
  admin: '/dashboard',
  mesero: '/tables',
  cajero: '/cajero',
  mesa: '/menu',
  taquero: '/taquero',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loginAt, setLoginAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pending2FA, setPending2FA] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = authService.getCurrentUser();
    const savedAt = authService.getLoginAt();
    if (saved) setUser(saved);
    if (savedAt) setLoginAt(savedAt);
    setLoading(false);
  }, []);

  // Login principal - maneja el flujo de 2FA
  const login = async (email, password, twoFactorCode = null) => {
    try {
      const data = await authService.login(email, password, twoFactorCode);
      
      // Caso 1: Se requiere 2FA
      if (data.requires2FA) {
        setPending2FA({
          userId: data.userId,
          email: email,
          password: password
        });
        return {
          requiresTwoFactor: true,
          userId: data.userId,
          message: data.message
        };
      }
      
      // Caso 2: Login exitoso
      if (data.token && data.user) {
   
        if (data.user.rol === 'mesa') {
          localStorage.removeItem('mesaSessionToken');
        }
        
        setUser(data.user);
        
        // Sincronizar loginAt desde el backend (que ahora es persistente por 12h)
        const currentLoginAt = data.user.dUltimoLogin || authService.getLoginAt();
        setLoginAt(currentLoginAt);
        localStorage.setItem('loginAt', currentLoginAt);

        setPending2FA(null);
        navigate(HOME_BY_ROL[data.user.rol] || '/dashboard');
        return { success: true, user: data.user };
      }
      
      return data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  // Verificar código 2FA
  const verify2FA = async (userId, twoFactorCode) => {
    try {
      const data = await authService.verify2FA(userId, twoFactorCode);
      
      if (data.token && data.user) {
        setUser(data.user);
        setLoginAt(authService.getLoginAt());
        setPending2FA(null);
        navigate(HOME_BY_ROL[data.user.rol] || '/dashboard');
        return { success: true, user: data.user };
      }
      
      return data;
    } catch (error) {
      console.error('Error al verificar 2FA:', error);
      throw error;
    }
  };

  // Verificar 2FA con código de respaldo
  const verify2FAWithBackup = async (email, password, backupCode) => {
    try {
      const data = await authService.login(email, password, backupCode);
      
      if (data.token && data.user) {
        setUser(data.user);
        setLoginAt(authService.getLoginAt());
        setPending2FA(null);
        navigate(HOME_BY_ROL[data.user.rol] || '/dashboard');
        return { success: true, user: data.user };
      }
      
      return data;
    } catch (error) {
      console.error('Error al verificar código de respaldo:', error);
      throw error;
    }
  };

  // Solicitar recuperación de contraseña
  const requestPasswordReset = async (email) => {
    try {
      const data = await authService.requestPasswordReset(email);
      return data;
    } catch (error) {
      console.error('Error en requestPasswordReset:', error);
      throw error;
    }
  };

  // Restablecer contraseña con token
  const resetPassword = async (token, newPassword) => {
    try {
      const data = await authService.resetPassword(token, newPassword);
      return data;
    } catch (error) {
      console.error('Error en resetPassword:', error);
      throw error;
    }
  };

  // Verificar token de recuperación
  const verifyResetToken = async (token) => {
    try {
      const data = await authService.verifyResetToken(token);
      return data;
    } catch (error) {
      console.error('Error en verifyResetToken:', error);
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setLoginAt(null);
    setPending2FA(null);
    navigate('/');
  };

  // Helpers para leer la mesa desde el user guardado en estado
  const getMesaId = () => user?.iMesaId || null;
  const mesaNombre = user?.mesa?.sNombre || (user?.iMesaId ? `Mesa ${user.iMesaId}` : null);

  const value = {
    user,
    loginAt,
    login,
    verify2FA,
    verify2FAWithBackup,
    requestPasswordReset,
    resetPassword,
    verifyResetToken,
    logout,
    loading,
    getMesaId,
    mesaNombre,
    iMesaId: user?.iMesaId || null,
    pending2FA,
    isAdmin: user?.rol === 'admin',
    isMesero: user?.rol === 'mesero',
    isCajero: user?.rol === 'cajero',
    isMesa: user?.rol === 'mesa',
    isTaquero: user?.rol === 'taquero',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
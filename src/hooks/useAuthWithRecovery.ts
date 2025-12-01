import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';

/**
 * Hook useAuthWithRecovery - Proporciona funcionalidades de autenticación con recuperación automática
 * 
 * Características:
 * - Acceso a datos de autenticación
 * - Verificación de autenticación con validación de token
 * - Recuperación automática de sesión
 * - Método de refresh de sesión
 * 
 * Uso:
 * ```
 * const { user, isAuthenticated, refreshSession } = useAuthWithRecovery();
 * ```
 */
export function useAuthWithRecovery() {
  const auth = useAuth();

  /**
   * Verificar si el usuario está completamente autenticado
   * (tiene usuario y token no expirado)
   */
  const isFullyAuthenticated = useCallback(() => {
    return auth.isAuthenticated && auth.user !== null;
  }, [auth.isAuthenticated, auth.user]);

  /**
   * Refrescar la sesión desde el storage
   */
  const refreshSession = useCallback(async () => {
    try {
      console.log('[useAuthWithRecovery] Refrescando sesión...');
      await auth.recoverSession();
      return true;
    } catch (error) {
      console.error('[useAuthWithRecovery] Error refrescando sesión:', error);
      return false;
    }
  }, [auth]);

  /**
   * Verificar el estado del token
   */
  const checkTokenStatus = useCallback(() => {
    return {
      isExpired: authService.isTokenExpired(),
      isValid: !authService.isTokenExpired(),
      hasToken: !!authService.getToken(),
    };
  }, []);

  return {
    // Datos de autenticación
    user: auth.user,
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    isFullyAuthenticated: isFullyAuthenticated(),

    // Métodos
    login: auth.login,
    logout: auth.logout,
    hasPermission: auth.hasPermission,
    refreshSession,
    checkTokenStatus,
  };
}

/**
 * Hook useRequireAuth - Para usar en componentes que requieren autenticación
 * Automáticamente redirige a login si no está autenticado
 */
export function useRequireAuth() {
  const auth = useAuthWithRecovery();

  if (!auth.isFullyAuthenticated && !auth.isLoading) {
    console.warn('[useRequireAuth] Usuario no autenticado');
    throw new Error('Usuario no autenticado');
  }

  return auth;
}

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';

/**
 * RouteValidator - Componente que valida la autenticación cuando cambia de ruta
 * 
 * Se debe colocar dentro del BrowserRouter para poder usar useLocation()
 * 
 * Propósito:
 * - Recuperar sesión cuando el usuario navega a una nueva ruta
 * - Validar que el token no esté expirado
 * - Limpiar sesión si el token expiró durante la navegación
 */
export function RouteValidator({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, recoverSession, isLoading } = useAuth();

  /**
   * Validar autenticación en cada cambio de ruta
   * Solo ejecutar DESPUÉS de la inicialización (cuando isLoading === false)
   */
  useEffect(() => {
    // No hacer nada durante la carga inicial
    if (isLoading) return;

    // Si no hay usuario pero hay token válido en storage, recuperar
    if (!user) {
      const token = authService.getToken();
      if (token && !authService.isTokenExpired()) {
        console.log('[RouteValidator] Token válido encontrado - recuperando sesión');
        recoverSession();
      }
      return;
    }

    // Si hay usuario, validar que el token siga siendo válido
    if (authService.isTokenExpired()) {
      console.warn('[RouteValidator] Token expirado - limpiando sesión');
      authService.logout();
    }
  }, [location, user, isLoading, recoverSession]);

  return <>{children}</>;
}

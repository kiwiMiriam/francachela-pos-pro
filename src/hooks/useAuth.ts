import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

/**
 * Hook para usar el contexto de autenticación
 * Lanza error si se usa fuera del proveedor
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

/**
 * StorageService - Servicio centralizado para manejo seguro de localStorage
 * 
 * Propósito:
 * - Abstracción de localStorage con validación
 * - Fallback seguro si localStorage no está disponible
 * - Logging centralizado
 * - Manejo consistente de errores de serialización
 */

interface StorageKey {
  readonly AUTH_TOKEN: 'auth_token';
  readonly USER_DATA: 'user';
  readonly PREFERENCES: 'app_preferences';
}

const STORAGE_KEYS: StorageKey = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user',
  PREFERENCES: 'app_preferences',
};

class StorageService {
  private isAvailable: boolean = false;

  constructor() {
    this.isAvailable = this.checkStorageAvailability();
  }

  /**
   * Verifica si localStorage está disponible
   */
  private checkStorageAvailability(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('[Storage] localStorage no disponible, usando fallback en memoria');
      return false;
    }
  }

  /**
   * Obtener valor del storage - retorna exactamente lo que se guardó
   */
  get<T>(key: keyof StorageKey): T | null {
    try {
      const value = localStorage.getItem(STORAGE_KEYS[key]);
      if (!value) return null;

      // Para AUTH_TOKEN, retornar siempre como string
      if (key === 'AUTH_TOKEN') {
        return value as unknown as T;
      }

      // Para otros valores, intentar parsear como JSON
      try {
        return JSON.parse(value);
      } catch {
        // Si no es JSON válido, retornar como string
        return value as T;
      }
    } catch (error) {
      console.error(`[Storage] Error getting ${key}:`, error);
      return null;
    }
  }

  /**
   * Guardar valor en el storage
   */
  set<T>(key: keyof StorageKey, value: T): boolean {
    try {
      if (!this.isAvailable) {
        console.warn(`[Storage] Storage no disponible, ignorando set de ${key}`);
        return false;
      }

      // Para AUTH_TOKEN, guardar como string directo
      if (key === 'AUTH_TOKEN' && typeof value === 'string') {
        localStorage.setItem(STORAGE_KEYS[key], value);
      } else {
        // Para otros valores, serializar si es necesario
        const serialized = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(STORAGE_KEYS[key], serialized);
      }
      return true;
    } catch (error) {
      console.error(`[Storage] Error setting ${key}:`, error);
      return false;
    }
  }

  /**
   * Remover valor del storage
   */
  remove(key: keyof StorageKey): boolean {
    try {
      localStorage.removeItem(STORAGE_KEYS[key]);
      return true;
    } catch (error) {
      console.error(`[Storage] Error removing ${key}:`, error);
      return false;
    }
  }

  /**
   * Limpiar todo el storage de autenticación
   */
  clearAuth(): void {
    try {
      this.remove('AUTH_TOKEN');
      this.remove('USER_DATA');
      console.log('[Storage] Auth data cleared');
    } catch (error) {
      console.error('[Storage] Error clearing auth:', error);
    }
  }

  /**
   * Obtener todas las claves del storage
   */
  getAllKeys(): string[] {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('[Storage] Error getting keys:', error);
      return [];
    }
  }

  /**
   * Limpiar todo el storage
   */
  clear(): void {
    try {
      localStorage.clear();
      console.log('[Storage] All data cleared');
    } catch (error) {
      console.error('[Storage] Error clearing storage:', error);
    }
  }
}

// Exportar instancia única del servicio
export const storageService = new StorageService();
export { STORAGE_KEYS };

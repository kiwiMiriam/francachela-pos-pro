/**
 * Validadores para asegurar que los datos retornados por las APIs son del tipo esperado
 * Esto previene errores como "expenses.filter is not a function" cuando el API retorna algo inesperado
 */

/**
 * Valida que el valor sea un array. Si no lo es, retorna un array vacío
 * @param value - El valor a validar
 * @param fallback - El array por defecto si la validación falla
 * @returns El array original o el fallback
 */
export const ensureArray = <T>(value: unknown, fallback: T[] = []): T[] => {
  if (Array.isArray(value)) {
    return value;
  }
  
  console.warn('Expected array but got:', typeof value, value);
  return fallback;
};

/**
 * Valida que el valor sea un objeto (pero no un array). Si no lo es, retorna null
 * @param value - El valor a validar
 * @returns El objeto original o null
 */
export const ensureObject = <T extends object>(value: unknown): T | null => {
  if (value === null || value === undefined) {
    return null;
  }
  
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as T;
  }
  
  console.warn('Expected object but got:', typeof value, value);
  return null;
};

/**
 * Valida que el valor sea un número. Si no lo es, retorna 0
 * @param value - El valor a validar
 * @returns El número original o 0
 */
export const ensureNumber = (value: unknown, fallback: number = 0): number => {
  if (typeof value === 'number') {
    return value;
  }
  
  const parsed = Number(value);
  if (!isNaN(parsed)) {
    return parsed;
  }
  
  console.warn('Expected number but got:', typeof value, value);
  return fallback;
};

/**
 * Valida que el valor sea una cadena. Si no lo es, retorna una cadena vacía
 * @param value - El valor a validar
 * @returns La cadena original o cadena vacía
 */
export const ensureString = (value: unknown, fallback: string = ''): string => {
  if (typeof value === 'string') {
    return value;
  }
  
  if (value === null || value === undefined) {
    return fallback;
  }
  
  return String(value);
};

/**
 * Maneja el resultado de una Promise que podría retornar un tipo incorrecto
 * Útil con Promise.allSettled para garantizar tipos seguros
 * @param result - El PromiseSettledResult
 * @param validator - Función para validar el valor
 * @param fallback - Valor por defecto si falla
 * @returns El valor validado o el fallback
 */
export const handlePromiseResult = <T>(
  result: PromiseSettledResult<any>,
  validator: (value: any) => T,
  fallback: T
): T => {
  if (result.status === 'fulfilled') {
    try {
      return validator(result.value);
    } catch (error) {
      console.error('Validation failed:', error);
      return fallback;
    }
  }
  
  console.error('Promise rejected:', result.reason);
  return fallback;
};

/**
 * Hook-helper para validar resultados de Promise.allSettled de manera segura
 * @example
 * const results = await Promise.allSettled([...]);
 * const [expenses, categories] = results.map((r, i) => 
 *   validatePromiseResult(r, i === 0 ? ensureArray : ensureString)
 * );
 */
export const validatePromiseResult = <T>(
  result: PromiseSettledResult<any>,
  validator: (value: any) => T,
  fallback: T
): T => {
  return handlePromiseResult(result, validator, fallback);
};

import { httpClient } from './httpClient';
import { extractErrorMessage } from '@/utils/errorHandler';

export interface InventarioEstadisticas {
  totalMovimientos: number;
  movimientosPorTipo: {
    ENTRADA: number;
    VENTA: number;
    DEVOLUCION: number;
  };
  movimientosPorCajero: Record<string, number>;
  productosMasMovidos: Record<string, number>;
  valorTotalEntradas: number;
  valorTotalSalidas: number;
  entradas: number;
  salidas: number;
  ajustes: number;
}

export const inventarioService = {
  /**
   * Obtener estadísticas de movimientos de inventario
   * @param fechaInicio - Fecha de inicio en formato YYYY-MM-DD HH:mm:ss
   * @param fechaFin - Fecha de fin en formato YYYY-MM-DD HH:mm:ss
   */
  getEstadisticas: async (fechaInicio: string, fechaFin: string): Promise<InventarioEstadisticas> => {
    try {
      const params = new URLSearchParams({
        fechaInicio: encodeURIComponent(fechaInicio),
        fechaFin: encodeURIComponent(fechaFin)
      });

      const url = `/movimiento-inventario/estadisticas?${params.toString()}`;
      const response = await httpClient.get<InventarioEstadisticas>(url);
      
      return response;
    } catch (error) {
      console.error('Error getting inventory statistics:', error);
      throw new Error(extractErrorMessage(error));
    }
  }
};


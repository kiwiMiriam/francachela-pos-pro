/**
 * API Services - Refactorizado para integración con backend
 * 
 * Este archivo actúa como un proxy que redirige a los servicios específicos
 * manteniendo compatibilidad con el código existente mientras migra gradualmente
 * a los nuevos servicios especializados.
 */

import { API_CONFIG } from '@/config/api';
import type {
  Product,
  Client,
  Sale,
  Promotion,
  Combo,
  CashRegister,
  Expense,
  DeliveryOrder,
  Settings,
  InventoryMovement
} from '@/types';

// Importar los nuevos servicios especializados
import { productsService } from './productsService';
import { clientsService } from './clientsService';
import { salesService } from './salesService';
import { promotionsService } from './promotionsService';

// Importar mocks alineados con el backend
import {
  mockProductsAligned,
  mockClientsAligned,
  mockSalesAligned,
  mockPromotionsAligned,
  mockCombosAligned,
  mockCashRegistersAligned,
  mockExpensesAligned,
  mockSettingsAligned
} from './mockDataAligned';

// Helper function para manejar errores
const handleApiError = (error: any): never => {
  console.error('API Error:', error);
  throw new Error(error.message || 'Error de carga');
};

// ============================================================================
// PRODUCTOS - Redirigir al nuevo servicio especializado
// ============================================================================
export const productsAPI = {
  getAll: async (): Promise<Product[]> => {
    try {
      return await productsService.getAll();
    } catch (error) {
      return handleApiError(error);
    }
  },

  getById: async (id: number): Promise<Product> => {
    try {
      return await productsService.getById(id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  create: async (product: Omit<Product, 'id'>): Promise<Product> => {
    try {
      return await productsService.create(product);
    } catch (error) {
      return handleApiError(error);
    }
  },

  update: async (id: number, product: Partial<Product>): Promise<Product> => {
    try {
      return await productsService.update(id, product);
    } catch (error) {
      return handleApiError(error);
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await productsService.delete(id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Métodos adicionales del nuevo servicio
  search: async (query: string): Promise<Product[]> => {
    try {
      return await productsService.search(query);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getCategories: async (): Promise<string[]> => {
    try {
      return await productsService.getCategories();
    } catch (error) {
      return handleApiError(error);
    }
  },

  getLowStock: async (): Promise<Product[]> => {
    try {
      return await productsService.getLowStock();
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateStock: async (id: number, stockData: any): Promise<Product> => {
    try {
      return await productsService.updateStock(id, stockData);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// ============================================================================
// CLIENTES - Redirigir al nuevo servicio especializado
// ============================================================================
export const clientsAPI = {
  getAll: async (): Promise<Client[]> => {
    try {
      return await clientsService.getAll();
    } catch (error) {
      return handleApiError(error);
    }
  },

  getById: async (id: number): Promise<Client> => {
    try {
      return await clientsService.getById(id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  create: async (client: Omit<Client, 'id'>): Promise<Client> => {
    try {
      return await clientsService.create(client);
    } catch (error) {
      return handleApiError(error);
    }
  },

  update: async (id: number, client: Partial<Client>): Promise<Client> => {
    try {
      return await clientsService.update(id, client);
    } catch (error) {
      return handleApiError(error);
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await clientsService.delete(id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Métodos adicionales del nuevo servicio
  search: async (query: string): Promise<Client[]> => {
    try {
      return await clientsService.search(query);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getByDni: async (dni: string): Promise<Client | null> => {
    try {
      return await clientsService.getByDni(dni);
    } catch (error) {
      console.error('Error getting client by DNI:', error);
      return null;
    }
  },

  getBirthdays: async (): Promise<Client[]> => {
    try {
      return await clientsService.getBirthdays();
    } catch (error) {
      return handleApiError(error);
    }
  },

  getTopClients: async (limit?: number): Promise<Client[]> => {
    try {
      return await clientsService.getTopClients(limit);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// ============================================================================
// VENTAS - Redirigir al nuevo servicio especializado
// ============================================================================
export const salesAPI = {
  getAll: async (): Promise<Sale[]> => {
    try {
      return await salesService.getAll();
    } catch (error) {
      return handleApiError(error);
    }
  },

  getById: async (id: number): Promise<Sale> => {
    try {
      return await salesService.getById(id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  create: async (sale: any): Promise<Sale> => {
    try {
      return await salesService.create(sale);
    } catch (error) {
      return handleApiError(error);
    }
  },

  cancel: async (id: number): Promise<Sale> => {
    try {
      return await salesService.cancel(id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Métodos adicionales del nuevo servicio
  search: async (query: string): Promise<Sale[]> => {
    try {
      return await salesService.search(query);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getToday: async (): Promise<Sale[]> => {
    try {
      return await salesService.getToday();
    } catch (error) {
      return handleApiError(error);
    }
  },

  getByClient: async (clientId: number): Promise<Sale[]> => {
    try {
      return await salesService.getByClient(clientId);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getStatistics: async (filters?: any): Promise<any> => {
    try {
      return await salesService.getStatistics(filters);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// ============================================================================
// PROMOCIONES - Redirigir al nuevo servicio especializado
// ============================================================================
export const promotionsAPI = {
  getAll: async (): Promise<Promotion[]> => {
    try {
      return await promotionsService.getAll();
    } catch (error) {
      return handleApiError(error);
    }
  },

  getById: async (id: number): Promise<Promotion> => {
    try {
      return await promotionsService.getById(id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  create: async (promotion: Omit<Promotion, 'id'>): Promise<Promotion> => {
    try {
      return await promotionsService.create(promotion);
    } catch (error) {
      return handleApiError(error);
    }
  },

  update: async (id: number, promotion: Partial<Promotion>): Promise<Promotion> => {
    try {
      return await promotionsService.update(id, promotion);
    } catch (error) {
      return handleApiError(error);
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await promotionsService.delete(id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Métodos adicionales del nuevo servicio
  getActive: async (): Promise<Promotion[]> => {
    try {
      return await promotionsService.getActive();
    } catch (error) {
      return handleApiError(error);
    }
  },

  activate: async (id: number): Promise<Promotion> => {
    try {
      return await promotionsService.activate(id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  deactivate: async (id: number): Promise<Promotion> => {
    try {
      return await promotionsService.deactivate(id);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// ============================================================================
// SERVICIOS PENDIENTES DE MIGRACIÓN (usando mocks temporalmente)
// ============================================================================

// Combos
export const combosAPI = {
  getAll: async (): Promise<Combo[]> => {
    try {
      if (API_CONFIG.USE_MOCKS) {
        return mockCombosAligned;
      }
      // TODO: Implementar servicio de combos
      return mockCombosAligned;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getById: async (id: number): Promise<Combo> => {
    try {
      const combo = mockCombosAligned.find(c => c.id === id);
      if (!combo) throw new Error('Combo no encontrado');
      return combo;
    } catch (error) {
      return handleApiError(error);
    }
  },

  create: async (combo: Omit<Combo, 'id'>): Promise<Combo> => {
    try {
      const newCombo = {
        ...combo,
        id: Math.max(...mockCombosAligned.map(c => c.id)) + 1
      };
      mockCombosAligned.push(newCombo);
      return newCombo;
    } catch (error) {
      return handleApiError(error);
    }
  },

  update: async (id: number, combo: Partial<Combo>): Promise<Combo> => {
    try {
      const index = mockCombosAligned.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Combo no encontrado');
      mockCombosAligned[index] = { ...mockCombosAligned[index], ...combo };
      return mockCombosAligned[index];
    } catch (error) {
      return handleApiError(error);
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      const index = mockCombosAligned.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Combo no encontrado');
      mockCombosAligned.splice(index, 1);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Caja Registradora
export const cashRegisterAPI = {
  getCurrent: async (): Promise<CashRegister | null> => {
    try {
      const openRegister = mockCashRegistersAligned.find(cr => cr.status === 'open');
      return openRegister || null;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getHistory: async (): Promise<CashRegister[]> => {
    try {
      return mockCashRegistersAligned;
    } catch (error) {
      return handleApiError(error);
    }
  },

  open: async (initialCash: number, cashier: string): Promise<CashRegister> => {
    try {
      const newRegister: CashRegister = {
        id: Math.max(...mockCashRegistersAligned.map(cr => cr.id)) + 1,
        cashier,
        openedAt: new Date().toISOString(),
        initialCash,
        totalSales: 0,
        totalExpenses: 0,
        status: 'open',
        paymentBreakdown: { efectivo: 0, yape: 0, plin: 0, tarjeta: 0 },
      };
      mockCashRegistersAligned.push(newRegister);
      return newRegister;
    } catch (error) {
      return handleApiError(error);
    }
  },

  close: async (id: number, finalCash: number): Promise<CashRegister> => {
    try {
      const index = mockCashRegistersAligned.findIndex(cr => cr.id === id);
      if (index === -1) throw new Error('Caja no encontrada');
      
      mockCashRegistersAligned[index] = {
        ...mockCashRegistersAligned[index],
        closedAt: new Date().toISOString(),
        finalCash,
        status: 'closed',
      };
      
      return mockCashRegistersAligned[index];
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Gastos
export const expensesAPI = {
  getAll: async (): Promise<Expense[]> => {
    try {
      return mockExpensesAligned;
    } catch (error) {
      return handleApiError(error);
    }
  },

  create: async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
    try {
      const newExpense = {
        ...expense,
        id: Math.max(...mockExpensesAligned.map(e => e.id)) + 1,
        date: new Date().toISOString(),
      };
      mockExpensesAligned.push(newExpense);
      return newExpense;
    } catch (error) {
      return handleApiError(error);
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      const index = mockExpensesAligned.findIndex(e => e.id === id);
      if (index === -1) throw new Error('Gasto no encontrado');
      mockExpensesAligned.splice(index, 1);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Inventario
export const inventoryAPI = {
  getMovements: async (): Promise<InventoryMovement[]> => {
    try {
      // Mock de movimientos de inventario
      return [
        {
          id: 1,
          TIPO: 'entrada',
          PRODUCTO_ID: 1,
          PRODUCTO_NOMBRE: 'Cerveza Pilsen 650ml',
          CANTIDAD: 50,
          HORA: '2024-12-01T09:00:00Z',
          DESCRIPCION: 'Compra de mercancía',
          CAJERO: 'Juan Cajero',
        },
        {
          id: 2,
          TIPO: 'salida',
          PRODUCTO_ID: 4,
          PRODUCTO_NOMBRE: 'Leche Gloria 1L',
          CANTIDAD: 10,
          HORA: '2024-12-01T14:30:00Z',
          DESCRIPCION: 'Venta',
          CAJERO: 'Juan Cajero',
        },
      ];
    } catch (error) {
      return handleApiError(error);
    }
  },

  createMovement: async (movement: Omit<InventoryMovement, 'id'>): Promise<InventoryMovement> => {
    try {
      const newMovement = {
        ...movement,
        id: Date.now(), // Simple ID generation
        HORA: new Date().toISOString(),
      };
      return newMovement;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Configuraciones
export const settingsAPI = {
  get: async (): Promise<Settings> => {
    try {
      return mockSettingsAligned;
    } catch (error) {
      return handleApiError(error);
    }
  },

  update: async (settings: Partial<Settings>): Promise<Settings> => {
    try {
      Object.assign(mockSettingsAligned, settings);
      return mockSettingsAligned;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Delivery (placeholder)
export const deliveryAPI = {
  getAll: async (): Promise<DeliveryOrder[]> => {
    try {
      return []; // Mock vacío por ahora
    } catch (error) {
      return handleApiError(error);
    }
  },

  create: async (order: Omit<DeliveryOrder, 'id'>): Promise<DeliveryOrder> => {
    try {
      const newOrder = {
        ...order,
        id: Date.now(),
      };
      return newOrder;
    } catch (error) {
      return handleApiError(error);
    }
  },

  update: async (id: number, order: Partial<DeliveryOrder>): Promise<DeliveryOrder> => {
    try {
      // Mock implementation
      return { id, ...order } as DeliveryOrder;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

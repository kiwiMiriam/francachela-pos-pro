// Tipos para las respuestas de la API del backend
export interface ApiResponse<T = unknown> {
  status: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  status: false;
  message: string;
  error?: string;
}

// Tipos para autenticación JWT
/**
 * Solicitud de login al endpoint /auth/login
 * El backend espera: username (no email) y password
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Respuesta del backend después de autenticarse
 * Puede venir en diferentes formatos dependiendo del backend
 */
export interface LoginResponse {
  user: {
    id: number;
    email: string;
    username: string;
    role: 'ADMIN' | 'CAJERO' | 'INVENTARIOS';
    nombre: string;
  };
  token: string;
}

/**
 * Respuesta alternativa del backend (formato directo)
 */
export interface LoginResponseDirect {
  id: number;
  email: string;
  username: string;
  role: 'ADMIN' | 'CAJERO' | 'INVENTARIOS';
  nombre: string;
  token: string;
}

/**
 * Respuesta alternativa del backend (formato con access_token)
 */
export interface LoginResponseAccessToken {
  user: {
    id: number;
    email: string;
    username: string;
    role: 'ADMIN' | 'CAJERO' | 'INVENTARIOS';
    nombre: string;
  };
  access_token: string;
}

// Tipos para paginación
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Tipos para filtros genéricos
export interface FilterParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: unknown;
}

export interface DateRangeFilterParams extends FilterParams {
  startDate?: string;
  endDate?: string;
}

// Alias para compatibilidad
export type DateRangeFilter = DateRangeFilterParams;

// Tipos para respuestas genéricas
export type GenericStatistics = Record<string, unknown>;

// Tipos específicos para productos según el backend
export interface ProductCreateRequest {
  productoDescripcion: string;
  codigoBarra: string;
  imagen?: string;
  costo: number;
  precio: number;
  precioMayoreo?: number;
  cantidadActual: number;
  cantidadMinima: number;
  proveedor: string;
  categoria: string;
  valorPuntos?: number;
  mostrar?: boolean;
  usaInventario?: boolean;
}

// ProductUpdateRequest es simplemente un alias para Partial<ProductCreateRequest>
export type ProductUpdateRequest = Partial<ProductCreateRequest>;

export interface ProductStockUpdateRequest {
  cantidad: number;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  observaciones?: string;
  proveedor?: string;
  numeroFactura?: string;
}

// Tipos para clientes según el backend
export interface ClientCreateRequest {
  nombres: string;
  apellidos: string;
  dni: string;
  fechaNacimiento?: string;
  telefono: string;
  direccion?: string;
}

// ClientUpdateRequest es simplemente un alias para Partial<ClientCreateRequest>
export type ClientUpdateRequest = Partial<ClientCreateRequest>;

// Tipos para ventas según el backend
export interface SaleCreateRequest {
  clienteId?: number;
  listaProductos: {
    productoId: number;
    cantidad: number;
    precioUnitario: number;
  }[];
  descuento?: number;
  metodoPago: 'EFECTIVO' | 'YAPE' | 'PLIN' | 'TARJETA';
  comentario?: string;
  tipoCompra?: 'LOCAL' | 'DELIVERY';
  montoRecibido?: number;
  puntosUsados?: number;
}

// Tipos para promociones según el backend
export interface PromotionCreateRequest {
  nombre: string;
  descripcion: string;
  tipo: 'PORCENTAJE' | 'MONTO_FIJO';
  descuento: number;
  fechaInicio: string;
  fechaFin: string;
  productosId?: number[];
  clientesId?: number[];
  montoMinimo?: number;
  cantidadMaxima?: number;
  active?: boolean;
}

// Tipos para combos según el backend
export interface ComboCreateRequest {
  nombre: string;
  descripcion: string;
  productos: {
    productoId: number;
    cantidad: number;
  }[];
  precioOriginal: number;
  precioCombo: number;
  puntosExtra?: number;
  active?: boolean;
}

// Tipos para caja según el backend
export interface CashRegisterOpenRequest {
  montoInicial: number;
  observaciones?: string;
  cajero?: string;
}

export interface CashRegisterCloseRequest {
  montoFinal: number;
  observaciones?: string;
}

// Tipos para gastos según el backend
export type ExpenseCategory = 'OPERATIVO' | 'ADMINISTRATIVO' | 'MARKETING' | 'MANTENIMIENTO' | 'OTROS';

export interface ExpenseCreateRequest {
  descripcion: string;
  monto: number;
  categoria: ExpenseCategory;
  metodoPago: 'EFECTIVO' | 'YAPE' | 'PLIN' | 'TARJETA';
  proveedor?: string;
  numeroComprobante?: string;
  comprobante?: string;
  cajero?: string;
  observaciones?: string;
}

// Tipos para delivery según el backend
export interface DeliveryCreateRequest {
  clienteId: number;
  pedidoId: number;
  direccion: string;
  repartidor: string;
  phone: string;
  deliveryFee: number;
  notes?: string;
}

export interface DeliveryUpdateRequest extends Partial<DeliveryCreateRequest> {
  estado?: 'PENDIENTE' | 'ASIGNADO' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';
  horaSalida?: string;
  horaEntrega?: string;
}

// Tipos para movimientos de inventario según el backend
export interface InventoryMovementCreateRequest {
  codigoBarra: string;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  cantidad: number;
  costo?: number;
  precioVenta?: number;
  cajero: string;
  proveedor?: string;
}

// Tipos para WhatsApp según el backend
export interface WhatsAppSendRequest {
  phone: string;
  message: string;
  ventaId?: number;
}

// Tipos para estadísticas
export interface SalesStatistics {
  totalVentas: number;
  ventasHoy: number;
  ventasSemana: number;
  ventasMes: number;
  promedioVenta: number;
  productosVendidos: number;
}

export interface ClientStatistics {
  totalCompras: number;
  montoTotal: number;
  ultimaCompra: string;
  puntosAcumulados: number;
  puntosUsados: number;
}

export interface CashRegisterStatistics {
  ventasEfectivo: number;
  ventasYape: number;
  ventasPlin: number;
  ventasTarjeta: number;
  totalVentas: number;
  totalGastos: number;
  diferencia: number;
  // Campos adicionales para el nuevo servicio
  totalCajas?: number;
  cajasAbiertas?: number;
  cajasCerradas?: number;
  promedioVentasPorCaja?: number;
  cajeroMasActivo?: string;
}

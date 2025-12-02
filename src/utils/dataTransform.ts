/**
 * Data transformation utilities for normalizing API responses
 * Converts string numbers to actual numbers and handles type conversions
 */

import type { Product, Sale, Client, Promotion, Combo } from '@/types';

/**
 * Safely convert a value to a number
 */
export function toNumber(value: unknown, defaultValue: number = 0): number {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

/**
 * Normalize a Product object - converts string numbers to actual numbers
 */
export function normalizeProduct(product: unknown): Product {
  if (!product) return product as Product;
  
  const p = product as Record<string, unknown>;
  return {
    ...(p as any),
    id: toNumber(p.id, p.id as number),
    precio: toNumber(p.precio),
    precioMayoreo: toNumber(p.precioMayoreo),
    costo: toNumber(p.costo),
    cantidadActual: toNumber(p.cantidadActual),
    cantidadMinima: toNumber(p.cantidadMinima),
    valorPuntos: toNumber(p.valorPuntos),
  };
}

/**
 * Normalize an array of Products
 */
export function normalizeProducts(products: unknown[]): Product[] {
  if (!Array.isArray(products)) return [];
  return products.map(normalizeProduct);
}

/**
 * Normalize a Sale object - converts string numbers to actual numbers
 */
export function normalizeSale(sale: unknown): Sale {
  if (!sale) return sale as Sale;
  
  const s = sale as Record<string, unknown>;
  return {
    ...(s as any),
    id: toNumber(s.id, s.id as number),
    subTotal: toNumber(s.subTotal, toNumber(s.subtotal)),
    descuento: toNumber(s.descuento),
    total: toNumber(s.total),
    puntosOtorgados: toNumber(s.puntosOtorgados),
    puntosUsados: toNumber(s.puntosUsados),
    montoRecibido: s.montoRecibido ? toNumber(s.montoRecibido) : undefined,
    vuelto: s.vuelto ? toNumber(s.vuelto) : undefined,
    // Normalize nested items if they exist
    listaProductos: Array.isArray(s.listaProductos)
      ? s.listaProductos.map((item: unknown) => {
          const i = item as Record<string, unknown>;
          return {
            ...(i as any),
            id: toNumber(i.id, i.id as number),
            precio: toNumber(i.precio),
            cantidad: toNumber(i.cantidad),
            subtotal: toNumber(i.subtotal),
          };
        })
      : s.listaProductos,
  };
}

/**
 * Normalize an array of Sales
 */
export function normalizeSales(sales: unknown[]): Sale[] {
  if (!Array.isArray(sales)) return [];
  return sales.map(normalizeSale);
}

/**
 * Normalize a Client object - converts string numbers to actual numbers
 */
export function normalizeClient(client: unknown): Client {
  if (!client) return client as Client;
  
  const c = client as Record<string, unknown>;
  return {
    ...(c as any),
    id: toNumber(c.id, c.id as number),
    puntosAcumulados: toNumber(c.puntosAcumulados),
  };
}

/**
 * Normalize an array of Clients
 */
export function normalizeClients(clients: unknown[]): Client[] {
  if (!Array.isArray(clients)) return [];
  return clients.map(normalizeClient);
}

/**
 * Normalize a Promotion object - converts string numbers to actual numbers
 */
export function normalizePromotion(promotion: unknown): Promotion {
  if (!promotion) return promotion as Promotion;
  
  const p = promotion as Record<string, unknown>;
  return {
    ...(p as any),
    id: toNumber(p.id, p.id as number),
    value: toNumber(p.value),
  };
}

/**
 * Normalize an array of Promotions
 */
export function normalizePromotions(promotions: unknown[]): Promotion[] {
  if (!Array.isArray(promotions)) return [];
  return promotions.map(normalizePromotion);
}

/**
 * Normalize a Combo object - converts string numbers to actual numbers
 */
export function normalizeCombo(combo: unknown): Combo {
  if (!combo) return combo as Combo;
  
  const c = combo as Record<string, unknown>;
  return {
    ...(c as any),
    id: toNumber(c.id, c.id as number),
    originalPrice: toNumber(c.originalPrice),
    comboPrice: toNumber(c.comboPrice),
  };
}

/**
 * Normalize an array of Combos
 */
export function normalizeCombos(combos: unknown[]): Combo[] {
  if (!Array.isArray(combos)) return [];
  return combos.map(normalizeCombo);
}

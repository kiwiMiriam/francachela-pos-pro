/**
 * Utilidades para cálculo de puntos de fidelidad
 */

import type { SaleItem, Product } from '@/types';

/**
 * Calcula los puntos totales de una venta
 */
export function calculateTotalPoints(items: SaleItem[]): number {
  return items.reduce((total, item) => {
    return total + (item.pointsValue * item.quantity);
  }, 0);
}

/**
 * Calcula los puntos para un producto basado en su precio
 * Por defecto: 1 punto por cada sol gastado
 */
export function calculateProductPoints(price: number, pointsPerSol: number = 1): number {
  return Math.floor(price * pointsPerSol);
}

/**
 * Verifica si un cliente tiene suficientes puntos para canjear
 */
export function canRedeemPoints(clientPoints: number, pointsToRedeem: number): boolean {
  return clientPoints >= pointsToRedeem;
}

/**
 * Convierte puntos a descuento en soles
 * Por defecto: 1 punto = 0.10 soles
 */
export function pointsToDiscount(points: number, solsPerPoint: number = 0.10): number {
  return points * solsPerPoint;
}

/**
 * Calcula cuántos puntos se necesitan para un descuento específico
 */
export function discountToPoints(discount: number, solsPerPoint: number = 0.10): number {
  return Math.ceil(discount / solsPerPoint);
}

/**
 * Genera un objeto SaleItem con puntos calculados
 */
export function createSaleItemWithPoints(
  product: Product,
  quantity: number,
  pointsPerSol: number = 1
): SaleItem {
  const pointsValue = calculateProductPoints(product.PRECIO, pointsPerSol);
  
  return {
    productId: product.id,
    productName: product.PRODUCTO_DESCRIPCION,
    quantity,
    price: product.PRECIO,
    subtotal: product.PRECIO * quantity,
    pointsValue,
  };
}

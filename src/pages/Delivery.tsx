import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck } from 'lucide-react';
import { deliveryAPI } from '@/services/api';
import type { DeliveryOrder } from '@/types';

export default function Delivery() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const data = await deliveryAPI.getAll();
    setOrders(data);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      'in-transit': 'default',
      delivered: 'outline',
      cancelled: 'destructive',
    } as const;
    return variants[status as keyof typeof variants] || 'secondary';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Delivery</h1>
        <p className="text-muted-foreground">Gestión de pedidos a domicilio</p>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Pedido #{order.id}</CardTitle>
                  <p className="text-sm text-muted-foreground">{order.address}</p>
                </div>
              </div>
              <Badge variant={getStatusBadge(order.status)}>{order.status}</Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-semibold">{order.phone}</p>
                </div>
                {order.driver && (
                  <div>
                    <p className="text-sm text-muted-foreground">Repartidor</p>
                    <p className="font-semibold">{order.driver}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Costo Delivery</p>
                  <p className="font-semibold">S/ {order.deliveryFee.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

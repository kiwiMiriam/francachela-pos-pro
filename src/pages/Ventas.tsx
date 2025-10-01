import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, User, CreditCard } from "lucide-react";

export default function Ventas() {
  const ventas = [
    { 
      id: 1, 
      fecha: "2025-01-15 14:30", 
      total: 145.00, 
      cliente: "Juan Pérez", 
      vendedor: "María García",
      metodoPago: "Efectivo",
      items: 5
    },
    { 
      id: 2, 
      fecha: "2025-01-15 13:15", 
      total: 89.50, 
      cliente: "Venta Rápida", 
      vendedor: "Carlos López",
      metodoPago: "Yape",
      items: 3
    },
    { 
      id: 3, 
      fecha: "2025-01-15 12:00", 
      total: 220.00, 
      cliente: "Ana Martínez", 
      vendedor: "María García",
      metodoPago: "Transferencia",
      items: 8
    },
    { 
      id: 4, 
      fecha: "2025-01-15 10:45", 
      total: 67.00, 
      cliente: "Venta Rápida", 
      vendedor: "Carlos López",
      metodoPago: "Plin",
      items: 4
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Historial de Ventas</h1>
        <p className="text-muted-foreground">Registro detallado de todas las transacciones</p>
      </div>

      <div className="grid gap-4">
        {ventas.map((venta) => (
          <Card key={venta.id} className="hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Ticket #{venta.id.toString().padStart(4, '0')}
                </CardTitle>
                <Badge variant="default" className="text-lg font-bold">
                  S/ {venta.total.toFixed(2)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Fecha y hora</p>
                    <p className="font-semibold text-sm">{venta.fecha}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Cliente</p>
                    <p className="font-semibold text-sm">{venta.cliente}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Vendedor</p>
                    <p className="font-semibold text-sm">{venta.vendedor}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Método de pago</p>
                    <p className="font-semibold text-sm">{venta.metodoPago}</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm text-muted-foreground">
                  Total de {venta.items} productos
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

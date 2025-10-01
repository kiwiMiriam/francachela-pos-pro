import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

export default function Productos() {
  const productos = [
    { id: 1, nombre: "Pisco Quebranta 750ml", precio: 45.00, stock: 15, categoria: "Pisco" },
    { id: 2, nombre: "Ron Cartavio Black 750ml", precio: 35.00, stock: 20, categoria: "Ron" },
    { id: 3, nombre: "Cerveza Cusqueña 330ml", precio: 6.00, stock: 50, categoria: "Cerveza" },
    { id: 4, nombre: "Vino Tacama Tinto 750ml", precio: 28.00, stock: 12, categoria: "Vino" },
    { id: 5, nombre: "Whisky Old Times 750ml", precio: 55.00, stock: 8, categoria: "Whisky" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gestión de Productos</h1>
        <p className="text-muted-foreground">Administra tu inventario de licores</p>
      </div>

      <div className="grid gap-4">
        {productos.map((producto) => (
          <Card key={producto.id} className="hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <Package className="h-5 w-5 text-primary" />
                {producto.nombre}
              </CardTitle>
              <Badge variant={producto.stock > 10 ? "default" : "destructive"}>
                Stock: {producto.stock}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Categoría</p>
                  <p className="font-semibold">{producto.categoria}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Precio</p>
                  <p className="text-2xl font-bold text-primary">S/ {producto.precio.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Calendar } from "lucide-react";

export default function Promociones() {
  const promociones = [
    {
      id: 1,
      nombre: "3x2 en Cervezas",
      descripcion: "Lleva 3 cervezas y paga solo 2",
      vigencia: "Hasta el 31/12/2025",
      activa: true,
    },
    {
      id: 2,
      nombre: "Descuento 15% en Piscos",
      descripcion: "15% de descuento en toda la línea de Piscos",
      vigencia: "Hasta el 15/01/2026",
      activa: true,
    },
    {
      id: 3,
      nombre: "Combo Fiesta",
      descripcion: "6 cervezas + 1 pisco a precio especial",
      vigencia: "Hasta el 20/01/2026",
      activa: false,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Promociones y Combos</h1>
        <p className="text-muted-foreground">Gestiona las ofertas especiales de tu tienda</p>
      </div>

      <div className="grid gap-4">
        {promociones.map((promo) => (
          <Card key={promo.id} className="hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-success" />
                {promo.nombre}
              </CardTitle>
              <Badge variant={promo.activa ? "default" : "secondary"}>
                {promo.activa ? "Activa" : "Inactiva"}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">{promo.descripcion}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {promo.vigencia}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

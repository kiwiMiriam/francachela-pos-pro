import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Star } from "lucide-react";

export default function Clientes() {
  const clientes = [
    { id: 1, nombre: "Juan Pérez", dni: "12345678", whatsapp: "+51987654321", puntos: 450 },
    { id: 2, nombre: "María García", dni: "87654321", whatsapp: "+51987654322", puntos: 320 },
    { id: 3, nombre: "Carlos López", dni: "11223344", whatsapp: "+51987654323", puntos: 180 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gestión de Clientes</h1>
        <p className="text-muted-foreground">Administra tus clientes y sus puntos de fidelidad</p>
      </div>

      <div className="grid gap-4">
        {clientes.map((cliente) => (
          <Card key={cliente.id} className="hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                {cliente.nombre}
              </CardTitle>
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3 w-3" />
                {cliente.puntos} pts
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">DNI</p>
                  <p className="font-semibold">{cliente.dni}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <p className="font-semibold">{cliente.whatsapp}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

export default function Puntos() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Sistema de Puntos</h1>
        <p className="text-muted-foreground">Programa de fidelización de clientes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Configuración de Puntos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Sistema de acumulación de puntos por compras</p>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Clock, History } from 'lucide-react';
import { cashRegisterAPI } from '@/services/api';
import type { CashRegister } from '@/types';

export default function Caja() {
  const [current, setCurrent] = useState<CashRegister | null>(null);
  const [history, setHistory] = useState<CashRegister[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [currentData, historyData] = await Promise.all([
      cashRegisterAPI.getCurrent(),
      cashRegisterAPI.getHistory(),
    ]);
    setCurrent(currentData);
    setHistory(historyData);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Control de Caja</h1>
        <p className="text-muted-foreground">Gestión de turnos y cierre de caja</p>
      </div>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Caja Actual</TabsTrigger>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {current ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Caja Abierta
                    </span>
                    <Badge variant="default">Activo</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Cajero</p>
                      <p className="font-semibold">{current.cashier}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Apertura</p>
                      <p className="font-semibold">
                        {new Date(current.openedAt).toLocaleString('es-PE')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Efectivo Inicial</p>
                      <p className="font-semibold text-primary">S/ {current.initialCash.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Ventas</p>
                      <p className="font-semibold text-green-600">S/ {current.totalSales.toFixed(2)}</p>
                    </div>
                  </div>

                  {current.paymentBreakdown && (
                    <div>
                      <p className="text-sm font-semibold mb-3">Desglose por Método de Pago</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Card>
                          <CardContent className="p-3">
                            <p className="text-sm text-muted-foreground">Efectivo</p>
                            <p className="font-bold">S/ {current.paymentBreakdown.efectivo.toFixed(2)}</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-3">
                            <p className="text-sm text-muted-foreground">Yape</p>
                            <p className="font-bold">S/ {current.paymentBreakdown.yape.toFixed(2)}</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-3">
                            <p className="text-sm text-muted-foreground">Plin</p>
                            <p className="font-bold">S/ {current.paymentBreakdown.plin.toFixed(2)}</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-3">
                            <p className="text-sm text-muted-foreground">Tarjeta</p>
                            <p className="font-bold">S/ {current.paymentBreakdown.tarjeta.toFixed(2)}</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No hay caja abierta</p>
                <Button>Abrir Caja</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {history.filter(cr => cr.status === 'closed').map((register) => (
            <Card key={register.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Caja #{register.id}
                  </span>
                  <Badge variant="secondary">Cerrada</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Cajero</p>
                    <p className="font-semibold">{register.cashier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p className="font-semibold">
                      {new Date(register.openedAt).toLocaleDateString('es-PE')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ventas</p>
                    <p className="font-semibold text-green-600">S/ {register.totalSales.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Efectivo Final</p>
                    <p className="font-semibold">S/ {register.finalCash?.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

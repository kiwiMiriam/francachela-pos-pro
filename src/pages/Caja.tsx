import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Clock, History, Plus, Calendar, TrendingUp, BarChart3, FileText, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import { cashRegisterService } from '@/services/cashRegisterService';
import type { CashRegister } from '@/types';

export default function Caja() {
  const [current, setCurrent] = useState<CashRegister | null>(null);
  const [history, setHistory] = useState<CashRegister[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [openData, setOpenData] = useState({
    montoInicial: 0,
    observaciones: ''
  });

  const [closeData, setCloseData] = useState({
    montoFinal: 0,
    observaciones: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [currentData, historyData, summaryData] = await Promise.all([
        cashRegisterService.getCurrent().catch(() => null),
        cashRegisterService.getHistory().catch(() => []),
        cashRegisterService.getSummary().catch(() => null)
      ]);
      
      setCurrent(currentData);
      setHistory(historyData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading cash register data:', error);
      toast.error('Error al cargar datos de caja');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCash = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!openData.montoInicial || openData.montoInicial <= 0) {
      toast.error('El monto inicial debe ser mayor a 0');
      return;
    }

    try {
      await cashRegisterService.open(openData);
      toast.success('Caja abierta correctamente');
      setIsOpenDialogOpen(false);
      setOpenData({ montoInicial: 0, observaciones: '' });
      loadData();
    } catch (error) {
      console.error('Error opening cash register:', error);
      toast.error('Error al abrir caja');
    }
  };

  const handleCloseCash = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!current || !closeData.montoFinal || closeData.montoFinal < 0) {
      toast.error('El monto final debe ser mayor o igual a 0');
      return;
    }

    try {
      await cashRegisterService.close(current.id, closeData);
      toast.success('Caja cerrada correctamente');
      setIsCloseDialogOpen(false);
      setCloseData({ montoFinal: 0, observaciones: '' });
      loadData();
    } catch (error) {
      console.error('Error closing cash register:', error);
      toast.error('Error al cerrar caja');
    }
  };

  const loadStatistics = async () => {
    if (!dateFrom || !dateTo) {
      toast.error('Por favor selecciona un rango de fechas');
      return;
    }

    try {
      const stats = await cashRegisterService.getStatistics(dateFrom, dateTo);
      setStatistics(stats);
      toast.success('Estadísticas cargadas correctamente');
    } catch (error) {
      console.error('Error loading statistics:', error);
      toast.error('Error al cargar estadísticas');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Control de Caja</h1>
          <p className="text-muted-foreground">Gestión de turnos, cierre de caja y corte de ventas</p>
        </div>
        <div className="flex gap-2">
          {!current ? (
            <Dialog open={isOpenDialogOpen} onOpenChange={setIsOpenDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Unlock className="h-4 w-4" />
                  Abrir Caja
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Abrir Caja</DialogTitle>
                  <DialogDescription>
                    Registra el monto inicial para abrir la caja del día
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleOpenCash} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="montoInicial">Monto Inicial S/ *</Label>
                    <Input
                      id="montoInicial"
                      type="number"
                      step="0.01"
                      value={openData.montoInicial || ''}
                      onChange={(e) => setOpenData({ ...openData, montoInicial: parseFloat(e.target.value) || 0 })}
                      placeholder="100.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observaciones">Observaciones</Label>
                    <Textarea
                      id="observaciones"
                      value={openData.observaciones}
                      onChange={(e) => setOpenData({ ...openData, observaciones: e.target.value })}
                      placeholder="Apertura normal del día..."
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full">
                      Abrir Caja
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Lock className="h-4 w-4" />
                  Cerrar Caja
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cerrar Caja</DialogTitle>
                  <DialogDescription>
                    Registra el monto final para cerrar la caja actual
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCloseCash} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="montoFinal">Monto Final S/ *</Label>
                    <Input
                      id="montoFinal"
                      type="number"
                      step="0.01"
                      value={closeData.montoFinal || ''}
                      onChange={(e) => setCloseData({ ...closeData, montoFinal: parseFloat(e.target.value) || 0 })}
                      placeholder="450.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observacionesCierre">Observaciones</Label>
                    <Textarea
                      id="observacionesCierre"
                      value={closeData.observaciones}
                      onChange={(e) => setCloseData({ ...closeData, observaciones: e.target.value })}
                      placeholder="Cierre normal, sin novedades..."
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" variant="destructive" className="w-full">
                      Cerrar Caja
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="current">Caja Actual</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
          <TabsTrigger value="sales">Corte de Ventas</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                <p>Cargando información de caja...</p>
              </div>
            </div>
          ) : current ? (
            <>
              {/* Estado actual de la caja */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Estado</p>
                        <p className="text-2xl font-bold text-green-600">ABIERTA</p>
                      </div>
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Unlock className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Monto Inicial</p>
                        <p className="text-2xl font-bold text-primary">S/ {current.montoInicial?.toFixed(2)}</p>
                      </div>
                      <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Hora Apertura</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {new Date(current.fechaApertura || '').toLocaleTimeString('es-PE', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Cajero</p>
                        <p className="text-2xl font-bold text-purple-600">{current.cajero || 'N/A'}</p>
                      </div>
                      <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <FileText className="h-4 w-4 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Resumen de la caja actual */}
              {summary && (
                <Card>
                  <CardHeader>
                    <CardTitle>Resumen de Caja Actual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Ventas del Día</p>
                        <p className="text-2xl font-bold text-green-600">S/ {summary.totalVentas?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Gastos del Día</p>
                        <p className="text-2xl font-bold text-red-600">S/ {summary.totalGastos?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Efectivo Esperado</p>
                        <p className="text-2xl font-bold text-blue-600">
                          S/ {((current.montoInicial || 0) + (summary.totalVentas || 0) - (summary.totalGastos || 0)).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Transacciones</p>
                        <p className="text-2xl font-bold text-purple-600">{summary.totalTransacciones || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Observaciones */}
              {current.observaciones && (
                <Card>
                  <CardHeader>
                    <CardTitle>Observaciones de Apertura</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{current.observaciones}</p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-semibold mb-2">No hay caja abierta</p>
                  <p className="text-muted-foreground mb-4">Abre una caja para comenzar las operaciones del día</p>
                  <Button onClick={() => setIsOpenDialogOpen(true)} className="gap-2">
                    <Unlock className="h-4 w-4" />
                    Abrir Caja
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Historial de Cajas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.length > 0 ? (
                  history.map((cashRegister) => (
                    <div key={cashRegister.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`h-3 w-3 rounded-full ${cashRegister.estado === 'ABIERTA' ? 'bg-green-500' : 'bg-gray-500'}`} />
                        <div>
                          <p className="font-semibold">
                            {new Date(cashRegister.fechaApertura || '').toLocaleDateString('es-PE')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {cashRegister.cajero} • {cashRegister.estado}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">S/ {cashRegister.montoInicial?.toFixed(2)}</p>
                        {cashRegister.montoFinal && (
                          <p className="text-sm text-muted-foreground">
                            Final: S/ {cashRegister.montoFinal.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-semibold mb-2">No hay historial de cajas</p>
                    <p className="text-muted-foreground">El historial aparecerá aquí cuando tengas cajas registradas</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Corte de Ventas por Fechas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <Label>Fecha Desde</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha Hasta</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button onClick={loadStatistics} className="w-full gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Generar Corte
                  </Button>
                </div>
              </div>

              {statistics && (
                <div className="space-y-6">
                  {/* Estadísticas principales */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Total Ventas</p>
                          <p className="text-2xl font-bold text-green-600">
                            S/ {statistics.totalVentas?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Total Gastos</p>
                          <p className="text-2xl font-bold text-red-600">
                            S/ {statistics.totalGastos?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Ganancia Neta</p>
                          <p className="text-2xl font-bold text-blue-600">
                            S/ {((statistics.totalVentas || 0) - (statistics.totalGastos || 0)).toFixed(2)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Transacciones</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {statistics.totalTransacciones || 0}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detalles por método de pago */}
                  {statistics.ventasPorMetodoPago && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Ventas por Método de Pago</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(statistics.ventasPorMetodoPago).map(([metodo, monto]) => (
                            <div key={metodo} className="flex justify-between items-center p-3 border rounded-lg">
                              <span className="font-medium">{metodo}</span>
                              <span className="font-bold text-green-600">S/ {(monto as number).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Productos más vendidos */}
                  {statistics.productosMasVendidos && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Productos Más Vendidos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {statistics.productosMasVendidos.slice(0, 10).map((producto: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{producto.nombre}</p>
                                <p className="text-sm text-muted-foreground">Cantidad: {producto.cantidad}</p>
                              </div>
                              <span className="font-bold text-primary">S/ {producto.total.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Análisis de Rendimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Resumen General</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total de Cajas Registradas:</span>
                      <span className="font-semibold">{history.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cajas Abiertas:</span>
                      <span className="font-semibold text-green-600">
                        {history.filter(c => c.estado === 'ABIERTA').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cajas Cerradas:</span>
                      <span className="font-semibold text-gray-600">
                        {history.filter(c => c.estado === 'CERRADA').length}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Promedios</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Monto Inicial Promedio:</span>
                      <span className="font-semibold">
                        S/ {history.length > 0 
                          ? (history.reduce((sum, c) => sum + (c.montoInicial || 0), 0) / history.length).toFixed(2)
                          : '0.00'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monto Final Promedio:</span>
                      <span className="font-semibold">
                        S/ {history.filter(c => c.montoFinal).length > 0
                          ? (history.reduce((sum, c) => sum + (c.montoFinal || 0), 0) / history.filter(c => c.montoFinal).length).toFixed(2)
                          : '0.00'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

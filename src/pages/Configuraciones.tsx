import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon } from 'lucide-react';
import { settingsAPI } from '@/services/api';
import type { Settings } from '@/types';

export default function Configuraciones() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const data = await settingsAPI.get();
    setSettings(data);
  };

  if (!settings) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Configuraciones</h1>
        <p className="text-muted-foreground">Ajustes generales del sistema</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="payments">Pagos</TabsTrigger>
          <TabsTrigger value="points">Puntos</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Información del Negocio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-semibold">{settings.general.businessName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">RUC</p>
                  <p className="font-semibold">{settings.general.ruc}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-semibold">{settings.general.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{settings.general.email}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dirección</p>
                <p className="font-semibold">{settings.general.address}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pago Aceptados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Efectivo</span>
                  <span className="font-semibold">{settings.payments.acceptCash ? 'Sí' : 'No'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Yape</span>
                  <span className="font-semibold">{settings.payments.acceptYape ? 'Sí' : 'No'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Plin</span>
                  <span className="font-semibold">{settings.payments.acceptPlin ? 'Sí' : 'No'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tarjeta</span>
                  <span className="font-semibold">{settings.payments.acceptCard ? 'Sí' : 'No'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="points">
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Puntos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <p className="font-semibold">{settings.points.enabled ? 'Activado' : 'Desactivado'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Puntos por Sol</p>
                  <p className="font-semibold">{settings.points.pointsPerSol}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Soles por Punto</p>
                  <p className="font-semibold">S/ {settings.points.solsPerPoint}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Notificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Alerta Stock Bajo</span>
                  <span className="font-semibold">{settings.notifications.lowStock ? 'Sí' : 'No'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Reporte Diario</span>
                  <span className="font-semibold">{settings.notifications.dailyReport ? 'Sí' : 'No'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Notificaciones Email</span>
                  <span className="font-semibold">{settings.notifications.emailNotifications ? 'Sí' : 'No'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

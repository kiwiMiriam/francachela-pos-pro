import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Gift, Calendar, Plus, Pencil, Trash2, Package, X } from "lucide-react";
import { toast } from "sonner";
import { promotionsService } from "@/services/promotionsService";
import { combosService } from "@/services/combosService";
import { productsService } from "@/services/productsService";
import type { Promotion, Combo, Product } from "@/types";

// Tipos para el backend
interface BackendPromotion {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: 'PORCENTAJE' | 'MONTO';
  descuento: number;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
  productosAplicables?: number[];
  montoMinimo?: number;
  cantidadMaximaUsos?: number;
}

interface BackendCombo {
  id: number;
  nombre: string;
  descripcion: string;
  productos: { productoId: number; cantidad: number }[];
  precioOriginal: number;
  precioCombo: number;
  puntosExtra?: number;
  active: boolean;
}

export default function Promociones() {
  const [promociones, setPromociones] = useState<Promotion[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [productos, setProductos] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPromoDialogOpen, setIsPromoDialogOpen] = useState(false);
  const [isComboDialogOpen, setIsComboDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
  const [currentPromoPage, setCurrentPromoPage] = useState(1);
  const [currentComboPage, setCurrentComboPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  // Form data alineado con el backend
  const [promoFormData, setPromoFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'PORCENTAJE' as 'PORCENTAJE' | 'MONTO',
    descuento: 0,
    fechaInicio: '',
    fechaFin: '',
    activo: true,
    productosAplicables: [] as number[],
    montoMinimo: 0,
    cantidadMaximaUsos: 0,
  });

  const [comboFormData, setComboFormData] = useState({
    nombre: '',
    descripcion: '',
    precioOriginal: 0,
    precioCombo: 0,
    puntosExtra: 0,
    active: true,
    productos: [] as { productId: number; quantity: number }[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [promosData, combosData, productsData] = await Promise.all([
        promotionsService.getAll(),
        combosService.getAll(),
        productsService.getAll(),
      ]);
      setPromociones(promosData || []);
      setCombos(combosData || []);
      setProductos(productsData || []);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  // Mapear frontend a backend para promociones
  const mapPromoToBackend = (formData: typeof promoFormData): Omit<BackendPromotion, 'id'> => ({
    nombre: formData.nombre,
    descripcion: formData.descripcion,
    tipo: formData.tipo,
    descuento: formData.descuento,
    fechaInicio: formData.fechaInicio,
    fechaFin: formData.fechaFin,
    activo: formData.activo,
    productosAplicables: formData.productosAplicables,
    montoMinimo: formData.montoMinimo || undefined,
    cantidadMaximaUsos: formData.cantidadMaximaUsos || undefined,
  });

  // Mapear backend a frontend para promociones
  const mapPromoFromBackend = (promo: BackendPromotion): Promotion => ({
    id: promo.id,
    name: promo.nombre,
    description: promo.descripcion,
    type: promo.tipo === 'PORCENTAJE' ? 'percentage' : 'fixed',
    value: Number(promo.descuento),
    startDate: promo.fechaInicio,
    endDate: promo.fechaFin,
    active: promo.activo,
    productIds: promo.productosAplicables || [],
  });

  // Mapear frontend a backend para combos
  const mapComboToBackend = (formData: typeof comboFormData) => ({
    nombre: formData.nombre,
    descripcion: formData.descripcion,
    productos: formData.productos.map(p => ({ productoId: p.productId, cantidad: p.quantity })),
    precioOriginal: formData.precioOriginal,
    precioCombo: formData.precioCombo,
    puntosExtra: formData.puntosExtra || undefined,
    active: formData.active,
  });

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const backendData = mapPromoToBackend(promoFormData);
      
      if (editingPromo) {
        await promotionsService.update(editingPromo.id, {
          name: backendData.nombre,
          description: backendData.descripcion,
          type: backendData.tipo === 'PORCENTAJE' ? 'percentage' : 'fixed',
          value: backendData.descuento,
          startDate: backendData.fechaInicio,
          endDate: backendData.fechaFin,
          active: backendData.activo,
          productIds: backendData.productosAplicables,
        });
        toast.success('Promoción actualizada correctamente');
      } else {
        await promotionsService.create({
          name: backendData.nombre,
          description: backendData.descripcion,
          type: backendData.tipo === 'PORCENTAJE' ? 'percentage' : 'fixed',
          value: backendData.descuento,
          startDate: backendData.fechaInicio,
          endDate: backendData.fechaFin,
          active: backendData.activo,
          productIds: backendData.productosAplicables,
        });
        toast.success('Promoción creada correctamente');
      }
      
      setIsPromoDialogOpen(false);
      resetPromoForm();
      loadData();
    } catch (error) {
      toast.error('Error al guardar promoción');
    }
  };

  const handleComboSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const backendData = mapComboToBackend(comboFormData);
      
      // Mapear a la estructura que espera el servicio
      const serviceData = {
        name: backendData.nombre,
        description: backendData.descripcion,
        products: comboFormData.productos.map(p => ({ productId: p.productId, quantity: p.quantity })),
        originalPrice: backendData.precioOriginal,
        comboPrice: backendData.precioCombo,
        active: backendData.active,
      };
      
      if (editingCombo) {
        await combosService.update(editingCombo.id, serviceData);
        toast.success('Combo actualizado correctamente');
      } else {
        await combosService.create(serviceData);
        toast.success('Combo creado correctamente');
      }
      
      setIsComboDialogOpen(false);
      resetComboForm();
      loadData();
    } catch (error) {
      toast.error('Error al guardar combo');
    }
  };

  const handleDeletePromo = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta promoción?')) return;
    
    try {
      await promotionsService.delete(id);
      toast.success('Promoción eliminada correctamente');
      loadData();
    } catch (error) {
      toast.error('Error al eliminar promoción');
    }
  };

  const handleDeleteCombo = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este combo?')) return;
    
    try {
      await combosService.delete(id);
      toast.success('Combo eliminado correctamente');
      loadData();
    } catch (error) {
      toast.error('Error al eliminar combo');
    }
  };

  const openEditPromoDialog = (promo: Promotion) => {
    setEditingPromo(promo);
    setPromoFormData({
      nombre: promo.name,
      descripcion: promo.description,
      tipo: promo.type === 'percentage' ? 'PORCENTAJE' : 'MONTO',
      descuento: promo.value,
      fechaInicio: promo.startDate,
      fechaFin: promo.endDate,
      activo: promo.active,
      productosAplicables: promo.productIds || [],
      montoMinimo: 0,
      cantidadMaximaUsos: 0,
    });
    setIsPromoDialogOpen(true);
  };

  const openEditComboDialog = (combo: Combo) => {
    setEditingCombo(combo);
    setComboFormData({
      nombre: combo.name,
      descripcion: combo.description,
      precioOriginal: combo.originalPrice,
      precioCombo: combo.comboPrice,
      puntosExtra: 0,
      active: combo.active,
      productos: combo.products,
    });
    setIsComboDialogOpen(true);
  };

  const resetPromoForm = () => {
    setEditingPromo(null);
    setPromoFormData({
      nombre: '',
      descripcion: '',
      tipo: 'PORCENTAJE',
      descuento: 0,
      fechaInicio: '',
      fechaFin: '',
      activo: true,
      productosAplicables: [],
      montoMinimo: 0,
      cantidadMaximaUsos: 0,
    });
  };

  const resetComboForm = () => {
    setEditingCombo(null);
    setComboFormData({
      nombre: '',
      descripcion: '',
      precioOriginal: 0,
      precioCombo: 0,
      puntosExtra: 0,
      active: true,
      productos: [],
    });
  };

  const addProductToCombo = (productId: number) => {
    if (comboFormData.productos.find(p => p.productId === productId)) {
      toast.error('El producto ya está en el combo');
      return;
    }
    setComboFormData({
      ...comboFormData,
      productos: [...comboFormData.productos, { productId, quantity: 1 }],
    });
  };

  const removeProductFromCombo = (productId: number) => {
    setComboFormData({
      ...comboFormData,
      productos: comboFormData.productos.filter(p => p.productId !== productId),
    });
  };

  const updateProductQuantity = (productId: number, quantity: number) => {
    setComboFormData({
      ...comboFormData,
      productos: comboFormData.productos.map(p => 
        p.productId === productId ? { ...p, quantity } : p
      ),
    });
  };

  const toggleProductInPromo = (productId: number) => {
    if (promoFormData.productosAplicables.includes(productId)) {
      setPromoFormData({
        ...promoFormData,
        productosAplicables: promoFormData.productosAplicables.filter(id => id !== productId),
      });
    } else {
      setPromoFormData({
        ...promoFormData,
        productosAplicables: [...promoFormData.productosAplicables, productId],
      });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Cargando...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in p-4 lg:p-6">
      <Tabs defaultValue="promociones" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="promociones">Promociones</TabsTrigger>
          <TabsTrigger value="combos">Combos</TabsTrigger>
        </TabsList>

        <TabsContent value="promociones" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">Promociones</h1>
              <p className="text-muted-foreground">Gestiona las ofertas especiales de tu tienda</p>
            </div>
            
            <Dialog open={isPromoDialogOpen} onOpenChange={(open) => {
              setIsPromoDialogOpen(open);
              if (!open) resetPromoForm();
            }}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Promoción
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingPromo ? 'Editar Promoción' : 'Nueva Promoción'}</DialogTitle>
                  <DialogDescription>
                    Configura los detalles de la promoción
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handlePromoSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="promoNombre">Nombre *</Label>
                    <Input
                      id="promoNombre"
                      value={promoFormData.nombre}
                      onChange={(e) => setPromoFormData({ ...promoFormData, nombre: e.target.value })}
                      placeholder="Descuento de Verano"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="promoDesc">Descripción *</Label>
                    <Textarea
                      id="promoDesc"
                      value={promoFormData.descripcion}
                      onChange={(e) => setPromoFormData({ ...promoFormData, descripcion: e.target.value })}
                      placeholder="20% de descuento en bebidas"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select value={promoFormData.tipo} onValueChange={(value: 'PORCENTAJE' | 'MONTO') => setPromoFormData({ ...promoFormData, tipo: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PORCENTAJE">Porcentaje</SelectItem>
                          <SelectItem value="MONTO">Monto Fijo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="promoDescuento">
                        {promoFormData.tipo === 'PORCENTAJE' ? 'Descuento %' : 'Descuento S/'}
                      </Label>
                      <Input
                        id="promoDescuento"
                        type="number"
                        step="0.01"
                        min="0"
                        value={promoFormData.descuento || ''}
                        onChange={(e) => setPromoFormData({ ...promoFormData, descuento: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                      <Input
                        id="fechaInicio"
                        type="date"
                        value={promoFormData.fechaInicio}
                        onChange={(e) => setPromoFormData({ ...promoFormData, fechaInicio: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fechaFin">Fecha Fin</Label>
                      <Input
                        id="fechaFin"
                        type="date"
                        value={promoFormData.fechaFin}
                        onChange={(e) => setPromoFormData({ ...promoFormData, fechaFin: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="montoMinimo">Monto Mínimo (opcional)</Label>
                      <Input
                        id="montoMinimo"
                        type="number"
                        step="0.01"
                        min="0"
                        value={promoFormData.montoMinimo || ''}
                        onChange={(e) => setPromoFormData({ ...promoFormData, montoMinimo: parseFloat(e.target.value) || 0 })}
                        placeholder="50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cantidadMaxima">Usos Máximos (opcional)</Label>
                      <Input
                        id="cantidadMaxima"
                        type="number"
                        min="0"
                        value={promoFormData.cantidadMaximaUsos || ''}
                        onChange={(e) => setPromoFormData({ ...promoFormData, cantidadMaximaUsos: parseInt(e.target.value) || 0 })}
                        placeholder="100"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Productos Aplicables</Label>
                    <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-1">
                      {productos.map((product) => (
                        <div key={product.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={promoFormData.productosAplicables.includes(product.id)}
                            onChange={() => toggleProductInPromo(product.id)}
                            className="rounded"
                          />
                          <span className="text-sm">{product.productoDescripcion}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {promoFormData.productosAplicables.length === 0 
                        ? 'Aplica a todos los productos' 
                        : `${promoFormData.productosAplicables.length} productos seleccionados`}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="promoActivo">Activa</Label>
                    <Switch
                      id="promoActivo"
                      checked={promoFormData.activo}
                      onCheckedChange={(checked) => setPromoFormData({ ...promoFormData, activo: checked })}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full">
                      {editingPromo ? 'Actualizar' : 'Crear Promoción'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {(promociones || [])
              .slice((currentPromoPage - 1) * ITEMS_PER_PAGE, currentPromoPage * ITEMS_PER_PAGE)
              .map((promo) => (
              <Card key={promo.id} className="hover:shadow-lg transition-all">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Gift className="h-5 w-5 text-primary" />
                    {promo.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Badge variant={promo.active ? "default" : "secondary"}>
                      {promo.active ? "Activa" : "Inactiva"}
                    </Badge>
                    <Button size="icon" variant="ghost" onClick={() => openEditPromoDialog(promo)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDeletePromo(promo.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">{promo.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}
                    </div>
                    <Badge variant="outline">{promo.type === 'percentage' ? 'PORCENTAJE' : 'MONTO'}</Badge>
                    <span className="font-semibold">{promo.value}{promo.type === 'percentage' ? '%' : ' soles'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {promociones.length > ITEMS_PER_PAGE && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPromoPage(p => Math.max(1, p - 1))}
                    className={currentPromoPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: Math.ceil(promociones.length / ITEMS_PER_PAGE) }, (_, i) => i + 1).map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPromoPage(page)}
                      isActive={currentPromoPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPromoPage(p => Math.min(Math.ceil(promociones.length / ITEMS_PER_PAGE), p + 1))}
                    className={currentPromoPage >= Math.ceil(promociones.length / ITEMS_PER_PAGE) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </TabsContent>

        <TabsContent value="combos" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">Combos</h1>
              <p className="text-muted-foreground">Crea paquetes especiales de productos</p>
            </div>
            
            <Dialog open={isComboDialogOpen} onOpenChange={(open) => {
              setIsComboDialogOpen(open);
              if (!open) resetComboForm();
            }}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Combo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingCombo ? 'Editar Combo' : 'Nuevo Combo'}</DialogTitle>
                  <DialogDescription>
                    Configura los productos y precios del combo
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleComboSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="comboNombre">Nombre *</Label>
                    <Input
                      id="comboNombre"
                      value={comboFormData.nombre}
                      onChange={(e) => setComboFormData({ ...comboFormData, nombre: e.target.value })}
                      placeholder="Combo Familiar"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comboDesc">Descripción *</Label>
                    <Textarea
                      id="comboDesc"
                      value={comboFormData.descripcion}
                      onChange={(e) => setComboFormData({ ...comboFormData, descripcion: e.target.value })}
                      placeholder="2 hamburguesas + 2 papas + 2 gaseosas"
                      required
                    />
                  </div>
                  
                  {/* Productos del combo */}
                  <div className="space-y-2">
                    <Label>Productos del Combo *</Label>
                    <Select onValueChange={(value) => addProductToCombo(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Agregar producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {productos.map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.productoDescripcion} - S/ {product.precio}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {comboFormData.productos.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {comboFormData.productos.map((item) => {
                          const product = productos.find(p => p.id === item.productId);
                          return (
                            <div key={item.productId} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                              <span className="flex-1 text-sm">{product?.productoDescripcion}</span>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateProductQuantity(item.productId, parseInt(e.target.value) || 1)}
                                className="w-20"
                              />
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => removeProductFromCombo(item.productId)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="precioOriginal">Precio Original S/</Label>
                      <Input
                        id="precioOriginal"
                        type="number"
                        step="0.01"
                        min="0"
                        value={comboFormData.precioOriginal || ''}
                        onChange={(e) => setComboFormData({ ...comboFormData, precioOriginal: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="precioCombo">Precio Combo S/</Label>
                      <Input
                        id="precioCombo"
                        type="number"
                        step="0.01"
                        min="0"
                        value={comboFormData.precioCombo || ''}
                        onChange={(e) => setComboFormData({ ...comboFormData, precioCombo: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="puntosExtra">Puntos Extra (opcional)</Label>
                    <Input
                      id="puntosExtra"
                      type="number"
                      min="0"
                      value={comboFormData.puntosExtra || ''}
                      onChange={(e) => setComboFormData({ ...comboFormData, puntosExtra: parseInt(e.target.value) || 0 })}
                      placeholder="10"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="comboActive">Activo</Label>
                    <Switch
                      id="comboActive"
                      checked={comboFormData.active}
                      onCheckedChange={(checked) => setComboFormData({ ...comboFormData, active: checked })}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full" disabled={comboFormData.productos.length === 0}>
                      {editingCombo ? 'Actualizar' : 'Crear Combo'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {(combos || [])
              .slice((currentComboPage - 1) * ITEMS_PER_PAGE, currentComboPage * ITEMS_PER_PAGE)
              .map((combo) => (
              <Card key={combo.id} className="hover:shadow-lg transition-all">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Package className="h-5 w-5 text-primary" />
                    {combo.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Badge variant={combo.active ? "default" : "secondary"}>
                      {combo.active ? "Activo" : "Inactivo"}
                    </Badge>
                    <Button size="icon" variant="ghost" onClick={() => openEditComboDialog(combo)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDeleteCombo(combo.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">{combo.description}</p>
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-sm line-through text-muted-foreground">
                      S/ {combo.originalPrice.toFixed(2)}
                    </span>
                    <span className="text-lg font-bold text-primary">
                      S/ {combo.comboPrice.toFixed(2)}
                    </span>
                    <Badge variant="outline">
                      Ahorro: S/ {(combo.originalPrice - combo.comboPrice).toFixed(2)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {combos.length > ITEMS_PER_PAGE && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentComboPage(p => Math.max(1, p - 1))}
                    className={currentComboPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: Math.ceil(combos.length / ITEMS_PER_PAGE) }, (_, i) => i + 1).map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentComboPage(page)}
                      isActive={currentComboPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentComboPage(p => Math.min(Math.ceil(combos.length / ITEMS_PER_PAGE), p + 1))}
                    className={currentComboPage >= Math.ceil(combos.length / ITEMS_PER_PAGE) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

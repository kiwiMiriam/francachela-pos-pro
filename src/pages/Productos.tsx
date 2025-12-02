import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Pencil, Trash2, Search, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { inventoryService } from '@/services/inventoryService';
import { productsService } from '@/services/productsService';
import type { Product, InventoryMovement } from "@/types";
import { ProductCategory, ProductSupplier } from "@/types";

export default function Productos() {
  // Usar hooks de TanStack Query
  const { data: productos = [], isLoading, error, refetch } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [movimientos, setMovimientos] = useState<InventoryMovement[]>([]);
  const [isLoadingMovements, setIsLoadingMovements] = useState(false);
  
  const [formData, setFormData] = useState({
    productoDescripcion: '',
    codigoBarra: '',
    categoria: '',
    precio: 0,
    costo: 0,
    cantidadActual: 0,
    cantidadMinima: 0,
    proveedor: '',
    imagen: '',
    precioMayoreo: 0,
    valorPuntos: 0,
    mostrar: true,
    usaInventario: true,
  });
  
  const [movementData, setMovementData] = useState({
    type: 'entrada' as 'entrada' | 'salida' | 'ajuste',
    quantity: 0,
    notes: '',
  });

  // Cargar movimientos de inventario
  useEffect(() => {
    const loadMovements = async () => {
      setIsLoadingMovements(true);
      try {
        const data = await inventoryService.getMovements();
        setMovimientos(data);
      } catch (error) {
        console.error('Error loading movements:', error);
      } finally {
        setIsLoadingMovements(false);
      }
    };
    loadMovements();
  }, []);

  // Manejar errores
  useEffect(() => {
    if (error) {
      toast.error('Error al cargar productos');
      console.error('Error loading products:', error);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, data: formData });
        toast.success('Producto actualizado correctamente');
      } else {
        await createProduct.mutateAsync(formData as Omit<Product, 'id'>);
        toast.success('Producto creado correctamente');
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Error al guardar producto');
    }
  };

  const handleMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) return;
    
    try {
      await inventoryService.createMovement({
        TIPO: movementData.type,
        PRODUCTO_ID: selectedProduct.id,
        PRODUCTO_NOMBRE: selectedProduct.productoDescripcion,
        CANTIDAD: movementData.quantity,
        HORA: new Date().toISOString(),
        DESCRIPCION: movementData.notes || `Movimiento de ${movementData.type}`,
        CAJERO: 'Usuario', // TODO: obtener del contexto de auth
      });
      
      // Actualizar stock del producto
      const newStock = movementData.type === 'entrada' 
        ? selectedProduct.cantidadActual + movementData.quantity
        : selectedProduct.cantidadActual - movementData.quantity;
      
      await productsService.update(selectedProduct.id, { cantidadActual: newStock });
      
      toast.success('Movimiento registrado correctamente');
      setIsMovementDialogOpen(false);
      resetMovementForm();
      
      // Recargar datos
      refetch();
      const updatedMovements = await inventoryService.getMovements();
      setMovimientos(updatedMovements);
    } catch (error) {
      toast.error('Error al registrar movimiento');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
      await deleteProduct.mutateAsync(id);
      toast.success('Producto eliminado correctamente');
    } catch (error) {
      toast.error('Error al eliminar producto');
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      productoDescripcion: product.productoDescripcion,
      codigoBarra: product.codigoBarra,
      categoria: product.categoria,
      precio: product.precio,
      costo: product.costo,
      cantidadActual: product.cantidadActual,
      cantidadMinima: product.cantidadMinima,
      proveedor: product.proveedor,
      imagen: product.imagen || '',
      precioMayoreo: product.precioMayoreo || 0,
      valorPuntos: product.valorPuntos || 0,
      mostrar: product.mostrar ?? true,
      usaInventario: product.usaInventario ?? true,
    });
    setIsDialogOpen(true);
  };

  const openMovementDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsMovementDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      productoDescripcion: '',
      codigoBarra: '',
      categoria: '',
      precio: 0,
      costo: 0,
      cantidadActual: 0,
      cantidadMinima: 0,
      proveedor: '',
      imagen: '',
      precioMayoreo: 0,
      valorPuntos: 0,
      mostrar: true,
      usaInventario: true,
    });
  };

  const resetMovementForm = () => {
    setSelectedProduct(null);
    setMovementData({
      type: 'entrada',
      quantity: 0,
      notes: '',
    });
  };

  // Filtrar productos localmente
  const filteredProductos = (productos || []).filter(producto => {
    if (!producto?.productoDescripcion || !producto?.codigoBarra || !producto?.categoria) return false;
    
    const searchTermLower = searchTerm.toLowerCase();
    return (
      producto.productoDescripcion.toLowerCase().includes(searchTermLower) ||
      producto.codigoBarra.includes(searchTerm) ||
      producto.categoria.toLowerCase().includes(searchTermLower)
    );
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Cargando productos...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in p-4 lg:p-6">
      <Tabs defaultValue="productos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="productos">Productos</TabsTrigger>
          <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
        </TabsList>

        <TabsContent value="productos" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">Gestión de Productos</h1>
              <p className="text-muted-foreground">Administra tu inventario de productos</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Producto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
                  <DialogDescription>
                    {editingProduct ? 'Actualiza la información del producto' : 'Completa los datos del nuevo producto'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={formData.productoDescripcion}
                      onChange={(e) => setFormData({ ...formData, productoDescripcion: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barcode">Código de Barras *</Label>
                    <Input
                      id="barcode"
                      value={formData.codigoBarra}
                      onChange={(e) => setFormData({ ...formData, codigoBarra: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría *</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                      required
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ProductCategory).map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cost">Costo S/ *</Label>
                      <Input
                        id="cost"
                        type="number"
                        step="0.01"
                        value={formData.costo || ''}
                        onChange={(e) => setFormData({ ...formData, costo: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Precio S/ *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.precio || ''}
                        onChange={(e) => setFormData({ ...formData, precio: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock *</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={formData.cantidadActual || ''}
                        onChange={(e) => setFormData({ ...formData, cantidadActual: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minStock">Stock Mínimo *</Label>
                      <Input
                        id="minStock"
                        type="number"
                        value={formData.cantidadMinima || ''}
                        onChange={(e) => setFormData({ ...formData, cantidadMinima: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Proveedor *</Label>
                    <Select
                      value={formData.proveedor}
                      onValueChange={(value) => setFormData({ ...formData, proveedor: value })}
                      required
                    >
                      <SelectTrigger id="supplier">
                        <SelectValue placeholder="Seleccionar proveedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ProductSupplier).map((sup) => (
                          <SelectItem key={sup} value={sup}>
                            {sup}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">URL de Imagen</Label>
                    <Input
                      id="image"
                      value={formData.imagen}
                      onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wholesalePrice">Precio Mayoreo S/</Label>
                    <Input
                      id="wholesalePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.precioMayoreo || ''}
                      onChange={(e) => setFormData({ ...formData, precioMayoreo: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pointsValue">Valor en Puntos</Label>
                    <Input
                      id="pointsValue"
                      type="number"
                      min="0"
                      value={formData.valorPuntos || ''}
                      onChange={(e) => setFormData({ ...formData, valorPuntos: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showInCatalog">Mostrar en Catálogo</Label>
                    <Input
                      id="showInCatalog"
                      type="checkbox"
                      checked={formData.mostrar}
                      onChange={(e) => setFormData({ ...formData, mostrar: e.target.checked })}
                      className="w-4 h-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="useInventory">Usa Inventario</Label>
                    <Input
                      id="useInventory"
                      type="checkbox"
                      checked={formData.usaInventario}
                      onChange={(e) => setFormData({ ...formData, usaInventario: e.target.checked })}
                      className="w-4 h-4"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full">
                      {editingProduct ? 'Actualizar' : 'Crear Producto'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, código o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid gap-4">
            {filteredProductos.map((producto) => (
              <Card key={producto.id} className="hover:shadow-lg transition-all">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Package className="h-5 w-5 text-primary" />
                    {producto.productoDescripcion}
                  </CardTitle>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Badge variant={producto.cantidadActual > producto.cantidadMinima ? "default" : "destructive"}>
                      Stock: {producto.cantidadActual}
                    </Badge>
                    <Button size="icon" variant="ghost" onClick={() => openMovementDialog(producto)}>
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => openEditDialog(producto)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(producto.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Categoría</p>
                      <p className="font-semibold">{producto.categoria}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Código</p>
                      <p className="font-semibold text-sm">{producto.codigoBarra}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Costo</p>
                      <p className="font-semibold">S/ {producto.costo.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Precio</p>
                      <p className="font-semibold text-primary">S/ {producto.precio.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Proveedor</p>
                      <p className="font-semibold">{producto.proveedor}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="movimientos" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Movimientos de Inventario</h2>
            <p className="text-muted-foreground">Historial de entradas, salidas y ajustes</p>
          </div>

          {isLoadingMovements ? (
            <div className="flex items-center justify-center h-32">Cargando movimientos...</div>
          ) : (
            <div className="grid gap-4">
              {movimientos.slice(0, 50).map((mov) => (
                <Card key={mov.id}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Fecha/Hora</p>
                        <p className="font-semibold text-sm">{new Date(mov.HORA).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Producto</p>
                        <p className="font-semibold text-sm">{mov.PRODUCTO_NOMBRE || mov.DESCRIPCION}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tipo</p>
                        <Badge variant={mov.TIPO === 'entrada' ? 'default' : mov.TIPO === 'salida' ? 'destructive' : 'secondary'}>
                          {mov.TIPO.toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cantidad</p>
                        <p className="font-semibold">{mov.CANTIDAD}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cajero</p>
                        <p className="font-semibold">{mov.CAJERO}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isMovementDialogOpen} onOpenChange={(open) => {
        setIsMovementDialogOpen(open);
        if (!open) resetMovementForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Movimiento</DialogTitle>
            <DialogDescription>
              {selectedProduct?.productoDescripcion}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMovementSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Movimiento</Label>
              <Select value={movementData.type} onValueChange={(value: 'entrada' | 'salida' | 'ajuste') => setMovementData({ ...movementData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="salida">Salida</SelectItem>
                  <SelectItem value="ajuste">Ajuste</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                value={movementData.quantity || ''}
                onChange={(e) => setMovementData({ ...movementData, quantity: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                required
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Input
                id="notes"
                value={movementData.notes}
                onChange={(e) => setMovementData({ ...movementData, notes: e.target.value })}
                placeholder="Descripción del movimiento"
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">Registrar Movimiento</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

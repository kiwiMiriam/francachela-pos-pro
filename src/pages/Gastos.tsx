import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Receipt, Plus, Search, Calendar, DollarSign, TrendingUp, Filter, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { expensesService } from '@/services/expensesService';
import type { Expense } from '@/types';

// Categorías de gastos según el backend
const EXPENSE_CATEGORIES = [
  'OPERATIVO',
  'ADMINISTRATIVO', 
  'MARKETING',
  'MANTENIMIENTO',
  'SERVICIOS',
  'OTROS'
];

const PAYMENT_METHODS = [
  'EFECTIVO',
  'TARJETA',
  'TRANSFERENCIA',
  'YAPE',
  'PLIN'
];

export default function Gastos() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [todayExpenses, setTodayExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [formData, setFormData] = useState({
    descripcion: '',
    monto: 0,
    categoria: '',
    metodoPago: '',
    proveedor: '',
    numeroComprobante: '',
    comprobante: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [allExpenses, todayData, categoriesData] = await Promise.all([
        expensesService.getAll(),
        expensesService.getToday(),
        expensesService.getCategories().catch(() => EXPENSE_CATEGORIES) // Fallback a categorías predefinidas
      ]);
      
      setExpenses(allExpenses);
      setTodayExpenses(todayData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading expenses:', error);
      toast.error('Error al cargar gastos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descripcion || !formData.monto || !formData.categoria || !formData.metodoPago) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      if (editingExpense) {
        await expensesService.update(editingExpense.id, formData);
        toast.success('Gasto actualizado correctamente');
      } else {
        await expensesService.create(formData);
        toast.success('Gasto registrado correctamente');
      }
      
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error('Error al guardar gasto');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este gasto?')) return;
    
    try {
      await expensesService.delete(id);
      toast.success('Gasto eliminado correctamente');
      loadData();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Error al eliminar gasto');
    }
  };

  const openEditDialog = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      descripcion: expense.descripcion || '',
      monto: expense.monto || 0,
      categoria: expense.categoria || '',
      metodoPago: expense.metodoPago || '',
      proveedor: expense.proveedor || '',
      numeroComprobante: expense.numeroComprobante || '',
      comprobante: expense.comprobante || ''
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingExpense(null);
    setFormData({
      descripcion: '',
      monto: 0,
      categoria: '',
      metodoPago: '',
      proveedor: '',
      numeroComprobante: '',
      comprobante: ''
    });
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.proveedor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || expense.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.monto || 0), 0);
  const todayTotal = todayExpenses.reduce((sum, e) => sum + (e.monto || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gastos</h1>
          <p className="text-muted-foreground">Control y gestión de gastos del negocio</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Gasto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingExpense ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}</DialogTitle>
              <DialogDescription>
                {editingExpense ? 'Actualiza la información del gasto' : 'Completa los datos del nuevo gasto'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción *</Label>
                  <Input
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Descripción del gasto"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monto">Monto S/ *</Label>
                  <Input
                    id="monto"
                    type="number"
                    step="0.01"
                    value={formData.monto || ''}
                    onChange={(e) => setFormData({ ...formData, monto: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoría *</Label>
                  <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Método de Pago *</Label>
                  <Select value={formData.metodoPago} onValueChange={(value) => setFormData({ ...formData, metodoPago: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar método" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method} value={method}>{method}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="proveedor">Proveedor</Label>
                  <Input
                    id="proveedor"
                    value={formData.proveedor}
                    onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                    placeholder="Nombre del proveedor"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numeroComprobante">N° Comprobante</Label>
                  <Input
                    id="numeroComprobante"
                    value={formData.numeroComprobante}
                    onChange={(e) => setFormData({ ...formData, numeroComprobante: e.target.value })}
                    placeholder="F001-00001234"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comprobante">URL Comprobante</Label>
                <Input
                  id="comprobante"
                  value={formData.comprobante}
                  onChange={(e) => setFormData({ ...formData, comprobante: e.target.value })}
                  placeholder="https://ejemplo.com/comprobante.pdf"
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full">
                  {editingExpense ? 'Actualizar' : 'Registrar'} Gasto
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="expenses">Gastos</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Gastos</p>
                    <p className="text-2xl font-bold text-destructive">S/ {totalExpenses.toFixed(2)}</p>
                  </div>
                  <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Gastos Hoy</p>
                    <p className="text-2xl font-bold text-orange-600">S/ {todayTotal.toFixed(2)}</p>
                  </div>
                  <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Registros</p>
                    <p className="text-2xl font-bold text-primary">{expenses.length}</p>
                  </div>
                  <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Receipt className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Promedio Diario</p>
                    <p className="text-2xl font-bold text-blue-600">
                      S/ {expenses.length > 0 ? (totalExpenses / Math.max(expenses.length, 1)).toFixed(2) : '0.00'}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gastos recientes */}
          <Card>
            <CardHeader>
              <CardTitle>Gastos Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenses.slice(0, 5).map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Receipt className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold">{expense.descripcion}</p>
                        <p className="text-sm text-muted-foreground">
                          {expense.categoria} • {new Date(expense.fechaCreacion || '').toLocaleDateString('es-PE')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-destructive">S/ {expense.monto?.toFixed(2)}</p>
                      <Badge variant="outline">{expense.metodoPago}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar gastos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas las categorías</SelectItem>
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
              </div>
            </CardContent>
          </Card>

          {/* Lista de gastos */}
          <div className="grid gap-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Receipt className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                  <p>Cargando gastos...</p>
                </div>
              </div>
            ) : filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense) => (
                <Card key={expense.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Receipt className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-semibold text-lg">{expense.descripcion}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{new Date(expense.fechaCreacion || '').toLocaleString('es-PE')}</span>
                            <Badge variant="outline">{expense.categoria}</Badge>
                            <Badge variant="secondary">{expense.metodoPago}</Badge>
                            {expense.proveedor && <span>• {expense.proveedor}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-4">
                          <p className="text-2xl font-bold text-destructive">S/ {expense.monto?.toFixed(2)}</p>
                          {expense.numeroComprobante && (
                            <p className="text-sm text-muted-foreground">{expense.numeroComprobante}</p>
                          )}
                        </div>
                        <Button size="icon" variant="ghost" onClick={() => openEditDialog(expense)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(expense.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-semibold mb-2">No hay gastos registrados</p>
                    <p className="text-muted-foreground">Los gastos aparecerán aquí cuando los registres</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {EXPENSE_CATEGORIES.map((category) => {
                  const categoryExpenses = expenses.filter(e => e.categoria === category);
                  const categoryTotal = categoryExpenses.reduce((sum, e) => sum + (e.monto || 0), 0);
                  const percentage = totalExpenses > 0 ? (categoryTotal / totalExpenses) * 100 : 0;
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category}</span>
                        <span className="text-sm text-muted-foreground">
                          S/ {categoryTotal.toFixed(2)} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

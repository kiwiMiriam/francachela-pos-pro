import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Receipt, Plus, Wallet, ArrowUpRight, ArrowDownRight, Calculator, Calendar, DollarSign, Lock, Unlock, Search, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { expensesService } from '@/services/expensesService';
import { cashRegisterService } from '@/services/cashRegisterService';
import type { Expense, CashRegister, PaymentMethod } from '@/types';
import type { CashRegisterStatistics } from '@/types/api';

const EXPENSE_CATEGORIES = ['OPERATIVO', 'ADMINISTRATIVO', 'MARKETING', 'MANTENIMIENTO', 'OTROS'];
const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  'EFECTIVO': 'Efectivo',
  'YAPE': 'Yape',
  'PLIN': 'Plin',
  'TARJETA': 'Tarjeta',
};

export default function Gastos() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currentCaja, setCurrentCaja] = useState<CashRegister | null>(null);
  const [cajaHistory, setCajaHistory] = useState<CashRegister[]>([]);
  const [cajaStats, setCajaStats] = useState<CashRegisterStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialogs
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isOpenCajaDialogOpen, setIsOpenCajaDialogOpen] = useState(false);
  const [isCloseCajaDialogOpen, setIsCloseCajaDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  // Forms
  const [expenseForm, setExpenseForm] = useState({
    descripcion: '',
    monto: 0,
    categoria: 'OPERATIVO',
    metodoPago: 'EFECTIVO' as PaymentMethod,
    proveedor: '',
    numeroComprobante: '',
  });
  
  const [openCajaForm, setOpenCajaForm] = useState({
    montoInicial: 0,
    observaciones: '',
  });
  
  const [closeCajaForm, setCloseCajaForm] = useState({
    montoFinal: 0,
    observaciones: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [expensesData, currentCajaData, historyData, statsData] = await Promise.all([
        expensesService.getAll(),
        cashRegisterService.getCurrent(),
        cashRegisterService.getHistory(),
        cashRegisterService.getStatistics(),
      ]);
      
      setExpenses(expensesData || []);
      setCurrentCaja(currentCajaData);
      setCajaHistory(historyData || []);
      setCajaStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingExpense) {
        await expensesService.update(editingExpense.id, {
          description: expenseForm.descripcion,
          amount: expenseForm.monto,
          category: expenseForm.categoria,
          paymentMethod: expenseForm.metodoPago,
        });
        toast.success('Gasto actualizado');
      } else {
        await expensesService.create({
          description: expenseForm.descripcion,
          amount: expenseForm.monto,
          category: expenseForm.categoria,
          paymentMethod: expenseForm.metodoPago,
          date: new Date().toISOString(),
        });
        toast.success('Gasto registrado');
      }
      
      resetExpenseForm();
      setIsExpenseDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error('Error al guardar gasto');
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (!confirm('¿Eliminar este gasto?')) return;
    
    try {
      await expensesService.delete(id);
      toast.success('Gasto eliminado');
      loadData();
    } catch (error) {
      toast.error('Error al eliminar gasto');
    }
  };

  const handleOpenCaja = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await cashRegisterService.open({
        montoInicial: openCajaForm.montoInicial,
        observaciones: openCajaForm.observaciones,
      });
      toast.success('Caja abierta correctamente');
      setIsOpenCajaDialogOpen(false);
      setOpenCajaForm({ montoInicial: 0, observaciones: '' });
      loadData();
    } catch (error) {
      toast.error('Error al abrir caja');
    }
  };

  const handleCloseCaja = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentCaja) return;
    
    try {
      await cashRegisterService.close(currentCaja.id, {
        montoFinal: closeCajaForm.montoFinal,
        observaciones: closeCajaForm.observaciones,
      });
      toast.success('Caja cerrada correctamente');
      setIsCloseCajaDialogOpen(false);
      setCloseCajaForm({ montoFinal: 0, observaciones: '' });
      loadData();
    } catch (error) {
      toast.error('Error al cerrar caja');
    }
  };

  const openEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      descripcion: expense.description,
      monto: expense.amount,
      categoria: expense.category,
      metodoPago: expense.paymentMethod,
      proveedor: '',
      numeroComprobante: '',
    });
    setIsExpenseDialogOpen(true);
  };

  const resetExpenseForm = () => {
    setEditingExpense(null);
    setExpenseForm({
      descripcion: '',
      monto: 0,
      categoria: 'OPERATIVO',
      metodoPago: 'EFECTIVO',
      proveedor: '',
      numeroComprobante: '',
    });
  };

  const filteredExpenses = expenses.filter(expense => {
    const searchLower = searchTerm.toLowerCase();
    return (
      expense.description.toLowerCase().includes(searchLower) ||
      expense.category.toLowerCase().includes(searchLower)
    );
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Cargando...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Gastos y Caja</h1>
          <p className="text-muted-foreground">Control financiero del negocio</p>
        </div>
      </div>

      <Tabs defaultValue="caja" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="caja">Caja</TabsTrigger>
          <TabsTrigger value="gastos">Gastos</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        {/* Tab: Caja Actual */}
        <TabsContent value="caja" className="space-y-6">
          {/* Estado de Caja */}
          <Card className={currentCaja ? 'border-green-500/50' : 'border-destructive/50'}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {currentCaja ? (
                    <Unlock className="h-5 w-5 text-green-500" />
                  ) : (
                    <Lock className="h-5 w-5 text-destructive" />
                  )}
                  Estado de Caja
                </div>
                <Badge variant={currentCaja ? 'default' : 'destructive'}>
                  {currentCaja ? 'ABIERTA' : 'CERRADA'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentCaja ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Cajero</p>
                      <p className="font-semibold">{currentCaja.cashier}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Apertura</p>
                      <p className="font-semibold text-sm">
                        {new Date(currentCaja.openedAt).toLocaleString('es-PE')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monto Inicial</p>
                      <p className="font-semibold text-green-600">
                        S/ {currentCaja.initialCash.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ventas del Día</p>
                      <p className="font-semibold text-primary">
                        S/ {currentCaja.totalSales.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Efectivo</p>
                        <p className="font-semibold">S/ {currentCaja.paymentBreakdown?.efectivo?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Yape</p>
                        <p className="font-semibold">S/ {currentCaja.paymentBreakdown?.yape?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Plin</p>
                        <p className="font-semibold">S/ {currentCaja.paymentBreakdown?.plin?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tarjeta</p>
                        <p className="font-semibold">S/ {currentCaja.paymentBreakdown?.tarjeta?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>
                  </div>

                  <Dialog open={isCloseCajaDialogOpen} onOpenChange={setIsCloseCajaDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Lock className="h-4 w-4 mr-2" />
                        Cerrar Caja
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cerrar Caja</DialogTitle>
                        <DialogDescription>
                          Ingresa el monto final en caja para realizar el corte.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCloseCaja} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Monto Final en Caja (S/)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={closeCajaForm.montoFinal || ''}
                            onChange={(e) => setCloseCajaForm({ ...closeCajaForm, montoFinal: parseFloat(e.target.value) || 0 })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Observaciones</Label>
                          <Input
                            value={closeCajaForm.observaciones}
                            onChange={(e) => setCloseCajaForm({ ...closeCajaForm, observaciones: e.target.value })}
                            placeholder="Notas del cierre..."
                          />
                        </div>
                        <DialogFooter>
                          <Button type="submit" variant="destructive">Confirmar Cierre</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </>
              ) : (
                <div className="text-center py-8">
                  <Lock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No hay caja abierta</p>
                  
                  <Dialog open={isOpenCajaDialogOpen} onOpenChange={setIsOpenCajaDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Unlock className="h-4 w-4 mr-2" />
                        Abrir Caja
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Abrir Caja</DialogTitle>
                        <DialogDescription>
                          Ingresa el monto inicial para comenzar el día.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleOpenCaja} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Monto Inicial (S/)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={openCajaForm.montoInicial || ''}
                            onChange={(e) => setOpenCajaForm({ ...openCajaForm, montoInicial: parseFloat(e.target.value) || 0 })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Observaciones</Label>
                          <Input
                            value={openCajaForm.observaciones}
                            onChange={(e) => setOpenCajaForm({ ...openCajaForm, observaciones: e.target.value })}
                            placeholder="Notas de apertura..."
                          />
                        </div>
                        <DialogFooter>
                          <Button type="submit">Abrir Caja</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estadísticas */}
          {cajaStats && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <ArrowUpRight className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Ventas</p>
                      <p className="text-2xl font-bold text-green-600">
                        S/ {cajaStats.totalVentas?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                      <ArrowDownRight className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Gastos</p>
                      <p className="text-2xl font-bold text-red-600">
                        S/ {cajaStats.totalGastos?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Calculator className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Diferencia</p>
                      <p className={`text-2xl font-bold ${(cajaStats.diferencia || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        S/ {cajaStats.diferencia?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cajas del Período</p>
                      <p className="text-2xl font-bold">{cajaStats.totalCajas || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Tab: Gastos */}
        <TabsContent value="gastos" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar gastos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isExpenseDialogOpen} onOpenChange={(open) => {
              setIsExpenseDialogOpen(open);
              if (!open) resetExpenseForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Gasto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingExpense ? 'Editar Gasto' : 'Nuevo Gasto'}</DialogTitle>
                  <DialogDescription>
                    Registra un nuevo gasto del negocio.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateExpense} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Descripción *</Label>
                    <Input
                      value={expenseForm.descripcion}
                      onChange={(e) => setExpenseForm({ ...expenseForm, descripcion: e.target.value })}
                      placeholder="Ej: Compra de limpieza"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Monto (S/) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={expenseForm.monto || ''}
                        onChange={(e) => setExpenseForm({ ...expenseForm, monto: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Categoría *</Label>
                      <Select
                        value={expenseForm.categoria}
                        onValueChange={(value) => setExpenseForm({ ...expenseForm, categoria: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EXPENSE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Método de Pago *</Label>
                    <Select
                      value={expenseForm.metodoPago}
                      onValueChange={(value: PaymentMethod) => setExpenseForm({ ...expenseForm, metodoPago: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Proveedor</Label>
                      <Input
                        value={expenseForm.proveedor}
                        onChange={(e) => setExpenseForm({ ...expenseForm, proveedor: e.target.value })}
                        placeholder="Opcional"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>N° Comprobante</Label>
                      <Input
                        value={expenseForm.numeroComprobante}
                        onChange={(e) => setExpenseForm({ ...expenseForm, numeroComprobante: e.target.value })}
                        placeholder="Opcional"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">{editingExpense ? 'Actualizar' : 'Registrar'}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Total Gastos</span>
                <span className="text-destructive">S/ {totalExpenses.toFixed(2)}</span>
              </CardTitle>
            </CardHeader>
          </Card>

          <div className="grid gap-4">
            {filteredExpenses.map((expense) => (
              <Card key={expense.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <Receipt className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-base">{expense.description}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(expense.date).toLocaleString('es-PE')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-destructive">
                      S/ {expense.amount.toFixed(2)}
                    </span>
                    <Button size="icon" variant="ghost" onClick={() => openEditExpense(expense)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDeleteExpense(expense.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Badge>{expense.category}</Badge>
                    <Badge variant="outline">{PAYMENT_METHOD_LABELS[expense.paymentMethod] || expense.paymentMethod}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredExpenses.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay gastos registrados</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab: Historial de Caja */}
        <TabsContent value="historial" className="space-y-6">
          <div className="grid gap-4">
            {cajaHistory.map((caja) => (
              <Card key={caja.id} className={caja.status === 'open' ? 'border-green-500/50' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      <span>Caja #{caja.id}</span>
                    </div>
                    <Badge variant={caja.status === 'open' ? 'default' : 'secondary'}>
                      {caja.status === 'open' ? 'ABIERTA' : 'CERRADA'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Cajero</p>
                      <p className="font-semibold">{caja.cashier}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Apertura</p>
                      <p className="font-semibold text-sm">
                        {new Date(caja.openedAt).toLocaleString('es-PE')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monto Inicial</p>
                      <p className="font-semibold">S/ {caja.initialCash.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Ventas</p>
                      <p className="font-semibold text-green-600">S/ {caja.totalSales.toFixed(2)}</p>
                    </div>
                    {caja.closedAt && (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground">Cierre</p>
                          <p className="font-semibold text-sm">
                            {new Date(caja.closedAt).toLocaleString('es-PE')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Monto Final</p>
                          <p className="font-semibold">S/ {caja.finalCash?.toFixed(2) || '0.00'}</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {cajaHistory.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay historial de cajas</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

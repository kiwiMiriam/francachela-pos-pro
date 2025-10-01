import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Minus, Trash2, ShoppingCart, Receipt } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  barcode: string;
}

interface CartItem extends Product {
  quantity: number;
}

const mockProducts: Product[] = [
  { id: 1, name: "Pisco Quebranta 750ml", price: 45.00, stock: 15, barcode: "7750001" },
  { id: 2, name: "Ron Cartavio Black 750ml", price: 35.00, stock: 20, barcode: "7750002" },
  { id: 3, name: "Cerveza Cusqueña 330ml", price: 6.00, stock: 50, barcode: "7750003" },
  { id: 4, name: "Vino Tacama Tinto 750ml", price: 28.00, stock: 12, barcode: "7750004" },
  { id: 5, name: "Whisky Old Times 750ml", price: 55.00, stock: 8, barcode: "7750005" },
  { id: 6, name: "Cerveza Pilsen 650ml", price: 7.50, stock: 45, barcode: "7750006" },
];

export default function POS() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const filteredProducts = mockProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm)
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error("Stock insuficiente");
        return;
      }
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      if (product.stock === 0) {
        toast.error("Producto sin stock");
        return;
      }
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    toast.success(`${product.name} agregado al carrito`);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === id) {
            const newQuantity = item.quantity + delta;
            if (newQuantity <= 0) return null;
            if (newQuantity > item.stock) {
              toast.error("Stock insuficiente");
              return item;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter((item) => item.id !== id));
    toast.info("Producto eliminado del carrito");
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }
    toast.success("Venta procesada exitosamente");
    setCart([]);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
      {/* Products Section */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Producto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Buscar por nombre o código de barras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 text-lg"
              autoFocus
            />
          </CardContent>
        </Card>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <div className="grid sm:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => addToCart(product)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        Código: {product.barcode}
                      </p>
                    </div>
                    <Badge
                      variant={product.stock > 10 ? "default" : "destructive"}
                      className="ml-2"
                    >
                      Stock: {product.stock}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">
                      S/ {product.price.toFixed(2)}
                    </span>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Agregar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="flex flex-col gap-4">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Carrito ({cart.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto custom-scrollbar p-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <ShoppingCart className="h-16 w-16 mb-4 opacity-50" />
                <p>Carrito vacío</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <Card key={item.id} className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-sm flex-1">
                        {item.name}
                      </h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-bold min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="font-bold text-lg">
                        S/ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
          <div className="border-t p-4 space-y-4 bg-muted/20">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>TOTAL:</span>
              <span className="text-2xl text-primary">
                S/ {getTotal().toFixed(2)}
              </span>
            </div>
            <Button
              className="w-full h-14 text-lg gap-2 pos-button pos-button-success"
              onClick={handleCheckout}
              disabled={cart.length === 0}
            >
              <Receipt className="h-5 w-5" />
              Procesar Venta
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

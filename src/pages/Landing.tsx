import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Wine, Gift, Star, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

export default function Landing() {
  const featuredProducts = [
    { id: 1, name: "Pisco Quebranta Premium", price: 45.00, image: "🍾", promo: false },
    { id: 2, name: "Ron Cartavio Black", price: 35.00, image: "🥃", promo: false },
    { id: 3, name: "Combo Fiesta - 3 Cervezas", price: 18.00, image: "🍺", promo: true },
    { id: 4, name: "Vino Tacama Tinto", price: 28.00, image: "🍷", promo: false },
  ];

  const handleWhatsAppOrder = (productName: string) => {
    const message = encodeURIComponent(`Hola! Me interesa el producto: ${productName}`);
    window.open(`https://wa.me/51999999999?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-90"></div>
        <div className="absolute top-4 right-4 z-20">
          <Button 
            size="sm" 
            variant="secondary"
            className="gap-2"
            asChild
          >
            <Link to="/home">
              <LogIn className="h-4 w-4" />
              Sistema
            </Link>
          </Button>
        </div>
        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <Wine className="h-12 w-12" />
            <h1 className="text-5xl md:text-6xl font-bold">Francachela</h1>
          </div>
          <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
            Tu tienda de licores de confianza
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="gap-2 text-lg px-8 py-6"
            onClick={() => handleWhatsAppOrder("Consulta general")}
          >
            <MessageCircle className="h-5 w-5" />
            Pide por WhatsApp
          </Button>
        </div>
      </header>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-2 hover:shadow-lg transition-all">
            <CardContent className="pt-6 text-center">
              <Gift className="h-12 w-12 mx-auto mb-4 text-success" />
              <h3 className="text-xl font-semibold mb-2">Promociones</h3>
              <p className="text-muted-foreground">Ofertas especiales cada semana</p>
            </CardContent>
          </Card>
          <Card className="border-2 hover:shadow-lg transition-all">
            <CardContent className="pt-6 text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Pedidos Rápidos</h3>
              <p className="text-muted-foreground">Ordena por WhatsApp fácilmente</p>
            </CardContent>
          </Card>
          <Card className="border-2 hover:shadow-lg transition-all">
            <CardContent className="pt-6 text-center">
              <Star className="h-12 w-12 mx-auto mb-4 text-warning" />
              <h3 className="text-xl font-semibold mb-2">Calidad Garantizada</h3>
              <p className="text-muted-foreground">Productos 100% originales</p>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6 text-center">Productos Destacados</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative bg-gradient-to-br from-muted/50 to-muted/20 p-8 flex items-center justify-center h-48">
                    <span className="text-7xl group-hover:scale-110 transition-transform">
                      {product.image}
                    </span>
                    {product.promo && (
                      <div className="absolute top-2 right-2 bg-success text-success-foreground px-3 py-1 rounded-full text-xs font-bold">
                        PROMO
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <p className="text-2xl font-bold text-primary mb-4">
                      S/ {product.price.toFixed(2)}
                    </p>
                    <Button 
                      className="w-full gap-2"
                      onClick={() => handleWhatsAppOrder(product.name)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Pedir ahora
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg mb-2">© 2025 Francachela - Todos los derechos reservados</p>
          <p className="text-sm text-primary-foreground/80">Tu licorería de confianza</p>
        </div>
      </footer>
    </div>
  );
}

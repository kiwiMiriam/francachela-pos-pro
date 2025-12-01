import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

/**
 * AppHeader - Encabezado de la aplicación
 * 
 * Muestra:
 * - Información del usuario actual
 * - Rol del usuario con badge
 * - Botón de cerrar sesión
 * - Indicador de estado de autenticación
 */
export function AppHeader() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);

  // Advertencia si el usuario no está autenticado
  useEffect(() => {
    if (!isAuthenticated && user === null) {
      setShowWarning(true);
      const timer = setTimeout(() => {
        console.warn('[AppHeader] Usuario no autenticado después de 2 segundos');
        navigate('/login', { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogout = () => {
    console.log('[AppHeader] Ejecutando logout...');
    logout();
    navigate('/login', { replace: true });
  };

  const getRoleBadge = () => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      administrador: "default",
      supervisor: "secondary",
      cajero: "outline",
    };

    return (
      <Badge variant={variants[user?.role || 'cajero']}>
        {user?.role.toUpperCase()}
      </Badge>
    );
  };

  if (showWarning) {
    return (
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3 text-warning">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">Verificando autenticación...</p>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              {user?.nombre || 'Usuario'}
            </p>
            {user && getRoleBadge()}
          </div>
        </div>
        
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </header>
  );
}

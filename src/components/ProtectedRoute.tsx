import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-muted/30">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center font-heading">Cargando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-muted/30 px-4">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <h2 className="text-xl font-heading mb-2">Acceso Denegado</h2>
            <p className="text-muted-foreground">
              No tienes permisos de administrador para acceder a esta página.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

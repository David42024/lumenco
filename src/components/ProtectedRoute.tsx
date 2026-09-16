// Protege rutas según el rol mínimo requerido. Si no hay sesión, redirige
// a /login guardando la ruta de origen. Si hay sesión pero el rol no
// alcanza, redirige a una página de "acceso denegado".
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import type { Role } from "@/types";

export default function ProtectedRoute({ minimo, children }: { minimo: Role; children: ReactNode }) {
  const { user, hasRole } = useAuthStore();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!hasRole(minimo)) {
    return <Navigate to="/acceso-denegado" replace />;
  }
  return <>{children}</>;
}

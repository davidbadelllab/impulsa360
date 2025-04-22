import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ReactNode, useEffect } from 'react';

interface ProtectedRouteProps {
  children?: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Si está cargando, mostramos un indicador de carga
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Si no está autenticado después de cargar, redirigimos al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si está autenticado pero no hay usuario, algo extraño pasa
  // En ese caso, dejamos que siga, el API interceptor manejará cualquier 401
  if (!currentUser) {
    console.warn("Autenticado pero sin datos de usuario");
  }

  // Si está autenticado y tenemos datos de usuario (o al menos está autenticado)
  return children ? <>{children}</> : <Outlet />;
}

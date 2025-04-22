import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import api from '../lib/api';

type AuthContextType = {
  currentUser: any;
  login: (userData: any, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsLoading(true);
        try {
          // Intentar cargar datos del usuario desde el backend
          const response = await api.get('/user');
          if (response.data) {
            setCurrentUser(response.data);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Error cargando datos del usuario:', error);
          // Si hay un error en la petición, evitamos el bucle infinito
          // pero mantenemos el token por si el error es temporal
          setIsAuthenticated(true);
          
          // Crear un usuario temporal para evitar redirects innecesarios
          setCurrentUser({
            username: 'Usuario',
            role: 'Usuario',
            is_superadmin: false
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  const login = (userData: any, token: string) => {
    setCurrentUser(userData);
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    // Redirigir sin recargar
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      login, 
      logout,
      isAuthenticated,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

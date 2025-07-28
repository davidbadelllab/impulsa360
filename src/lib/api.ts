import axios from 'axios';

// Configuración dinámica de la URL base para diferentes entornos
const getBaseURL = () => {
  // Prioridad 1: Variable de entorno de Vite
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Prioridad 2: Variable global personalizada (para casos especiales)
  if (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) {
    return (window as any).__API_BASE_URL__;
  }
  
  // Prioridad 3: Detectar automáticamente basado en la URL actual
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // En desarrollo local
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:3000/api`;
    }
    
    // En producción: usar la misma URL del frontend
    return port ? `${protocol}//${hostname}:${port}/api` : `${protocol}//${hostname}/api`;
  }
  
  // Fallback para casos edge
  return 'http://localhost:3000/api';
};

const baseURL = getBaseURL();
console.log('🔧 API Base URL configurada:', baseURL);

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Si estamos obteniendo el usuario actual y falla con 401, 
      // simplemente rechazamos la promesa para que el contexto de autenticación
      // pueda manejarlo
      if (error.config?.url === '/user') {
        console.log('Sesión expirada: error al obtener usuario');
        localStorage.removeItem('token');
        return Promise.reject(error);
      }
      
      // Para otras llamadas, redirigir sin recargar
      console.log('Sesión expirada: redirigiendo a login');
      localStorage.removeItem('token');
      
      // Solo forzamos redirección si no estamos ya en /login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

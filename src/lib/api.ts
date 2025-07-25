import axios from 'axios';

// Configuración dinámica de la URL base para diferentes entornos
const getBaseURL = () => {
  // Si hay una variable de entorno específica para la API, usarla
  if (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) {
    return (window as any).__API_BASE_URL__;
  }
  
  if (typeof window === 'undefined') {
    // Server-side rendering: usar variables de entorno o fallback
    return process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
  }
  
  // Client-side: usar la URL actual del navegador
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  // En desarrollo local
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:3000/api`;
  }
  
  // En producción: usar la misma URL del frontend (esto funciona para Dokploy)
  return port ? `${protocol}//${hostname}:${port}/api` : `${protocol}//${hostname}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
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

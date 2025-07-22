import axios from 'axios';

// Cambiamos la URL base para que coincida con el backend real
// Corregimos la URL para que apunte al puerto correcto (3001)
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Modificamos el puerto para que coincida con server.js
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

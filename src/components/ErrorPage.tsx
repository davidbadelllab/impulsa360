import React, { useEffect, useState } from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { Button } from './Button';
import { ArrowLeft, RefreshCw, AlertTriangle, Server, Wifi, Code } from 'lucide-react';

// Importemos o definamos el tipo de ButtonProps según cómo esté definido en tu proyecto
interface ButtonProps {
  to?: string;
  variant: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function ErrorPage() {
  const error = useRouteError();
  const [errorAnimation, setErrorAnimation] = useState(false);
  const [countdown, setCountdown] = useState(10);
  
  let errorMessage = 'Ocurrió un error inesperado';
  let errorStatus: string | number = 'Error desconocido';
  let errorIcon = AlertTriangle;
  
  // Determinar el tipo de error y asignar el icono adecuado
  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.statusText || (error.data?.message as string) || errorMessage;
    
    if (errorStatus === 404) {
      errorIcon = Wifi;
    } else if (typeof errorStatus === 'number' && errorStatus >= 500) {
      errorIcon = Server;
    } else {
      errorIcon = Code;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  // Efecto de animación para el número de error
  useEffect(() => {
    const interval = setInterval(() => {
      setErrorAnimation(prev => !prev);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Cuenta regresiva para redirección automática
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Redireccionar al home después de la cuenta regresiva
      window.location.href = '/';
    }
  }, [countdown]);
  
  // Función para reintentar la carga de la página
  const handleRetry = () => {
    window.location.reload();
  };

  // Render condicional de ícono basado en el tipo
  const IconComponent = errorIcon;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white overflow-hidden relative">
      {/* Partículas de fondo (efecto decorativo) */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-blue-500/20 blur-xl"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 40 + 10}px`,
              height: `${Math.random() * 40 + 10}px`,
              animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
      
      {/* Contenido principal */}
      <div className="max-w-3xl w-full relative z-10">
        <div className="relative bg-gray-800/70 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
          {/* Barra superior de decoración */}
          <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"></div>
          
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Visualización del código de error con animación */}
              <div className="flex-shrink-0">
                <div className={`text-[120px] md:text-[150px] font-black bg-clip-text text-transparent bg-gradient-to-br from-red-500 to-orange-600 leading-none select-none transition-all duration-1000 ease-in-out ${errorAnimation ? 'scale-105 opacity-90' : 'scale-100 opacity-100'}`}>
                  {typeof errorStatus === 'number' ? errorStatus : '!'}
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center md:justify-start gap-3">
                  <span className="inline-block p-2 bg-red-500/20 rounded-lg">
                    <IconComponent className="h-7 w-7 text-red-500" />
                  </span>
                  <span>Houston, tenemos un problema</span>
                </h1>
                
                <div className="space-y-4">
                  <p className="text-xl text-gray-300 font-medium">
                    {errorMessage}
                  </p>
                  
                  <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
                  
                  <p className="text-gray-400">
                    La página que buscas parece tener problemas técnicos. 
                    Estamos trabajando para resolverlo lo antes posible.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Acciones */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center">
              <Button 
                to="/"
                variant="primary"
              >
                <div className="group flex items-center">
                  <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
                  <span>Volver al inicio</span>
                  <span className="ml-1 text-blue-300">{countdown > 0 && `(${countdown})`}</span>
                </div>
              </Button>
              
              <button 
                onClick={handleRetry}
                className="flex-1 py-3.5 px-6 bg-gray-800/50 hover:bg-gray-700/60 border border-gray-700 hover:border-gray-600 rounded-lg text-white font-medium transition-all duration-300 flex items-center justify-center"
              >
                <RefreshCw className="w-5 h-5 mr-2 group-hover:animate-spin" />
                <span>Reintentar</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mensaje adicional */}
        <div className="mt-4 text-center text-gray-500 text-sm">
          <p>ID: {Math.random().toString(36).substring(2, 10).toUpperCase()} • Tiempo: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const loginContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const video = videoRef.current;
    const loginContainer = loginContainerRef.current;
    
    const fadeInTimer = setTimeout(() => {
      loginContainer?.classList.add('opacity-100');
      loginContainer?.classList.remove('opacity-0', 'translate-y-4');
    }, 300);

    const handleVideoEnd = () => {
      console.log('Video ended, centering form');
      loginContainer?.classList.add('transition-all', 'duration-1000', 'ease-in-out');
      loginContainer?.classList.remove('ml-16');
      loginContainer?.classList.add('mx-auto');
    };

    if (video) {
      video.addEventListener('ended', handleVideoEnd);
    }

    return () => {
      clearTimeout(fadeInTimer);
      if (video) {
        video.removeEventListener('ended', handleVideoEnd);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await api.post<{token: string}>('/login', {
        email: formData.email,
        password: formData.password
      });
      
      document.getElementById('login-form')?.classList.add('scale-95', 'opacity-0');
      
      setTimeout(() => {
        login({ 
          email: formData.email,
          name: formData.email.split('@')[0] // Ejemplo de datos de usuario
        }, response.data.token);
        navigate('/dashboard');
      }, 800);
      
    } catch (err) {
      setError('Credenciales incorrectas. Inténtalo de nuevo.');
      setIsLoading(false);
      
      document.getElementById('login-form')?.classList.add('shake');
      setTimeout(() => {
        document.getElementById('login-form')?.classList.remove('shake');
      }, 500);
    }
  };

  return (
    <div className="min-h-screen flex text-white relative overflow-hidden">
      <video 
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay 
        muted 
        playsInline
      >
        <source src="/img/BG.mp4" type="video/mp4" />
        Tu navegador no soporta videos HTML5.
      </video>
      
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/10 to-purple-900/10 z-10"></div>
      
      <div 
        ref={loginContainerRef}
        id="login-container"
        className="opacity-0 translate-y-4 transition-all duration-500 ease-out transform w-full max-w-md relative z-20 mt-32 ml-16"
      >
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-600 rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-600 rounded-full filter blur-3xl opacity-20"></div>
        
        <div className="backdrop-blur-md bg-black bg-opacity-30 p-8 rounded-xl border border-gray-700 shadow-2xl">
          <div className="flex justify-center mb-6">
            <img src="/img/LogoImpulsa.png" alt="Logo" className="w-25 h-20" />
          </div>
          
          <h2 className="text-3xl font-bold mb-2 text-center text-white">Acceso Seguro</h2>
          <p className="text-white text-sm text-center mb-8">Ingresa tus credenciales para continuar</p>
          
          {error && (
            <div className="mb-6 py-2 px-4 rounded-lg bg-red-500 bg-opacity-20 border border-red-500 border-opacity-40">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          <form id="login-form" onSubmit={handleSubmit} className="transition-all duration-500">
            <div className="mb-6 group">
              <label className="block text-white text-sm font-medium mb-2 transition-all duration-300" htmlFor="email">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white bg-opacity-10 text-white px-10 py-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="Ingresa tu correo electrónico"
                  required
                />
              </div>
            </div>
            
            <div className="mb-8 group">
              <label className="block text-white text-sm font-medium mb-2" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white bg-opacity-10 text-white px-10 py-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="Ingresa tu contraseña"
                  required
                />
                <div 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 hover:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 hover:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 relative overflow-hidden
                ${isLoading ? 'bg-gray-700 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'}`}
            >
              <div className="relative z-10 flex items-center justify-center">
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                )}
                {isLoading ? 'Procesando...' : 'Iniciar Sesión'}
              </div>
            </button>
            
            <div className="mt-6 text-center">
              <a href="#" className="text-sm text-white hover:text-blue-400 transition-colors duration-300">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </form>
        </div>
        
        <style>{`
          @keyframes shake {
            0% { transform: translateX(0); }
            20% { transform: translateX(-10px); }
            40% { transform: translateX(10px); }
            60% { transform: translateX(-10px); }
            80% { transform: translateX(10px); }
            100% { transform: translateX(0); }
          }
          .shake {
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Login;

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ArrowRight, Zap, TrendingUp, Globe, Sparkles, ArrowUpRight, ChevronRight, Activity, PieChart, LineChart } from 'lucide-react';


const Hero = () => {
  const { theme = 'dark' } = useTheme(); // Tema oscuro por defecto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hoverStat, setHoverStat] = useState(null);
  const [activeFeature, setActiveFeature] = useState(0);
  
  // Animación inicial de entrada
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Efecto de paralaje avanzado
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      
      const rect = heroRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMousePosition({ x, y });
    };
    
    const heroElement = heroRef.current;
    if (heroElement) {
      heroElement.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      if (heroElement) {
        heroElement.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  // Efecto de progreso de scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const progress = Math.min(scrollY / (windowHeight * 0.5), 1);
      setScrollProgress(progress);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Rotación automática de features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Datos de características destacadas
  const features = [
    { 
      icon: <Activity className="h-5 w-5 text-blue-400" />, 
      title: "SEO Avanzado", 
      description: "Mejora orgánica con estrategias basadas en IA" 
    },
    { 
      icon: <LineChart className="h-5 w-5 text-purple-400" />, 
      title: "Marketing Digital", 
      description: "Campañas de alto rendimiento y ROI medible" 
    },
    { 
      icon: <PieChart className="h-5 w-5 text-emerald-400" />, 
      title: "Desarrollo Tech", 
      description: "Soluciones a medida con tecnologías de vanguardia" 
    }
  ];

  // Datos de estadísticas impactantes
  const stats = [
    { icon: <TrendingUp className="h-6 w-6" />, value: "+300%", label: "Aumento de tráfico", color: "from-green-500 to-blue-500" },
    { icon: <Globe className="h-6 w-6" />, value: "94%", label: "Retención de clientes", color: "from-blue-500 to-purple-500" },
    { icon: <Zap className="h-6 w-6" />, value: "2.8x", label: "ROI promedio", color: "from-purple-500 to-pink-500" }
  ];

  // Cálculo de transformaciones para efecto de paralaje
  const getParallaxTransform = (depth) => {
    const x = (mousePosition.x - 0.5) * depth;
    const y = (mousePosition.y - 0.5) * depth;
    return `translate(${x}px, ${y}px)`;
  };

  return (
    <section 
      ref={heroRef}
      id="inicio"
      className={`relative min-h-screen overflow-hidden py-32 lg:py-0 flex items-center ${
        theme === 'dark' 
          ? 'bg-gradient-to-b from-gray-950 via-blue-950 to-gray-950' 
          : 'bg-gradient-to-b from-gray-50 via-blue-50 to-gray-50'
      }`}
      style={{ perspective: '1000px' }}
    >
      {/* Partículas animadas en el fondo */}
      <div className="particles absolute inset-0 opacity-30">
        {Array.from({ length: 20 }).map((_, index) => (
          <div 
            key={index}
            className="particle absolute rounded-full"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              background: `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, 255, ${Math.random() * 0.5 + 0.5})`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
      
      {/* Elementos decorativos de fondo con efecto de paralaje */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div 
          className="absolute top-0 right-0 bg-blue-400/30 w-96 h-96 rounded-full filter blur-3xl"
          style={{ transform: getParallaxTransform(-20) }}
        ></div>
        <div 
          className="absolute bottom-0 left-20 bg-purple-500/30 w-[32rem] h-[32rem] rounded-full filter blur-3xl"
          style={{ transform: getParallaxTransform(-30) }}
        ></div>
        <div 
          className="absolute top-1/3 left-1/4 bg-indigo-600/20 w-80 h-80 rounded-full filter blur-2xl"
          style={{ transform: getParallaxTransform(-15) }}
        ></div>
        <div 
          className="absolute bottom-1/4 right-1/4 bg-cyan-500/20 w-64 h-64 rounded-full filter blur-2xl"
          style={{ transform: getParallaxTransform(-25) }}
        ></div>
      </div>
      
      {/* Línea central dinámica */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-500/50 to-transparent opacity-70"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:min-h-screen">
          {/* Contenido de texto con animaciones avanzadas */}
          <div className={`lg:w-1/2 transition-all duration-1000 transform ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'}`}>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-300 border border-blue-500/20 backdrop-blur-md mb-8 animate-pulse-slow">
              <Sparkles size={16} className="mr-2 animate-spin-slow" />
              <span className="text-sm font-medium">Innovación Tecnológica Disruptiva</span>
            </div>
            
            <h1 className={`text-5xl md:text-6xl xl:text-7xl font-bold mb-8 ${theme === 'dark' ? 'text-white' : 'text-black'} leading-tight tracking-tight`}>
              <div className="overflow-hidden">
                <span className="block transform transition-transform duration-1000 delay-200" style={{ transform: isVisible ? 'translateY(0)' : 'translateY(100%)' }}>
                  Revoluciona tu
                </span>
              </div>
              <div className="overflow-hidden">
                <span className="block transform transition-transform duration-1000 delay-400" style={{ transform: isVisible ? 'translateY(0)' : 'translateY(100%)' }}>
                  <span className="relative">
                    <span className={`bg-clip-text text-transparent inline-block ${
                      theme === 'dark' 
                        ? 'bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500' 
                        : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600'
                    }`}>presencia digital</span>
                    <span className={`absolute -bottom-2 left-0 right-0 h-1 transform scale-x-0 transition-transform duration-1000 delay-1000 origin-left ${
                      theme === 'dark' 
                        ? 'bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500' 
                        : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600'
                    }`} style={{ transform: isVisible ? 'scaleX(1)' : 'scaleX(0)' }}></span>
                  </span>
                </span>
              </div>
            </h1>
            
            <p className={`text-xl mb-10 max-w-xl transform transition-all duration-1000 delay-700 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`} style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(20px)' }}>
              Despliega todo el potencial de tu empresa con soluciones digitales de vanguardia. Estrategias basadas en inteligencia artificial y análisis predictivo para un crecimiento exponencial.
            </p>
            
            <div className="flex flex-wrap gap-6 items-center transform transition-all duration-1000 delay-900" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(20px)' }}>           
              <a href="/success-cases" className={`group ${theme === 'dark' ? 'text-white' : 'text-blue-700'} text-lg inline-flex items-center relative overflow-hidden`}>
                <span className="relative z-10">Ver casos de éxito</span>
                <ChevronRight size={20} className="ml-1 transition-transform duration-300 transform group-hover:translate-x-1" />
                <span className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-blue-500 to-purple-500 transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100"></span>
              </a>
            </div>
            
            {/* Tarjetas de estadísticas con efecto hover */}
            <div className="mt-16 grid grid-cols-3 gap-4 transform transition-all duration-1000 delay-1000" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(30px)' }}>
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className={`relative overflow-hidden ${theme === 'dark' ? 'bg-gray-900/40' : 'bg-white/70'} backdrop-blur-md rounded-xl p-4 ${theme === 'dark' ? 'border border-white/10' : 'border border-gray-200'} group transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
                  onMouseEnter={() => setHoverStat(index)}
                  onMouseLeave={() => setHoverStat(null)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-${theme === 'dark' ? '10' : '20'} transition-opacity duration-300`}></div>
                  
                  <div className="flex items-center justify-center flex-col">
                    <div className={`rounded-full p-2 mb-2 bg-gradient-to-r ${stat.color} bg-opacity-20 transition-transform duration-500 ${hoverStat === index ? 'scale-110' : ''}`}>
                      {stat.icon}
                    </div>
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-1`}>{stat.value}</p>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-center text-sm`}>{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Parte visual con efectos avanzados */}
          <div className={`lg:w-1/2 transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}>
            <div className="relative" style={{ transform: `perspective(1000px) rotateY(${mousePosition.x * 5 - 2.5}deg) rotateX(${mousePosition.y * -5 + 2.5}deg)`, transition: 'transform 0.1s ease-out' }}>
              {/* Efecto de resplandor y borde */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-70 animate-pulse-slow"></div>
              
              {/* Contenedor principal con efecto de cristal */}
              <div className={`relative rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl group transition-all duration-500 ${
                theme === 'dark' 
                  ? 'bg-gray-900/80 border border-white/20 hover:shadow-blue-900/20' 
                  : 'bg-white/80 border border-gray-200 hover:shadow-blue-200/50'
              }`}>
                {/* Barra superior degradada */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                
                {/* Contenido visual principal */}
                <div className="p-1">
                    <img 
                      src="/img/DashboardMuestra.png" 
                      alt="Estrategias digitales innovadoras" 
                      className={`w-full h-full object-cover rounded-xl transition-all duration-500 ${
                        theme === 'dark' 
                          ? 'mix-blend-luminosity opacity-90 hover:mix-blend-normal hover:opacity-100' 
                          : 'opacity-90 hover:opacity-100'
                      }`}
                    />
                </div>
                
                {/* Elementos flotantes informativos */}
                <div 
                  className={`absolute top-4 right-4 ${theme === 'dark' ? 'bg-black/60' : 'bg-white/80'} backdrop-blur-xl rounded-lg p-3 ${theme === 'dark' ? 'border border-white/10' : 'border border-gray-200'} shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-blue-500/20`}
                  style={{ transform: `translate3d(${mousePosition.x * -15}px, ${mousePosition.y * -15}px, 20px)` }}
                >
                  <div className="flex items-center">
                    <Globe size={20} className="text-blue-400 mr-2" />
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Alcance global</span>
                  </div>
                  <div className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Presente en +5 países</div>
                </div>
                
                <div 
                  className={`absolute bottom-4 left-4 ${theme === 'dark' ? 'bg-black/60' : 'bg-white/80'} backdrop-blur-xl rounded-lg p-3 ${theme === 'dark' ? 'border border-white/10' : 'border border-gray-200'} shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-green-500/20`}
                  style={{ transform: `translate3d(${mousePosition.x * 15}px, ${mousePosition.y * 15}px, 40px)` }}
                >
                  <div className="flex items-center">
                    <TrendingUp size={20} className="text-green-400 mr-2" />
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>+320% ROI promedio</span>
                  </div>
                  <div className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>En los últimos 12 meses</div>
                </div>
                
                {/* Característica destacada animada */}
                <div 
                  className={`absolute bottom-4 right-4 max-w-xs ${theme === 'dark' ? 'bg-black/70' : 'bg-white/80'} backdrop-blur-xl rounded-lg overflow-hidden ${theme === 'dark' ? 'border border-white/10' : 'border border-gray-200'} shadow-lg`}
                  style={{ transform: `translate3d(${mousePosition.x * 10}px, ${mousePosition.y * 10}px, 30px)` }}
                >
                  <div className="relative">
                    <div className="flex items-center p-3">
                      <div className="flex-shrink-0 mr-3">
                        {features[activeFeature].icon}
                      </div>
                      <div>
                        <h3 className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{features[activeFeature].title}</h3>
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-xs`}>{features[activeFeature].description}</p>
                      </div>
                    </div>
                    
                    {/* Barra de progreso para el cambio automático */}
                    <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 animate-progress"></div>
                  </div>
                </div>
              </div>
              
              {/* Elementos decorativos flotantes al fondo */}
              <div 
                className="absolute -top-4 -left-8 w-16 h-16 bg-blue-600/20 rounded-full blur-xl opacity-70"
                style={{ transform: `translate3d(${mousePosition.x * 30}px, ${mousePosition.y * 30}px, 0px)` }}
              ></div>
              <div 
                className="absolute -bottom-10 -right-6 w-20 h-20 bg-purple-600/20 rounded-full blur-xl opacity-70"
                style={{ transform: `translate3d(${mousePosition.x * -25}px, ${mousePosition.y * -25}px, 0px)` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Flecha de scroll animada */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className={`flex flex-col items-center ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>
          <p className="text-xs mb-2 tracking-widest">SCROLL</p>
          <div className={`w-px h-8 bg-gradient-to-b ${theme === 'dark' ? 'from-white/50' : 'from-gray-500'} to-transparent animate-pulse`}></div>
        </div>
      </div>
      
      {/* Estilos para animaciones personalizadas */}
              <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-15px) translateX(10px); }
          50% { transform: translateY(-5px) translateX(-15px); }
          75% { transform: translateY(10px) translateX(5px); }
        }
        
        @keyframes shine {
          from { left: -150%; opacity: 0.5; }
          to { left: 150%; opacity: 0; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes progress {
          0% { width: 0%; }
          95% { width: 100%; }
          100% { width: 100%; }
        }
        
        .animate-progress {
          animation: progress 3s linear infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-shine {
          animation: shine 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero;
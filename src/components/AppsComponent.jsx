import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Brain, Zap, Calendar, Sparkles, ArrowUpRight, ChevronRight, Globe, TrendingUp } from 'lucide-react';

const AppsComponent = () => {
  const { theme = 'dark' } = useTheme();
  const [activeApp, setActiveApp] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getParallaxTransform = (depth) => {
    const x = (mousePosition.x - 0.5) * depth;
    const y = (mousePosition.y - 0.5) * depth;
    return `translate(${x}px, ${y}px)`;
  };

  const apps = [
    {
      id: 1,
      title: "Beopple",
      icon: <Brain className="w-6 h-6" />,
      description: "Asistente virtual empresarial potenciado por IA para empresa de servicia de transporte que trabaj directamente con cliente sin necesiade de una aplicacion compleja, esto revoluciona la atención al cliente. Respuestas instantáneas y aprendizaje continuo para una satisfacción garantizada ya que todo es gestionado desde un chat de whatsapp",
      image: "/img/BeoppleB.png",
      tech: ["React Native", "TensorFlow", "Node.js"],
      stats: [
        { label: "Conversión", value: "+145%", icon: <TrendingUp className="h-5 w-5" /> },
        { label: "Retención", value: "89%", icon: <Globe className="h-5 w-5" /> },
        { label: "Satisfacción", value: "4.9/5", icon: <Sparkles className="h-5 w-5" /> }
      ],
      gradient: "from-blue-500 via-indigo-500 to-purple-500"
    },
    {
      id: 2,
      title: "QuestionsIA",
      icon: <Zap className="w-6 h-6" />,
      description: "Asistente virtual empresarial potenciado por IA para empresa de que requieren una respuesta puntual por correos y que organizan su sesiones de reuniones a partir de estas, indicaciones o avance, todo esto con un agestión minimalista y minima, sin necesidades de una aplicación compleja, esto revoluciona la atención al cliente. Respuestas instantáneas y aprendizaje continuo para una satisfacción garantizada ya que todo es gestionado.",
      image: "/img/QuestionsB.png",
      tech: ["OpenAI", "Vue.js", "Python"],
      stats: [
        { label: "Tiempo Respuesta", value: "-85%", icon: <Zap className="h-5 w-5" /> },
        { label: "Precisión", value: "97%", icon: <Brain className="h-5 w-5" /> },
        { label: "Automatización", value: "76%", icon: <TrendingUp className="h-5 w-5" /> }
      ],
      gradient: "from-purple-500 via-indigo-500 to-blue-500"
    },
    {
      id: 3,
      title: "Spotly",
      icon: <Calendar className="w-6 h-6" />,
      description: "Sistema inteligente de gestión de reservas de mesas, habitaciones, cachas deportivas, espacios de trabajo, optimiza recursos y maximiza la eficiencia operativa. Automatización avanzada para una gestión sin esfuerzo.",
      image: "/img/Spotly.png",
      tech: ["Flutter", "Firebase", "AWS"],
      stats: [
        { label: "Productividad", value: "+180%", icon: <TrendingUp className="h-5 w-5" /> },
        { label: "Ahorro", value: "65%", icon: <Globe className="h-5 w-5" /> },
        { label: "Eficiencia", value: "+125%", icon: <Sparkles className="h-5 w-5" /> }
      ],
      gradient: "from-indigo-500 via-purple-500 to-blue-500"
    }
  ];

  return (
    <section 
      ref={containerRef}
      className={`relative min-h-screen overflow-hidden py-32 lg:py-20 ${
        theme === 'dark' 
          ? 'bg-gradient-to-b from-gray-950 via-blue-950 to-gray-950' 
          : 'bg-gradient-to-b from-gray-50 via-blue-50 to-gray-50'
      }`}
      style={{ perspective: '1000px' }}
    >
      {/* Partículas animadas */}
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

      {/* Elementos decorativos de fondo */}
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Encabezado */}
        <div className={`text-center mb-20 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`}>
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 backdrop-blur-md mb-8 animate-pulse-slow">
            <Sparkles className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} animate-spin-slow`} />
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
              Soluciones Digitales de Vanguardia
            </span>
          </div>
          
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <span className="relative">
              <span className={`bg-clip-text text-transparent inline-block ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500' 
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600'
              }`}>Aplicaciones Inteligentes para tu Negocio</span>
            </span>
          </h2>
          
          <p className={`max-w-2xl mx-auto text-lg ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Transformamos ideas en soluciones digitales revolucionarias que impulsan el crecimiento de tu empresa
          </p>
        </div>

        {/* Apps */}
        <div className="space-y-32">
          {apps.map((app, index) => (
            <div 
              key={app.id}
              className={`flex flex-col lg:flex-row items-center gap-12 ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {/* Contenido */}
              <div className="lg:w-1/2">
                <div className={`flex items-center gap-3 mb-6 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${app.gradient} bg-opacity-20`}>
                    {app.icon}
                  </div>
                  <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
                    {app.title}
                  </h3>
                </div>

                <p className={`text-lg mb-8 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {app.description}
                </p>

                {/* Estadísticas */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {app.stats.map((stat, idx) => (
                    <div 
                      key={idx}
                      className={`p-4 rounded-xl ${
                        theme === 'dark' 
                          ? 'bg-gray-900/40 backdrop-blur-md border border-white/10' 
                          : 'bg-white/70 backdrop-blur-md border border-gray-200'
                      } group transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
                    >
                      <div className={`rounded-full p-2 mb-2 bg-gradient-to-r ${app.gradient} bg-opacity-20`}>
                        {stat.icon}
                      </div>
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-1`}>
                        {stat.value}
                      </p>
                      <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {app.tech.map((tech, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 rounded-full text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-900/40 backdrop-blur-md border border-white/10 text-gray-300'
                          : 'bg-white/70 backdrop-blur-md border border-gray-200 text-gray-700'
                      }`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Imagen */}
              <div className="lg:w-1/2">
                <div className="relative" style={{ transform: `perspective(1000px) rotateY(${mousePosition.x * 5 - 2.5}deg) rotateX(${mousePosition.y * -5 + 2.5}deg)`, transition: 'transform 0.1s ease-out' }}>
                  {/* Efecto de brillo */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-70 animate-pulse-slow"></div>
                  
                  {/* Contenedor de la imagen */}
                  <div className={`relative rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl ${
                    theme === 'dark' 
                      ? 'bg-gray-900/80 border border-white/20' 
                      : 'bg-white/80 border border-gray-200'
                  }`}>
                    {/* Barra superior degradada */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                    
                    <div className="p-1">
                      <img 
                        src={app.image}
                        alt={app.title}
                        className={`${app.id === 3 ? 'w-2/5' : 'w-3/5'} h-auto mx-auto object-cover rounded-xl transition-all duration-500 ${
                          theme === 'dark' 
                            ? 'mix-blend-luminosity opacity-90 hover:mix-blend-normal hover:opacity-100' 
                            : 'opacity-90 hover:opacity-100'
                        }`}
                        style={{ transform: app.id === 3 ? 'scale(0.6)' : 'scale(0.7)' }}
                      />
                      
                      {/* Overlay con información flotante */}
                      <div className={`absolute top-4 right-4 ${
                        theme === 'dark' ? 'bg-black/60' : 'bg-white/80'
                      } backdrop-blur-xl rounded-lg p-3 border border-white/10 shadow-lg transform transition-transform duration-300 hover:scale-105`}
                        style={{ transform: `translate3d(${mousePosition.x * -15}px, ${mousePosition.y * -15}px, 20px)` }}
                      >
                        <div className="flex items-center">
                          <Globe className="text-blue-400 w-5 h-5 mr-2" />
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                            Tecnología Global
                          </span>
                        </div>
                        <div className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Presente en +15 países
                        </div>
                      </div>

                      <div className={`absolute bottom-4 left-4 ${
                        theme === 'dark' ? 'bg-black/60' : 'bg-white/80'
                      } backdrop-blur-xl rounded-lg p-3 border border-white/10 shadow-lg transform transition-transform duration-300 hover:scale-105`}
                        style={{ transform: `translate3d(${mousePosition.x * 15}px, ${mousePosition.y * 15}px, 40px)` }}
                      >
                        <div className="flex items-center">
                          <TrendingUp className="text-green-400 w-5 h-5 mr-2" />
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                            +240% ROI
                          </span>
                        </div>
                        <div className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Último trimestre
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Elementos decorativos flotantes */}
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
          ))}
        </div>
      </div>

      {/* Estilos para animaciones */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-15px) translateX(10px); }
          50% { transform: translateY(-5px) translateX(-15px); }
          75% { transform: translateY(10px) translateX(5px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default AppsComponent;

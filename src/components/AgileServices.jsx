import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Sparkles, GitBranch, GitMerge, GitPullRequest, 
  Zap, ArrowRight, Infinity, RefreshCw, Target, 
  Users, Rocket, Shield, ArrowUpRight
} from 'lucide-react';

const AgileServices = () => {
  const { theme = 'dark' } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
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

  const features = [
    {
      icon: <GitBranch className="w-6 h-6" />,
      title: "Metodología Agile",
      description: "Implementación flexible y adaptativa de Scrum para maximizar la eficiencia y el valor del negocio.",
      gradient: "from-purple-500 via-indigo-500 to-blue-500",
      metrics: ["98% Satisfacción", "40% Más Rápido", "ROI Mejorado"]
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: "Sprints Optimizados",
      description: "Ciclos de desarrollo cortos y efectivos que garantizan entregas continuas y mejora iterativa.",
      gradient: "from-blue-500 via-cyan-500 to-purple-500",
      metrics: ["2-4 Semanas", "Entregas Rápidas", "Mejora Continua"]
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Objetivos Estratégicos",
      description: "Alineación perfecta entre desarrollo ágil y metas empresariales para máximo impacto.",
      gradient: "from-indigo-500 via-purple-500 to-blue-500",
      metrics: ["100% Alineación", "KPIs Definidos", "Valor Medible"]
    }
  ];

  const processSteps = [
    {
      icon: <Users />,
      title: "Equipo Scrum Dedicado",
      description: "Profesionales especializados liderados por un Scrum Master certificado"
    },
    {
      icon: <GitPullRequest />,
      title: "Sprints Iterativos",
      description: "Ciclos de desarrollo cortos con entregas incrementales de valor"
    },
    {
      icon: <Rocket />,
      title: "Entregas Continuas",
      description: "Implementación ágil y despliegue continuo de funcionalidades"
    },
    {
      icon: <Infinity />,
      title: "Mejora Constante",
      description: "Retroalimentación y optimización continua del proceso"
    }
  ];

  return (
    <section 
      ref={containerRef}
      className={`relative min-h-screen overflow-hidden py-32 ${
        theme === 'dark' 
          ? 'bg-gradient-to-b from-gray-950 via-blue-950 to-gray-950' 
          : 'bg-gradient-to-b from-gray-50 via-blue-50 to-gray-50'
      }`}
      style={{ perspective: '1000px' }}
    >
      {/* Partículas de fondo */}
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Encabezado */}
        <div className={`text-center mb-20 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`}>
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 backdrop-blur-md mb-8 animate-pulse-slow">
            <GitMerge className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
              Metodologías Ágiles
            </span>
          </div>
          
          <h2 className={`text-4xl md:text-5xl font-bold mb-6`}>
            <span className="relative">
              <span className={`bg-clip-text text-transparent bg-gradient-to-r ${
                theme === 'dark' 
                  ? 'from-blue-400 via-indigo-400 to-purple-500' 
                  : 'from-blue-600 via-indigo-600 to-purple-600'
              }`}>
                Transforma tu negocio con <br />
                servicios agile y scrum
              </span>
            </span>
          </h2>
          
          <p className={`max-w-3xl mx-auto text-lg ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Ofrecemos soluciones tecnológicas innovadoras, ágiles y flexibles que aportan valor inmediato y sostenido a tu negocio.
          </p>
        </div>

        {/* Características principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`relative group ${
                theme === 'dark' ? 'bg-black/30' : 'bg-white/70'
              } backdrop-blur-xl rounded-2xl p-6 border border-white/10 transition-all duration-500 hover:scale-105`}
              onMouseEnter={() => setActiveFeature(index)}
              onMouseLeave={() => setActiveFeature(null)}
            >
              {/* Efecto de brillo */}
              <div className={`absolute -inset-px rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>

                <h3 className={`text-xl font-bold mb-3 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>

                <p className={`mb-4 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {feature.metrics.map((metric, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 rounded-full text-sm ${
                        theme === 'dark'
                          ? 'bg-black/30 border border-white/10 text-gray-300'
                          : 'bg-white/50 border border-gray-200 text-gray-700'
                      }`}
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Proceso Agile */}
        <div className={`relative mb-20 ${
          theme === 'dark' ? 'bg-black/30' : 'bg-white/70'
        } backdrop-blur-xl rounded-2xl p-8 border border-white/10`}>
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 opacity-10"></div>
          
          <div className="relative z-10">
            <h3 className={`text-2xl font-bold mb-8 text-center ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Nuestro proceso agiles con metodo scrum
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {processSteps.map((step, index) => (
                <div 
                  key={index}
                  className="flex flex-col items-center text-center group"
                >
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
                    {React.cloneElement(step.icon, { 
                      className: 'w-8 h-8 text-white'
                    })}
                  </div>
                  <h4 className={`text-lg font-bold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {step.title}
                  </h4>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {step.description}
                  </p>
                  {index < processSteps.length - 1 && (
                    <ArrowRight className={`hidden md:block absolute right-[-1rem] top-1/2 transform -translate-y-1/2 ${
                      theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Estilos para animaciones */}
              <style>{`
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

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default AgileServices;
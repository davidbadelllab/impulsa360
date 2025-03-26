import React, { useState, useEffect, useRef } from 'react';
import { Target, BarChart, Users, Zap, Rocket, Award, TrendingUp, Shield, Code } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Benefits = () => {
  const { theme = 'dark' } = useTheme();
  const [activeTab, setActiveTab] = useState('estrategias');
  const [isVisible, setIsVisible] = useState(false);
  const [clickedTabs, setClickedTabs] = useState([]);
  const sectionRef = useRef(null);

  // Datos mejorados y ampliados para cada categoría
  const benefitCategories = {
    estrategias: [
      {
        title: "Estrategias disruptivas",
        description: "Metodologías avanzadas que rompen con lo convencional y generan resultados exponenciales",
        icon: Rocket,
        stats: "+187% ROI"
      },
      {
        title: "Personalización avanzada",
        description: "Análisis predictivo con IA para crear soluciones adaptadas específicamente a tu nicho de mercado",
        icon: Target,
        stats: "98% efectividad"
      },
      {
        title: "Innovación constante",
        description: "Actualización trimestral de estrategias basadas en análisis de tendencias globales",
        icon: Zap,
        stats: "+25% ventaja"
      }
    ],
    resultados: [
      {
        title: "Analytics en tiempo real",
        description: "Dashboard personalizado con métricas clave y visualización avanzada de datos para decisiones inmediatas",
        icon: BarChart,
        stats: "24/7 monitoreo"
      },
      {
        title: "Crecimiento acelerado",
        description: "Estrategias de growth hacking que maximizan resultados con inversión optimizada",
        icon: TrendingUp,
        stats: "3x más rápido"
      },
      {
        title: "Garantía de performance",
        description: "Trabajamos con objetivos claros y métricas definidas. Sin resultados, no hay pago",
        icon: Award,
        stats: "100% compromiso"
      }
    ],
    equipo: [
      {
        title: "Especialistas certificados",
        description: "Profesionales de élite con certificaciones internacionales y experiencia comprobada",
        icon: Users,
        stats: "+15 años exp."
      },
      {
        title: "Seguridad avanzada",
        description: "Protocolos de ciberseguridad de nivel empresarial en todos nuestros desarrollos",
        icon: Shield,
        stats: "ISO 27001"
      },
      {
        title: "Desarrollo full-stack",
        description: "Arquitectura moderna, microservicios y tecnologías de vanguardia para soluciones escalables",
        icon: Code,
        stats: "99.9% uptime"
      }
    ]
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Crear una referencia a cada botón no pulsado para manejar su animación
  const buttonRefs = useRef({});
  
  // Efecto para gestionar la animación única de pulso
  useEffect(() => {
    Object.keys(benefitCategories).forEach((category) => {
      if (!clickedTabs.includes(category) && buttonRefs.current[category]) {
        const button = buttonRefs.current[category];
        
        // Crear y añadir las reglas CSS para la animación
        const styleSheet = document.styleSheets[0];
        const keyframes = `
          @keyframes pulse-glow {
            0% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
              opacity: 1;
            }
            70% {
              transform: scale(1.05);
              box-shadow: 0 0 0 10px rgba(99, 102, 241, 0);
              opacity: 0.8;
            }
            100% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
              opacity: 1;
            }
          }
        `;
        
        try {
          styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
        } catch (e) {
          // Si ya existe, evitamos duplicarlo
        }

        // Aplicar animación
        button.style.animation = 'pulse-glow 2s';
        
        // Eliminar la animación después de ejecutarse una vez
        const animationEndHandler = () => {
          button.style.animation = 'none';
          button.removeEventListener('animationend', animationEndHandler);
        };
        
        button.addEventListener('animationend', animationEndHandler);
      }
    });
  }, [isVisible, clickedTabs]);

  return (
    <section 
      ref={sectionRef}
      className={`py-24 relative overflow-hidden ${
        theme === 'dark'
          ? 'bg-gradient-to-b from-gray-900 to-blue-900'
          : 'bg-gradient-to-b from-gray-50 to-blue-50'
      }`}
    >
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full filter blur-3xl ${
          theme === 'dark' ? 'bg-blue-500' : 'bg-blue-300'
        }`}></div>
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full filter blur-3xl ${
          theme === 'dark' ? 'bg-purple-500' : 'bg-purple-300'
        }`}></div>
      </div>
      
      {/* Patrón de puntos */}
      <div className={`absolute inset-0 ${
        theme === 'dark' ? 'bg-grid-white/[0.03]' : 'bg-grid-black/[0.03]'
      }`} style={{
        backgroundImage: `radial-gradient(${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} 1px, transparent 1px)`,
        backgroundSize: '30px 30px'
      }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        {/* Cabecera con animación */}
        <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <div className="flex justify-center mb-3">
            <div className={`px-4 py-1 rounded-full ${
              theme === 'dark'
                ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'
                : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-700'
            } text-sm font-medium inline-flex items-center border`}>
              <Award size={14} className="mr-1" />
              Ventajas competitivas
            </div>
          </div>
          
          <h2 className={`text-4xl md:text-5xl font-bold text-center mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Domina tu mercado con<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              ventajas estratégicas inigualables
            </span>
          </h2>
          
          <p className={`text-xl text-center mb-12 max-w-2xl mx-auto ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            No ofrecemos servicios, creamos <strong>ventajas competitivas decisivas</strong> que transforman tu posición en el mercado y aceleran tu crecimiento.
          </p>
        </div>

        {/* Tabs para navegar entre categorías */}
        <div className={`flex justify-center mb-12 transition-all duration-1000 delay-200 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <div className={`inline-flex p-1 rounded-xl backdrop-blur-sm ${
            theme === 'dark'
              ? 'bg-gray-800/50 border-gray-700'
              : 'bg-gray-200/50 border-gray-300'
          } border`}>
            {Object.keys(benefitCategories).map((category) => (
              <button
                key={category}
                ref={(el) => buttonRefs.current[category] = el}
                onClick={() => {
                  setActiveTab(category);
                  if (!clickedTabs.includes(category)) {
                    setClickedTabs([...clickedTabs, category]);
                  }
                }}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all relative overflow-hidden ${
                  activeTab === category 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                    : theme === 'dark'
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {category === 'estrategias' ? 'Estrategias' : 
                 category === 'resultados' ? 'Resultados' : 'Equipo'}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de beneficios con animación */}
        <div className={`transition-all duration-1000 delay-400 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefitCategories[activeTab].map((benefit, index) => (
              <div 
                key={index}
                className={`backdrop-blur-sm rounded-xl overflow-hidden transition-all hover:translate-y-[-8px] duration-300 group hover:shadow-xl ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-gray-800/70 to-gray-900/90 border-gray-700/50 hover:border-blue-500/30 hover:shadow-blue-500/10'
                    : 'bg-gradient-to-br from-white/70 to-gray-50/90 border-gray-200/50 hover:border-blue-500/30 hover:shadow-blue-500/10'
                } border`}
              >
                <div className="p-8 relative">
                  {/* Ícono con efecto */}
                  <div className={`mb-6 inline-flex items-center justify-center w-16 h-16 rounded-xl transition-all ${
                    theme === 'dark'
                      ? 'bg-blue-900/30 border-blue-700/30 text-blue-400 group-hover:text-white group-hover:bg-blue-600'
                      : 'bg-blue-100 border-blue-200 text-blue-600 group-hover:text-white group-hover:bg-blue-600'
                  } border`}>
                    <benefit.icon size={32} />
                  </div>
                  
                  {/* Etiqueta de estadística */}
                  <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-sm font-medium ${
                    theme === 'dark'
                      ? 'bg-indigo-900/40 text-indigo-300 border-indigo-700/30'
                      : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                  } border`}>
                    {benefit.stats}
                  </div>
                  
                  <h3 className={`text-2xl font-bold mb-3 group-hover:text-blue-600 transition-colors ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {benefit.title}
                  </h3>
                  
                  <p className={`mb-4 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {benefit.description}
                  </p>
                  
                  <a href="#" className={`inline-flex items-center font-medium ${
                    theme === 'dark'
                      ? 'text-blue-400 group-hover:text-blue-300'
                      : 'text-blue-600 group-hover:text-blue-700'
                  }`}>
                    Descubrir más
                    <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
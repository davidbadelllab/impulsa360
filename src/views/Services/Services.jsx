import React, { useState, useEffect, useRef } from 'react';
import { 
  Server, 
  Shield, 
  Database, 
  Cloud, 
  Settings, 
  Layers, 
  ChevronRight, 
  Zap, 
  Cpu, 
  TrendingUp 
} from 'lucide-react';

const Systems = () => {
  const [activeSystem, setActiveSystem] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  
  useEffect(() => {
    setIsVisible(true);
    
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

  const systems = [
    {
      icon: Database,
      accentColor: "from-blue-500 to-indigo-600",
      glowColor: "blue",
      title: "ERP Empresarial Ultra",
      description: "Plataforma integral de nueva generación que unifica y potencia todos tus procesos de negocio con IA avanzada.",
      features: [
        "Analítica predictiva con IA",
        "Gestión financiera automatizada",
        "Inventario inteligente en tiempo real",
        "Dashboards personalizados"
      ]
    },
    {
      icon: Cloud,
      accentColor: "from-purple-500 to-pink-600",
      glowColor: "purple",
      title: "Cloud Hyperscale",
      description: "Infraestructura cloud de próxima generación con capacidades de auto-optimización y escalabilidad extrema.",
      features: [
        "Escalabilidad cuántica",
        "Redundancia multi-región",
        "Integración edge computing",
        "Latencia ultra-baja garantizada"
      ]
    },
    {
      icon: Shield,
      accentColor: "from-red-500 to-orange-600",
      glowColor: "red",
      title: "Ciberseguridad Quantum",
      description: "Sistema de protección avanzada con IA predictiva que neutraliza amenazas antes de que ocurran.",
      features: [
        "Firewall neuronal adaptativo",
        "Detección holística con ML",
        "Encriptación cuántica",
        "Zero-trust architecture"
      ]
    },
    {
      icon: Cpu,
      accentColor: "from-green-500 to-teal-600",
      glowColor: "green",
      title: "Hiperautomatización",
      description: "Revoluciona tu operación con sistemas inteligentes que optimizan cada aspecto de tu cadena de valor.",
      features: [
        "Orquestación multi-workflow",
        "Automatización cognitiva",
        "Gemelos digitales avanzados",
        "Optimización predictiva"
      ]
    }
  ];

  const renderGlowEffect = (color) => {
    return (
      <div className="absolute inset-0 -z-10">
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-100 blur-xl transition-all duration-700`}></div>
      </div>
    );
  };

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-gradient-to-b from-black via-gray-900 to-blue-950 py-32">
      {/* Elementos decorativos de fondo avanzados */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-25">
        <div className="absolute top-0 right-0 bg-blue-600 w-96 h-96 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-20 bg-violet-600 w-96 h-96 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 left-1/4 bg-cyan-600 w-64 h-64 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>
      
      {/* Se eliminaron las líneas blancas del fondo */}

      {/* Elementos cibernéticos */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-blue-500 w-1 h-20 animate-meteor"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          ></div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          <div className="flex justify-center mb-4">
            <div className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-blue-300 font-medium inline-flex items-center backdrop-blur-md border border-blue-500/20">
              <Zap size={18} className="mr-2 animate-pulse" />
              SISTEMAS EMPRESARIALES NEXT-GEN
            </div>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-extrabold text-center mb-6 text-white tracking-tight">
            Infraestructura <span className="italic">ultra</span>
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 pb-2">
              transformadora
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 text-center mb-16 max-w-3xl mx-auto leading-relaxed">
            Ecosistemas tecnológicos de élite diseñados para organizaciones que no aceptan límites. Redefine lo posible con nuestra infraestructura de próxima generación.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {systems.map((system, index) => (
              <div 
                key={index}
                className={`relative rounded-2xl p-8 border border-gray-800 group transition-all duration-500 
                  backdrop-blur-lg bg-gradient-to-br from-gray-900/90 to-gray-950/90
                  hover:from-gray-900/95 hover:to-gray-950/95
                  hover:border-${system.glowColor}-500/50 hover:shadow-${system.glowColor}-900/20 hover:shadow-lg
                  ${activeSystem === index ? 'scale-[1.02] border-gray-700' : 'scale-100'}
                `}
                onMouseEnter={() => setActiveSystem(index)}
                onMouseLeave={() => setActiveSystem(null)}
              >
                {renderGlowEffect(system.accentColor)}
                
                <div className={`mb-8 inline-flex items-center justify-center w-20 h-20 rounded-2xl 
                  bg-gradient-to-br ${system.accentColor} text-white shadow-lg p-4
                  transform group-hover:scale-110 transition-all duration-300 ease-out
                `}>
                  <system.icon size={36} className="drop-shadow-md" />
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 flex items-center">
                  {system.title}
                  <ChevronRight size={20} className="ml-2 text-gray-500 transform group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100" />
                </h3>
                
                <p className="text-gray-300 mb-8 leading-relaxed">{system.description}</p>

                <div className="grid grid-cols-1 gap-4">
                  {system.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-3 text-gray-200 group/feature">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-${system.glowColor}-900/30 group-hover/feature:bg-${system.glowColor}-900/50 transition-colors duration-300`}>
                        <TrendingUp size={14} className={`text-${system.glowColor}-400`} />
                      </div>
                      <span className="font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agregar estilos para animación de meteoros */}
      <style jsx>{`
        @keyframes meteor {
          0% {
            transform: translateY(-200px) translateX(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(calc(100vh + 200px)) translateX(100px) rotate(20deg);
            opacity: 0;
          }
        }
        .animate-meteor {
          animation: meteor linear forwards;
        }
      `}</style>
    </section>
  );
};

export default Systems;
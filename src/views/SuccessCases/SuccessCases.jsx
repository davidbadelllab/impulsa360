import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  Globe, 
  ArrowUpRight, 
  Star, 
  BarChart, 
  Target, 
  ExternalLink,
  Clock,
  LineChart,
  Gauge,
  ArrowUp,
  Zap
} from 'lucide-react';

const SuccessCases = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCase, setActiveCase] = useState(0);
  const [animateCharts, setAnimateCharts] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Iniciar animación de gráficos después de que el componente es visible
    const timer = setTimeout(() => {
      setAnimateCharts(true);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const cases = [
    {
      company: "TechCorp Solutions",
      industry: "Software & Technology",
      description: "Transformación digital completa que resultó en un aumento del 200% en leads cualificados y mejora de KPIs críticos para el negocio.",
      results: [
        { label: "Incremento en ventas", value: "+150%", icon: TrendingUp },
        { label: "Nuevos usuarios", value: "10k+", icon: Users },
        { label: "ROI", value: "3.5x", icon: BarChart }
      ],
      metrics: {
        lineData: [15, 25, 40, 30, 45, 75, 90, 100, 125, 150],
        conversionRate: 78,
        timeReduction: 65,
        growthPercentage: 150
      },
      color: "#4F46E5", // Indigo
      tags: ["SEO", "Marketing Digital", "Desarrollo Web"]
    },
    {
      company: "Global Retail",
      industry: "E-commerce",
      description: "Implementación de estrategia omnicanal que revolucionó la experiencia de compra y optimizó la conversión en todas las plataformas.",
      results: [
        { label: "Conversión", value: "+85%", icon: Target },
        { label: "Retención", value: "+60%", icon: Users },
        { label: "Alcance", value: "Global", icon: Globe }
      ],
      metrics: {
        lineData: [20, 35, 30, 45, 40, 55, 60, 75, 70, 85],
        conversionRate: 85,
        timeReduction: 50,
        growthPercentage: 85
      },
      color: "#8B5CF6", // Violet
      tags: ["E-commerce", "UX/UI", "Analytics"]
    },
    {
      company: "FinTech Pro",
      industry: "Servicios Financieros",
      description: "Sistema de seguridad avanzado y automatización de procesos críticos que redujo costos operativos y mejoró la protección de datos.",
      results: [
        { label: "Eficiencia", value: "+120%", icon: TrendingUp },
        { label: "Seguridad", value: "99.9%", icon: Star },
        { label: "Ahorro", value: "45%", icon: BarChart }
      ],
      metrics: {
        lineData: [25, 40, 50, 45, 60, 75, 90, 95, 110, 120],
        conversionRate: 99.9,
        timeReduction: 75,
        growthPercentage: 120
      },
      color: "#2563EB", // Blue
      tags: ["Ciberseguridad", "Automatización", "FinTech"]
    }
  ];

  // Componente de gráfico lineal SVG
  const LineGraph = ({ data, color, animate }) => {
    const height = 120;
    const width = 260;
    const max = Math.max(...data);
    
    // Calcular puntos para el path
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - (value / max) * height;
      return `${x},${y}`;
    }).join(' ');

    // Calcular puntos para el área rellena
    const areaPoints = `0,${height} ` + points + ` ${width},${height}`;

    return (
      <svg width="100%" height="150" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Líneas de cuadrícula */}
        {[0, 1, 2, 3].map((i) => (
          <line 
            key={i}
            x1="0" 
            y1={height - (i / 3) * height} 
            x2={width} 
            y2={height - (i / 3) * height} 
            stroke="rgba(255,255,255,0.1)" 
            strokeDasharray="4 4"
          />
        ))}
        
        {/* Área bajo la curva */}
        <path 
          d={`M ${areaPoints} Z`} 
          fill={`url(#gradient-${color.replace('#', '')})`}
          opacity={animate ? "0.2" : "0"}
          style={{ transition: "opacity 1s ease-out" }}
        />
        
        {/* Línea de la gráfica */}
        <path 
          d={`M ${points}`} 
          fill="none" 
          stroke={color} 
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={animate ? "0" : width * 3}
          strokeDashoffset={animate ? "0" : width * 3}
          style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
        />
        
        {/* Puntos de datos */}
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * width;
          const y = height - (value / max) * height;
          
          return (
            <circle 
              key={index} 
              cx={x} 
              cy={y} 
              r="4"
              fill="#0F172A"
              stroke={color}
              strokeWidth="2"
              opacity={animate ? "1" : "0"}
              style={{ 
                transition: `opacity 0.3s ease-out ${0.1 * index}s`,
                filter: "drop-shadow(0 0 3px rgba(0,0,0,0.3))"
              }}
            />
          );
        })}
        
        {/* Definición del gradiente */}
        <defs>
          <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.5" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  // Componente de medidor circular SVG
  const CircularGauge = ({ percentage, color, label, icon: Icon, animate }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const dashoffset = circumference - (percentage / 100) * circumference;
    
    return (
      <div className="relative flex flex-col items-center justify-center p-2">
        <svg width="100" height="100" viewBox="0 0 120 120" className="transform -rotate-90">
          {/* Círculo de fondo */}
          <circle 
            cx="60" 
            cy="60" 
            r={radius} 
            fill="none" 
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="8"
          />
          
          {/* Círculo de progreso */}
          <circle 
            cx="60" 
            cy="60" 
            r={radius} 
            fill="none" 
            stroke={color} 
            strokeWidth="8" 
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={animate ? dashoffset : circumference}
            style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
          />
        </svg>
        
        <div className="absolute flex flex-col items-center justify-center">
          <Icon size={18} className={`mb-1 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`} />
          <div className={`text-xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>{percentage}%</div>
          <div className={`text-xs mt-1 text-center ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>{label}</div>
        </div>
      </div>
    );
  };

  const { theme } = useTheme();

  return (
    <section className={`relative overflow-hidden py-20 ${
      theme === 'dark' 
        ? 'bg-gradient-to-r from-gray-900 to-blue-900' 
        : 'bg-gradient-to-r from-gray-50 to-blue-50'
    }`}>
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
        <div className="absolute top-0 right-0 bg-blue-400 w-64 h-64 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-20 bg-purple-500 w-96 h-96 rounded-full filter blur-3xl"></div>
      </div>
      
      {/* Patrón eliminado para un diseño más limpio */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <div className="flex justify-center mb-3">
            <div className="px-4 py-1.5 rounded-full bg-blue-600/20 text-blue-300 text-sm font-medium inline-flex items-center">
              <Trophy size={16} className="mr-2" />
              Casos de Éxito
            </div>
          </div>
          
          <h2 className={`text-4xl md:text-5xl font-bold text-center mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Resultados que hablan
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600">
              por sí mismos
            </span>
          </h2>
          
          <p className={`text-xl text-center mb-16 max-w-3xl mx-auto ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Descubre cómo hemos ayudado a empresas líderes a alcanzar sus objetivos digitales y superar sus expectativas.
          </p>

          <div className="grid grid-cols-1 gap-12">
            {cases.map((case_, index) => (
              <div 
                key={index}
                className={`backdrop-blur-xl rounded-2xl p-8 transition-all duration-500 group ${activeCase === index ? 'scale-[1.01]' : ''} ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-blue-500/30' 
                    : 'bg-white/80 border border-gray-200/80 hover:border-blue-400/50 shadow-sm'
                }`}
                onMouseEnter={() => setActiveCase(index)}
              >
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                    <h3 className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{case_.company}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      theme === 'dark' 
                        ? 'bg-blue-900/30 text-blue-300' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                        {case_.industry}
                      </span>
                    </div>

                    <p className={`mb-6 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>{case_.description}</p>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                      {case_.results.map((result, idx) => (
                        <div key={idx} className={`backdrop-blur-lg rounded-lg p-4 text-center transition-all duration-300 ${
                          theme === 'dark' 
                            ? 'bg-gray-800/50 border border-gray-700/30 hover:border-gray-600/50' 
                            : 'bg-white border border-gray-200 hover:border-gray-300'
                        }`}>
                          <result.icon size={24} className={`mx-auto mb-2 ${
                            theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                          }`} />
                          <div className={`text-2xl font-bold mb-1 ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>{result.value}</div>
                          <div className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>{result.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {case_.tags.map((tag, idx) => (
                        <span key={idx} className={`px-3 py-1 rounded-full text-sm ${
                          theme === 'dark' 
                            ? 'bg-indigo-900/30 text-indigo-300' 
                            : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <button className={`mt-6 inline-flex items-center transition-colors ${
                      theme === 'dark' 
                        ? 'text-blue-400 hover:text-blue-300' 
                        : 'text-blue-600 hover:text-blue-500'
                    }`}>
                      Ver caso completo
                      <ExternalLink size={14} className="ml-1.5" />
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl blur-md opacity-30 group-hover:opacity-70 transition-all duration-500"></div>
                    <div className="relative p-1 h-full flex flex-col">
                      <div className={`backdrop-blur-sm rounded-xl p-5 h-full ${
                        theme === 'dark' 
                          ? 'bg-gray-900/80 border border-gray-800' 
                          : 'bg-white/90 border border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-800">
                          <div className="flex items-center space-x-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                          </div>
                          <div className={`text-xs ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                          }`}>dashboard-metrics.io</div>
                        </div>
                        
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-300 flex items-center">
                              <LineChart size={14} className="mr-1.5" />
                              Crecimiento desde implementación
                            </h4>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/30 text-green-400 flex items-center">
                              <ArrowUp size={10} className="mr-1" />
                              {case_.metrics.growthPercentage}%
                            </span>
                          </div>
                          <LineGraph 
                            data={case_.metrics.lineData} 
                            color={case_.color} 
                            animate={animateCharts} 
                          />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <CircularGauge 
                            percentage={case_.metrics.conversionRate} 
                            color={case_.color} 
                            label="Conversión" 
                            icon={Target}
                            animate={animateCharts}
                          />
                          <CircularGauge 
                            percentage={case_.metrics.timeReduction} 
                            color={case_.color} 
                            label="Reducción tiempo" 
                            icon={Clock}
                            animate={animateCharts}
                          />
                          <CircularGauge 
                            percentage={case_.metrics.growthPercentage > 100 ? 100 : case_.metrics.growthPercentage} 
                            color={case_.color} 
                            label="Meta lograda" 
                            icon={Zap}
                            animate={animateCharts}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium group hover:from-blue-700 hover:to-indigo-700 transition-all">
              Ver más casos de éxito
              <ArrowUpRight size={20} className="ml-2 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessCases;

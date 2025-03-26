import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Sparkles, Star, Quote, LineChart, Users, Globe, ArrowUpRight, 
  TrendingUp, CheckCircle, Award, Medal, Fingerprint
} from 'lucide-react';

const Testimonials = () => {
  const { theme = 'dark' } = useTheme();
  const [activeCase, setActiveCase] = useState(null);
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

  const testimonials = [
    {
      id: 1,
      client: "Psicólogo Clínico Maity Rincón Reinberg",
      role: "Fundadora & CEO",
      avatar: "/img/MaitiRincon.jpg",
      image: "/img/MaityPsicólogo.svg",
      quote: "La transformación digital de mi consulta ha sido extraordinaria. El equipo no solo entendió mis necesidades específicas, sino que superó todas mis expectativas.",
      metrics: [
        { label: "Pacientes Mensuales", value: "+250%", icon: <Users />, trend: "up" },
        { label: "Retención Clientes", value: "97%", icon: <CheckCircle />, trend: "stable" },
        { label: "ROI Marketing", value: "3.8x", icon: <TrendingUp />, trend: "up" }
      ],
      gradient: "from-purple-500 via-indigo-500 to-blue-500",
      achievements: [
        { text: "Optimización SEO", icon: <Globe /> },
        { text: "Campañas en Redes", icon: <LineChart /> },
        { text: "Marketing Digital", icon: <TrendingUp /> }
      ],
      rating: 5
    },
    {
      id: 2,
      client: "Canchas Atlantic Sur",
      role: "Director General",
      avatar: "/img/AtlanticSur.svg",
      image: "/img/AtlanticSur.svg",
      quote: "Gracias a su experiencia en marketing digital, nos hemos convertido en el referente deportivo de la zona. Los resultados hablan por sí solos.",
      metrics: [
        { label: "Reservas Online", value: "+320%", icon: <TrendingUp />, trend: "up" },
        { label: "Ranking Local", value: "#1", icon: <Award />, trend: "up" },
        { label: "Retención", value: "92%", icon: <Users />, trend: "stable" }
      ],
      gradient: "from-blue-500 via-cyan-500 to-purple-500",
      achievements: [
        { text: "SEO Local", icon: <Globe /> },
        { text: "Sistema de Reservas", icon: <Fingerprint /> },
        { text: "App Móvil", icon: <Medal /> }
      ],
      rating: 5
    },
    {
      id: 3,
      client: "Taxi Caribe LLC",
      role: "Director de Operaciones",
      avatar: "/img/TaxiCaribe.svg",
      image: "/img/TaxiCaribe.svg",
      quote: "La plataforma desarrollada revolucionó nuestra operación. La automatización y el sistema de reservas han sido un game changer para nuestro negocio.",
      metrics: [
        { label: "Eficiencia", value: "+210%", icon: <TrendingUp />, trend: "up" },
        { label: "Satisfacción", value: "98%", icon: <Star />, trend: "up" },
        { label: "Tiempo Respuesta", value: "-65%", icon: <LineChart />, trend: "down" }
      ],
      gradient: "from-indigo-500 via-purple-500 to-blue-500",
      achievements: [
        { text: "App Personalizada", icon: <Fingerprint /> },
        { text: "Sistema GPS", icon: <Globe /> },
        { text: "IA Predictiva", icon: <TrendingUp /> }
      ],
      rating: 5
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
      {/* Partículas y efectos de fondo */}
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
            <Quote className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
              Historias de Éxito
            </span>
          </div>
          
          <h2 className={`text-4xl md:text-5xl font-bold mb-6`}>
            <span className={`bg-clip-text text-transparent bg-gradient-to-r ${
              theme === 'dark' 
                ? 'from-blue-400 via-indigo-400 to-purple-500' 
                : 'from-blue-600 via-indigo-600 to-purple-600'
            }`}>
              Lo Que Dicen Nuestros Clientes
            </span>
          </h2>
          
          <p className={`max-w-2xl mx-auto text-lg ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Descubre cómo hemos ayudado a empresas reales a alcanzar el siguiente nivel en su transformación digital
          </p>
        </div>

        {/* Testimonios */}
        <div className="space-y-32">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id}
              className={`flex flex-col lg:flex-row items-center gap-12 ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`}
              style={{ transitionDelay: `${index * 200}ms` }}
              onMouseEnter={() => setActiveCase(testimonial.id)}
              onMouseLeave={() => setActiveCase(null)}
            >
              {/* Contenido */}
              <div className="lg:w-1/2">
                {/* Cabecera con información del cliente */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative">
                    <div className={`absolute -inset-1 rounded-full bg-gradient-to-r ${testimonial.gradient} blur`}></div>
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.client}
                      className="relative w-16 h-16 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {testimonial.client}
                    </h3>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>

                {/* Quote */}
                <div className="relative mb-8">
                  <Quote className={`absolute -left-4 -top-4 w-8 h-8 ${
                    theme === 'dark' ? 'text-purple-500/30' : 'text-purple-600/30'
                  }`} />
                  <p className={`text-xl italic ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  } leading-relaxed pl-6`}>
                    "{testimonial.quote}"
                  </p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-8">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current text-yellow-500" />
                  ))}
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {testimonial.metrics.map((metric, idx) => (
                    <div 
                      key={idx}
                      className={`p-4 rounded-xl ${
                        theme === 'dark' 
                          ? 'bg-black/30 border border-white/10' 
                          : 'bg-white/50 border border-gray-200'
                      } group/metric transition-all duration-300 hover:scale-105`}
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r ${testimonial.gradient} mb-3 mx-auto`}>
                        {React.cloneElement(metric.icon, { 
                          className: 'w-5 h-5 text-white'
                        })}
                      </div>
                      <p className={`text-2xl font-bold text-center mb-1 bg-gradient-to-r ${testimonial.gradient} bg-clip-text text-transparent`}>
                        {metric.value}
                      </p>
                      <p className={`text-sm text-center ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Logros */}
                <div className="flex flex-wrap gap-3 mb-8">
                  {testimonial.achievements.map((achievement, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                        theme === 'dark'
                          ? 'bg-black/30 border border-white/10' 
                          : 'bg-white/50 border border-gray-200'
                      }`}
                    >
                      {React.cloneElement(achievement.icon, { 
                        className: `w-4 h-4 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`
                      })}
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        {achievement.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {/* <a 
                  href={`/case-study/${testimonial.id}`}
                  className="inline-flex items-center group"
                >
                  <span className={`relative px-6 py-3 rounded-xl bg-gradient-to-r ${testimonial.gradient} text-white font-medium overflow-hidden`}>
                    <span className="relative z-10">Ver Caso Completo</span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  </span>
                  <ArrowUpRight className="w-6 h-6 ml-2 text-purple-400 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </a> */}
              </div>

              {/* Imagen */}
              <div className="lg:w-1/2">
                <div className="relative" style={{ transform: `perspective(1000px) rotateY(${mousePosition.x * 5 - 2.5}deg) rotateX(${mousePosition.y * -5 + 2.5}deg)`, transition: 'transform 0.1s ease-out' }}>
                  {/* Efecto de brillo */}
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${testimonial.gradient} rounded-2xl blur-xl opacity-70 animate-pulse-slow`}></div>
                  
                  {/* Contenedor de la imagen */}
                  <div className={`relative rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl ${
                    theme === 'dark' 
                      ? 'bg-gray-900/80 border border-white/20' 
                      : 'bg-white/80 border border-gray-200'
                  }`}>
                    {/* Barra superior degradada */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${testimonial.gradient}`}></div>
                    
                    <div className="p-1">
                      <img 
                        src={testimonial.image}
                        alt={testimonial.client}
                        className={`w-1/2 h-auto mx-auto object-cover rounded-xl transition-all duration-500 ${
                          theme === 'dark' 
                            ? 'mix-blend-luminosity opacity-90 hover:mix-blend-normal hover:opacity-100' 
                            : 'opacity-90 hover:opacity-100'
                        }`}
                        style={{ transform: 'scale(0.8)' }}
                      />
                    </div>

                    {/* Overlay con efecto de brillo */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Elementos decorativos flotantes */}
                  <div 
                    className={`absolute -top-4 -left-8 w-16 h-16 bg-gradient-to-r ${testimonial.gradient} rounded-full blur-xl opacity-30`}
                    style={{ transform: getParallaxTransform(30) }}
                  ></div>
                  <div 
                    className={`absolute -bottom-10 -right-6 w-20 h-20 bg-gradient-to-r ${testimonial.gradient} rounded-full blur-xl opacity-30`}
                    style={{ transform: getParallaxTransform(-25) }}
                  ></div>
                </div>
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

export default Testimonials;

import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Code, Palette, TrendingUp, CheckCircle, ArrowRight, ChevronRight,
  BrainCircuit, Layers, Globe, Search, LineChart, BarChart,
  MessageSquare, Mail, Smartphone, Zap, Megaphone, Database,
  PenTool, Video, Film, PlayCircle, Figma, Repeat
} from 'lucide-react';

const ServicePlans = () => {
  const { theme = 'dark' } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('marketing');
  const [activeCard, setActiveCard] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const categories = [
    {
      id: 'marketing',
      name: 'Marketing Digital',
      icon: TrendingUp,
      description: 'Estrategias avanzadas para potenciar tu presencia digital y alcanzar nuevos clientes.'
    },
    {
      id: 'development',
      name: 'Desarrollo',
      icon: Code,
      description: 'Soluciones tecnológicas a medida con los lenguajes y frameworks más avanzados del mercado.'
    },
    {
      id: 'design',
      name: 'Diseño',
      icon: Palette,
      description: 'Diseño visual de alto impacto para hacer destacar tu marca en cualquier plataforma.'
    }
  ];

  const services = {
    marketing: [
      {
        title: 'SEO & Posicionamiento',
        description: 'Optimización técnica avanzada para motores de búsqueda y estrategias de posicionamiento orgánico.',
        features: [
          'Análisis de keywords técnico',
          'Optimización on-page profesional',
          'Estrategia de backlinks de alta autoridad',
          'Optimización de Core Web Vitals',
          'Seguimiento de rankings y métricas'
        ],
        icon: Search,
        gradient: 'from-orange-600 to-red-600'
      },
      {
        title: 'Social Media Pro',
        description: 'Gestión estratégica de redes sociales con contenido de alto impacto y análisis de datos.',
        features: [
          'Estrategia de contenido multiplataforma',
          'Diseño de publicaciones premium',
          'Calendario editorial estratégico',
          'Gestión de comunidad experta',
          'Análisis de competencia y benchmark'
        ],
        icon: Globe,
        gradient: 'from-blue-600 to-indigo-600'
      },
      {
        title: 'Analítica & BI',
        description: 'Transformación de datos en insights accionables para optimizar tu estrategia digital.',
        features: [
          'Implementación de Google Analytics 4',
          'Dashboards personalizados en tiempo real',
          'Análisis de embudo de conversión',
          'Informes ejecutivos mensuales',
          'Recomendaciones basadas en datos'
        ],
        icon: LineChart,
        gradient: 'from-green-600 to-teal-600'
      },
      {
        title: 'Email Marketing',
        description: 'Estrategias de email marketing automatizadas para nutrir leads y aumentar conversiones.',
        features: [
          'Diseño de templates personalizados',
          'Segmentación avanzada de audiencias',
          'Automatizaciones con triggers',
          'A/B testing de campañas',
          'Análisis de métricas clave'
        ],
        icon: Mail,
        gradient: 'from-yellow-600 to-amber-600'
      },
      {
        title: 'SEM & Paid Media',
        description: 'Campañas publicitarias de alto rendimiento en Google Ads, Meta y plataformas especializadas.',
        features: [
          'Estrategia de pujas avanzada',
          'Segmentación precisa de audiencias',
          'Creación de anuncios de alto impacto',
          'Optimización continua basada en datos',
          'Remarketing estratégico'
        ],
        icon: Megaphone,
        gradient: 'from-purple-600 to-violet-600'
      },
      {
        title: 'Marketing de Contenidos',
        description: 'Creación de contenido estratégico que atrae, convierte y fideliza a tu audiencia ideal.',
        features: [
          'Estrategia de keywords por buyer persona',
          'Contenido SEO optimizado',
          'Blogs, whitepapers y e-books',
          'Estrategia de contenido multimedia',
          'Plan editorial completo'
        ],
        icon: MessageSquare,
        gradient: 'from-cyan-600 to-blue-600'
      }
    ],
    development: [
      {
        title: 'Desarrollo Backend',
        description: 'Arquitectura robusta y escalable con los lenguajes y frameworks más potentes del mercado.',
        features: [
          'Laravel (PHP) - Aplicaciones empresariales',
          'Node.js - Arquitecturas de microservicios',
          'Python - Procesamiento de datos y ML',
          'Go - Alto rendimiento y concurrencia',
          'APIs RESTful y GraphQL'
        ],
        icon: Database,
        gradient: 'from-blue-600 to-indigo-600'
      },
      {
        title: 'Desarrollo Frontend',
        description: 'Interfaces modernas, responsivas y de alto rendimiento con las tecnologías más avanzadas.',
        features: [
          'React.js - SPAs de alto rendimiento',
          'Next.js - Renderizado híbrido y SSR',
          'Remix.js - Aplicaciones web modernas',
          'Vue.js - Interfaces reactivas',
          'UI/UX responsive cross-browser'
        ],
        icon: Layers,
        gradient: 'from-cyan-600 to-blue-600'
      },
      {
        title: 'Desarrollo Móvil',
        description: 'Aplicaciones nativas y multiplataforma con rendimiento excepcional y experiencia fluida.',
        features: [
          'React Native - Desarrollo multiplataforma',
          'Swift - Aplicaciones nativas iOS',
          'Kotlin - Aplicaciones nativas Android',
          'Flutter - UI consistente en plataformas',
          'Integración con servicios nativos'
        ],
        icon: Smartphone,
        gradient: 'from-purple-600 to-indigo-600'
      },
      {
        title: 'Arquitectura Cloud',
        description: 'Infraestructura escalable, segura y de alto rendimiento en proveedores cloud líderes.',
        features: [
          'AWS - Arquitectura serverless',
          'Azure - Soluciones empresariales',
          'Google Cloud - Big data y ML',
          'Docker y Kubernetes - Contenedores',
          'CI/CD para despliegue continuo'
        ],
        icon: BrainCircuit,
        gradient: 'from-gray-600 to-blue-900'
      },
      {
        title: 'E-commerce',
        description: 'Plataformas de comercio electrónico personalizadas, seguras y con alto índice de conversión.',
        features: [
          'WooCommerce - Personalización avanzada',
          'Shopify - Desarrollo de temas y apps',
          'Magento - Soluciones enterprise',
          'Pasarelas de pago múltiples',
          'Optimización de UX para conversión'
        ],
        icon: BarChart,
        gradient: 'from-green-600 to-emerald-600'
      },
      {
        title: 'Desarrollo Full-Stack',
        description: 'Soluciones end-to-end con arquitectura escalable y tecnologías de vanguardia.',
        features: [
          'MERN Stack (MongoDB, Express, React, Node)',
          'LAMP Stack (Linux, Apache, MySQL, PHP)',
          'JAMstack para sitios de alto rendimiento',
          'Arquitectura de microservicios',
          'Integración con servicios de terceros'
        ],
        icon: Zap,
        gradient: 'from-orange-600 to-red-600'
      }
    ],
    design: [
      {
        title: 'Diseño UI/UX',
        description: 'Experiencias digitales excepcionales que combinan estética y funcionalidad con un enfoque centrado en el usuario.',
        features: [
          'Diseño de interfaces intuitivas',
          'Prototipos interactivos avanzados',
          'Sistemas de diseño escalables',
          'Research y testing con usuarios',
          'Auditorías de usabilidad'
        ],
        icon: Figma,
        gradient: 'from-purple-600 to-pink-600'
      },
      {
        title: 'Diseño Gráfico Premium',
        description: 'Creación de activos visuales de alta calidad que comunican la esencia de tu marca y cautivan a tu audiencia.',
        features: [
          'Identidad visual corporativa',
          'Branding estratégico completo',
          'Materiales impresos de alta gama',
          'Infografías y presentaciones',
          'Packaging y merchandising'
        ],
        icon: PenTool,
        gradient: 'from-blue-600 to-indigo-600'
      },
      {
        title: 'Motion Graphics',
        description: 'Animaciones visuales dinámicas que dan vida a tu marca y comunican conceptos complejos de forma atractiva.',
        features: [
          'Intros y outros animados',
          'Animación de logos e identidad',
          'Infografías animadas',
          'Transiciones personalizadas',
          'Efectos visuales (VFX)'
        ],
        icon: Repeat,
        gradient: 'from-amber-500 to-orange-600'
      },
      {
        title: 'Producción Audiovisual',
        description: 'Contenido audiovisual que transmite tu mensaje con calidad profesional y enfoque estratégico.',
        features: [
          'Videos corporativos premium',
          'Spots publicitarios de alto impacto',
          'Contenido para redes sociales',
          'Entrevistas y testimoniales',
          'Eventos y transmisiones en vivo'
        ],
        icon: Video,
        gradient: 'from-red-600 to-pink-600'
      },
      {
        title: 'Ilustración & Vectorización',
        description: 'Ilustraciones únicas y vectorizaciones precisas que añaden personalidad y distinción a tu comunicación visual.',
        features: [
          'Ilustraciones personalizadas',
          'Iconografía a medida',
          'Vectorización de alta precisión',
          'Ilustraciones técnicas y diagramas',
          'Characters design'
        ],
        icon: PenTool,
        gradient: 'from-green-600 to-teal-600'
      },
      {
        title: 'Diseño Web Creativo',
        description: 'Sitios web visualmente impactantes con diseño responsive que destacan tu marca en el entorno digital.',
        features: [
          'Diseño web premium',
          'Microinteracciones avanzadas',
          'Animaciones scroll-based',
          'Efectos parallax y 3D',
          'Layouts innovadores'
        ],
        icon: Globe,
        gradient: 'from-cyan-600 to-blue-600'
      }
    ]
  };

  const openWhatsApp = () => {
    const phoneNumber = "+584246312483";
    const message = "Hola, estoy interesado en conocer más sobre sus servicios.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section className={`relative overflow-hidden py-24 ${
      theme === 'dark'
        ? 'bg-gradient-to-b from-gray-950 via-gray-900 to-blue-950'
        : 'bg-gradient-to-b from-gray-50 via-gray-100 to-blue-50'
    }`}>
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
        <div className={`absolute top-0 right-0 ${
          theme === 'dark' ? 'bg-blue-600' : 'bg-blue-400'
        } w-96 h-96 rounded-full filter blur-3xl animate-pulse`} 
        style={{ animationDuration: '8s' }}></div>
        <div className={`absolute bottom-0 left-20 ${
          theme === 'dark' ? 'bg-purple-600' : 'bg-purple-400'
        } w-96 h-96 rounded-full filter blur-3xl animate-pulse`} 
        style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <div className="flex justify-center mb-4">
            <div className={`px-5 py-2 rounded-full ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-blue-300 border-blue-500/20'
                : 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200'
            } font-medium inline-flex items-center backdrop-blur-md border`}>
              <Layers size={18} className="mr-2" />
              NUESTRAS ÁREAS DE ESPECIALIZACIÓN
            </div>
          </div>
          
          <h2 className={`text-4xl md:text-5xl font-extrabold text-center mb-4 tracking-tight ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Servicios de
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 pb-2">
              clase mundial
            </span>
          </h2>
          
          <p className={`text-xl text-center mb-16 max-w-3xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Ofrecemos soluciones integrales en marketing, desarrollo y diseño para llevar tu negocio al siguiente nivel.
            </p>

            {/* Tabs de categorías */}
            <div className="flex flex-wrap justify-center mb-12 space-x-2 md:space-x-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`px-6 py-3 rounded-xl flex items-center transition-all duration-300 mb-2 ${
                    activeTab === category.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : theme === 'dark'
                        ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveTab(category.id)}
                >
                  <category.icon size={20} className={activeTab === category.id ? 'text-white mr-2' : `mr-2 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  {category.name}
                </button>
              ))}
            </div>

            {/* Descripción de la categoría */}
            <div className="text-center mb-12 max-w-3xl mx-auto">
              <h3 className={`text-2xl font-bold mb-3 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {categories.find(c => c.id === activeTab).name}
              </h3>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                {categories.find(c => c.id === activeTab).description}
              </p>
            </div>

            {/* Grid de servicios */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services[activeTab].map((service, index) => (
                <div
                  key={index}
                  className={`backdrop-blur-lg rounded-2xl overflow-hidden transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl ${
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-gray-900/90 to-gray-950/90 border-gray-800 hover:shadow-blue-900/10'
                      : 'bg-gradient-to-br from-white/90 to-gray-50/90 border-gray-200 hover:shadow-blue-200/30'
                  } border ${
                    activeCard === index 
                      ? 'ring-2 ring-blue-500 ring-opacity-50' 
                      : ''
                  }`}
                  onMouseEnter={() => setActiveCard(index)}
                  onMouseLeave={() => setActiveCard(null)}
                >
                  <div className="p-8">
                    {/* Encabezado */}
                    <div className="flex items-start space-x-4 mb-6">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${service.gradient} text-white`}>
                        <service.icon size={24} />
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold mb-1 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>{service.title}</h3>
                      </div>
                    </div>
                    
                    {/* Descripción */}
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                      {service.description}
                    </p>
                    
                    {/* Lista de características */}
                    <div className="space-y-3 mb-8">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start">
                          <CheckCircle size={18} className={`mr-2 flex-shrink-0 mt-0.5 ${
                            theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                          }`} />
                          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                            {feature}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Botón */}
                    <button 
                      onClick={openWhatsApp}
                      className={`w-full py-3 px-4 rounded-xl flex items-center justify-center transition-all group ${
                        theme === 'dark'
                          ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-blue-600/30 text-blue-300 hover:from-blue-600/30 hover:to-indigo-600/30'
                          : 'bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-200 text-blue-700 hover:from-blue-200 hover:to-indigo-200'
                      } border`}
                    >
                      Contactar por WhatsApp
                      <ArrowRight size={18} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA bottom */}
            <div className="mt-16 text-center">
              <div className={`backdrop-blur-lg rounded-2xl p-8 max-w-3xl mx-auto ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-gray-900/80 to-gray-950/80 border-gray-800'
                  : 'bg-gradient-to-br from-white/80 to-gray-50/80 border-gray-200'
              } border`}>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>¿Necesitas una solución personalizada?</h3>
                <p className={`mb-6 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Nuestro equipo de expertos está listo para crear una estrategia a medida que se adapte perfectamente a tus necesidades específicas.
                </p>
                <button 
                  onClick={openWhatsApp}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center mx-auto"
                >
                  Contactanos
                  <ChevronRight size={20} className="ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
};

export default ServicePlans;
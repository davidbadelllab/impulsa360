import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  BookOpen, 
  Clock, 
  ArrowUpRight, 
  Tag, 
  User, 
  Calendar, 
  MessageCircle, 
  ThumbsUp, 
  Share2, 
  X, 
  Mail, 
  Building, 
  ChevronRight, 
  Shield,
  Bell,
  TrendingUp,
  Zap,
  Star
} from 'lucide-react';

const Blog = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [activeArticle, setActiveArticle] = useState(null);

  useEffect(() => {
    setIsVisible(true);
    
    // Mostrar el popup después de 2 segundos
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const articles = [
    {
      title: "10 Tendencias de Marketing Digital para 2024",
      excerpt: "Descubre las estrategias y tecnologías emergentes que están redefiniendo el marketing digital y cómo implementarlas para obtener ventaja competitiva.",
      image: "/img/tendencias2024.jpg",
      category: "Marketing Digital",
      author: "Luis Chavez",
      authorPosition: "Head of Digital Marketing",
      authorImage: "/img/luis chavez.jpg",
      Invite: "David Badell",
      InviteImage: "/img/profile.jpeg",
      date: "Mar 15, 2025",
      readTime: "8 min",
      tags: ["Marketing", "Tendencias", "Digital"],
      likes: 243,
      comments: 57,
      shares: 89,
      trending: true
    },
    {
      title: "Ciberseguridad: Protegiendo tu Negocio en la Era Digital",
      excerpt: "Estrategias avanzadas de protección contra ciberataques y cómo implementar protocolos de seguridad empresarial de nivel enterprise.",
      image: "/img/ProtegeDigital.jpg",
      category: "Marketing Digital",
      author: "Luis Chavez",
      authorPosition: "Head of Digital Marketing",
      authorImage: "/img/luis chavez.jpg",
      Invite: "David Badell",
      InviteImage: "/img/profile.jpeg",
      date: "Mar 12, 2025",
      readTime: "10 min",
      tags: ["Seguridad", "Empresas", "Digital"],
      likes: 189,
      comments: 42,
      shares: 76,
      featured: true
    },
    {
      title: "Inteligencia Artificial en el E-commerce",
      excerpt: "Análisis detallado de cómo la IA está revolucionando cada aspecto del e-commerce, desde la personalización hasta la logística predictiva.",
      image: "/img/Ai-ecommerce.jpg",
      category: "Tecnología",
      author: "Luis Chavez",
      authorPosition: "AI Implementation Specialist",
      authorImage: "/img/luis chavez.jpg",
      Invite: "David Badell",
      InviteImage: "/img/profile.jpeg",
      date: "Mar 10, 2025",
      readTime: "6 min",
      tags: ["IA", "E-commerce", "Innovación"],
      likes: 315,
      comments: 93,
      shares: 124,
      trending: true
    },
    {
      title: "SEO Avanzado: Más Allá de las Keywords",
      excerpt: "Técnicas de vanguardia en SEO que aprovechan algoritmos de machine learning y señales de comportamiento del usuario para dominar los rankings.",
      image: "/img/TecnicasSEO.jpg",
      category: "SEO",
      author: "Pedro Sánchez",
      authorPosition: "SEO Strategist",
      authorImage: "/img/luis chavez.jpg",
      date: "Mar 8, 2025",
      readTime: "12 min",
      tags: ["SEO", "Marketing", "Estrategia"],
      likes: 178,
      comments: 38,
      shares: 65,
      featured: true
    }
  ];

  const closePopup = () => {
    setShowPopup(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica para manejar el registro
    setShowPopup(false);
    // Aquí podrías añadir lógica para mostrar un mensaje de éxito
  };

  const RegistrationPopup = () => {
    if (!showPopup) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-all duration-300">
        <div className="relative bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 p-8 max-w-md w-full shadow-2xl transition-all transform animate-fadeIn">
          <button 
            onClick={closePopup}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
              <Bell size={24} className="text-white" />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-center text-white mb-2">
            ¡Únete a nuestra comunidad!
          </h3>
          
          <p className="text-gray-300 text-center mb-6">
            Para interactuar con la comunidad y acceder a contenido exclusivo, necesitas registrarte.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="relative mb-6">
              <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg opacity-70 blur transition-all duration-300 ${emailFocused ? 'opacity-100' : 'opacity-0'}`}></div>
              <div className="relative bg-gray-800/80 border border-gray-700 rounded-lg flex items-center overflow-hidden">
                <span className="pl-4 text-gray-400">
                  <Mail size={18} />
                </span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  placeholder="Ingresa tu correo corporativo" 
                  className="w-full px-3 py-3 bg-transparent text-white focus:outline-none placeholder-gray-500"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6 text-sm text-gray-400">
              <div className="flex items-start mb-2">
                <div className="flex-shrink-0 mt-0.5">
                  <Shield size={12} className="text-green-400" />
                </div>
                <p className="ml-2">Tus datos están seguros y no compartiremos tu información.</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <Building size={12} className="text-blue-400" />
                </div>
                <p className="ml-2">Las cuentas de empresa ya han sido creadas, solo necesitas acceder con tu correo corporativo.</p>
              </div>
            </div>
            
            <button 
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Registrarme ahora
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <button className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
              Ya tengo una cuenta
            </button>
          </div>
        </div>
      </div>
    );
  };

  const { theme } = useTheme();

  return (
    <section className={`relative overflow-hidden py-24 ${
      theme === 'dark' 
        ? 'bg-gradient-to-b from-gray-950 via-gray-900 to-blue-950' 
        : 'bg-gradient-to-b from-gray-50 via-gray-100 to-blue-100'
    }`}>
      {/* Elementos decorativos de fondo */}
      <div className={`absolute top-0 left-0 w-full h-full overflow-hidden ${
        theme === 'dark' ? 'opacity-20' : 'opacity-10'
      }`}>
        <div className="absolute top-0 right-0 bg-blue-600 w-96 h-96 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-0 left-20 bg-purple-600 w-96 h-96 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <div className="flex justify-center mb-4">
            <div className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-blue-300 font-medium inline-flex items-center backdrop-blur-md border border-blue-500/20">
              <BookOpen size={18} className="mr-2" />
              COMUNIDAD & INSIGHTS
            </div>
          </div>
          
          <h2 className={`text-4xl md:text-5xl font-extrabold text-center mb-4 tracking-tight ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Conocimiento estratégico
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 pb-2">
              para profesionales digitales
            </span>
          </h2>
          
          <p className={`text-xl text-center mb-16 max-w-3xl mx-auto ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Únete a la conversación y descubre insights exclusivos sobre tecnología, marketing y estrategia empresarial.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {articles.map((article, index) => (
              <div 
                key={index}
                className={`bg-gradient-to-br ${
                  theme === 'dark' 
                    ? 'from-gray-900/90 to-gray-950/90 border-gray-800 hover:border-blue-500/40' 
                    : 'from-gray-50/90 to-gray-100/90 border-gray-200 hover:border-blue-500/40'
                } backdrop-blur-lg rounded-2xl overflow-hidden transition-all duration-300 group transform hover:scale-[1.01] ${
                  activeArticle === index ? 'ring-2 ring-blue-500/50 ring-offset-2 ring-offset-gray-950' : ''
                }`}
                onMouseEnter={() => setActiveArticle(index)}
                onMouseLeave={() => setActiveArticle(null)}
              >
                <div className="relative">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent opacity-70"></div>
                  
                  {/* Indicadores de trending/featured */}
                  {article.trending && (
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm font-medium flex items-center">
                      <TrendingUp size={14} className="mr-1" />
                      Trending
                    </div>
                  )}
                  
                  {article.featured && !article.trending && (
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium flex items-center">
                      <Star size={14} className="mr-1" />
                      Destacado
                    </div>
                  )}
                  
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-blue-900/80 text-blue-300 text-sm backdrop-blur-sm border border-blue-700/30">
                      {article.category}
                    </span>
                  </div>
                  
                  {/* Autor e invitado destacados al estilo Facebook */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-blue-500 overflow-hidden">
                        <img 
                          src={article.authorImage} 
                          alt={article.author}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-white font-semibold">{article.author}</h4>
                        <p className="text-gray-300 text-sm">{article.authorPosition}</p>
                      </div>
                    </div>
                    
                    {article.Invite && (
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-purple-500 overflow-hidden">
                          <img 
                            src={article.InviteImage} 
                            alt={article.Invite}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-2">
                          <p className="text-gray-300 text-sm">Invitado</p>
                          <h4 className="text-white font-semibold text-sm">{article.Invite}</h4>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-400 mb-3 space-x-4">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {article.date}
                    </div>
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {article.readTime}
                    </div>
                  </div>
                  
                  <h3 className={`text-2xl font-bold mb-3 group-hover:text-blue-400 transition-colors line-clamp-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {article.title}
                  </h3>
                  
                  <p className={`mb-6 line-clamp-3 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {article.excerpt}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {article.tags.map((tag, idx) => (
                      <span key={idx} className={`px-3 py-1 rounded-full text-sm hover:bg-gray-700 transition-colors cursor-pointer ${
                        theme === 'dark' 
                          ? 'bg-gray-800/80 text-gray-300 border border-gray-700/50' 
                          : 'bg-gray-200 text-gray-700 border border-gray-300/50'
                      }`}>
                        <Tag size={12} className="inline mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Interacciones estilo Facebook */}
                  <div className="border-t border-gray-800 pt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <button className={`flex items-center transition-colors ${
                        theme === 'dark' 
                          ? 'text-gray-400 hover:text-blue-400' 
                          : 'text-gray-500 hover:text-blue-500'
                      }`}>
                        <ThumbsUp size={16} className="mr-1.5" />
                        <span>{article.likes}</span>
                      </button>
                      
                      <button className={`flex items-center transition-colors ${
                        theme === 'dark' 
                          ? 'text-gray-400 hover:text-indigo-400' 
                          : 'text-gray-500 hover:text-indigo-500'
                      }`}>
                        <MessageCircle size={16} className="mr-1.5" />
                        <span>{article.comments}</span>
                      </button>
                      
                      <button className={`flex items-center transition-colors ${
                        theme === 'dark' 
                          ? 'text-gray-400 hover:text-purple-400' 
                          : 'text-gray-500 hover:text-purple-500'
                      }`}>
                        <Share2 size={16} className="mr-1.5" />
                        <span>{article.shares}</span>
                      </button>
                    </div>
                    
                    <button className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors font-medium">
                      Leer más
                      <ChevronRight size={16} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <button className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-lg group hover:shadow-lg hover:shadow-blue-700/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
              Explorar toda la comunidad
              <ArrowUpRight size={22} className="ml-2 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Popup de registro */}
      <RegistrationPopup />
      
      {/* Estilos para la animación */}
              <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default Blog;

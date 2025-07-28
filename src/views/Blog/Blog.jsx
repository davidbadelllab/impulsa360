import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { 
  BookOpen, 
  Clock, 
  ArrowUpRight, 
  Tag, 
  User, 
  Calendar, 
  ChevronRight, 
  X, 
  Mail, 
  Building, 
  Shield,
  Bell,
  TrendingUp,
  Zap,
  Star,
  Loader2,
  AlertCircle
} from 'lucide-react';

const Blog = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [activeArticle, setActiveArticle] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API base URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    setIsVisible(true);
    
    // Mostrar el popup después de 2 segundos
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Fetch articles from API
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/blog/articles`);
        
        if (!response.ok) {
          throw new Error('Error al cargar los artículos');
        }
        
        const data = await response.json();
        
        // Transform API data to match the expected format
        const transformedArticles = data
          .filter(article => article.status === 'published') // Solo artículos publicados
          .map(article => {
            // Calculate read time based on content length
            const wordCount = article.content ? article.content.split(' ').length : 0;
            const readTime = Math.max(1, Math.ceil(wordCount / 200)); // 200 words per minute
            
            // Extract tags from seo_keywords or use empty array
            const tags = Array.isArray(article.seo_keywords) 
              ? article.seo_keywords.slice(0, 3) // Limit to 3 tags
              : (typeof article.seo_keywords === 'string' 
                  ? article.seo_keywords.split(',').map(tag => tag.trim()).slice(0, 3)
                  : []);
            
            return {
              id: article.id,
              title: article.title,
              excerpt: article.excerpt || 'Contenido exclusivo disponible para la comunidad.',
              image: article.featured_image_url || '/img/default-blog.jpg',
              category: article.category_name || 'General',
              author: article.author_name || 'Equipo Impulsa360',
              guest_author: article.guest_author_name || null,
              date: new Date(article.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }),
              readTime: `${readTime} min`,
              tags: tags,
              trending: article.is_trending || false,
              featured: article.is_featured || false,
              slug: article.slug
            };
          });
        
        setArticles(transformedArticles);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching articles:', err);
        
        // Fallback to empty array if API fails
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [API_BASE_URL]);

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

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className={`h-12 w-12 animate-spin mb-4 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <p className={`text-lg ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>Cargando contenido exclusivo...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className={`p-6 rounded-2xl border ${
                theme === 'dark' 
                  ? 'bg-red-950/50 border-red-800/50' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center mb-4">
                  <AlertCircle className={`h-8 w-8 mr-3 ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-600'
                  }`} />
                  <h3 className={`text-xl font-semibold ${
                    theme === 'dark' ? 'text-red-300' : 'text-red-800'
                  }`}>Error al cargar el contenido</h3>
                </div>
                <p className={`mb-4 ${
                  theme === 'dark' ? 'text-red-200' : 'text-red-700'
                }`}>{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && articles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className={`p-8 rounded-2xl border text-center ${
                theme === 'dark' 
                  ? 'bg-gray-900/50 border-gray-800' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <BookOpen className={`h-16 w-16 mx-auto mb-4 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <h3 className={`text-2xl font-semibold mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-800'
                }`}>Próximamente contenido exclusivo</h3>
                <p className={`mb-6 max-w-md ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Estamos preparando contenido de alta calidad para nuestra comunidad. ¡Regístrate para ser el primero en acceder!</p>
                <button 
                  onClick={() => setShowPopup(true)}
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02]"
                >
                  <Bell size={18} className="mr-2" />
                  Notificarme cuando esté listo
                </button>
              </div>
            </div>
          )}

          {/* Articles Grid */}
          {!loading && !error && articles.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {articles.map((article, index) => (
                <div 
                  key={article.id || index}
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
                      onError={(e) => {
                        e.target.src = '/img/default-blog.jpg';
                      }}
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
                    
                    {/* Author info */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center">
                        <div className="flex items-center space-x-1">
                          <User size={14} className="text-gray-300" />
                          <span className="text-white font-medium text-sm">{article.author}</span>
                          {article.guest_author && (
                            <>
                              <span className="text-gray-400 text-sm">+</span>
                              <span className="text-gray-300 text-sm">{article.guest_author}</span>
                            </>
                          )}
                        </div>
                      </div>
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

                    {article.tags.length > 0 && (
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
                    )}
                    
                    {/* Read more link */}
                    <div className="border-t border-gray-800 pt-4 flex items-center justify-end">
                      <Link 
                        to={`/blog/${article.id}`}
                        className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors font-medium"
                      >
                        Leer más
                        <ChevronRight size={16} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

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

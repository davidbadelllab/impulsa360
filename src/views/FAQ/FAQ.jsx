import React, { useState, useEffect } from 'react';
import { PlusCircle, MinusCircle, ArrowRight, Mail, CreditCard, Shield, Zap, Globe, Rocket } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const FAQ = () => {
  const { theme } = useTheme();
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const faqs = [
    {
      question: '¿Cómo puedo empezar a trabajar con Impulsa360?',
      answer: 'Solicita una consulta gratuita desde nuestro formulario o contáctanos directamente por nuestros canales de atención.',
      icon: <Rocket className="w-6 h-6" />,
      category: 'inicio'
    },
    {
      question: '¿Cuánto tiempo tarda en verse resultados con sus estrategias?',
      answer: 'Normalmente, nuestros clientes comienzan a ver resultados claros entre 2 y 3 meses después de iniciar la implementación.',
      icon: <Zap className="w-6 h-6" />,
      category: 'resultados'
    },
    {
      question: '¿Pueden garantizar el primer lugar en Google?',
      answer: 'Aunque no se puede garantizar una posición específica, utilizamos estrategias probadas para posicionarte en los primeros resultados.',
      icon: <Globe className="w-6 h-6" />,
      category: 'seo'
    },
    {
      question: '¿Puedo personalizar los servicios según mis necesidades?',
      answer: 'Sí, nuestros planes son completamente personalizados, adaptados a los objetivos y presupuesto de tu negocio.',
      icon: <CreditCard className="w-6 h-6" />,
      category: 'servicios'
    },
    {
      question: '¿Qué diferencia a Impulsa360 de otras agencias digitales?',
      answer: 'Nos destacamos por ofrecer estrategias medibles, atención personalizada y compromiso total con los objetivos de cada cliente.',
      icon: <Shield className="w-6 h-6" />,
      category: 'empresa'
    },
    {
      question: '¿Qué tipos de aplicaciones desarrollan?',
      answer: 'Creamos aplicaciones móviles, web y sistemas personalizados orientados a optimizar procesos y potenciar la presencia digital de tu negocio.',
      icon: <ArrowRight className="w-6 h-6" />,
      category: 'desarrollo'
    }
  ];

  const categories = [
    { name: 'Todos', filter: '' },
    { name: 'Inicio', filter: 'inicio' },
    { name: 'Resultados', filter: 'resultados' },
    { name: 'SEO', filter: 'seo' },
    { name: 'Servicios', filter: 'servicios' },
    { name: 'Empresa', filter: 'empresa' },
    { name: 'Desarrollo', filter: 'desarrollo' }
  ];

  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => {
    const filtered = faqs.filter(faq => {
      const matchesQuery = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === '' || faq.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
    setFilteredFaqs(filtered);
  }, [searchQuery, activeCategory]);

  const toggleAccordion = (index) => {
    setIsAnimating(true);
    setActiveIndex(activeIndex === index ? null : index);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setActiveIndex(null);
  };

  return (
    <div className={`min-h-screen pt-24 pb-24 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-black to-indigo-950 text-white' 
        : 'bg-white text-gray-900'
    }`}>
      <div className="relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-700 rounded-full filter blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-700 rounded-full filter blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="mb-16 text-center relative">
              <h1 className="text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                PREGUNTAS FRECUENTES
              </h1>
              <div className="absolute left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              <p className="text-2xl text-indigo-200 mt-8 font-light">
                Respuestas <span className="font-bold">rápidas</span> para decisiones <span className="font-bold">inteligentes</span>
              </p>
            </div>

            {/* Search bar */}
            <div className="mb-10">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Busca tu pregunta aquí..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full px-6 py-4 rounded-full border outline-none backdrop-blur-md transition-all duration-300 focus:ring-2 focus:ring-opacity-50 ${
                    theme === 'dark'
                      ? 'bg-gray-900 bg-opacity-50 border-gray-700 focus:border-indigo-400 text-white focus:ring-indigo-500'
                      : 'bg-gray-100 border-gray-300 focus:border-blue-400 text-gray-900 focus:ring-blue-500'
                  }`}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => handleCategoryChange(category.filter)}
                      className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                        activeCategory === category.filter
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                          : theme === 'dark'
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* FAQ items */}
            <div className="space-y-6">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, index) => (
                  <div 
                    key={index} 
                    className={`backdrop-blur-lg rounded-xl p-1 transition-all duration-300 ${
                      theme === 'dark'
                        ? 'bg-gray-900 bg-opacity-40 border-gray-800'
                        : 'bg-gray-100 bg-opacity-80 border-gray-200'
                    } ${
                      activeIndex === index 
                        ? 'border-indigo-500 shadow-lg shadow-indigo-500/20 transform scale-102' 
                        : theme === 'dark'
                          ? 'hover:border-indigo-400/30'
                          : 'hover:border-indigo-300'
                    }`}
                  >
                    <button
                      className="flex items-center justify-between w-full p-6 text-left focus:outline-none"
                      onClick={() => toggleAccordion(index)}
                      disabled={isAnimating}
                    >
                      <div className="flex items-center">
                        <div className="mr-5 p-3 bg-indigo-900 bg-opacity-50 rounded-lg">
                          <div className={`text-indigo-400 transition-all duration-300 ${activeIndex === index ? 'transform rotate-12' : ''}`}>
                            {faq.icon}
                          </div>
                        </div>
                        <h2 className={`text-xl font-bold ${
                          theme === 'dark' ? 'text-indigo-100' : 'text-indigo-800'
                        }`}>{faq.question}</h2>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        {activeIndex === index ? (
                          <MinusCircle className="text-indigo-400 w-6 h-6" />
                        ) : (
                          <PlusCircle className="text-indigo-400 w-6 h-6" />
                        )}
                      </div>
                    </button>
                    
                    <div className={`overflow-hidden transition-all duration-300 ${activeIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="p-6 pt-0">
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent mb-4"></div>
                        <p className={`leading-relaxed ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`text-center p-10 backdrop-blur-lg rounded-xl ${
                  theme === 'dark'
                    ? 'bg-gray-900 bg-opacity-40 border border-gray-800'
                    : 'bg-gray-100 bg-opacity-80 border border-gray-200'
                }`}>
                  <p className={`text-xl ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>No se encontraron resultados para tu búsqueda</p>
                </div>
              )}
            </div>

            {/* <div className="mt-16 text-center">
              <p className="text-indigo-200 mb-6 text-lg">¿No encuentras lo que buscas?</p>
              <button className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-full font-bold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-indigo-500/30">
                Contáctanos ahora
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;

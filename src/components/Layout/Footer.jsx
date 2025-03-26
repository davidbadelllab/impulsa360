import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { MapPin, Phone, Mail, ArrowUpRight, Facebook, Instagram, Linkedin, Twitter, ChevronRight, Globe, Award, Shield } from 'lucide-react';
import BookingModal from '../BookingModal';
import ModalLinkTree from '../ModalLinkTree';

const Footer = () => {
  const { theme = 'dark' } = useTheme();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isLinkTreeModalOpen, setIsLinkTreeModalOpen] = useState(false);

  return (
    <div>
      <footer className={`relative overflow-hidden pt-20 pb-8 ${
        theme === 'dark'
          ? 'bg-gradient-to-b from-blue-950 to-black'
          : 'bg-gradient-to-b from-gray-100 to-white'
      }`}>
        {/* Elementos decorativos */}
        <div className={`absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent ${
          theme === 'dark'
            ? 'via-blue-500 to-transparent opacity-50'
            : 'via-blue-300 to-transparent opacity-30'
        }`}></div>
        
        <div className={`absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t ${
          theme === 'dark'
            ? 'from-blue-900/10 to-transparent'
            : 'from-blue-100/20 to-transparent'
        }`}></div>
        
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full filter blur-3xl ${
          theme === 'dark'
            ? 'bg-blue-600 opacity-10'
            : 'bg-blue-200 opacity-30'
        }`}></div>
        
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full filter blur-3xl ${
          theme === 'dark'
            ? 'bg-indigo-600 opacity-10'
            : 'bg-indigo-200 opacity-30'
        }`}></div>
        
        {/* Patrón de fondo */}
        <div className={`absolute inset-0 ${
          theme === 'dark' ? 'bg-grid-white/[0.02]' : 'bg-grid-black/[0.02]'
        }`} style={{
          backgroundImage: `radial-gradient(${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          {/* Sección superior con logo y descripción */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
            {/* Columna de logo y descripción */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center space-x-3">
              <img 
                  src={theme === 'dark' ? "/img/LogoImpulsa.png" : "/img/ImpulsaColor2.png"} 
                  alt="Impulsa360 Logo" 
                  className="h-12" 
                />
                <div className="h-6 w-px bg-gradient-to-b from-blue-500 to-indigo-600"></div>
                <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  DIGITAL AGENCY
                </span>
              </div>
              
              <p className={`text-lg max-w-md ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Transformamos negocios ordinarios en líderes digitales mediante estrategias disruptivas y tecnología de vanguardia.
              </p>
              
              <div className="flex flex-wrap gap-4 mt-6">
                <div className={`inline-flex items-center rounded-lg px-4 py-2 ${
                  theme === 'dark'
                    ? 'bg-blue-900/20 border-blue-800/30 text-blue-300'
                    : 'bg-blue-50 border-blue-200 text-blue-700'
                } border`}>
                  <Globe size={16} className="mr-2" />
                  <span>Presencia global</span>
                </div>
                <div className={`inline-flex items-center rounded-lg px-4 py-2 ${
                  theme === 'dark'
                    ? 'bg-indigo-900/20 border-indigo-800/30 text-indigo-300'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                } border`}>
                  <Award size={16} className="mr-2" />
                  <span>Premiados 2024</span>
                </div>
                <div className={`inline-flex items-center rounded-lg px-4 py-2 ${
                  theme === 'dark'
                    ? 'bg-purple-900/20 border-purple-800/30 text-purple-300'
                    : 'bg-purple-50 border-purple-200 text-purple-700'
                } border`}>
                  <Shield size={16} className="mr-2" />
                  <span>ISO 27001</span>
                </div>
              </div>
            </div>
            
            {/* Columna para contacto */}
            <div className="lg:col-span-3">
              <h3 className={`text-xl font-bold mb-6 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <span className="border-b-2 border-blue-500 pb-1">Contacto</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className={`w-5 h-5 mt-1 mr-3 flex-shrink-0 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    Maracaibo, Venezuela <br/>Edificio Millenium, Torre A, Piso 5
                  </p>
                </div>
                <div className="flex items-center">
                  <Phone className={`w-5 h-5 mr-3 flex-shrink-0 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    +58 (424) 631-2483
                  </p>
                </div>
                <div className="flex items-center">
                  <Mail className={`w-5 h-5 mr-3 flex-shrink-0 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    impulsa360agency@gmail.com
                  </p>
                </div>
              </div>
            </div>
            
            {/* Columna para enlaces rápidos */}
            <div className="lg:col-span-2">
              <h3 className={`text-xl font-bold mb-6 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <span className="border-b-2 border-blue-500 pb-1">Enlaces</span>
              </h3>
              <ul className="space-y-3">
                {[
                  { label: 'Inicio', path: '/' },
                  { label: 'Servicios', path: '/services' },
                  { label: 'Casos de éxito', path: '/success-cases' },
                  { label: 'Blog', path: '/blog' },
                  { label: 'Contacto', path: '/contact' }
                ].map((item, index) => (
                  <li key={index}>
                    <a href={item.path} className={`transition-colors duration-300 flex items-center group ${
                      theme === 'dark'
                        ? 'text-gray-300 hover:text-blue-400'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}>
                      <ChevronRight size={16} className={`mr-2 transform group-hover:translate-x-1 transition-transform ${
                        theme === 'dark' ? 'text-blue-500' : 'text-blue-600'
                      }`} />
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Columna para redes sociales */}
            <div className="lg:col-span-2">
              <h3 className={`text-xl font-bold mb-6 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <span className="border-b-2 border-blue-500 pb-1">Conéctate</span>
              </h3>
              <button 
                onClick={() => setIsLinkTreeModalOpen(true)}
                className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                <img 
                  src={theme === 'dark' ? "/img/LogoImpulsa.png" : "/img/ImpulsaColor2.png"} 
                  alt="Redes Sociales" 
                  className="h-10 w-10 object-contain"
                />
              </button>
              {isLinkTreeModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="relative w-full max-w-md">
                    <button 
                      onClick={() => setIsLinkTreeModalOpen(false)}
                      className="absolute -top-10 right-0 text-white hover:text-gray-300"
                    >
                      ✕
                    </button>
                    <ModalLinkTree />
                  </div>
                </div>
              )}
              
              <div className="mt-8">
                <button 
                  onClick={() => setIsBookingModalOpen(true)}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 p-4 rounded-lg text-white font-medium transition-all group w-full justify-center"
                >
                  <span>Consulta</span>
                  <ArrowUpRight size={18} className="transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Línea divisoria con gradiente */}
          <div className={`h-px w-full bg-gradient-to-r from-transparent ${
            theme === 'dark'
              ? 'via-gray-700 to-transparent'
              : 'via-gray-200 to-transparent'
          }`}></div>
          
          {/* Copyright y políticas */}
          <div className={`py-6 flex flex-col md:flex-row justify-between items-center text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <div>
              &copy; {new Date().getFullYear()} Impulsa360. Todos los derechos reservados
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/terms" className={`transition-colors ${
                theme === 'dark'
                  ? 'hover:text-blue-400'
                  : 'hover:text-blue-600'
              }`}>Términos de servicio</a>
              <a href="/privacy" className={`transition-colors ${
                theme === 'dark'
                  ? 'hover:text-blue-400'
                  : 'hover:text-blue-600'
              }`}>Política de privacidad</a>
              <a href="/legal" className={`transition-colors ${
                theme === 'dark'
                  ? 'hover:text-blue-400'
                  : 'hover:text-blue-600'
              }`}>Aviso legal</a>
            </div>
          </div>
        </div>
      </footer>
      
      <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />
    </div>
  );
};

export default Footer;
